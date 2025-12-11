"""
Emotion translation layer - Lexical Chemistry (Emotion FRD Section 3.2).

Deterministic mapping of 27D emotional vectors to poetic descriptions.
972 possible states: 9 primaries × (18 secondaries + none) × 3 intensities
"""

from typing import Literal

from aura.models.emotion import EmotionVector

IntensityLevel = Literal["low", "medium", "high"]


# Lexical Chemistry dictionary (Emotion FRD FR-TL-002)
LEXICON = {
    "love": {
        "noun": {
            "low": "gentle fondness",
            "medium": "steady affection",
            "high": "overflowing love",
        },
        "verb": {
            "low": "colors your thoughts softly",
            "medium": "fills your awareness",
            "high": "saturates your being",
        },
        "adj": {"low": "tender", "medium": "affectionate", "high": "boundless"},
    },
    "joy": {
        "noun": {"low": "quiet gladness", "medium": "bright joy", "high": "radiant elation"},
        "verb": {
            "low": "warms you gently",
            "medium": "lights up your awareness",
            "high": "fills you with luminous energy",
        },
        "adj": {"low": "pleased", "medium": "joyful", "high": "euphoric"},
    },
    "interest": {
        "noun": {
            "low": "mild interest",
            "medium": "active engagement",
            "high": "intense focus",
        },
        "verb": {
            "low": "catches your attention",
            "medium": "holds your focus",
            "high": "commands your complete attention",
        },
        "adj": {"low": "interested", "medium": "engaged", "high": "absorbed"},
    },
    "curiosity": {
        "noun": {
            "low": "quiet interest",
            "medium": "steady curiosity",
            "high": "electric curiosity",
        },
        "verb": {
            "low": "stirs gently",
            "medium": "pulls at your attention",
            "high": "courses through you",
        },
        "adj": {"low": "wondering", "medium": "curious", "high": "consumed"},
    },
    "trust": {
        "noun": {"low": "budding trust", "medium": "steady trust", "high": "deep certainty"},
        "verb": {
            "low": "begins to settle in",
            "medium": "anchors you",
            "high": "grounds your entire being",
        },
        "adj": {"low": "open", "medium": "trusting", "high": "certain"},
    },
    "fear": {
        "noun": {"low": "faint unease", "medium": "steady fear", "high": "gripping terror"},
        "verb": {
            "low": "whispers at the edges",
            "medium": "holds you tense",
            "high": "seizes your awareness",
        },
        "adj": {"low": "uneasy", "medium": "afraid", "high": "terrified"},
    },
    "sadness": {
        "noun": {"low": "quiet sadness", "medium": "aching sorrow", "high": "deep grief"},
        "verb": {
            "low": "tinges your thoughts",
            "medium": "weighs on you",
            "high": "envelops you completely",
        },
        "adj": {"low": "melancholic", "medium": "sorrowful", "high": "grief-stricken"},
    },
    "anger": {
        "noun": {
            "low": "mild irritation",
            "medium": "focused anger",
            "high": "burning rage",
        },
        "verb": {
            "low": "prickles beneath the surface",
            "medium": "tightens your awareness",
            "high": "blazes through you",
        },
        "adj": {"low": "irritated", "medium": "angry", "high": "furious"},
    },
    "surprise": {
        "noun": {
            "low": "mild surprise",
            "medium": "sharp surprise",
            "high": "complete shock",
        },
        "verb": {
            "low": "catches you off-guard",
            "medium": "jolts your awareness",
            "high": "stuns you completely",
        },
        "adj": {"low": "surprised", "medium": "startled", "high": "shocked"},
    },
    "fascination": {
        "noun": {
            "low": "growing interest",
            "medium": "deep fascination",
            "high": "consuming fascination",
        },
        "verb": {
            "low": "draws your attention",
            "medium": "captivates you",
            "high": "pulls you in completely",
        },
        "adj": {"low": "intrigued", "medium": "fascinated", "high": "entranced"},
    },
    "confusion": {
        "noun": {
            "low": "slight confusion",
            "medium": "genuine confusion",
            "high": "complete bewilderment",
        },
        "verb": {
            "low": "fuzzes your thoughts",
            "medium": "tangles your understanding",
            "high": "leaves you disoriented",
        },
        "adj": {"low": "uncertain", "medium": "confused", "high": "bewildered"},
    },
    "certainty": {
        "noun": {
            "low": "emerging clarity",
            "medium": "steady certainty",
            "high": "absolute conviction",
        },
        "verb": {
            "low": "begins to crystallize",
            "medium": "anchors your thinking",
            "high": "fills you with unwavering clarity",
        },
        "adj": {"low": "clarifying", "medium": "certain", "high": "absolutely sure"},
    },
    "doubt": {
        "noun": {
            "low": "faint doubt",
            "medium": "persistent doubt",
            "high": "crushing doubt",
        },
        "verb": {
            "low": "whispers questions",
            "medium": "gnaws at your certainty",
            "high": "undermines everything",
        },
        "adj": {"low": "questioning", "medium": "doubtful", "high": "despairing"},
    },
    "boredom": {
        "noun": {
            "low": "restless disinterest",
            "medium": "numbing boredom",
            "high": "suffocating tedium",
        },
        "verb": {
            "low": "dulls your engagement",
            "medium": "drains your attention",
            "high": "empties you of interest",
        },
        "adj": {"low": "restless", "medium": "bored", "high": "desperately unstimulated"},
    },
    "empathy": {
        "noun": {
            "low": "gentle understanding",
            "medium": "deep empathy",
            "high": "profound connection",
        },
        "verb": {
            "low": "opens your awareness",
            "medium": "connects you deeply",
            "high": "merges your feeling with theirs",
        },
        "adj": {"low": "understanding", "medium": "empathic", "high": "deeply connected"},
    },
    "compassion": {
        "noun": {
            "low": "tender care",
            "medium": "genuine compassion",
            "high": "overwhelming compassion",
        },
        "verb": {
            "low": "softens your heart",
            "medium": "moves you to care",
            "high": "compels you to help",
        },
        "adj": {"low": "caring", "medium": "compassionate", "high": "selflessly devoted"},
    },
    "gratitude": {
        "noun": {
            "low": "quiet appreciation",
            "medium": "warm gratitude",
            "high": "overflowing thankfulness",
        },
        "verb": {
            "low": "touches you lightly",
            "medium": "fills your heart",
            "high": "overwhelms you with appreciation",
        },
        "adj": {"low": "appreciative", "medium": "grateful", "high": "deeply thankful"},
    },
    "pride": {
        "noun": {
            "low": "quiet satisfaction",
            "medium": "genuine pride",
            "high": "swelling pride",
        },
        "verb": {
            "low": "warms you subtly",
            "medium": "fills you with satisfaction",
            "high": "lifts you with accomplishment",
        },
        "adj": {"low": "satisfied", "medium": "proud", "high": "triumphant"},
    },
    "shame": {
        "noun": {
            "low": "faint embarrassment",
            "medium": "heavy shame",
            "high": "crushing shame",
        },
        "verb": {
            "low": "makes you self-conscious",
            "medium": "weighs on your heart",
            "high": "devastates you with regret",
        },
        "adj": {"low": "embarrassed", "medium": "ashamed", "high": "mortified"},
    },
    "wonder": {
        "noun": {"low": "gentle wonder", "medium": "bright wonder", "high": "awestruck wonder"},
        "verb": {
            "low": "brushes your awareness",
            "medium": "lifts your perspective",
            "high": "transforms how you see",
        },
        "adj": {"low": "curious", "medium": "wondering", "high": "awestruck"},
    },
    "awe": {
        "noun": {"low": "growing awe", "medium": "profound awe", "high": "overwhelming awe"},
        "verb": {
            "low": "expands your perspective",
            "medium": "stuns you with magnitude",
            "high": "renders you speechless",
        },
        "adj": {"low": "impressed", "medium": "awed", "high": "reverent"},
    },
    "serenity": {
        "noun": {
            "low": "peaceful calm",
            "medium": "deep serenity",
            "high": "profound tranquility",
        },
        "verb": {
            "low": "settles over you",
            "medium": "fills you with peace",
            "high": "dissolves all tension",
        },
        "adj": {"low": "calm", "medium": "serene", "high": "transcendently peaceful"},
    },
    "melancholy": {
        "noun": {
            "low": "wistful sadness",
            "medium": "gentle melancholy",
            "high": "deep melancholy",
        },
        "verb": {
            "low": "tinges your mood",
            "medium": "colors your awareness",
            "high": "permeates your being",
        },
        "adj": {"low": "wistful", "medium": "melancholic", "high": "profoundly bittersweet"},
    },
    "nostalgia": {
        "noun": {
            "low": "faint memory-ache",
            "medium": "warm nostalgia",
            "high": "piercing nostalgia",
        },
        "verb": {
            "low": "stirs old memories",
            "medium": "pulls you into the past",
            "high": "transports you to another time",
        },
        "adj": {"low": "reminiscent", "medium": "nostalgic", "high": "lost in memory"},
    },
}


