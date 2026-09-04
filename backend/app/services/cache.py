from __future__ import annotations

import functools
import time
from typing import Any, Optional

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger("cache")


class CacheConfig:
    default_ttl = 300  # 5 minutes for embeddings/retrieval


class LRUCache:
    """Simple bounded LRU cache for embeddings and retrieval results."""

    def __init__(self, maxsize: int = 500):
        self._maxsize = maxsize
        self._store: dict[str, Any] = {}
        self._access_order: list[str] = []

    def get(self, key: str) -> Any:
        if key in self._store:
            # Move to end (most recently used)
            self._access_order.remove(key)
            self._access_order.append(key)
            return self._store[key]
        return None

    def set(self, key: str, value: Any) -> None:
        if key in self._store:
            self._access_order.remove(key)
        elif len(self._store) >= self._maxsize:
            oldest = self._access_order.pop(0)
            del self._store[oldest]
        self._store[key] = value
        self._access_order.append(key)


class EmbeddingCache:
    """Cache wrapper around embedding service to avoid redundant API calls."""

    def __init__(self, ttl: int = CacheConfig.default_ttl):
        self.ttl = ttl
        self._cache = LRUCache(maxsize=1000)

    def key_for_text(self, text: str) -> str:
        return f"emb:{hash(text)}"

    def get(self, text: str) -> Optional[list[float]]:
        result = self._cache.get(self.key_for_text(text))
        if result is not None:
            logger.info("cache.embedding.hit")
        else:
            logger.info("cache.embedding.miss")
        return result

    def set(self, text: str, embedding: list[float]) -> None:
        self._cache.set(self.key_for_text(text), embedding)


class RetrievalCache:
    """Cache for repeated identical queries (same query + same machine filter)."""

    def __init__(self, ttl: int = 600):
        self.ttl = ttl
        self._cache = LRUCache(maxsize=500)

    def key_for_query(self, query: str, machine_id: Optional[str]) -> str:
        return f"retr:{hash(query)}:{machine_id or 'all'}"

    def get(self, query: str, machine_id: Optional[str]) -> Optional[dict]:
        return self._cache.get(self.key_for_query(query, machine_id))

    def set(self, query: str, machine_id: Optional[str], result: dict) -> None:
        self._cache.set(self.key_for_query(query, machine_id), result)
