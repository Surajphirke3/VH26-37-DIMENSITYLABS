from __future__ import annotations

from fastapi import APIRouter, Depends

from app.api.deps import get_current_user
from app.core.config import settings
from app.models.user import User
from app.services.ai.model_router import ModelRouter

router = APIRouter(tags=["models"])


@router.get("/models", response_model=dict)
async def list_models(current_user: User = Depends(get_current_user)) -> dict:
    """List all available AI models and task routing configuration."""
    router_service = ModelRouter()
    models = router_service.get_available_models()
    default_model = router_service.get_default_model() or settings.GROQ_MODEL
    routing = settings.MODELS_CONFIG.get("task_routing", {})

    return {
        "success": True,
        "data": {
            "models": models,
            "default_model": default_model,
            "task_routing": routing,
        },
    }


@router.get("/models/active", response_model=dict)
async def get_active_model(current_user: User = Depends(get_current_user)) -> dict:
    """Get the currently active default model."""
    router_service = ModelRouter()
    default_model = router_service.get_default_model() or settings.GROQ_MODEL
    return {
        "success": True,
        "data": {
            "active_model": default_model,
            "provider": "groq",
        },
    }
