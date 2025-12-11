"""Emotion Engine API routes."""

from typing import Any

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from aura.models.emotion import EmotionInfluence, EmotionPhysicsConfig, EmotionState

router = APIRouter()

# Global emotion engine reference (will be set by main.py)
_emotion_engine: Any = None


def set_emotion_engine(engine: Any) -> None:
    """Set the global emotion engine instance."""
    global _emotion_engine
    _emotion_engine = engine


def get_emotion_engine() -> Any:
    """Get the emotion engine or raise error."""
    if _emotion_engine is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Emotion engine not initialized",
        )
    return _emotion_engine


class EmotionResponse(BaseModel):
    """Response model for emotion endpoints."""

    success: bool
    data: EmotionState | None = None
    message: str = ""


class InfluenceRequest(BaseModel):
    """Request model for applying emotional influence."""

    source: str = Field(..., description="Source of influence")
    emotions: dict[str, float] = Field(
        ..., description="Emotion deltas {emotion: delta}"
    )
    intensity: float = Field(default=1.0, ge=0.0, le=2.0)
    reason: str = Field(..., description="Reason for influence")


@router.get("/current", response_model=EmotionResponse)
async def get_current_emotion() -> EmotionResponse:
    """
    Get current emotional state with poetic description.

    Returns:
        Current emotional state including:
        - 27D emotion vector
        - Dominant and secondary emotions
        - Volatility and stability scores
        - Human-readable description
    """
    engine = get_emotion_engine()

    try:
        state = await engine.get_current_state()
        return EmotionResponse(success=True, data=state)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get emotional state: {str(e)}",
        )


@router.post("/influence", response_model=EmotionResponse)
async def apply_influence(request: InfluenceRequest) -> EmotionResponse:
    """
    Apply external emotional influence.

    This endpoint allows triggering emotional responses based on:
    - Conversation content
    - Memory recall
    - Goal progress
    - Tool outcomes
    - Learning results

    Args:
        request: Influence specification with emotions and intensity

    Returns:
        Updated emotional state after influence applied
    """
    engine = get_emotion_engine()

    try:
        # Create EmotionInfluence from request
        influence = EmotionInfluence(
            source=request.source,
            emotions=request.emotions,
            intensity=request.intensity,
            reason=request.reason,
        )

        state = await engine.apply_influence(influence)

        return EmotionResponse(
            success=True,
            data=state,
            message=f"Influence applied: {request.reason}",
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to apply influence: {str(e)}",
        )


@router.get("/history")
async def get_emotion_history(limit: int = 100) -> dict[str, Any]:
    """
    Get emotional state history timeline.

    Args:
        limit: Maximum number of historical states to return

    Returns:
        List of historical emotional states with timestamps
    """
    engine = get_emotion_engine()

    try:
        history = await engine.get_history(limit=limit)
        return {"success": True, "count": len(history), "history": history}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve history: {str(e)}",
        )


@router.post("/configure")
async def configure_physics(config: EmotionPhysicsConfig) -> dict[str, Any]:
    """
    Update emotion physics parameters.

    Allows tuning:
    - Decay rates per emotion category
    - Inertia factors
    - Baseline personality

    Args:
        config: New physics configuration

    Returns:
        Confirmation of configuration update
    """
    engine = get_emotion_engine()

    try:
        await engine.configure_physics(config)
        return {
            "success": True,
            "message": "Physics configuration updated",
            "config": config.model_dump(),
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update configuration: {str(e)}",
        )


@router.get("/status")
async def get_engine_status() -> dict[str, Any]:
    """Get emotion engine status."""
    engine = get_emotion_engine()

    status_info = engine.get_status()
    status_info["tick_rate"] = engine.tick_rate
    status_info["volatility_samples"] = len(engine.volatility_history)

    return {"success": True, "status": status_info}

