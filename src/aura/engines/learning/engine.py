"""
Learning Engine - Adaptive pattern extraction and skill acquisition.

Implements Learning FRD Section 3.1 (Core Learning Loop).
"""

import logging
from datetime import datetime
from typing import Any
from uuid import uuid4

from aura.db.client import get_db_client
from aura.engines.base import BaseEngine
from aura.llm.embeddings import get_embeddings_client
from aura.models.learning import Experience, LearningContext, Rule, Skill
from aura.models.messages import EngineMessage, MessagePriority

logger = logging.getLogger(__name__)


class LearningEngine(BaseEngine):
    """
    Learning Engine implementing 6-phase learning cycle.

    Phases: Capture → Extract → Abstract → Integrate → Transfer → Validate
    Based on Learning FRD FR-LL-001.
    """

    def __init__(self):
        """Initialize learning engine."""
        super().__init__("learning_engine")

        # Database
        self.db = get_db_client()

        # Embeddings client for semantic search
        self.embeddings = get_embeddings_client()

        # Message bus (will be set by orchestrator)
        self._message_bus: Any = None

        # Counters
        self.experiences_logged = 0
        self.rules_created = 0

    def set_message_bus(self, message_bus: Any) -> None:
        """Set message bus for inter-engine communication."""
        self._message_bus = message_bus

    async def initialize(self) -> None:
        """Initialize engine resources."""
        self.logger.info("Initializing Learning Engine...")

        # Load statistics
        try:
            exp_result = await self.db.query("SELECT count() FROM experience GROUP ALL")
            if exp_result and exp_result[0]["result"]:
                self.experiences_logged = exp_result[0]["result"][0].get("count", 0)

            rule_result = await self.db.query("SELECT count() FROM rule GROUP ALL")
            if rule_result and rule_result[0]["result"]:
                self.rules_created = rule_result[0]["result"][0].get("count", 0)
        except Exception as e:
            self.logger.warning(f"Could not load statistics: {e}")

        self.logger.info(
            f"Learning Engine initialized - "
            f"Experiences: {self.experiences_logged}, Rules: {self.rules_created}"
        )

    async def tick(self) -> None:
        """
        Execute one learning engine cycle.

        Currently processes background pattern extraction.
        In future phases, this will trigger autonomous research.
        """
        # TODO: Implement background pattern extraction
        # TODO: Implement hypothesis queue processing
        # For now, just sleep
        import asyncio

        await asyncio.sleep(60.0)  # Run once per minute

    async def shutdown(self) -> None:
        """Clean up engine resources."""
        self.logger.info("Shutting down Learning Engine...")
        self.logger.info(f"Final stats - Experiences: {self.experiences_logged}, Rules: {self.rules_created}")

    # Phase 1: Experience Capture

    async def log_experience(self, experience_data: dict[str, Any]) -> str:
        """
        Log an interaction experience with semantic embedding.

        Args:
            experience_data: Experience details (user_id, task_type, context, etc.)

        Returns:
            experience_id
        """
        experience_id = f"experience:{uuid4().hex[:12]}"

        try:
            # Ensure required fields
            experience = Experience(
                experience_id=experience_id,
                user_id=experience_data.get("user_id", "default"),
                task_type=experience_data.get("task_type", "unknown"),
                domain=experience_data.get("domain", "general"),
                context=experience_data.get("context", {}),
                aura_response=experience_data.get("aura_response", {}),
                outcome=experience_data.get("outcome", {}),
                emotional_state=experience_data.get("emotional_state", {}),
                metadata=experience_data.get("metadata", {}),
            )

            # Generate embedding for semantic clustering
            context_text = str(experience.context.get("user_query", ""))
            if context_text:
                embedding = await self.embeddings.embed(context_text)
                if embedding:
                    experience.embedding = embedding
                    self.logger.debug(f"Generated embedding for experience {experience_id}")

            # Store in database
            await self.db.create("experience", experience.model_dump())

            self.experiences_logged += 1
            self.logger.info(f"Experience logged: {experience_id} ({experience.task_type})")

            # Check for pattern extraction opportunity
            await self._check_pattern_extraction(experience)

            return experience_id

        except Exception as e:
            self.logger.error(f"Failed to log experience: {e}")
            raise

    # Phase 5: Transfer (Rule Retrieval)

    async def retrieve_rules(
        self,
        context: str,
        domain: str | None = None,
        confidence_min: float = 0.5,
        user_id: str | None = None,
        limit: int = 10,
        use_semantic_search: bool = True,
    ) -> list[Rule]:
        """
        Retrieve relevant rules using hybrid search (semantic + filters).

        Args:
            context: Context description
            domain: Filter by domain
            confidence_min: Minimum confidence threshold
            user_id: Filter for user-specific rules
            limit: Maximum rules to return
            use_semantic_search: Use vector similarity (requires context embedding)

        Returns:
            List of relevant rules sorted by relevance
        """
        try:
            # Strategy 1: Semantic search if context provided
            if use_semantic_search and context:
                # Generate embedding for context
                context_embedding = await self.embeddings.embed(context)

                if context_embedding:
                    # Use vector similarity search
                    # TODO: SurrealDB vector search syntax (when available)
                    # For now, fall back to filtered search
                    self.logger.debug("Vector search not yet implemented, using filtered search")

            # Strategy 2: Filtered search (fallback or when no context)
            conditions = [f"confidence >= {confidence_min}", "deprecated = false"]

            if domain:
                conditions.append(f"domain = '{domain}'")

            if user_id:
                conditions.append(f"(user_specific = false OR user_id = '{user_id}')")

            where_clause = " AND ".join(conditions)

            query = f"""
                SELECT * FROM rule
                WHERE {where_clause}
                ORDER BY confidence DESC, application_count DESC
                LIMIT {limit}
            """

            result = await self.db.query(query)

            if not result or not result[0]["result"]:
                return []

            rules = [Rule(**rule_data) for rule_data in result[0]["result"]]

            self.logger.debug(f"Retrieved {len(rules)} rules for context")
            return rules

        except Exception as e:
            self.logger.error(f"Failed to retrieve rules: {e}")
            return []

    async def get_learning_context(
        self,
        context: str,
        domain: str | None = None,
        user_id: str | None = None,
    ) -> LearningContext:
        """
        Get complete learning context for LLM injection.

        Args:
            context: Task context
            domain: Domain filter
            user_id: User ID for personalized rules

        Returns:
            Learning context with rules, confidence, mastery
        """
        rules = await self.retrieve_rules(
            context=context, domain=domain, user_id=user_id
        )

        # Calculate overall confidence and mastery
        if rules:
            avg_confidence = sum(r.confidence for r in rules) / len(rules)
            mastery_level = self._calculate_mastery_from_rules(rules)
        else:
            avg_confidence = 0.0
            mastery_level = 0.0

        return LearningContext(
            rules=rules,
            confidence_level=avg_confidence,
            mastery_level=mastery_level,
        )

    # Rule Management

    async def create_rule(self, rule_data: dict[str, Any]) -> str:
        """
        Create a new learned rule with semantic embedding.

        Args:
            rule_data: Rule specification

        Returns:
            rule_id
        """
        rule_id = f"rule:{uuid4().hex[:12]}"

        try:
            rule = Rule(
                rule_id=rule_id,
                condition=rule_data["condition"],
                action=rule_data["action"],
                rationale=rule_data.get("rationale", ""),
                domain=rule_data.get("domain", "general"),
                task_type=rule_data.get("task_type", "unknown"),
                confidence=rule_data.get("confidence", 0.5),
                emotional_signature=rule_data.get("emotional_signature", {}),
                user_specific=rule_data.get("user_specific", False),
                source_experiences=rule_data.get("source_experiences", []),
            )

            # Generate embedding for semantic retrieval
            # Combine condition + action for meaningful representation
            rule_text = f"{rule.condition} → {rule.action}"
            embedding = await self.embeddings.embed(rule_text)
            if embedding:
                rule.embedding = embedding
                self.logger.debug(f"Generated embedding for rule {rule_id}")

            await self.db.create("rule", rule.model_dump())

            self.rules_created += 1
            self.logger.info(f"Rule created: {rule_id} ({rule.domain})")

            # Broadcast rule creation
            if self._message_bus:
                message = EngineMessage.create_state_update(
                    source="learning_engine",
                    data={"rule_id": rule_id, "domain": rule.domain, "confidence": rule.confidence},
                    targets=["orchestrator", "emotion_engine"],
                    priority=MessagePriority.NORMAL,
                )
                await self._message_bus.publish(message)

            return rule_id

        except Exception as e:
            self.logger.error(f"Failed to create rule: {e}")
            raise

    async def update_rule_confidence(
        self, rule_id: str, success: bool, resolution_time: float | None = None
    ) -> None:
        """
        Update rule confidence based on application outcome (Bayesian updating).

        Args:
            rule_id: Rule identifier
            success: Whether rule application succeeded
            resolution_time: Time to resolution (for statistics)
        """
        try:
            # Get current rule
            result = await self.db.select(rule_id)

            if not result or not result[0]["result"]:
                return

            rule_data = result[0]["result"][0]

            # Update counts
            application_count = rule_data.get("application_count", 0) + 1
            success_count = rule_data.get("success_count", 0) + (1 if success else 0)
            fail_count = rule_data.get("fail_count", 0) + (0 if success else 1)

            # Bayesian update of confidence
            # Simple formula: (successes + 1) / (total + 2)
            new_confidence = (success_count + 1) / (application_count + 2)

            updates = {
                "application_count": application_count,
                "success_count": success_count,
                "fail_count": fail_count,
                "confidence": new_confidence,
                "last_used": datetime.utcnow().isoformat(),
            }

            if resolution_time is not None:
                # Update moving average
                old_avg = rule_data.get("avg_resolution_time", 0.0)
                updates["avg_resolution_time"] = (
                    old_avg * (application_count - 1) + resolution_time
                ) / application_count

            await self.db.merge(rule_id, updates)

            self.logger.debug(
                f"Rule {rule_id} updated: confidence={new_confidence:.2f}, "
                f"success_rate={success_count}/{application_count}"
            )

            # Check for deprecation
            if new_confidence < 0.4 and application_count > 10:
                await self.db.merge(rule_id, {"deprecated": True})
                self.logger.info(f"Rule {rule_id} deprecated (low confidence)")

        except Exception as e:
            self.logger.error(f"Failed to update rule confidence: {e}")

    # Skill Tree

    async def get_skill(self, skill_id: str) -> Skill | None:
        """Get skill by ID."""
        try:
            result = await self.db.select(skill_id)

            if not result or not result[0]["result"]:
                return None

            return Skill(**result[0]["result"][0])

        except Exception as e:
            self.logger.error(f"Failed to get skill: {e}")
            return None

    async def get_skills_by_domain(self, domain: str) -> list[Skill]:
        """Get all skills in a domain."""
        try:
            result = await self.db.query(
                f"SELECT * FROM skill WHERE domain = '{domain}'"
            )

            if not result or not result[0]["result"]:
                return []

            return [Skill(**s) for s in result[0]["result"]]

        except Exception as e:
            self.logger.error(f"Failed to get skills: {e}")
            return []

    # Private methods

    async def _check_pattern_extraction(self, experience: Experience) -> None:
        """
        Check if enough similar experiences exist to extract patterns.

        Triggers pattern extraction when threshold is met.
        """
        try:
            # Query similar experiences by domain and task_type
            result = await self.db.query(
                """
                SELECT count() FROM experience
                WHERE domain = $domain AND task_type = $task_type
                GROUP ALL
                """,
                {"domain": experience.domain, "task_type": experience.task_type},
            )

            if result and result[0]["result"]:
                count = result[0]["result"][0].get("count", 0)

                # Trigger pattern extraction at threshold (5+ similar experiences)
                if count >= 5 and count % 5 == 0:
                    self.logger.info(
                        f"Pattern extraction threshold met: {experience.domain}/{experience.task_type} "
                        f"({count} experiences)"
                    )
                    # TODO: Queue pattern extraction task for L2

        except Exception as e:
            self.logger.error(f"Failed to check pattern extraction: {e}")

    def _calculate_mastery_from_rules(self, rules: list[Rule]) -> float:
        """Calculate overall mastery level from retrieved rules."""
        if not rules:
            return 0.0

        # Weight by confidence and success rate
        total_weight = 0.0
        weighted_sum = 0.0

        for rule in rules:
            if rule.application_count > 0:
                success_rate = rule.success_count / rule.application_count
                weight = rule.confidence * success_rate
                weighted_sum += weight
                total_weight += 1.0

        return weighted_sum / total_weight if total_weight > 0 else 0.0

