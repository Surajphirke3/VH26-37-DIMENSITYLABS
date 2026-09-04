from __future__ import annotations

from functools import lru_cache

from app.services.ai.base import EmbeddingProvider, LLMProvider


@lru_cache(maxsize=1)
def get_llm_provider() -> LLMProvider:
    from app.core.config import settings

    provider = settings.LLM_PROVIDER.lower()

    if provider == "groq":
        from app.services.ai.groq import GroqLLM
        return GroqLLM(api_key=settings.GROQ_API_KEY, model=settings.GROQ_MODEL)

    if provider == "gemini":
        from app.services.ai.gemini import GeminiLLM
        return GeminiLLM(api_key=settings.GEMINI_API_KEY, model=settings.GEMINI_GENERATION_MODEL)

    if provider == "openrouter":
        from app.services.ai.openrouter import OpenRouterLLM
        return OpenRouterLLM(
            api_key=settings.OPENROUTER_API_KEY,
            model=settings.OPENROUTER_MODEL,
            site_url=settings.OPENROUTER_SITE_URL,
        )

    if provider == "ollama":
        from app.services.ai.ollama import OllamaLLM
        return OllamaLLM(base_url=settings.OLLAMA_BASE_URL, model=settings.OLLAMA_LLM_MODEL)

    raise ValueError(f"Unknown LLM_PROVIDER: {provider!r}. Choose: groq, gemini, openrouter, ollama")


@lru_cache(maxsize=1)
def get_embedding_provider() -> EmbeddingProvider:
    from app.core.config import settings

    provider = settings.EMBEDDING_PROVIDER.lower()

    if provider == "gemini":
        from app.services.ai.gemini import GeminiEmbedding
        return GeminiEmbedding(api_key=settings.GEMINI_API_KEY, model=settings.GEMINI_EMBEDDING_MODEL)

    if provider == "groq":
        from app.services.ai.groq import GroqEmbedding
        return GroqEmbedding()

    if provider == "openrouter":
        from app.services.ai.openrouter import OpenRouterEmbedding
        return OpenRouterEmbedding()

    if provider == "ollama":
        from app.services.ai.ollama import OllamaEmbedding
        return OllamaEmbedding(base_url=settings.OLLAMA_BASE_URL, model=settings.OLLAMA_EMBEDDING_MODEL)

    if provider == "local":
        from app.services.ai.local import LocalEmbedding
        return LocalEmbedding()

    raise ValueError(
        f"Unknown EMBEDDING_PROVIDER: {provider!r}. Choose: gemini, groq, openrouter, ollama, local"
    )
