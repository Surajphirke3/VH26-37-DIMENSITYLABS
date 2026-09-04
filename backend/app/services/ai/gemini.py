from __future__ import annotations

import asyncio

import google.generativeai as genai

from app.services.ai.base import EmbeddingProvider, LLMProvider


class GeminiLLM(LLMProvider):
    def __init__(self, api_key: str, model: str) -> None:
        genai.configure(api_key=api_key)
        self._model = genai.GenerativeModel(model)

    async def generate(self, prompt: str) -> str:
        loop = asyncio.get_event_loop()
        resp = await loop.run_in_executor(None, lambda: self._model.generate_content(prompt))
        return resp.text

    async def generate_json(self, prompt: str) -> str:
        return await self.generate(prompt)


class GeminiEmbedding(EmbeddingProvider):
    def __init__(self, api_key: str, model: str) -> None:
        genai.configure(api_key=api_key)
        self.model = model

    async def _embed(self, text: str, task_type: str) -> list[float]:
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            None,
            lambda: genai.embed_content(
                model=f"models/{self.model}",
                content=text,
                task_type=task_type,
            ),
        )
        return result["embedding"]

    async def embed_text(self, text: str) -> list[float]:
        return await self._embed(text, "retrieval_document")

    async def embed_query(self, text: str) -> list[float]:
        return await self._embed(text, "retrieval_query")
