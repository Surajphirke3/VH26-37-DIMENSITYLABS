from __future__ import annotations

import json
import re
from typing import Optional

from huggingface_hub import AsyncInferenceClient

from app.core.logging import get_logger
from app.services.ai.base import LLMProvider

logger = get_logger("ai.huggingface")

# Reasoning / Qwen models emit chain-of-thought in <think>…</think> before final text
_THINK_RE = re.compile(r"<think>.*?</think>", re.DOTALL | re.IGNORECASE)


def _strip_think(text: str) -> str:
    return _THINK_RE.sub("", text).strip()


class HuggingFaceLLM(LLMProvider):
    """
    Hugging Face Cloud Inference Provider for Custom Fine-Tuned Models.
    Supports user custom fine-tuned adapters (e.g. deep101godhani/mendx-apex-v3)
    and transparent serverless fallback when custom weights are cold or not dedicated.
    """

    def __init__(
        self,
        api_key: str,
        model: str = "deep101godhani/mendx-apex-v3",
        fallback_model: str = "Qwen/Qwen2.5-Coder-32B-Instruct",
        endpoint_url: Optional[str] = None,
    ) -> None:
        self._api_key = api_key
        self._primary_model = model
        self._fallback_model = fallback_model
        self._endpoint_url = endpoint_url
        self._client = AsyncInferenceClient(
            token=api_key,
            model=endpoint_url if endpoint_url else None,
        )
        logger.info(
            "huggingface.init",
            primary_model=model,
            fallback_model=fallback_model,
            endpoint_url=endpoint_url,
        )

    async def generate(
        self,
        prompt: str,
        model: Optional[str] = None,
        image_data: Optional[str] = None,
    ) -> str:
        target_model = model or self._primary_model
        models_to_try = [target_model]
        if self._fallback_model and self._fallback_model != target_model:
            models_to_try.append(self._fallback_model)

        last_error: Exception | None = None
        for m in models_to_try:
            try:
                resp = await self._client.chat.completions.create(
                    model=m,
                    messages=[{"role": "user", "content": prompt}],
                    max_tokens=4096,
                    temperature=0.1,
                )
                content = resp.choices[0].message.content or ""
                return _strip_think(content)
            except Exception as exc:
                last_error = exc
                logger.warning(
                    "huggingface.generate_failed_trying_fallback",
                    attempted_model=m,
                    error=str(exc),
                )

        logger.error("huggingface.all_models_failed", error=str(last_error))
        raise last_error or RuntimeError("Hugging Face inference failed on all models.")

    async def generate_json(
        self,
        prompt: str,
        model: Optional[str] = None,
        image_data: Optional[str] = None,
    ) -> str:
        # Enforce JSON output instructions
        json_prompt = (
            f"{prompt}\n\n"
            "CRITICAL: Output valid JSON ONLY. Do not include markdown formatting or commentary."
        )
        target_model = model or self._primary_model
        models_to_try = [target_model]
        if self._fallback_model and self._fallback_model != target_model:
            models_to_try.append(self._fallback_model)

        last_error: Exception | None = None
        for m in models_to_try:
            try:
                resp = await self._client.chat.completions.create(
                    model=m,
                    messages=[{"role": "user", "content": json_prompt}],
                    max_tokens=4096,
                    temperature=0.1,
                    response_format={"type": "json_object"},
                )
                content = resp.choices[0].message.content or ""
                cleaned = _strip_think(content)
                # Verify parseable JSON
                json.loads(cleaned)
                return cleaned
            except Exception as exc:
                # If json_object response_format is unsupported, try raw generation
                try:
                    raw = await self.generate(json_prompt, model=m)
                    # Extract json block if surrounded by markdown
                    match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", raw, re.DOTALL)
                    candidate = match.group(1) if match else raw.strip()
                    json.loads(candidate)
                    return candidate
                except Exception as parse_exc:
                    last_error = parse_exc
                    logger.warning(
                        "huggingface.generate_json_failed",
                        attempted_model=m,
                        error=str(exc),
                    )

        logger.error("huggingface.all_json_models_failed", error=str(last_error))
        raise last_error or RuntimeError("Hugging Face JSON inference failed on all models.")
