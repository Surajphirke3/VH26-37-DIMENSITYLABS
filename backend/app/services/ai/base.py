from __future__ import annotations

from abc import ABC, abstractmethod


class LLMProvider(ABC):
    @abstractmethod
    async def generate(self, prompt: str) -> str:
        """Send prompt, return raw text response."""

    @abstractmethod
    async def generate_json(self, prompt: str) -> str:
        """Send prompt expecting JSON, return raw text (caller parses)."""


class EmbeddingProvider(ABC):
    model: str

    @abstractmethod
    async def embed_text(self, text: str) -> list[float]:
        """Embed a document string."""

    @abstractmethod
    async def embed_query(self, text: str) -> list[float]:
        """Embed a query string."""

    async def embed_batch(self, texts: list[str]) -> list[list[float]]:
        results: list[list[float]] = []
        for text in texts:
            results.append(await self.embed_text(text))
        return results
