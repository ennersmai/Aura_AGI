"""Learning Engine API routes."""

from typing import Any

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from aura.models.learning import LearningContext, Rule

router = APIRouter()

# Global learning engine reference (will be set by main.py)
_learning_engine: Any = None


def set_learning_engine(engine: Any) -> None:
    """Set the global learning engine instance."""
    global _learning_engine
    _learning_engine = engine


def get_learning_engine() -> Any:
    """Get the learning engine or raise error."""
    if _learning_engine is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Learning engine not initialized",
        )
    return _learning_engine


class ExperienceRequest(BaseModel):
    """Request model for logging experience."""

    user_id: str = Field(default="default")
    task_type: str = Field(..., description="e.g., 'code_debugging', 'conversation'")
    domain: str = Field(..., description="e.g., 'javascript', 'philosophy'")
    context: dict[str, Any] = Field(..., description="Task context")
    aura_response: dict[str, Any] = Field(..., description="Aura's response")
    outcome: dict[str, Any] = Field(..., description="Result of interaction")
    emotional_state: dict[str, Any] = Field(default_factory=dict)


class RuleRequest(BaseModel):
    """Request model for creating a rule."""

    condition: str
    action: str
    rationale: str = ""
    domain: str = "general"
    task_type: str = "unknown"
    confidence: float = Field(default=0.5, ge=0.0, le=1.0)
    user_specific: bool = False
    emotional_signature: dict[str, float] = Field(default_factory=dict)


class RuleFeedbackRequest(BaseModel):
    """Request model for rule application feedback."""

    rule_id: str
    success: bool
    resolution_time: float | None = None


@router.post("/experience")
async def log_experience(request: ExperienceRequest) -> dict[str, Any]:
    """
    Log an interaction experience for learning.

    This captures:
    - User query and context
    - Aura's response and reasoning
    - Outcome (success/failure)
    - Emotional state during interaction

    Experiences are clustered for pattern extraction.
    """
    engine = get_learning_engine()

    try:
        experience_id = await engine.log_experience(request.model_dump())

        return {
            "success": True,
            "experience_id": experience_id,
            "message": "Experience logged successfully",
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to log experience: {str(e)}",
        )


@router.get("/rules")
async def get_rules(
    domain: str | None = None,
    confidence_min: float = 0.5,
    user_id: str | None = None,
    limit: int = 10,
) -> dict[str, Any]:
    """
    Retrieve learned rules with filters.

    Args:
        domain: Filter by domain
        confidence_min: Minimum confidence threshold
        user_id: Filter for user-specific rules
        limit: Maximum rules to return

    Returns:
        List of rules matching criteria
    """
    engine = get_learning_engine()

    try:
        # For generic retrieval, use empty context
        rules = await engine.retrieve_rules(
            context="",
            domain=domain,
            confidence_min=confidence_min,
            user_id=user_id,
            limit=limit,
        )

        return {
            "success": True,
            "count": len(rules),
            "rules": [rule.model_dump() for rule in rules],
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve rules: {str(e)}",
        )


@router.post("/rules")
async def create_rule(request: RuleRequest) -> dict[str, Any]:
    """
    Manually create a learned rule.

    Typically rules are extracted automatically from patterns,
    but this allows manual rule creation for bootstrapping.
    """
    engine = get_learning_engine()

    try:
        rule_id = await engine.create_rule(request.model_dump())

        return {
            "success": True,
            "rule_id": rule_id,
            "message": "Rule created successfully",
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create rule: {str(e)}",
        )


@router.post("/rules/feedback")
async def submit_rule_feedback(request: RuleFeedbackRequest) -> dict[str, Any]:
    """
    Submit feedback on rule application.

    Updates rule confidence via Bayesian updating based on success/failure.
    """
    engine = get_learning_engine()

    try:
        await engine.update_rule_confidence(
            rule_id=request.rule_id,
            success=request.success,
            resolution_time=request.resolution_time,
        )

        return {
            "success": True,
            "message": "Rule confidence updated",
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update rule: {str(e)}",
        )


@router.get("/context")
async def get_learning_context(
    context: str,
    domain: str | None = None,
    user_id: str | None = None,
) -> dict[str, Any]:
    """
    Get complete learning context for LLM injection.

    Returns:
        - Relevant rules
        - Overall confidence level
        - Mastery level in domain
        - Emotional associations
    """
    engine = get_learning_engine()

    try:
        learning_context = await engine.get_learning_context(
            context=context, domain=domain, user_id=user_id
        )

        return {
            "success": True,
            "context": learning_context.model_dump(),
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get learning context: {str(e)}",
        )


@router.get("/skills")
async def get_skills(domain: str | None = None) -> dict[str, Any]:
    """
    Get all skills, optionally filtered by domain.

    Returns hierarchical skill tree structure.
    """
    engine = get_learning_engine()

    try:
        skills = await engine.get_skills_by_domain(domain) if domain else []

        return {
            "success": True,
            "count": len(skills),
            "skills": [skill.model_dump() for skill in skills],
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve skills: {str(e)}",
        )


@router.get("/skills/{skill_id}/mastery")
async def get_skill_mastery(skill_id: str) -> dict[str, Any]:
    """
    Calculate and return mastery level for a skill.

    Mastery is calculated from:
    - Sub-skill masteries
    - Rule confidence levels
    - Recent application success rates
    """
    engine = get_learning_engine()

    try:
        skill = await engine.get_skill(skill_id)

        if not skill:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Skill not found: {skill_id}",
            )

        # Mastery calculation handled by skill tree manager
        from aura.engines.learning.skills import SkillTreeManager

        skill_tree = SkillTreeManager()
        mastery = await skill_tree.calculate_mastery(skill_id)

        return {
            "success": True,
            "skill_id": skill_id,
            "name": skill.name,
            "mastery_level": mastery,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to calculate mastery: {str(e)}",
        )


@router.get("/status")
async def get_engine_status() -> dict[str, Any]:
    """Get learning engine status."""
    engine = get_learning_engine()

    status_info = engine.get_status()
    status_info["experiences_logged"] = engine.experiences_logged
    status_info["rules_created"] = engine.rules_created

    return {"success": True, "status": status_info}

