import time
import os
import hashlib
import json
import logging
from typing import Optional, Any, Dict

logger = logging.getLogger("llm_cache")


class LLMCache:
    """
    In-memory LLM response cache with optional Redis backend support.
    Keys are generated using SHA-256 based on model, prompt_template, user_prompt, and temperature.
    """

    def __init__(self, redis_url: Optional[str] = None):
        self._memory_cache: Dict[str, Dict[str, Any]] = {}
        self._redis_client = None

        redis_uri = redis_url or os.getenv("REDIS_URL")
        if redis_uri:
            try:
                import redis
                self._redis_client = redis.from_url(redis_uri, decode_responses=True)
                logger.info("Connected to Redis cache for LLMGateway.")
            except Exception as e:
                logger.warning(f"Failed to initialize Redis client ({e}). Falling back to in-memory cache.")
                self._redis_client = None

    @staticmethod
    def create_key(model: str, prompt_template: str, user_prompt: str, temperature: float) -> str:
        """Generates SHA-256 hash from model, prompt template, user prompt, and temperature."""
        raw = f"{model}:{prompt_template}:{user_prompt}:{temperature}"
        return hashlib.sha256(raw.encode("utf-8")).hexdigest()

    def get(self, key: str) -> Optional[str]:
        """Retrieves cached response if key exists and has not expired."""
        if self._redis_client:
            try:
                val = self._redis_client.get(key)
                if val is not None:
                    return val
            except Exception as e:
                logger.warning(f"Redis get error: {e}")

        # In-memory cache fallback/check
        if key in self._memory_cache:
            entry = self._memory_cache[key]
            if entry["expires_at"] > time.time():
                return entry["value"]
            else:
                del self._memory_cache[key]
        return None

    def set(self, key: str, value: str, ttl_seconds: int) -> None:
        """Stores value in cache with TTL in seconds."""
        if ttl_seconds <= 0:
            return

        if self._redis_client:
            try:
                self._redis_client.setex(key, ttl_seconds, value)
            except Exception as e:
                logger.warning(f"Redis set error: {e}")

        expires_at = time.time() + ttl_seconds
        self._memory_cache[key] = {
            "value": value,
            "expires_at": expires_at
        }

    def clear(self) -> None:
        """Clears all cached entries."""
        self._memory_cache.clear()
        if self._redis_client:
            try:
                self._redis_client.flushdb()
            except Exception as e:
                logger.warning(f"Redis clear error: {e}")


# Global Cache Singleton
llm_cache = LLMCache()
