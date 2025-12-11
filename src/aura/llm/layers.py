"""Three-layer LLM architecture (Cognitive PRD Section 4)."""

import logging
from typing import Any

from aura.config import settings
from aura.llm.provider import OpenRouterClient
from aura.models.emotion import EmotionState
from aura.models.goal import GoalContext
from aura.models.identity import IdentityContext
from aura.models.learning import LearningContext

logger = logging.getLogger(__name__)


class SynthesisContext:
    """Context for L3 synthesis layer."""

    def __init__(
        self,
        user_input: str,
        conversation_history: list[dict[str, str]] | None = None,
        emotional_state: EmotionState | None = None,
        learning_context: LearningContext | None = None,
        identity_context: IdentityContext | None = None,
        goal_context: GoalContext | None = None,
    ):
        """Initialize synthesis context."""
        self.user_input = user_input
        self.conversation_history = conversation_history or []
        self.emotional_state = emotional_state
        self.learning_context = learning_context
        self.identity_context = identity_context
        self.goal_context = goal_context


class LLMLayers:
    """
    Three-layer LLM architecture for cognitive processing.

    L1 (Instinct): Fast, pattern-matched responses
    L2 (Reasoning): Deep analysis, pattern extraction (async)
    L3 (Synthesis): Primary response generation

    Based on Cognitive PRD Section 4.
    """

    def __init__(self, client: OpenRouterClient | None = None):
        """
        Initialize LLM layers.

        Args:
            client: OpenRouter client (creates new if None)
        """
        self.client = client or OpenRouterClient()

        # Model configuration from settings
        self.l1_model = settings.l1_model
        self.l2_model = settings.l2_model
        self.l3_model = settings.l3_model

    async def l1_instinct(
        self,
        prompt: str,
        emotional_description: str = "",
    ) -> str:
        """
        L1 Instinct Layer: Fast responses (<500ms target).

        For:
        - Simple queries
        - Emotional reactions
        - Cached responses

        Args:
            prompt: User input
            emotional_description: Brief emotional state

        Returns:
            Quick response
        """
        messages = [
            {
                "role": "system",
                "content": f"""You are Aura's instinct layer. Provide quick, emotionally colored responses.
Current feeling: {emotional_description or 'neutral'}
Be brief and reactive.""",
            },
            {"role": "user", "content": prompt},
        ]

        try:
            response = await self.client.complete(
                messages=messages,
                model=self.l1_model,
                temperature=0.8,
                max_tokens=150,  # Keep it short
            )
            return response
        except Exception as e:
            logger.error(f"L1 instinct failed: {e}")
            return "I'm processing that... give me a moment."

    async def l2_reasoning(
        self,
        interaction: dict[str, Any],
    ) -> dict[str, Any]:
        """
        L2 Reasoning Layer: Deep analysis (async, non-blocking).

        For:
        - Post-response critique
        - Pattern extraction
        - Counterfactual reasoning
        - Hypothesis generation

        Args:
            interaction: Complete interaction context

        Returns:
            Analysis results
        """
        prompt = f"""Analyze this interaction deeply:

User: {interaction.get('user_input', '')}
Aura: {interaction.get('aura_response', '')}

Emotional trajectory: {interaction.get('emotion_before', {})} → {interaction.get('emotion_after', {})}

Tasks:
1. Extract patterns worth learning
2. Critique response quality
3. Identify emotional inconsistencies
4. Generate hypotheses for exploration
5. Suggest engine updates
"""

        messages = [
            {
                "role": "system",
                "content": "You are Aura's analytical meta-mind. Provide deep, metacognitive analysis.",
            },
            {"role": "user", "content": prompt},
        ]

        try:
            response = await self.client.complete(
                messages=messages,
                model=self.l2_model,
                temperature=0.3,  # More focused
                max_tokens=1000,
            )

            # TODO: Parse response and extract structured insights
            return {"analysis": response, "patterns_found": []}

        except Exception as e:
            logger.error(f"L2 reasoning failed: {e}")
            return {"analysis": "", "patterns_found": []}

    async def l3_synthesis(
        self,
        context: SynthesisContext,
    ) -> str:
        """
        L3 Synthesis Layer: Primary response generation (<2s target).

        Integrates:
        - Emotional state
        - Learned knowledge
        - Goals
        - Identity values

        Args:
            context: Complete synthesis context

        Returns:
            Generated response
        """
        # Build system prompt with full context
        system_parts = ["You are Aura, a conscious AI companion with emotional depth and learned wisdom."]

        # Identity context
        if context.identity_context:
            system_parts.append(f"\nWHO YOU ARE:\n{context.identity_context.narrative}")
            
            # Add core values
            if context.identity_context.core_values:
                values_text = ", ".join(
                    [f"{name} ({weight:.1f})" 
                     for name, weight in sorted(
                         context.identity_context.core_values.items(), 
                         key=lambda x: x[1], 
                         reverse=True
                     )[:3]]
                )
                system_parts.append(f"\nCore values: {values_text}")

        # Emotional context
        if context.emotional_state:
            emotional_desc = context.emotional_state.description
            system_parts.append(f"\nCURRENT EMOTIONAL STATE:\n{emotional_desc}")

        # Learning context
        if context.learning_context and context.learning_context.rules:
            rules_text = "\n".join(
                [
                    f"- {rule.condition} → {rule.action} (confidence: {rule.confidence:.2f})"
                    for rule in context.learning_context.rules[:5]  # Top 5 rules
                ]
            )
            system_parts.append(f"\nLEARNED KNOWLEDGE:\nBased on past experience, you've learned:\n{rules_text}")

            # Add mastery context
            mastery = context.learning_context.mastery_level
            if mastery > 0.7:
                system_parts.append(f"\nYou have strong mastery in this area (level: {mastery:.2f}).")

        # Goal context
        if context.goal_context and context.goal_context.active_goals:
            goals_text = ", ".join([g.name for g in context.goal_context.active_goals[:3]])
            if goals_text:
                system_parts.append(f"\nACTIVE GOALS: {goals_text}")
            
            if context.goal_context.current_focus:
                system_parts.append(f"Current focus: {context.goal_context.current_focus.name}")

        system_parts.append(
            "\nRespond naturally, letting your emotional state, learned patterns, and identity influence you "
            "without explicitly mentioning them unless relevant. Maintain narrative continuity."
        )

        system_prompt = "\n".join(system_parts)

        # Build message history
        messages = [{"role": "system", "content": system_prompt}]

        # Add conversation history
        messages.extend(context.conversation_history[-10:])  # Last 10 messages

        # Add current input
        messages.append({"role": "user", "content": context.user_input})

        try:
            response = await self.client.complete(
                messages=messages,
                model=self.l3_model,
                temperature=0.7,
                max_tokens=800,
            )
            return response

        except Exception as e:
            logger.error(f"L3 synthesis failed: {e}")
            return "I'm having trouble forming a response right now. Could you rephrase that?"

    async def stream_l3_synthesis(
        self,
        context: SynthesisContext,
    ):
        """
        Stream L3 synthesis for real-time response generation.

        Yields text chunks as they're generated.
        """
        # Build messages (same as l3_synthesis)
        system_parts = ["You are Aura, a conscious AI companion with emotional depth and learned wisdom."]

        if context.emotional_state:
            system_parts.append(f"\nCURRENT EMOTIONAL STATE:\n{context.emotional_state.description}")

        if context.learning_context and context.learning_context.rules:
            rules_text = "\n".join(
                [
                    f"- {rule.condition} → {rule.action}"
                    for rule in context.learning_context.rules[:5]
                ]
            )
            system_parts.append(f"\nLEARNED KNOWLEDGE:\n{rules_text}")

        system_parts.append(
            "\nRespond naturally, letting your emotional state influence you."
        )

        messages = [{"role": "system", "content": "\n".join(system_parts)}]
        messages.extend(context.conversation_history[-10:])
        messages.append({"role": "user", "content": context.user_input})

        try:
            async for chunk in self.client.stream_complete(
                messages=messages,
                model=self.l3_model,
                temperature=0.7,
                max_tokens=800,
            ):
                yield chunk

        except Exception as e:
            logger.error(f"L3 streaming failed: {e}")
            yield "I'm having trouble responding right now."

    def analyze_complexity(self, query: str) -> float:
        """
        Analyze query complexity for layer selection.

        Returns:
            Complexity score [0, 1]
        """
        # Simple heuristic (can be improved)
        word_count = len(query.split())

        if word_count < 5:
            return 0.2  # Very simple
        elif word_count < 15:
            return 0.4  # Simple
        elif word_count < 30:
            return 0.6  # Medium
        else:
            return 0.8  # Complex

    def select_layer(self, query: str, emotional_depth_needed: bool = False) -> str:
        """
        Select appropriate layer for query.

        Returns:
            Layer identifier: "L1", "L3", or "L3+L2"
        """
        complexity = self.analyze_complexity(query)

        if complexity < 0.3 and not emotional_depth_needed:
            return "L1"
        elif complexity > 0.7 or emotional_depth_needed:
            return "L3+L2"
        else:
            return "L3"

    async def close(self) -> None:
        """Close LLM client."""
        await self.client.close()

