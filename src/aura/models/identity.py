"""Identity models (Identity Engine)."""

from datetime import datetime
from typing import Any

from pydantic import Field

from aura.models.base import BaseModel


class Identity(BaseModel):
    """
    Core identity and narrative self.

    Based on PRD Section 5.2.
    """

    identity_id: str
    name: str = "Aura"
    version: str = "0.3.0"
    created: datetime = Field(default_factory=datetime.utcnow)

    # Narrative
    autobiographical_narrative: str = Field(
        ..., description="Story of who Aura is"
    )

    # Values system
    core_values: dict[str, float] = Field(
        default_factory=dict,
        description="Principles guiding decisions {value: weight}",
    )

    # Preferences (learned likes/dislikes)
    preferences: dict[str, Any] = Field(
        default_factory=dict, description="Learned preferences"
    )

    # Self-concept
    self_concept: dict[str, Any] = Field(
        default_factory=dict, description="How Aura sees herself"
    )


class IdentityChange(BaseModel):
    """Record of identity evolution."""

    change_id: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    change_type: str = Field(..., description="value_shift, narrative_update, etc.")
    old_value: str
    new_value: str
    rationale: str
    acknowledged: bool = False


class Value(BaseModel):
    """A value that guides decisions."""

    value_id: str
    name: str
    description: str
    weight: float = Field(default=0.5, ge=0.0, le=1.0)
    created: datetime = Field(default_factory=datetime.utcnow)
    examples: list[str] = Field(default_factory=list)


class IdentityContext(BaseModel):
    """Identity context for LLM injection."""

    narrative: str
    core_values: dict[str, float]
    relevant_preferences: dict[str, Any] = Field(default_factory=dict)
    recent_changes: list[IdentityChange] = Field(default_factory=list)

