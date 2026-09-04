from __future__ import annotations

from app.services.ai.factory import get_embedding_provider


class EmbeddingService:
    def __init__(self) -> None:
        self._provider = get_embedding_provider()
        self.model = self._provider.model

    async def embed_text(self, text: str) -> list[float]:
        return await self._provider.embed_text(text)

    async def embed_query(self, text: str) -> list[float]:
        return await self._provider.embed_query(text)

    async def embed_batch(self, texts: list[str]) -> list[list[float]]:
        return await self._provider.embed_batch(texts)
