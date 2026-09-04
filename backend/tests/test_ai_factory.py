"""Unit tests for AI provider factory — no network calls."""
from __future__ import annotations

import pytest


def test_factory_imports_cleanly():
    from app.services.ai.base import LLMProvider, EmbeddingProvider
    assert LLMProvider
    assert EmbeddingProvider


def test_base_provider_is_abstract():
    from app.services.ai.base import LLMProvider
    with pytest.raises(TypeError):
        LLMProvider()  # type: ignore[abstract]


def test_groq_provider_class_exists():
    from app.services.ai.groq import GroqLLM
    assert GroqLLM


def test_gemini_provider_class_exists():
    pytest.importorskip("google.generativeai", reason="google-generativeai not installed")
    from app.services.ai.gemini import GeminiLLM, GeminiEmbedding
    assert GeminiLLM
    assert GeminiEmbedding


def test_openrouter_provider_class_exists():
    from app.services.ai.openrouter import OpenRouterLLM
    assert OpenRouterLLM


def test_ollama_provider_class_exists():
    from app.services.ai.ollama import OllamaLLM, OllamaEmbedding
    assert OllamaLLM
    assert OllamaEmbedding


def test_factory_unknown_provider_raises():
    from unittest.mock import patch
    from app.services.ai import factory
    import functools

    # Clear lru_cache so we can test with patched settings
    factory.get_llm_provider.cache_clear()
    with patch("app.core.config.settings") as mock_settings:
        mock_settings.LLM_PROVIDER = "nonexistent"
        with pytest.raises(ValueError, match="Unknown LLM_PROVIDER"):
            factory.get_llm_provider()

    factory.get_llm_provider.cache_clear()
