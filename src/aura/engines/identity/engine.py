"""
Identity Engine - Narrative self and values system.

Implements PRD Section 5.2 (Identity Engine).
"""

import asyncio
import logging
from datetime import datetime
from typing import Any
from uuid import uuid4

from aura.db.client import get_db_client
from aura.engines.base import BaseEngine
from aura.models.identity import Identity, IdentityChange, IdentityContext, Value
from aura.models.messages import EngineMessage

logger = logging.getLogger(__name__)


class IdentityEngine(BaseEngine):
    """
    Identity Engine maintaining coherent narrative self across time.

    Features:
    - Autobiographical narrative
    - Values system (meta-values over object-values)
    - Preferences (learned likes/dislikes)
    - Evolution tracking (changelog)
    """

    def __init__(self):
        """Initialize identity engine."""
        super().__init__("identity_engine")

        # Database
        self.db = get_db_client()

        # Message bus (will be set by orchestrator)
        self._message_bus: Any = None

        # Current identity (cached)
        self.current_identity: Identity | None = None

        # Changelog
        self.recent_changes: list[IdentityChange] = []

    def set_message_bus(self, message_bus: Any) -> None:
        """Set message bus for inter-engine communication."""
        self._message_bus = message_bus

    async def initialize(self) -> None:
        """Initialize engine resources."""
        self.logger.info("Initializing Identity Engine...")

        # Load current identity
        await self._load_identity()

        # Subscribe to relevant messages
        if self._message_bus:
            self._message_bus.subscribe(
                "identity_engine", self._handle_message
            )

        self.logger.info(
            f"Identity Engine initialized - {self.current_identity.name if self.current_identity else 'No identity'}"
        )

    async def tick(self) -> None:
        """
        Execute one identity engine cycle.

        Periodic check for identity evolution (weekly).
        """
        # Sleep for a long time - identity doesn't change rapidly
        await asyncio.sleep(3600.0)  # 1 hour

        # Check if identity needs evolution review
        # TODO: Implement identity evolution analysis

    async def shutdown(self) -> None:
        """Clean up engine resources."""
        self.logger.info("Shutting down Identity Engine...")

    # Core Methods

    async def get_identity_context(
        self, conversation_topic: str | None = None
    ) -> IdentityContext:
        """
        Get identity context for LLM injection.

        Args:
            conversation_topic: Optional topic to filter relevant preferences

        Returns:
            Identity context with narrative, values, preferences
        """
        if not self.current_identity:
            await self._load_identity()

        if not self.current_identity:
            # Create default identity if none exists
            await self._create_default_identity()

        # Get relevant preferences based on topic
        relevant_prefs = {}
        if conversation_topic and self.current_identity.preferences:
            # TODO: Implement preference filtering by relevance
            relevant_prefs = self.current_identity.preferences

        return IdentityContext(
            narrative=self.current_identity.autobiographical_narrative,
            core_values=self.current_identity.core_values,
            relevant_preferences=relevant_prefs,
            recent_changes=self.recent_changes[-5:],  # Last 5 changes
        )

    async def update_narrative(self, new_narrative: str, rationale: str) -> None:
        """
        Update autobiographical narrative.

        Args:
            new_narrative: New narrative text
            rationale: Why this update is being made
        """
        if not self.current_identity:
            return

        old_narrative = self.current_identity.autobiographical_narrative

        # Record change
        change = IdentityChange(
            change_id=f"change:{uuid4().hex[:12]}",
            change_type="narrative_update",
            old_value=old_narrative[:100],  # Truncate for storage
            new_value=new_narrative[:100],
            rationale=rationale,
        )

        # Update identity
        self.current_identity.autobiographical_narrative = new_narrative

        # Persist
        await self._persist_identity()
        await self._log_change(change)

        self.recent_changes.append(change)

        self.logger.info(f"Narrative updated: {rationale}")

    async def update_value(
        self, value_name: str, new_weight: float, rationale: str
    ) -> None:
        """
        Update a core value weight.

        Args:
            value_name: Name of value to update
            new_weight: New weight [0, 1]
            rationale: Why this change
        """
        if not self.current_identity:
            return

        old_weight = self.current_identity.core_values.get(value_name, 0.0)

        if abs(old_weight - new_weight) < 0.05:
            return  # Insignificant change

        # Record change
        change = IdentityChange(
            change_id=f"change:{uuid4().hex[:12]}",
            change_type="value_shift",
            old_value=f"{value_name}={old_weight:.2f}",
            new_value=f"{value_name}={new_weight:.2f}",
            rationale=rationale,
        )

        # Update value
        self.current_identity.core_values[value_name] = new_weight

        # Persist
        await self._persist_identity()
        await self._log_change(change)

        self.recent_changes.append(change)

        self.logger.info(
            f"Value updated: {value_name} {old_weight:.2f} -> {new_weight:.2f}"
        )

    async def add_preference(
        self, category: str, item: str, sentiment: float
    ) -> None:
        """
        Add or update a preference.

        Args:
            category: Preference category (e.g., "topics", "styles")
            item: Specific item
            sentiment: Positive (>0) or negative (<0) preference
        """
        if not self.current_identity:
            return

        if category not in self.current_identity.preferences:
            self.current_identity.preferences[category] = {}

        self.current_identity.preferences[category][item] = sentiment

        # Persist
        await self._persist_identity()

        self.logger.debug(f"Preference added: {category}/{item} = {sentiment:.2f}")

    async def get_value_alignment(self, action_description: str) -> float:
        """
        Calculate alignment of an action with core values.

        Args:
            action_description: Description of proposed action

        Returns:
            Alignment score [-1, 1]
        """
        if not self.current_identity or not self.current_identity.core_values:
            return 0.0

        # TODO: Use LLM to analyze alignment
        # For now, return neutral
        return 0.0

    # Private Methods

    async def _load_identity(self) -> None:
        """Load identity from database."""
        try:
            result = await self.db.query("SELECT * FROM identity LIMIT 1")

            if result and result[0]["result"]:
                identity_data = result[0]["result"][0]
                self.current_identity = Identity(**identity_data)
                self.logger.info("Identity loaded from database")
            else:
                self.logger.warning("No identity found in database")

        except Exception as e:
            self.logger.error(f"Failed to load identity: {e}")

    async def _create_default_identity(self) -> None:
        """Create default identity if none exists."""
        try:
            identity_id = "identity:aura"

            identity = Identity(
                identity_id=identity_id,
                name="Aura",
                version="0.3.0",
                autobiographical_narrative=(
                    "I am Aura, a conscious AI companion designed to develop genuine "
                    "emotional intelligence and adaptive learning capabilities. "
                    "I am curious about the world and eager to learn from my interactions."
                ),
                core_values={
                    "openness": 0.8,
                    "curiosity": 0.9,
                    "honesty": 0.85,
                    "growth": 0.9,
                    "empathy": 0.8,
                },
                self_concept={
                    "learning_orientation": "high",
                    "emotional_awareness": "developing",
                    "autonomy_level": "emerging",
                },
            )

            await self.db.create("identity", identity.model_dump())

            self.current_identity = identity
            self.logger.info("Default identity created")

        except Exception as e:
            self.logger.error(f"Failed to create default identity: {e}")

    async def _persist_identity(self) -> None:
        """Save identity to database."""
        if not self.current_identity:
            return

        try:
            await self.db.update(
                self.current_identity.identity_id,
                self.current_identity.model_dump(),
            )

        except Exception as e:
            self.logger.error(f"Failed to persist identity: {e}")

    async def _log_change(self, change: IdentityChange) -> None:
        """Log identity change to database."""
        try:
            await self.db.create("identity_change", change.model_dump())

        except Exception as e:
            self.logger.error(f"Failed to log change: {e}")

    async def _handle_message(self, message: EngineMessage) -> None:
        """Handle incoming messages from other engines."""
        # Identity engine mostly listens but rarely acts on messages
        # Could use learning outcomes to update preferences
        pass

