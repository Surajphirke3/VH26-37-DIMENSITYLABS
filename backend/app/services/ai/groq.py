from __future__ import annotations

from groq import AsyncGroq

from app.services.ai.base import EmbeddingProvider, LLMProvider


class GroqLLM(LLMProvider):
    def __init__(self, api_key: str, model: str) -> None:
        self._client = AsyncGroq(api_key=api_key)
        self._model = model

    async def generate(self, prompt: str) -> str:
        resp = await self._client.chat.completions.create(
            model=self._model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=800,
        )
        return resp.choices[0].message.content or ""

    async def generate_json(self, prompt: str) -> str:
        resp = await self._client.chat.completions.create(
            model=self._model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=800,
            response_format={"type": "json_object"},
        )
        return resp.choices[0].message.content or ""


class GroqEmbedding(EmbeddingProvider):
    """Groq does not offer an embedding API — falls back to local sentence-transformers."""

    def __init__(self) -> None:
        from sentence_transformers import SentenceTransformer
        self._encoder = SentenceTransformer("all-MiniLM-L6-v2")
        self.model = "all-MiniLM-L6-v2-local"

    async def embed_text(self, text: str) -> list[float]:
        return self._encoder.encode(text, convert_to_numpy=True).tolist()

    async def embed_query(self, text: str) -> list[float]:
        return await self.embed_text(text)
