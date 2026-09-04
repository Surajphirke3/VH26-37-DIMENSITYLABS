from __future__ import annotations

from typing import Optional

from groq import AsyncGroq
from pydantic import Field

from app.core.config import settings
from app.core.logging import get_logger
from app.services.ai.base import LLMProvider

logger = get_logger("ai.groq")


class GroqLLM(LLMProvider):
    """Groq-hosted LLM implementation."""

    def __init__(self, api_key: str, model: str = Field(default_factory=lambda: settings.GROQ_MODEL)):
        self._client = AsyncGroq(api_key=api_key)
        self.model = model

    async def generate(self, prompt: str, model: str | None = None, image_data: str | None = None) -> str:
        chosen_model = model or self.model
        if image_data:
            img_url = image_data if (image_data.startswith("data:") or image_data.startswith("http")) else f"data:image/jpeg;base64,{image_data}"
            messages = [
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {"type": "image_url", "image_url": {"url": img_url}},
                    ],
                }
            ]
        else:
            messages = [{"role": "user", "content": prompt}]

        resp = await self._client.chat.completions.create(
            model=chosen_model,
            messages=messages,
            temperature=0.1,
            max_tokens=min(settings.RAG_CONFIG.get("max_tokens", 1024), 1024),
        )
        return resp.choices[0].message.content or ""

    async def generate_json(self, prompt: str, model: str | None = None, image_data: str | None = None) -> str:
        chosen_model = model or self.model
        if image_data:
            img_url = image_data if (image_data.startswith("data:") or image_data.startswith("http")) else f"data:image/jpeg;base64,{image_data}"
            messages = [
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {"type": "image_url", "image_url": {"url": img_url}},
                    ],
                }
            ]
        else:
            messages = [{"role": "user", "content": prompt}]

        resp = await self._client.chat.completions.create(
            model=chosen_model,
            messages=messages,
            temperature=0.1,
            max_tokens=min(settings.RAG_CONFIG.get("max_tokens", 1024), 1024),
            response_format={"type": "json_object"},
        )
        return resp.choices[0].message.content or ""


class GroqEmbedding:
    """Groq doesn't offer an embedding API; falls back to local sentence-transformers."""

    def __init__(self) -> None:
        from sentence_transformers import SentenceTransformer
        self._encoder = SentenceTransformer("all-MiniLM-L6-v2")
        self.model = "all-MiniLM-L6-v2-local"

    async def embed_text(self, text: str) -> list[float]:
        return self._encoder.encode(text, convert_to_numpy=True).tolist()

    async def embed_query(self, text: str) -> list[float]:
        return await self.embed_text(text)

    async def embed_batch(self, texts: list[str]) -> list[list[float]]:
        if not texts:
            return []
        embeddings = self._encoder.encode(texts, batch_size=32, convert_to_numpy=True)
        return embeddings.tolist()
