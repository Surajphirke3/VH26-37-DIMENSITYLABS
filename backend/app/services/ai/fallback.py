from __future__ import annotations

import asyncio
from typing import Sequence

from app.core.logging import get_logger
from app.services.ai.base import LLMProvider

logger = get_logger("ai.fallback")


class FallbackLLM(LLMProvider):
    """
    Round-robin fallback chain over multiple LLMProvider instances.

    On every call it tries providers in order. If a provider raises an
    exception OR returns an empty string it is logged and the next
    provider is tried. The first non-empty response wins.

    If all providers fail the last exception is re-raised so the caller
    can return its own fallback response.
    """

    def __init__(self, providers: Sequence[tuple[str, LLMProvider]]) -> None:
        """
        Args:
            providers: ordered list of (label, provider) pairs.
                       label is used only for logging (e.g. "ollama_cloud", "ollama_local", "groq").
        """
        if not providers:
            raise ValueError("FallbackLLM requires at least one provider")
        self._providers = list(providers)
        logger.info(
            "fallback_llm.init",
            chain=[label for label, _ in self._providers],
        )

    # ------------------------------------------------------------------ #
    #  Internal helper                                                     #
    # ------------------------------------------------------------------ #

    async def _try_all(self, method: str, *args, **kwargs) -> str:
        last_exc: Exception | None = None
        for label, provider in self._providers:
            try:
                fn = getattr(provider, method)
                result: str = await fn(*args, **kwargs)
                if result and result.strip():
                    logger.info("fallback_llm.success", provider=label, method=method)
                    return result
                logger.warning(
                    "fallback_llm.empty_response",
                    provider=label,
                    method=method,
                )
            except Exception as exc:  # noqa: BLE001
                last_exc = exc
                logger.warning(
                    "fallback_llm.provider_error",
                    provider=label,
                    method=method,
                    error=str(exc)[:200],
                )

        if last_exc is not None:
            raise last_exc
        raise RuntimeError("All LLM providers returned empty responses")

    # ------------------------------------------------------------------ #
    #  LLMProvider interface                                               #
    # ------------------------------------------------------------------ #

    async def generate(self, prompt: str, model: str | None = None, image_data: str | None = None) -> str:
        return await self._try_all("generate", prompt, model=model, image_data=image_data)

    async def generate_json(self, prompt: str, model: str | None = None, image_data: str | None = None) -> str:
        return await self._try_all("generate_json", prompt, model=model, image_data=image_data)
