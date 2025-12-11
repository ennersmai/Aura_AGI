"""Application configuration using Pydantic Settings."""

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings with environment variable support."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # SurrealDB Configuration
    surreal_url: str = Field(default="ws://localhost:8000/rpc")
    surreal_user: str = Field(default="root")
    surreal_pass: str = Field(default="root")
    surreal_ns: str = Field(default="aura")
    surreal_db: str = Field(default="main")

    # OpenRouter API Configuration
    openrouter_api_key: str = Field(default="")
    openrouter_base_url: str = Field(default="https://openrouter.ai/api/v1")

    # LLM Model Configuration (Hot-Swappable via Environment Variables)
    l1_model: str = Field(
        default="mistralai/mistral-7b-instruct",
        validation_alias="AURA_L1_MODEL",
        description="L1 Instinct Layer - Fast responses (<500ms)",
    )
    l2_model: str = Field(
        default="anthropic/claude-3.5-sonnet",
        validation_alias="AURA_L2_MODEL",
        description="L2 Reasoning Layer - Deep analysis (async)",
    )
    l3_model: str = Field(
        default="deepseek/deepseek-chat",
        validation_alias="AURA_L3_MODEL",
        description="L3 Synthesis Layer - Primary response generation",
    )

    # Embeddings Configuration (for semantic search)
    embeddings_model: str = Field(
        default="openai/text-embedding-3-small",
        validation_alias="AURA_EMBEDDING_MODEL",
        description="Embedding model (1536 dimensions for OpenAI compatibility)",
    )
    embeddings_dimension: int = Field(
        default=1536,
        validation_alias="AURA_EMBEDDING_DIMENSION",
        description="Embedding vector dimension",
    )

    # Application Configuration
    environment: str = Field(default="development")
    log_level: str = Field(default="INFO")
    api_host: str = Field(default="0.0.0.0")
    api_port: int = Field(default=8080)

    # Emotion Engine Configuration
    emotion_tick_rate: float = Field(default=5.0, description="Seconds between emotion ticks")
    emotion_persistence_interval: float = Field(
        default=60.0, description="Seconds between emotion state saves"
    )

    # CORS Configuration
    cors_origins: str = Field(
        default="http://localhost:3000,http://localhost:3001",
        description="Comma-separated list of allowed origins",
    )

    @property
    def cors_origins_list(self) -> list[str]:
        """Parse CORS origins string into list."""
        return [origin.strip() for origin in self.cors_origins.split(",")]


# Global settings instance
settings = Settings()

