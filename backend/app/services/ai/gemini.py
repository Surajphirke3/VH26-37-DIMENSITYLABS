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
        cleaned_model = model.strip()
        if cleaned_model.startswith("models/"):
            cleaned_model = cleaned_model.replace("models/", "")
        self.model = cleaned_model

    async def _embed(self, text: str, task_type: str) -> list[float]:
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            None,
            lambda: genai.embed_content(
                model=f"models/{self.model}",
                content=text,
                task_type=task_type,
                output_dimensionality=768,
            ),
        )
        return result["embedding"]

    async def embed_text(self, text: str) -> list[float]:
        return await self._embed(text, "retrieval_document")

    async def embed_query(self, text: str) -> list[float]:
        return await self._embed(text, "retrieval_query")

    async def embed_batch(self, texts: list[str], max_retries: int = 6) -> list[list[float]]:
        loop = asyncio.get_event_loop()
        for attempt in range(max_retries):
            try:
                result = await loop.run_in_executor(
                    None,
                    lambda: genai.embed_content(
                        model=f"models/{self.model}",
                        content=texts,
                        task_type="retrieval_document",
                        output_dimensionality=768,
                    ),
                )
                return result["embedding"]
            except Exception as exc:
                err_str = str(exc)
                if "RESOURCE_EXHAUSTED" in err_str or "429" in err_str:
                    if attempt < max_retries - 1:
                        import re
                        match = re.search(r"retry in (\d+)", err_str)
                        wait_sec = (int(match.group(1)) + 3) if match else 60
                        await asyncio.sleep(wait_sec)
                        continue
                raise
