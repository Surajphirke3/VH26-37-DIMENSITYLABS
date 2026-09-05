from __future__ import annotations

import re
import httpx

from app.services.ai.base import EmbeddingProvider, LLMProvider

# Qwen3 and similar reasoning models wrap chain-of-thought in <think>…</think>.
# Strip those tags so we only parse the actual JSON output.
_THINK_RE = re.compile(r"<think>.*?</think>", re.DOTALL | re.IGNORECASE)


def _strip_think(text: str) -> str:
    """Remove Qwen3 / reasoning-model <think> blocks from output."""
    return _THINK_RE.sub("", text).strip()


class OllamaLLM(LLMProvider):
    def __init__(self, base_url: str, model: str) -> None:
        self._base_url = base_url.rstrip("/")
        self._model = model

    async def generate(self, prompt: str, model: str | None = None, **kwargs) -> str:
        async with httpx.AsyncClient(timeout=180) as client:
            resp = await client.post(
                f"{self._base_url}/api/generate",
                json={
                    "model": model or self._model,
                    "prompt": prompt,
                    "stream": False,
                },
            )
            resp.raise_for_status()
            return _strip_think(resp.json()["response"])

    async def generate_json(self, prompt: str, model: str | None = None, **kwargs) -> str:
        async with httpx.AsyncClient(timeout=180) as client:
            resp = await client.post(
                f"{self._base_url}/api/generate",
                json={
                    "model": model or self._model,
                    "prompt": prompt,
                    "stream": False,
                    "format": "json",
                },
            )
            resp.raise_for_status()
            return _strip_think(resp.json()["response"])


class OllamaEmbedding(EmbeddingProvider):
    def __init__(self, base_url: str, model: str) -> None:
        self._base_url = base_url.rstrip("/")
        self.model = model

    async def embed_text(self, text: str) -> list[float]:
        async with httpx.AsyncClient(timeout=60) as client:
            resp = await client.post(
                f"{self._base_url}/api/embeddings",
                json={"model": self.model, "prompt": text},
            )
            resp.raise_for_status()
            return resp.json()["embedding"]

    async def embed_query(self, text: str) -> list[float]:
        return await self.embed_text(text)

    async def embed_batch(self, texts: list[str]) -> list[list[float]]:
        if not texts:
            return []
        results = []
        for text in texts:
            results.append(await self.embed_text(text))
        return results

