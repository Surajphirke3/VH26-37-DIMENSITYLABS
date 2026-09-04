from __future__ import annotations

import asyncio
from typing import List
from sentence_transformers import SentenceTransformer

from app.core.logging import get_logger
from app.services.ai.base import EmbeddingProvider

logger = get_logger("ai.local_embedding")


def _pad_to_768(vec: list[float]) -> list[float]:
    """Pad vector to 768 dimensions for pgvector schema compatibility without altering cosine similarity."""
    if len(vec) == 768:
        return vec
    if len(vec) < 768:
        return vec + [0.0] * (768 - len(vec))
    return vec[:768]


class LocalEmbedding(EmbeddingProvider):
    """
    100% Local, offline sentence-transformers embedding provider.
    - Zero API rate limits or quota errors
    - Fast batch tensor inference on CPU / GPU
    - Fully compatible with 768-dim pgvector and ChromaDB
    """

    def __init__(self, model_name: str = "all-MiniLM-L6-v2") -> None:
        self.model = f"{model_name}-local"
        logger.info("local_embedding.init", model=self.model)
        self._encoder = SentenceTransformer(model_name)

    async def embed_text(self, text: str) -> List[float]:
        loop = asyncio.get_event_loop()
        vec = await loop.run_in_executor(
            None,
            lambda: self._encoder.encode(text, convert_to_numpy=True).tolist(),
        )
        return _pad_to_768(vec)

    async def embed_query(self, text: str) -> List[float]:
        return await self.embed_text(text)

    async def embed_batch(self, texts: List[str]) -> List[List[float]]:
        if not texts:
            return []
        loop = asyncio.get_event_loop()
        embeddings = await loop.run_in_executor(
            None,
            lambda: self._encoder.encode(texts, batch_size=64, convert_to_numpy=True),
        )
        return [_pad_to_768(vec.tolist()) for vec in embeddings]
