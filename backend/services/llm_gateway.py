import os
import time
import asyncio
import logging
from typing import Dict, Any, List, Optional
from groq import AsyncGroq
from services.cache import llm_cache, LLMCache

logger = logging.getLogger("llm_gateway")
logging.basicConfig(level=logging.INFO)

# Pricing per 1M tokens (USD)
MODEL_PRICING = {
    "llama-3.1-8b-instant": {"input": 0.05 / 1_000_000, "output": 0.08 / 1_000_000},
    "llama-3.2-11b-vision-preview": {"input": 0.18 / 1_000_000, "output": 0.18 / 1_000_000},
    "llama-3.2-90b-vision-preview": {"input": 0.90 / 1_000_000, "output": 0.90 / 1_000_000},
    "meta-llama/llama-4-scout-17b-16e-instruct": {"input": 0.20 / 1_000_000, "output": 0.20 / 1_000_000},
    "default": {"input": 0.10 / 1_000_000, "output": 0.10 / 1_000_000},
}

TASK_TTL = {
    "content_generation": 3600,   # 1 hour
    "vision": 1800,               # 30 minutes
    "analytics": 600,             # 10 minutes
    "trend": 600,                 # 10 minutes
    "prediction": 0,              # No caching
    "default": 600,               # 10 minutes
}


class LLMGateway:
    """
    Centralized Gateway for all LLM interactions in Verion AI.
    Handles async execution, transparent response caching, retries, token counting,
    latency measurement, cost calculation, and telemetry metrics.
    """

    def __init__(self, cache: Optional[LLMCache] = None):
        self.cache = cache or llm_cache
        self.metrics = {
            "total_requests": 0,
            "successful_requests": 0,
            "failed_requests": 0,
            "retries": 0,
            "cache_hits": 0,
            "cache_misses": 0,
            "total_latency_seconds": 0.0,
            "prompt_tokens": 0,
            "completion_tokens": 0,
            "total_tokens": 0,
            "estimated_cost_usd": 0.0,
        }
        self._clients: Dict[str, AsyncGroq] = {}

    def _get_client(self, api_key: Optional[str] = None) -> AsyncGroq:
        key = api_key or os.getenv("GROQ_API_KEY")
        if not key:
            raise ValueError("GROQ_API_KEY environment variable is not set.")
        if key not in self._clients:
            self._clients[key] = AsyncGroq(api_key=key)
        return self._clients[key]

    async def generate_chat(
        self,
        messages: List[Dict[str, Any]],
        model: str = "llama-3.1-8b-instant",
        temperature: float = 0.5,
        max_tokens: int = 2048,
        response_format: Optional[Dict[str, str]] = None,
        api_key: Optional[str] = None,
        max_retries: int = 3,
        initial_backoff: float = 1.0,
        task_type: Optional[str] = None,
        ttl: Optional[int] = None,
        prompt_template_content: Optional[str] = None,
        user_prompt_content: Optional[str] = None,
    ) -> str:
        """
        Executes a chat completion call with transparent caching, retries, and metrics tracking.
        Returns raw message content string.
        """
        self.metrics["total_requests"] += 1

        # Determine effective TTL
        if ttl is not None:
            effective_ttl = ttl
        elif task_type in TASK_TTL:
            effective_ttl = TASK_TTL[task_type]
        else:
            effective_ttl = TASK_TTL["default"]

        # Cache lookup logic
        cache_key = None
        if effective_ttl > 0:
            sys_prompt = prompt_template_content or ""
            usr_prompt = user_prompt_content or ""
            if not sys_prompt or not usr_prompt:
                for m in messages:
                    role = m.get("role")
                    content = m.get("content")
                    if role == "system" and not sys_prompt:
                        sys_prompt = str(content)
                    elif role == "user" and not usr_prompt:
                        usr_prompt = str(content)
                if not usr_prompt and messages:
                    usr_prompt = str(messages)

            cache_key = self.cache.create_key(model, sys_prompt, usr_prompt, temperature)
            cached_val = self.cache.get(cache_key)
            if cached_val is not None:
                self.metrics["cache_hits"] += 1
                self.metrics["successful_requests"] += 1
                logger.info(f"LLMGateway cache HIT for key {cache_key[:8]} (task: {task_type}, model: {model})")
                return cached_val

            self.metrics["cache_misses"] += 1

        client = self._get_client(api_key)
        start_time = time.time()
        last_exception = None

        for attempt in range(1, max_retries + 1):
            try:
                kwargs: Dict[str, Any] = {
                    "messages": messages,
                    "model": model,
                    "temperature": temperature,
                    "max_tokens": max_tokens,
                }
                if response_format:
                    kwargs["response_format"] = response_format

                response = await client.chat.completions.create(**kwargs)
                elapsed = time.time() - start_time

                # Metrics recording
                self.metrics["successful_requests"] += 1
                self.metrics["total_latency_seconds"] += elapsed

                if hasattr(response, "usage") and response.usage:
                    p_tokens = getattr(response.usage, "prompt_tokens", 0) or 0
                    c_tokens = getattr(response.usage, "completion_tokens", 0) or 0
                    t_tokens = getattr(response.usage, "total_tokens", p_tokens + c_tokens) or 0

                    self.metrics["prompt_tokens"] += p_tokens
                    self.metrics["completion_tokens"] += c_tokens
                    self.metrics["total_tokens"] += t_tokens

                    pricing = MODEL_PRICING.get(model, MODEL_PRICING["default"])
                    cost = (p_tokens * pricing["input"]) + (c_tokens * pricing["output"])
                    self.metrics["estimated_cost_usd"] += cost

                content = response.choices[0].message.content or ""

                # Store response in cache if applicable
                if cache_key and effective_ttl > 0:
                    self.cache.set(cache_key, content, effective_ttl)

                return content

            except Exception as e:
                last_exception = e
                err_str = str(e).lower()
                logger.warning(f"LLMGateway attempt {attempt}/{max_retries} failed for model {model}: {e}")
                
                # If Payload Too Large (413), fallback to model with higher TPM token limit or reduce prompt
                if ("413" in err_str or "payload too large" in err_str or "rate_limit_exceeded" in err_str) and model == "llama-3.1-8b-instant":
                    model = "llama-3.3-70b-versatile"
                    logger.info(f"Switching model to {model} due to payload/TPM limits.")

                if attempt < max_retries:
                    self.metrics["retries"] += 1
                    # Double wait time if 429 rate limit
                    sleep_multiplier = 4.0 if ("429" in err_str or "rate" in err_str) else 1.0
                    sleep_time = initial_backoff * (2 ** (attempt - 1)) * sleep_multiplier
                    await asyncio.sleep(sleep_time)

        self.metrics["failed_requests"] += 1
        raise RuntimeError(f"LLMGateway call failed after {max_retries} retries. Error: {last_exception}")

    def get_metrics(self) -> Dict[str, Any]:
        """Returns snapshot of current LLM Gateway metrics including cache hit rate."""
        m = dict(self.metrics)
        succ = m["successful_requests"]
        hits = m["cache_hits"]
        misses = m["cache_misses"]
        total_lookups = hits + misses

        m["cache_hit_rate"] = round(hits / total_lookups, 4) if total_lookups > 0 else 0.0
        m["avg_latency_seconds"] = round(m["total_latency_seconds"] / succ, 3) if succ > 0 else 0.0
        m["estimated_cost_usd"] = round(m["estimated_cost_usd"], 6)
        return m


# Global Gateway Singleton
llm_gateway = LLMGateway()
