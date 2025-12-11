"""Learning models (Learning FRD Section 3)."""

from datetime import datetime
from typing import Any, Literal

from pydantic import Field

from aura.models.base import BaseModel


class Experience(BaseModel):
    """
    Logged interaction experience with vector embeddings.

    Based on Learning FRD FR-LL-002.
    """

    experience_id: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    user_id: str
    task_type: str = Field(..., description="e.g., 'code_debugging', 'conversation'")
    domain: str = Field(..., description="e.g., 'javascript', 'philosophy'")

    context: dict[str, Any] = Field(
        ...,
        description="User query, code snippets, tools used, conversation summary",
    )

    aura_response: dict[str, Any] = Field(
        ..., description="Diagnosis, solution, confidence, reasoning strategy"
    )

    outcome: dict[str, Any] = Field(
        ...,
        description="Success status, user feedback, time to resolution, emotional resolution",
    )

    emotional_state: dict[str, Any] = Field(
        ..., description="Pre and post emotional state, dominant emotion"
    )

    metadata: dict[str, Any] = Field(
        default_factory=dict,
        description="Similar experiences, learned_from flag, importance",
    )

    # Vector embedding for semantic pattern extraction
    embedding: list[float] | None = Field(
        default=None, description="Vector embedding for clustering similar experiences"
    )


class Rule(BaseModel):
    """
    Learned heuristic from pattern extraction with semantic embeddings.

    Based on Learning FRD FR-AB-001.
    """

    rule_id: str
    created: datetime = Field(default_factory=datetime.utcnow)
    updated: datetime = Field(default_factory=datetime.utcnow)

    # Content
    condition: str = Field(..., description="When to apply this rule")
    action: str = Field(..., description="What to do")
    rationale: str = Field(..., description="Why this works")
    domain: str = Field(..., description="Domain of applicability")
    task_type: str = Field(..., description="Task type this applies to")

    # Confidence tracking
    confidence: float = Field(..., ge=0.0, le=1.0)
    confidence_history: list[dict[str, Any]] = Field(default_factory=list)

    # Statistics
    application_count: int = Field(default=0, ge=0)
    success_count: int = Field(default=0, ge=0)
    fail_count: int = Field(default=0, ge=0)
    avg_resolution_time: float = Field(default=0.0, ge=0.0)
    last_used: datetime | None = None

    # Provenance
    source_experiences: list[str] = Field(default_factory=list)
    extraction_method: str = Field(default="manual")
    validated_against: list[str] = Field(default_factory=list)

    # Emotional signature
    emotional_signature: dict[str, float] = Field(default_factory=dict)

    # Relationships
    extends: list[str] = Field(default_factory=list)
    contradicts: list[str] = Field(default_factory=list)
    similar_to: list[str] = Field(default_factory=list)
    prerequisite_for: list[str] = Field(default_factory=list)

    # Metadata
    user_specific: bool = Field(default=False)
    deprecated: bool = Field(default=False)
    deprecation_threshold: float = Field(default=0.4, ge=0.0, le=1.0)

    # Vector embedding for semantic rule retrieval
    embedding: list[float] | None = Field(
        default=None,
        description="Vector embedding for semantic similarity search (condition + action)",
    )


class Skill(BaseModel):
    """
    Hierarchical knowledge organization node.

    Based on Learning FRD FR-ST-001.
    """

    skill_id: str
    name: str
    domain: str
    created: datetime = Field(default_factory=datetime.utcnow)

    # Mastery
    mastery_level: float = Field(default=0.0, ge=0.0, le=1.0)

    # Emotional association
    emotional_signature: dict[str, float] = Field(default_factory=dict)

    # Hierarchy
    parent_skill_id: str | None = None
    sub_skill_ids: list[str] = Field(default_factory=list)
    rule_ids: list[str] = Field(default_factory=list)

    # Metadata
    last_practiced: datetime | None = None
    practice_count: int = Field(default=0, ge=0)


class Strategy(BaseModel):
    """
    Reasoning strategy meta-layer.

    Based on Learning FRD FR-RS-001.
    """

    strategy_id: str
    task_type: str = Field(..., description="Type of task this strategy applies to")
    approach: str = Field(..., description="Name of reasoning approach")

    # Performance
    success_rate: float = Field(default=0.0, ge=0.0, le=1.0)
    avg_confidence: float = Field(default=0.0, ge=0.0, le=1.0)
    usage_count: int = Field(default=0, ge=0)

    # Emotional prerequisites
    emotional_prerequisites: dict[str, float] = Field(
        default_factory=dict, description="Required emotional state {emotion: min_value}"
    )

    # Guidance
    when_to_use: str = Field(default="", description="Guidance on when to apply")
    examples: list[str] = Field(default_factory=list, description="Example experience IDs")

    # Metadata
    last_updated: datetime = Field(default_factory=datetime.utcnow)


class LearningContext(BaseModel):
    """Learning context for rule retrieval and application."""

    rules: list[Rule] = Field(default_factory=list)
    strategy: Strategy | None = None
    confidence_level: float = Field(default=0.0, ge=0.0, le=1.0)
    mastery_level: float = Field(default=0.0, ge=0.0, le=1.0)
    emotional_alignment: dict[str, float] = Field(default_factory=dict)