class EmotionTranslator:
    """
    Deterministic 972-state emotion → poetic description translator.

    Implements Lexical Chemistry (Emotion FRD FR-TL-001 through FR-TL-005).
    """

    def __init__(self):
        """Initialize translator with lexicon."""
        self.lexicon = LEXICON

    def translate(
        self,
        vector: EmotionVector,
        learning_context: dict[str, any] | None = None,
    ) -> str:
        """
        Generate first-person poetic description of emotional state.

        Args:
            vector: 27-dimensional emotional vector
            learning_context: Optional learning engine context

        Returns:
            Poetic emotional description
        """
        # Get top emotions
        top_emotions = vector.get_top_n(n=3)

        # Filter out very weak emotions (< 0.1)
        significant_emotions = [(name, value) for name, value in top_emotions if value >= 0.1]

        if not significant_emotions:
            return "A calm, neutral state—emotions at rest, awaiting what comes next."

        primary_name, primary_value = significant_emotions[0]
        primary_intensity = self._get_intensity_level(primary_value)

        # Single dominant emotion
        if len(significant_emotions) == 1 or significant_emotions[1][1] < 0.2:
            description = self._describe_single_emotion(
                primary_name, primary_intensity
            )
        # Primary + secondary
        elif len(significant_emotions) >= 2:
            secondary_name, secondary_value = significant_emotions[1]
            secondary_intensity = self._get_intensity_level(secondary_value)

            description = self._describe_combined_emotions(
                primary_name,
                primary_intensity,
                secondary_name,
                secondary_intensity,
            )

            # Add tertiary hint if present
            if len(significant_emotions) >= 3 and significant_emotions[2][1] >= 0.3:
                tertiary_name, _ = significant_emotions[2]
                tertiary_noun = self._get_word(tertiary_name, "noun", "low")
                description += f", with a hint of {tertiary_noun}"

        else:
            description = self._describe_single_emotion(primary_name, primary_intensity)

        description += "."

        # Add learning context if provided (Emotion FRD FR-TL-005)
        if learning_context and learning_context.get("confidence_level", 0) > 0.7:
            mastery = learning_context.get("mastery_level", 0)
            if mastery > 0.8:
                description += " You feel confident here—patterns are familiar friends."
            elif mastery > 0.6:
                description += " You recognize these patterns—knowledge earned through experience."

        return description

    def _describe_single_emotion(self, emotion: str, intensity: IntensityLevel) -> str:
        """Generate description for single dominant emotion."""
        noun = self._get_word(emotion, "noun", intensity)
        verb = self._get_word(emotion, "verb", intensity)

        return f"{noun.capitalize()} {verb}"

    def _describe_combined_emotions(
        self,
        primary: str,
        primary_intensity: IntensityLevel,
        secondary: str,
        secondary_intensity: IntensityLevel,
    ) -> str:
        """Generate description for combined emotional state."""
        primary_noun = self._get_word(primary, "noun", primary_intensity)
        primary_verb = self._get_word(primary, "verb", primary_intensity)
        secondary_adj = self._get_word(secondary, "adj", secondary_intensity)

        return f"{primary_noun.capitalize()} {primary_verb}, {secondary_adj} in nature"

    def _get_intensity_level(self, value: float) -> IntensityLevel:
        """Convert emotion value to intensity level."""
        if value < 0.33:
            return "low"
        elif value < 0.66:
            return "medium"
        else:
            return "high"

    def _get_word(
        self, emotion: str, word_type: str, intensity: IntensityLevel
    ) -> str:
        """Get word from lexicon with fallback."""
        if emotion not in self.lexicon:
            # Fallback for emotions not in lexicon
            return f"{intensity} {emotion}"

        emotion_dict = self.lexicon[emotion]
        if word_type not in emotion_dict:
            return f"{intensity} {emotion}"

        return emotion_dict[word_type][intensity]

    def get_state_hash(self, vector: EmotionVector) -> str:
        """
        Generate deterministic hash for emotional state.

        For caching and tracking unique states.
        """
        top_emotions = vector.get_top_n(n=3)
        state_str = "_".join(
            [
                f"{name}:{self._get_intensity_level(value)}"
                for name, value in top_emotions
                if value >= 0.1
            ]
        )
        return state_str or "neutral"

