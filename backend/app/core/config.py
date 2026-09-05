from __future__ import annotations

from functools import cached_property
from typing import List

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


import json
import os
from functools import cached_property
from pathlib import Path
from typing import Any, Dict, List

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


def _load_json_config(filename: str) -> Dict[str, Any]:
    config_path = Path(__file__).resolve().parent.parent.parent / "config" / filename
    if config_path.exists():
        try:
            with open(config_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}
    return {}


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        case_sensitive=False,
        extra="ignore",
    )

    # Database
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str = "mechind"
    POSTGRES_USER: str = "mechind"
    POSTGRES_PASSWORD: str = "change_me_in_production"

    # ChromaDB Vector Store
    CHROMA_PERSIST_DIR: str = str(Path(__file__).resolve().parent.parent.parent / "chroma_db")
    CHROMA_COLLECTION_NAME: str = "manual_chunks"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # AI Provider selection
    LLM_PROVIDER: str = "groq"           # groq | gemini | openrouter | ollama
    EMBEDDING_PROVIDER: str = "gemini"   # gemini | groq | openrouter | ollama | local

    # Gemini
    GEMINI_API_KEY: str = "placeholder"
    GEMINI_EMBEDDING_MODEL: str = "gemini-embedding-001"
    GEMINI_GENERATION_MODEL: str = "gemini-2.5-flash"

    # Groq
    GROQ_API_KEY: str = "placeholder"
    GROQ_MODEL: str = "openai/gpt-oss-120b"

    # OpenRouter
    OPENROUTER_API_KEY: str = "placeholder"
    OPENROUTER_MODEL: str = "anthropic/claude-3.5-haiku"
    OPENROUTER_SITE_URL: str = ""

    # Ollama (local + cloud)
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_LLM_MODEL: str = "qwen3.5:9b"
    OLLAMA_EMBEDDING_MODEL: str = "nomic-embed-text"
    OLLAMA_API_KEY: str = ""   # Set to use Ollama Cloud (https://ollama.com)

    # JWT
    JWT_SECRET_KEY: str = "dev-secret-change-in-production-min-32-chars!"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # App
    PROJECT_NAME: str = "MEND - X"
    VERSION: str = "1.2.1"
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"
    MAX_UPLOAD_SIZE_MB: int = 100
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]
    UPLOAD_DIR: str = "./uploads"

    # RAG & Retrieval Tuning
    EVIDENCE_SCORE_THRESHOLD: float = 0.45
    DISAMBIGUATION_THRESHOLD: float = 0.3
    INITIAL_TOP_K: int = 20
    RERANKER_TOP_K: int = 8
    FINAL_CONTEXT_K: int = 5
    MAX_RETRIEVAL_CHUNKS: int = 20
    CHUNK_MAX_TOKENS: int = 800
    CHUNK_MIN_TOKENS: int = 100
    CHUNK_OVERLAP_PCT: int = 15

    # Configs from JSON files
    MODELS_CONFIG: Dict[str, Any] = _load_json_config("models.json")
    RAG_CONFIG: Dict[str, Any] = _load_json_config("rag.json")
    RETRIEVAL_CONFIG: Dict[str, Any] = _load_json_config("retrieval.json")
    CHUNKING_CONFIG: Dict[str, Any] = _load_json_config("chunking.json")
    GUARDRAILS_CONFIG: Dict[str, Any] = _load_json_config("guardrails.json")
    LANGUAGES_CONFIG: Dict[str, Any] = _load_json_config("languages.json")
    SYSTEM_CONFIG: Dict[str, Any] = _load_json_config("system.json")

    @cached_property
    def DATABASE_URL(self) -> str:
        return (
            f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: object) -> object:
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v


settings = Settings()
