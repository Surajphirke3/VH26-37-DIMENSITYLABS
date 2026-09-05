from __future__ import annotations

import re

from openai import AsyncOpenAI

from app.core.logging import get_logger
from app.services.ai.base import LLMProvider

logger = get_logger("ai.ollama_cloud")

# Qwen3 / reasoning models emit chain-of-thought in <think>…</think> before JSON.
_THINK_RE = re.compile(r"<think>.*?</think>", re.DOTALL | re.IGNORECASE)


def _strip_think(text: str) -> str:
    return _THINK_RE.sub("", text).strip()


class OllamaCloudLLM(LLMProvider):
    """
    Ollama Cloud inference via the OpenAI-compatible REST API.
    Base URL: https://api.ollama.com
    Auth:     Bearer <OLLAMA_API_KEY>
    """

    def __init__(self, api_key: str, model: str) -> None:
        self._model = model
        self._client = AsyncOpenAI(
            api_key=api_key,
            base_url="https://ollama.com/v1",
        )
        logger.info("ollama_cloud.init", model=model)

    async def generate(self, prompt: str, model: str | None = None, image_data: str | None = None) -> str:
        chosen = model or self._model
        resp = await self._client.chat.completions.create(
            model=chosen,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=4096,
        )
        raw = resp.choices[0].message.content or ""
        return _strip_think(raw)

    async def generate_json(self, prompt: str, model: str | None = None, image_data: str | None = None) -> str:
        chosen = model or self._model
        resp = await self._client.chat.completions.create(
            model=chosen,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=4096,
            response_format={"type": "json_object"},
        )
        raw = resp.choices[0].message.content or ""
        return _strip_think(raw)
