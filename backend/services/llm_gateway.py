import os
import time
import asyncio
import logging
from typing import Dict, Any, List, Optional
from groq import AsyncGroq

logger = logging.getLogger("llm_gateway")
logging.basicConfig(level=logging.INFO)

# Pricing per 1M tokens (USD)
MODEL_PRICING = {
    "llama-3.1-8b-instant": {"input": 0.05 / 1_000_000, "output": 0.08 / 1_000_000},
    "meta-llama/llama-4-scout-17b-16e-instruct": {"input": 0.20 / 1_000_000, "output": 0.20 / 1_000_000},
    "default": {"input": 0.10 / 1_000_000, "output": 0.10 / 1_000_000},
}


class LLMGateway:
    """
    Centralized Gateway for all LLM interactions in Verion AI.
    Handles async execution, retries, token counting, latency measurement,
    cost calculation, and telemetry metrics.
    """

    def __init__(self):
        self.metrics = {
            "total_requests": 0,
            "successful_requests": 0,
            "failed_requests": 0,
            "retries": 0,
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
    ) -> str:
        """
        Executes a chat completion call with retries and metrics tracking.
        Returns the raw message content string.
        """
        client = self._get_client(api_key)
        self.metrics["total_requests"] += 1
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
                return content

            except Exception as e:
                last_exception = e
                logger.warning(f"LLMGateway attempt {attempt}/{max_retries} failed for model {model}: {e}")
                if attempt < max_retries:
                    self.metrics["retries"] += 1
                    sleep_time = initial_backoff * (2 ** (attempt - 1))
                    await asyncio.sleep(sleep_time)

        self.metrics["failed_requests"] += 1
        raise RuntimeError(f"LLMGateway call failed after {max_retries} retries. Error: {last_exception}")

    def get_metrics(self) -> Dict[str, Any]:
        """Returns snapshot of current LLM Gateway metrics."""
        m = dict(self.metrics)
        succ = m["successful_requests"]
        m["avg_latency_seconds"] = round(m["total_latency_seconds"] / succ, 3) if succ > 0 else 0.0
        m["estimated_cost_usd"] = round(m["estimated_cost_usd"], 6)
        return m


# Global Gateway Singleton
llm_gateway = LLMGateway()
