from __future__ import annotations

import httpx

from app.services.ai.base import EmbeddingProvider, LLMProvider

_BASE_URL = "https://openrouter.ai/api/v1"


class OpenRouterLLM(LLMProvider):
    def __init__(self, api_key: str, model: str, site_url: str = "", site_name: str = "MEND - X") -> None:
        self._api_key = api_key
        self._model = model
        self._headers = {
            "Authorization": f"Bearer {api_key}",
            "HTTP-Referer": site_url,
            "X-Title": site_name,
            "Content-Type": "application/json",
        }

    async def _chat(self, prompt: str, json_mode: bool = False) -> str:
        body: dict = {
            "model": self._model,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.1,
            "max_tokens": 2048,
        }
        if json_mode:
            body["response_format"] = {"type": "json_object"}

        async with httpx.AsyncClient(timeout=60) as client:
            resp = await client.post(f"{_BASE_URL}/chat/completions", headers=self._headers, json=body)
            resp.raise_for_status()
            return resp.json()["choices"][0]["message"]["content"]

    async def generate(self, prompt: str) -> str:
        return await self._chat(prompt)

    async def generate_json(self, prompt: str) -> str:
        return await self._chat(prompt, json_mode=True)


class OpenRouterEmbedding(EmbeddingProvider):
    """Uses local sentence-transformers — OpenRouter has no embedding endpoint."""

    def __init__(self) -> None:
        from sentence_transformers import SentenceTransformer
        self._encoder = SentenceTransformer("all-MiniLM-L6-v2")
        self.model = "all-MiniLM-L6-v2-local"

    async def embed_text(self, text: str) -> list[float]:
        return self._encoder.encode(text, convert_to_numpy=True).tolist()

    async def embed_query(self, text: str) -> list[float]:
        return await self.embed_text(text)
