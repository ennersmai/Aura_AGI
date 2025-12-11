"""
Reflection Engine - Continuous self-improvement through analysis.

Implements PRD Section 5.5 (Reflection Engine).
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Any
from uuid import uuid4

from aura.db.client import get_db_client
from aura.engines.base import BaseEngine
from aura.models.reflection import Reflection, ReflectionInsight

logger = logging.getLogger(__name__)


class ReflectionEngine(BaseEngine):
    """
    Reflection Engine for continuous self-improvement.

    Features:
    - Nightly reflection sessions
    - Pattern detection across experiences
    - Self-analysis and improvement proposals
    - Metacognitive awareness
    """

    def __init__(self):
        """Initialize reflection engine."""
        super().__init__("reflection_engine")

        # Database
        self.db = get_db_client()

        # Message bus
        self._message_bus: Any = None

        # State
        self.last_reflection: datetime | None = None
        self.reflection_interval = 86400.0  # 24 hours (daily)

        # For testing, can be set shorter
        self.test_mode = False
        if self.test_mode:
            self.reflection_interval = 3600.0  # 1 hour

    def set_message_bus(self, message_bus: Any) -> None:
        """Set message bus for inter-engine communication."""
        self._message_bus = message_bus

    async def initialize(self) -> None:
        """Initialize engine resources."""
        self.logger.info("Initializing Reflection Engine...")

        # Load last reflection time
        try:
            result = await self.db.query(
                """
                SELECT timestamp FROM reflection
                ORDER BY timestamp DESC
                LIMIT 1
                """
            )

            if result and result[0]["result"]:
                self.last_reflection = result[0]["result"][0]["timestamp"]

        except Exception as e:
            self.logger.warning(f"Could not load last reflection: {e}")

        self.logger.info(
            f"Reflection Engine initialized - "
            f"Last reflection: {self.last_reflection or 'Never'}"
        )

    async def tick(self) -> None:
        """
        Execute one reflection engine cycle.

        Checks if it's time for reflection.
        """
        now = datetime.utcnow()

        # Check if reflection is due
        if self.last_reflection:
            time_since = (now - self.last_reflection).total_seconds()
            if time_since < self.reflection_interval:
                # Not yet time
                await asyncio.sleep(3600.0)  # Check every hour
                return

        # Time for reflection!
        self.logger.info("Starting reflection session...")

        try:
            await self.reflect_on_day()
            self.last_reflection = now
        except Exception as e:
            self.logger.error(f"Reflection failed: {e}")

        await asyncio.sleep(3600.0)  # Check every hour

    async def shutdown(self) -> None:
        """Clean up engine resources."""
        self.logger.info("Shutting down Reflection Engine...")

    # Core Methods

    async def reflect_on_day(self) -> Reflection:
        """
        Perform daily reflection on experiences.

        Analyzes:
        - Emotional trajectory
        - Learning patterns
        - Goal progress
        - Identity shifts

        Returns:
            Reflection session
        """
        now = datetime.utcnow()
        period_start = now - timedelta(hours=24)

        self.logger.info(f"Reflecting on period: {period_start} to {now}")

        # Gather data from different engines
        emotional_summary = await self._summarize_emotions(period_start, now)
        learning_patterns = await self._analyze_learning(period_start, now)
        goal_progress = await self._review_goals(period_start, now)
        identity_shifts = await self._detect_identity_changes(period_start, now)

        # Extract insights
        insights = []

        # Insight from emotional patterns
        if emotional_summary.get("dominant_emotion"):
            insights.append(
                {
                    "type": "emotional_pattern",
                    "description": f"Dominant emotion: {emotional_summary['dominant_emotion']}",
                    "confidence": 0.8,
                }
            )

        # Insight from learning
        if learning_patterns.get("experiences_count", 0) >= 5:
            insights.append(
                {
                    "type": "learning_opportunity",
                    "description": f"Logged {learning_patterns['experiences_count']} experiences - "
                    "pattern extraction recommended",
                    "confidence": 0.7,
                    "actionable": True,
                }
            )

        # Create reflection
        reflection = Reflection(
            reflection_id=f"reflection:{uuid4().hex[:12]}",
            period_start=period_start,
            period_end=now,
            reflection_type="daily",
            insights=insights,
            patterns_found=learning_patterns.get("patterns", []),
            emotional_summary=emotional_summary,
            goal_progress=goal_progress,
            identity_shifts=identity_shifts,
            proposals=[],  # TODO: Generate improvement proposals
        )

        # Store reflection
        try:
            await self.db.create("reflection", reflection.model_dump())
            self.logger.info(
                f"Reflection complete - {len(insights)} insights, "
                f"{len(learning_patterns.get('patterns', []))} patterns"
            )
        except Exception as e:
            self.logger.error(f"Failed to store reflection: {e}")

        # Trigger actions based on insights
        await self._act_on_insights(insights)

        return reflection

    async def analyze_interaction(
        self,
        user_input: str,
        aura_response: str,
        context: dict[str, Any],
    ) -> list[ReflectionInsight]:
        """
        Immediate reflection on a single interaction.

        Args:
            user_input: User's message
            aura_response: Aura's response
            context: Interaction context

        Returns:
            List of insights
        """
        insights = []

        # Quick coherence check
        # TODO: Use L2 to analyze response quality

        return insights

    # Private Methods

    async def _summarize_emotions(
        self, start: datetime, end: datetime
    ) -> dict[str, Any]:
        """Summarize emotional trajectory for period."""
        try:
            result = await self.db.query(
                """
                SELECT * FROM emotion_state
                WHERE timestamp >= $start AND timestamp <= $end
                ORDER BY timestamp ASC
                """,
                {"start": start.isoformat(), "end": end.isoformat()},
            )

            if not result or not result[0]["result"]:
                return {}

            states = result[0]["result"]

            # Find dominant emotion across period
            emotion_counts: dict[str, int] = {}
            for state in states:
                dominant = state.get("dominant", [])
                if dominant:
                    emotion = dominant[0]
                    emotion_counts[emotion] = emotion_counts.get(emotion, 0) + 1

            dominant_emotion = (
                max(emotion_counts.items(), key=lambda x: x[1])[0]
                if emotion_counts
                else None
            )

            return {
                "states_count": len(states),
                "dominant_emotion": dominant_emotion,
                "emotion_distribution": emotion_counts,
            }

        except Exception as e:
            self.logger.error(f"Failed to summarize emotions: {e}")
            return {}

    async def _analyze_learning(
        self, start: datetime, end: datetime
    ) -> dict[str, Any]:
        """Analyze learning patterns for period."""
        try:
            # Count experiences
            exp_result = await self.db.query(
                """
                SELECT count() FROM experience
                WHERE timestamp >= $start AND timestamp <= $end
                GROUP ALL
                """,
                {"start": start.isoformat(), "end": end.isoformat()},
            )

            experiences_count = 0
            if exp_result and exp_result[0]["result"]:
                experiences_count = exp_result[0]["result"][0].get("count", 0)

            # Count new rules
            rule_result = await self.db.query(
                """
                SELECT count() FROM rule
                WHERE created >= $start AND created <= $end
                GROUP ALL
                """,
                {"start": start.isoformat(), "end": end.isoformat()},
            )

            rules_count = 0
            if rule_result and rule_result[0]["result"]:
                rules_count = rule_result[0]["result"][0].get("count", 0)

            return {
                "experiences_count": experiences_count,
                "rules_created": rules_count,
                "patterns": [],  # TODO: Detect actual patterns
            }

        except Exception as e:
            self.logger.error(f"Failed to analyze learning: {e}")
            return {}

    async def _review_goals(self, start: datetime, end: datetime) -> dict[str, Any]:
        """Review goal progress for period."""
        try:
            result = await self.db.query(
                """
                SELECT * FROM goal
                WHERE updated >= $start AND updated <= $end
                """,
                {"start": start.isoformat(), "end": end.isoformat()},
            )

            if not result or not result[0]["result"]:
                return {"goals_updated": 0}

            goals = result[0]["result"]

            completed = len([g for g in goals if g.get("status") == "completed"])

            return {
                "goals_updated": len(goals),
                "goals_completed": completed,
            }

        except Exception as e:
            self.logger.error(f"Failed to review goals: {e}")
            return {}

    async def _detect_identity_changes(
        self, start: datetime, end: datetime
    ) -> list[dict[str, Any]]:
        """Detect identity changes for period."""
        try:
            result = await self.db.query(
                """
                SELECT * FROM identity_change
                WHERE timestamp >= $start AND timestamp <= $end
                ORDER BY timestamp ASC
                """,
                {"start": start.isoformat(), "end": end.isoformat()},
            )

            if not result or not result[0]["result"]:
                return []

            return result[0]["result"]

        except Exception as e:
            self.logger.error(f"Failed to detect identity changes: {e}")
            return []

    async def _act_on_insights(self, insights: list[dict[str, Any]]) -> None:
        """Take action based on reflection insights."""
        for insight in insights:
            if not insight.get("actionable"):
                continue

            # Trigger pattern extraction if recommended
            if insight.get("type") == "learning_opportunity":
                self.logger.info("Triggering pattern extraction based on reflection")
                # TODO: Send message to learning engine to extract patterns

