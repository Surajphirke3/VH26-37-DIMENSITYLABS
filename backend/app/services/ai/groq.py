from __future__ import annotations

from typing import Optional

from groq import AsyncGroq
from pydantic import Field

from app.core.config import settings
from app.core.logging import get_logger
from app.services.ai.base import LLMProvider

logger = get_logger("ai.groq")

# Models verified to work on this Groq account — any other model will be silently replaced.
VERIFIED_GROQ_MODELS: frozenset[str] = frozenset({
    "openai/gpt-oss-120b",
    "openai/gpt-oss-20b",
    "groq/compound-mini",
    "qwen/qwen3.6-27b",
    "qwen/qwen3.8-27b",
})

_DEFAULT_GROQ_MODEL = "openai/gpt-oss-120b"


def _safe_model(model: str | None) -> str:
    """Return model if in verified list, else fall back to default."""
    if model and model in VERIFIED_GROQ_MODELS:
        return model
    if model:
        logger.warning("groq.invalid_model_fallback", requested=model, using=_DEFAULT_GROQ_MODEL)
    return settings.GROQ_MODEL or _DEFAULT_GROQ_MODEL


class GroqLLM(LLMProvider):
    """Groq-hosted LLM implementation."""

    def __init__(self, api_key: str, model: str = Field(default_factory=lambda: settings.GROQ_MODEL)):
        self._client = AsyncGroq(api_key=api_key)
        self.model = _safe_model(model)

    async def generate(self, prompt: str, model: str | None = None, image_data: str | None = None) -> str:
        chosen_model = _safe_model(model or self.model)
        # Note: These models don't support vision — send as text-only if image attached
        messages = [{
            "role": "user",
            "content": prompt + (f"\n\n[IMAGE ATTACHED — analyze visually if applicable]" if image_data else "")
        }]

        resp = await self._client.chat.completions.create(
            model=chosen_model,
            messages=messages,
            temperature=0.1,
            max_tokens=min(settings.RAG_CONFIG.get("max_tokens", 4096), 4096),
        )
        return resp.choices[0].message.content or ""


    async def generate_json(self, prompt: str, model: str | None = None, image_data: str | None = None) -> str:
        chosen_model = _safe_model(model or self.model)
        # Note: These models don't support vision via image_url — include image context as text
        messages = [{
            "role": "user",
            "content": prompt + ("\n\n[IMAGE ATTACHED — analyze visually if applicable]" if image_data else "")
        }]

        resp = await self._client.chat.completions.create(
            model=chosen_model,
            messages=messages,
            temperature=0.1,
            max_tokens=min(settings.RAG_CONFIG.get("max_tokens", 4096), 4096),
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
