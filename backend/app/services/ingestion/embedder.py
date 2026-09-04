from __future__ import annotations

import asyncio

import google.generativeai as genai

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger("embedder")


class EmbeddingService:
    def __init__(self) -> None:
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = settings.GEMINI_EMBEDDING_MODEL

    async def embed_text(self, text: str) -> list[float]:
        """Embed a single document string. Returns 768-dim vector."""
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            None,
            lambda: genai.embed_content(
                model=f"models/{self.model}",
                content=text,
                task_type="retrieval_document",
            ),
        )
        return result["embedding"]

    async def embed_query(self, text: str) -> list[float]:
        """Embed a query string with retrieval_query task type."""
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            None,
            lambda: genai.embed_content(
                model=f"models/{self.model}",
                content=text,
                task_type="retrieval_query",
            ),
        )
        return result["embedding"]

    async def embed_batch(self, texts: list[str]) -> list[list[float]]:
        """Embed multiple texts sequentially (Gemini free tier has no batch endpoint)."""
        results: list[list[float]] = []
        for text in texts:
            vec = await self.embed_text(text)
            results.append(vec)
        return results
