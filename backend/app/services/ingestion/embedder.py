from __future__ import annotations

import hashlib
from typing import Dict, List

from app.core.logging import get_logger
from app.services.ai.factory import get_embedding_provider

logger = get_logger("ingestion.embedder")


class EmbeddingService:
    """
    Embedding service with content-hash caching, batching, and provider abstraction.
    Prevents redundant API calls for previously embedded chunks.
    """

    _cache: Dict[str, List[float]] = {}
    _MAX_CACHE_SIZE = 10000

    def __init__(self) -> None:
        self._provider = get_embedding_provider()
        self.model = self._provider.model

    def _hash_text(self, text: str) -> str:
        return hashlib.sha256(text.encode("utf-8")).hexdigest()

    async def embed_text(self, text: str) -> List[float]:
        text_hash = self._hash_text(text)
        if text_hash in self._cache:
            return self._cache[text_hash]

        embedding = await self._provider.embed_text(text)
        if len(self._cache) < self._MAX_CACHE_SIZE:
            self._cache[text_hash] = embedding
        return embedding

    async def embed_query(self, text: str) -> List[float]:
        return await self._provider.embed_query(text)

    async def embed_batch(self, texts: List[str]) -> List[List[float]]:
        if not texts:
            return []

        results: List[List[float] | None] = [None] * len(texts)
        missing_indices: List[int] = []
        missing_texts: List[str] = []

        # Check cache
        for i, text in enumerate(texts):
            h = self._hash_text(text)
            if h in self._cache:
                results[i] = self._cache[h]
            else:
                missing_indices.append(i)
                missing_texts.append(text)

        # Batch embed only missing items
        if missing_texts:
            logger.info("embedder.batch_fetch", total=len(texts), uncached=len(missing_texts))
            embeddings = await self._provider.embed_batch(missing_texts)
            for idx, text, emb in zip(missing_indices, missing_texts, embeddings):
                results[idx] = emb
                if len(self._cache) < self._MAX_CACHE_SIZE:
                    self._cache[self._hash_text(text)] = emb

        return [r for r in results if r is not None]
