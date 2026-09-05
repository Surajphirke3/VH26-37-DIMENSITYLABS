from __future__ import annotations

from functools import lru_cache

from app.services.ai.base import EmbeddingProvider, LLMProvider


def _build_fallback_chain() -> LLMProvider:
    """
    Build an ordered fallback chain:
        1. Ollama Cloud  — if OLLAMA_API_KEY is set (non-empty / non-placeholder)
        2. Local Ollama  — always attempted; skipped only on connect error at runtime
        3. Groq          — if GROQ_API_KEY is set (non-empty / non-placeholder)

    Returns a FallbackLLM that tries them in that order automatically.
    """
    from app.core.config import settings
    from app.core.logging import get_logger
    from app.services.ai.fallback import FallbackLLM

    log = get_logger("ai.factory")
    providers: list[tuple[str, LLMProvider]] = []

    # --- 1. Hugging Face Cloud (Own Custom Fine-Tuned Model) --------------
    hf_key = (settings.HUGGINGFACE_API_KEY or "").strip()
    if hf_key and hf_key not in ("placeholder", "your_huggingface_api_key_here", ""):
        try:
            from app.services.ai.huggingface import HuggingFaceLLM
            providers.append((
                "huggingface_cloud",
                HuggingFaceLLM(
                    api_key=hf_key,
                    model=settings.HUGGINGFACE_MODEL,
                    fallback_model=settings.HUGGINGFACE_FALLBACK_MODEL,
                    endpoint_url=settings.HUGGINGFACE_ENDPOINT_URL or None,
                ),
            ))
            log.info("factory.provider_registered", provider="huggingface_cloud", model=settings.HUGGINGFACE_MODEL)
        except Exception as exc:
            log.warning("factory.huggingface_cloud_unavailable", error=str(exc))

    # --- 2. Ollama Cloud --------------------------------------------------
    cloud_key = (settings.OLLAMA_API_KEY or "").strip()
    if cloud_key and cloud_key not in ("placeholder", "your_ollama_api_key_here", ""):
        try:
            from app.services.ai.ollama_cloud import OllamaCloudLLM
            providers.append((
                "ollama_cloud",
                OllamaCloudLLM(api_key=cloud_key, model=settings.OLLAMA_LLM_MODEL),
            ))
            log.info("factory.provider_registered", provider="ollama_cloud", model=settings.OLLAMA_LLM_MODEL)
        except Exception as exc:
            log.warning("factory.ollama_cloud_unavailable", error=str(exc))

    # --- 2. Local Ollama --------------------------------------------------
    try:
        from app.services.ai.ollama import OllamaLLM
        providers.append((
            "ollama_local",
            OllamaLLM(base_url=settings.OLLAMA_BASE_URL, model=settings.OLLAMA_LLM_MODEL),
        ))
        log.info("factory.provider_registered", provider="ollama_local", model=settings.OLLAMA_LLM_MODEL)
    except Exception as exc:
        log.warning("factory.ollama_local_unavailable", error=str(exc))

    # --- 3. Groq (last resort) -------------------------------------------
    groq_key = (settings.GROQ_API_KEY or "").strip()
    if groq_key and groq_key not in ("placeholder", ""):
        try:
            from app.services.ai.groq import GroqLLM
            providers.append((
                "groq",
                GroqLLM(api_key=groq_key, model=settings.GROQ_MODEL),
            ))
            log.info("factory.provider_registered", provider="groq", model=settings.GROQ_MODEL)
        except Exception as exc:
            log.warning("factory.groq_unavailable", error=str(exc))

    if not providers:
        raise RuntimeError(
            "No LLM providers are configured. "
            "Set OLLAMA_API_KEY, ensure local Ollama is running, or set GROQ_API_KEY."
        )

    if len(providers) == 1:
        # No need to wrap in fallback if there is only one
        return providers[0][1]

    return FallbackLLM(providers)


@lru_cache(maxsize=1)
def get_llm_provider() -> LLMProvider:
    from app.core.config import settings

    provider = settings.LLM_PROVIDER.lower()

    # "auto" or "ollama" -> build the full round-robin chain
    if provider in ("auto", "fallback", "ollama"):
        return _build_fallback_chain()

    if provider in ("huggingface", "hf", "huggingface_cloud"):
        from app.services.ai.huggingface import HuggingFaceLLM
        return HuggingFaceLLM(
            api_key=settings.HUGGINGFACE_API_KEY,
            model=settings.HUGGINGFACE_MODEL,
            fallback_model=settings.HUGGINGFACE_FALLBACK_MODEL,
            endpoint_url=settings.HUGGINGFACE_ENDPOINT_URL or None,
        )

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

    raise ValueError(f"Unknown LLM_PROVIDER: {provider!r}. Choose: auto, huggingface, groq, gemini, openrouter, ollama")


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
