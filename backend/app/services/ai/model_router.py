from __future__ import annotations

import json
from pathlib import Path
from typing import Optional

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger("ai.model_router")


class ModelRouter:
    """
    Routes queries to the appropriate model based on task type, modality, and latency requirements.
    Reads from config/models.json for available models.
    """

    def __init__(self) -> None:
        self._config = settings.MODELS_CONFIG
        self._routing = self._config.get("task_routing", {})

    def get_model_for_task(self, task: str) -> Optional[str]:
        """Return the configured model ID for a given task type."""
        model_id = self._routing.get(task)
        if model_id:
            logger.debug("model_router.task_routed", task=task, model=model_id)
        return model_id

    def get_available_models(self) -> list[dict]:
        """Return all configured models from the JSON config."""
        models = []
        for provider_name, provider_data in self._config.get("providers", {}).items():
            if not provider_data.get("enabled", False):
                continue
            for model in provider_data.get("models", []):
                models.append({
                    "provider": provider_name,
                    "id": model.get("id"),
                    "name": model.get("name"),
                    "type": model.get("type"),
                    "speed": model.get("speed", "unknown"),
                    "max_tokens": model.get("max_tokens", 4096),
                })
        return models

    def get_default_model(self) -> Optional[str]:
        """Return the configured default model for the active provider."""
        active_provider = settings.LLM_PROVIDER.lower()
        provider_data = self._config.get("providers", {}).get(active_provider, {})
        if provider_data.get("enabled") and provider_data.get("default_model"):
            return provider_data.get("default_model")

        for provider_name, p_data in self._config.get("providers", {}).items():
            if p_data.get("enabled"):
                default = p_data.get("default_model")
                if default:
                    return default
        return None

    def resolve_model(
        self,
        task: Optional[str] = None,
        modality: Optional[str] = None,
        explicit_model: Optional[str] = None
    ) -> str:
        """
        Resolve the best model for the given parameters.
        Priority: explicit_model > task-based routing > provider default > fallback.
        """
        if explicit_model:
            known_ids = {m["id"] for m in self.get_available_models()}
            if explicit_model in known_ids:
                return explicit_model
            logger.warning("model_router.fallback_from_unsupported_model", unsupported_model=explicit_model)

        if task:
            routed = self.get_model_for_task(task)
            if routed:
                return routed

        default = self.get_default_model()
        if default:
            return default

        # Hard-coded fallback
        return settings.GROQ_MODEL
