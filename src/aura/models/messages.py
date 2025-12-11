"""Inter-engine message bus models (Cognitive Architecture PRD Section 3.2)."""

from datetime import datetime
from enum import Enum
from typing import Any

from pydantic import Field

from aura.models.base import BaseModel


class MessageType(str, Enum):
    """Types of messages engines can send."""

    STATE_UPDATE = "state_update"  # "Here's my current state"
    QUERY = "query"  # "I need information"
    PROPOSAL = "proposal"  # "I want to do something"
    CONFLICT = "conflict"  # "I have a problem"
    RESPONSE = "response"  # "Here's my answer"


class MessagePriority(str, Enum):
    """Message priority levels."""

    NORMAL = "normal"
    URGENT = "urgent"


class EngineMessage(BaseModel):
    """
    Standardized message format for inter-engine communication.

    Based on Cognitive Architecture PRD Section 3.2 (OR-005).
    """

    source: str = Field(..., description="Which engine sent this message")
    timestamp: float = Field(
        default_factory=lambda: datetime.utcnow().timestamp(),
        description="Unix timestamp of message creation",
    )
    message_type: MessageType = Field(..., description="Type of message")
    priority: MessagePriority = Field(
        default=MessagePriority.NORMAL, description="Message priority level"
    )
    data: dict[str, Any] = Field(..., description="Engine-specific payload")
    targets: list[str] = Field(..., description="List of target engine IDs")
    requires_response: bool = Field(
        default=False, description="Does sender expect a reply?"
    )
    correlation_id: str | None = Field(
        default=None, description="ID for tracking message conversations"
    )

    @classmethod
    def create_state_update(
        cls,
        source: str,
        data: dict[str, Any],
        targets: list[str],
        priority: MessagePriority = MessagePriority.NORMAL,
    ) -> "EngineMessage":
        """Factory method for state update messages."""
        return cls(
            source=source,
            message_type=MessageType.STATE_UPDATE,
            priority=priority,
            data=data,
            targets=targets,
        )

    @classmethod
    def create_query(
        cls,
        source: str,
        data: dict[str, Any],
        targets: list[str],
        correlation_id: str | None = None,
    ) -> "EngineMessage":
        """Factory method for query messages."""
        return cls(
            source=source,
            message_type=MessageType.QUERY,
            data=data,
            targets=targets,
            requires_response=True,
            correlation_id=correlation_id,
        )

    @classmethod
    def create_conflict(
        cls, source: str, data: dict[str, Any], targets: list[str]
    ) -> "EngineMessage":
        """Factory method for conflict messages."""
        return cls(
            source=source,
            message_type=MessageType.CONFLICT,
            priority=MessagePriority.URGENT,
            data=data,
            targets=targets,
        )

