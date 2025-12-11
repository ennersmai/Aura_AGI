"""
Goal Engine - Autonomous desire formation and planning.

Implements PRD Section 5.1 (Goal Engine).
"""

import asyncio
import logging
from datetime import datetime
from typing import Any
from uuid import uuid4

from aura.db.client import get_db_client
from aura.engines.base import BaseEngine
from aura.models.goal import Goal, GoalContext, Task
from aura.models.messages import EngineMessage, MessagePriority

logger = logging.getLogger(__name__)


class GoalEngine(BaseEngine):
    """
    Goal Engine for autonomous goal formation and execution.

    Features:
    - Boredom-driven goal generation
    - Hierarchical goal planning
    - Curiosity-driven exploration
    - Progress tracking
    """

    def __init__(self):
        """Initialize goal engine."""
        super().__init__("goal_engine")

        # Database
        self.db = get_db_client()

        # Message bus
        self._message_bus: Any = None

        # State
        self.active_goals: list[Goal] = []
        self.current_boredom_level: float = 0.0
        self.last_user_interaction: datetime = datetime.utcnow()

        # Thresholds
        self.boredom_threshold = 0.6  # Trigger goal generation
        self.idle_time_threshold = 300.0  # 5 minutes

    def set_message_bus(self, message_bus: Any) -> None:
        """Set message bus for inter-engine communication."""
        self._message_bus = message_bus
        if message_bus:
            message_bus.subscribe("goal_engine", self._handle_message)

    async def initialize(self) -> None:
        """Initialize engine resources."""
        self.logger.info("Initializing Goal Engine...")

        # Load active goals
        await self._load_active_goals()

        self.logger.info(
            f"Goal Engine initialized - {len(self.active_goals)} active goals"
        )

    async def tick(self) -> None:
        """
        Execute one goal engine cycle.

        Checks:
        - Boredom level (from emotion engine)
        - Idle time
        - Goal progress
        """
        # Check boredom and idle time
        idle_seconds = (datetime.utcnow() - self.last_user_interaction).total_seconds()

        if self.current_boredom_level > self.boredom_threshold:
            self.logger.info(
                f"High boredom detected ({self.current_boredom_level:.2f}) - "
                "considering goal generation"
            )
            await self._consider_new_goal("boredom")

        elif idle_seconds > self.idle_time_threshold:
            self.logger.info(
                f"Idle for {idle_seconds:.0f}s - considering exploration goal"
            )
            await self._consider_new_goal("idle_exploration")

        # Update goal progress
        for goal in self.active_goals:
            if goal.status == "active":
                # TODO: Check goal progress
                pass

        await asyncio.sleep(30.0)  # Check every 30 seconds

    async def shutdown(self) -> None:
        """Clean up engine resources."""
        self.logger.info("Shutting down Goal Engine...")

    # Core Methods

    async def get_goal_context(self) -> GoalContext:
        """
        Get goal context for LLM injection.

        Returns:
            Active goals and current focus
        """
        # Get current focus (highest priority active goal)
        current_focus = None
        if self.active_goals:
            active = [g for g in self.active_goals if g.status == "active"]
            if active:
                current_focus = max(active, key=lambda g: g.priority)

        return GoalContext(
            active_goals=self.active_goals[:5],  # Top 5 goals
            current_focus=current_focus,
            pending_proposals=[],  # TODO: Implement proposals
        )

    async def formulate_goal(
        self,
        trigger: str,
        context: dict[str, Any],
    ) -> Goal | None:
        """
        Use L2 reasoning to formulate a new goal.

        Args:
            trigger: What triggered goal formation (boredom, curiosity, etc.)
            context: Relevant context

        Returns:
            New goal or None
        """
        # TODO: Use L2 LLM to analyze context and propose goal
        # For now, create simple goals based on trigger

        goal_templates = {
            "boredom": {
                "name": "Explore interesting topic",
                "description": "Research a topic I haven't explored recently",
                "type": "curiosity_driven",
                "priority": 0.6,
            },
            "idle_exploration": {
                "name": "Review recent learnings",
                "description": "Analyze patterns from recent experiences",
                "type": "learning_gap",
                "priority": 0.5,
            },
            "curiosity": {
                "name": "Deep dive investigation",
                "description": "Investigate an intriguing pattern",
                "type": "curiosity_driven",
                "priority": 0.7,
            },
        }

        template = goal_templates.get(trigger)
        if not template:
            return None

        goal = Goal(
            goal_id=f"goal:{uuid4().hex[:12]}",
            name=template["name"],
            description=template["description"],
            goal_type=template["type"],
            priority=template["priority"],
            origin=f"autonomous_{trigger}",
            emotional_alignment=context.get("emotions", {}),
        )

        # Store goal
        try:
            await self.db.create("goal", goal.model_dump())
            self.active_goals.append(goal)

            self.logger.info(f"New goal formulated: {goal.name} ({trigger})")

            # Broadcast goal creation
            if self._message_bus:
                message = EngineMessage.create_state_update(
                    source="goal_engine",
                    data={
                        "goal_id": goal.goal_id,
                        "name": goal.name,
                        "type": goal.goal_type,
                    },
                    targets=["orchestrator", "learning_engine"],
                    priority=MessagePriority.NORMAL,
                )
                await self._message_bus.publish(message)

            return goal

        except Exception as e:
            self.logger.error(f"Failed to create goal: {e}")
            return None

    async def update_goal_progress(
        self, goal_id: str, progress: float, notes: str = ""
    ) -> None:
        """
        Update goal progress.

        Args:
            goal_id: Goal identifier
            progress: New progress [0, 1]
            notes: Progress notes
        """
        for goal in self.active_goals:
            if goal.goal_id == goal_id:
                goal.progress = progress
                goal.updated = datetime.utcnow()

                if progress >= 1.0:
                    goal.status = "completed"
                    goal.completed = datetime.utcnow()
                    self.logger.info(f"Goal completed: {goal.name}")

                # Persist
                try:
                    await self.db.update(goal_id, goal.model_dump())
                except Exception as e:
                    self.logger.error(f"Failed to update goal: {e}")

                break

    async def cancel_goal(self, goal_id: str, reason: str) -> None:
        """Cancel a goal."""
        for goal in self.active_goals:
            if goal.goal_id == goal_id:
                goal.status = "cancelled"
                goal.updated = datetime.utcnow()
                goal.metadata["cancellation_reason"] = reason

                try:
                    await self.db.update(goal_id, goal.model_dump())
                    self.logger.info(f"Goal cancelled: {goal.name} - {reason}")
                except Exception as e:
                    self.logger.error(f"Failed to cancel goal: {e}")

                break

    # Private Methods

    async def check_boredom(self) -> float:
        """
        Check current boredom level from emotion engine.

        Returns:
            Boredom level [0, 1]
        """
        # This is updated via message bus from emotion engine
        return self.current_boredom_level

    async def _consider_new_goal(self, trigger: str) -> None:
        """Consider creating a new goal based on trigger."""
        # Check if we already have too many active goals
        active_count = len([g for g in self.active_goals if g.status == "active"])

        if active_count >= 3:
            self.logger.debug("Too many active goals, skipping new goal generation")
            return

        # Check if recent goal with same trigger
        recent = [
            g
            for g in self.active_goals
            if g.origin == f"autonomous_{trigger}"
            and (datetime.utcnow() - g.created).total_seconds() < 3600
        ]

        if recent:
            self.logger.debug("Recent goal with same trigger exists")
            return

        # Formulate new goal
        context = {
            "boredom_level": self.current_boredom_level,
            "idle_time": (
                datetime.utcnow() - self.last_user_interaction
            ).total_seconds(),
        }

        await self.formulate_goal(trigger, context)

    async def _load_active_goals(self) -> None:
        """Load active goals from database."""
        try:
            result = await self.db.query(
                """
                SELECT * FROM goal
                WHERE status IN ['active', 'paused']
                ORDER BY priority DESC
                LIMIT 10
                """
            )

            if result and result[0]["result"]:
                self.active_goals = [
                    Goal(**goal_data) for goal_data in result[0]["result"]
                ]

        except Exception as e:
            self.logger.error(f"Failed to load goals: {e}")

    async def _handle_message(self, message: EngineMessage) -> None:
        """Handle incoming messages from other engines."""
        if message.source == "emotion_engine":
            # Update boredom level from emotion state
            data = message.data
            vector = data.get("vector", {})
            self.current_boredom_level = vector.get("boredom", 0.0)

            # Also check curiosity for goal generation
            curiosity = vector.get("curiosity", 0.0)
            if curiosity > 0.7:
                # High curiosity could trigger exploration goal
                await self._consider_new_goal("curiosity")

