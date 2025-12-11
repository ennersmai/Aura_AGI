"""Embeddings generation for semantic search."""

import logging
from typing import Any

import httpx

from aura.config import settings

logger = logging.getLogger(__name__)


class EmbeddingsClient:
    """
    Client for generating text embeddings via OpenRouter.

    Uses OpenAI-compatible embedding models (1536 dimensions).
    """

    def __init__(
        self,
        api_key: str | None = None,
        base_url: str | None = None,
        model: str = "openai/text-embedding-3-small",
    ):
        """
        Initialize embeddings client.

        Args:
            api_key: OpenRouter API key
            base_url: API base URL
            model: Embedding model to use (default: OpenAI text-embedding-3-small)
        """
        self.api_key = api_key or settings.openrouter_api_key
        self.base_url = base_url or settings.openrouter_base_url
        self.model = model

        self.client = httpx.AsyncClient(timeout=30.0)

        if not self.api_key:
            logger.warning("OpenRouter API key not configured for embeddings")

    async def embed(self, text: str) -> list[float] | None:
        """
        Generate embedding for text.

        Args:
            text: Text to embed

        Returns:
            1536-dimensional embedding vector or None on error
        """
        if not self.api_key:
            logger.error("Cannot generate embedding: API key not configured")
            return None

        if not text or not text.strip():
            logger.warning("Empty text provided for embedding")
            return None

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        payload = {
            "model": self.model,
            "input": text,
        }

        try:
            response = await self.client.post(
                f"{self.base_url}/embeddings",
                headers=headers,
                json=payload,
            )

            response.raise_for_status()
            data = response.json()

            if "data" in data and len(data["data"]) > 0:
                embedding = data["data"][0]["embedding"]

                # Verify dimension
                if len(embedding) != 1536:
                    logger.warning(
                        f"Unexpected embedding dimension: {len(embedding)} (expected 1536)"
                    )

                return embedding
            else:
                logger.error("No embedding returned from API")
                return None

        except httpx.HTTPStatusError as e:
            logger.error(
                f"Embedding API error: {e.response.status_code} - {e.response.text}"
            )
            return None
        except Exception as e:
            logger.error(f"Embedding request failed: {e}")
            return None

    async def embed_batch(self, texts: list[str]) -> list[list[float] | None]:
        """
        Generate embeddings for multiple texts.

        Args:
            texts: List of texts to embed

        Returns:
            List of embeddings (None for failures)
        """
        if not texts:
            return []

        # For now, process sequentially (can be optimized with batching)
        embeddings = []
        for text in texts:
            embedding = await self.embed(text)
            embeddings.append(embedding)

        return embeddings

    async def close(self) -> None:
        """Close HTTP client."""
        await self.client.aclose()


# Global embeddings client
_embeddings_client: EmbeddingsClient | None = None


def get_embeddings_client() -> EmbeddingsClient:
    """Get global embeddings client."""
    global _embeddings_client
    if _embeddings_client is None:
        _embeddings_client = EmbeddingsClient()
    return _embeddings_client

