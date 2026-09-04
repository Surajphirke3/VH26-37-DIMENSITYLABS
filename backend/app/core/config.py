from __future__ import annotations

from functools import cached_property
from typing import List

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=False,
        extra="ignore",
    )

    # Database
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str = "mechmind"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = ""

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # AI Provider selection
    LLM_PROVIDER: str = "groq"           # groq | gemini | openrouter | ollama
    EMBEDDING_PROVIDER: str = "gemini"   # gemini | groq | openrouter | ollama | local

    # Gemini
    GEMINI_API_KEY: str = "placeholder"
    GEMINI_EMBEDDING_MODEL: str = "text-embedding-004"
    GEMINI_GENERATION_MODEL: str = "gemini-1.5-flash"

    # Groq
    GROQ_API_KEY: str = "placeholder"
    GROQ_MODEL: str = "llama-3.3-70b-versatile"

    # OpenRouter
    OPENROUTER_API_KEY: str = "placeholder"
    OPENROUTER_MODEL: str = "anthropic/claude-3.5-haiku"
    OPENROUTER_SITE_URL: str = ""

    # Ollama (local)
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_LLM_MODEL: str = "llama3.2"
    OLLAMA_EMBEDDING_MODEL: str = "nomic-embed-text"

    # JWT
    JWT_SECRET_KEY: str = "dev-secret-change-in-production-min-32-chars!"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # App
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"
    MAX_UPLOAD_SIZE_MB: int = 100
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]
    UPLOAD_DIR: str = "./uploads"

    # RAG tuning
    EVIDENCE_SCORE_THRESHOLD: float = 0.45
    DISAMBIGUATION_THRESHOLD: float = 0.3
    MAX_RETRIEVAL_CHUNKS: int = 20
    RERANKER_TOP_K: int = 10
    CHUNK_MAX_TOKENS: int = 800
    CHUNK_MIN_TOKENS: int = 100
    CHUNK_OVERLAP_PCT: int = 15

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
