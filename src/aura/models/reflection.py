"""Reflection models (Reflection Engine)."""

from datetime import datetime
from typing import Any

from pydantic import Field

from aura.models.base import BaseModel


class Reflection(BaseModel):
    """
    Reflection session analyzing a period of time.

    Based on PRD Section 5.5.
    """

    reflection_id: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    # Period covered
    period_start: datetime
    period_end: datetime
    reflection_type: str = Field(..., description="daily, weekly, session")

    # Insights
    insights: list[dict[str, Any]] = Field(
        default_factory=list, description="Key learnings from period"
    )

    patterns_found: list[dict[str, Any]] = Field(
        default_factory=list, description="Behavioral patterns detected"
    )

    # Summaries
    emotional_summary: dict[str, Any] = Field(
        default_factory=dict, description="Emotional trajectory"
    )

    goal_progress: dict[str, Any] = Field(
        default_factory=dict, description="Progress on active goals"
    )

    identity_shifts: list[dict[str, Any]] = Field(
        default_factory=list, description="Changes in self-concept"
    )

    # Proposals
    proposals: list[dict[str, Any]] = Field(
        default_factory=list, description="Suggested improvements"
    )


class ReflectionInsight(BaseModel):
    """A specific insight from reflection."""

    insight_type: str
    description: str
    confidence: float = Field(default=0.5, ge=0.0, le=1.0)
    evidence: list[str] = Field(default_factory=list)
    actionable: bool = False
    priority: float = Field(default=0.5, ge=0.0, le=1.0)

