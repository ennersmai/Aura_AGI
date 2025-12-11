"""Memory models (PRD Section 8.1)."""

from datetime import datetime
from typing import Any

from pydantic import Field

from aura.models.base import BaseModel


class Memory(BaseModel):
    """
    Memory node with emotional tagging and vector embeddings.

    Based on PRD Section 8.1.
    """

    memory_id: str
    content: str = Field(..., description="Memory content")
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    # Emotional context
    emotional_signature: dict[str, float] = Field(
        default_factory=dict, description="Emotional state during memory formation"
    )

    # Metadata
    importance: float = Field(default=0.5, ge=0.0, le=1.0)
    learned_from: bool = Field(default=False, description="Has this memory been learned from?")
    conversation_id: str | None = None
    user_id: str | None = None

    # Additional context
    tags: list[str] = Field(default_factory=list)
    metadata: dict[str, Any] = Field(default_factory=dict)

    # Vector embedding for semantic search (1536 dimensions for OpenAI/OpenRouter)
    embedding: list[float] | None = Field(
        default=None, description="Vector embedding for semantic similarity search"
    )


class Conversation(BaseModel):
    """Conversation session."""

    conversation_id: str
    user_id: str
    started_at: datetime = Field(default_factory=datetime.utcnow)
    ended_at: datetime | None = None

    # Messages
    message_count: int = Field(default=0, ge=0)

    # Emotional trajectory
    initial_emotion: dict[str, float] = Field(default_factory=dict)
    final_emotion: dict[str, float] = Field(default_factory=dict)

    # Summary
    summary: str = Field(default="")
    key_topics: list[str] = Field(default_factory=list)

    # Learning
    experiences_logged: list[str] = Field(default_factory=list)
    rules_created: list[str] = Field(default_factory=list)

