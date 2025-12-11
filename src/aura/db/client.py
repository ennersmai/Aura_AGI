"""SurrealDB async client wrapper."""

import logging
from typing import Any

from surrealdb import Surreal

from aura.config import settings

logger = logging.getLogger(__name__)


class DatabaseClient:
    """Async SurrealDB client wrapper with connection pooling."""

    def __init__(self) -> None:
        """Initialize database client."""
        self._client: Surreal | None = None
        self._connected: bool = False

    @property
    def is_connected(self) -> bool:
        """Check if database is connected."""
        return self._connected and self._client is not None

    async def connect(self) -> None:
        """Establish database connection."""
        if self._connected:
            logger.warning("Database already connected")
            return

        try:
            self._client = Surreal(settings.surreal_url)
            await self._client.connect()

            # Sign in
            await self._client.signin(
                {
                    "user": settings.surreal_user,
                    "pass": settings.surreal_pass,
                }
            )

            # Use namespace and database
            await self._client.use(settings.surreal_ns, settings.surreal_db)

            self._connected = True
            logger.info(
                f"Connected to SurrealDB: {settings.surreal_ns}/{settings.surreal_db}"
            )

        except Exception as e:
            logger.error(f"Failed to connect to database: {e}")
            self._connected = False
            raise

    async def close(self) -> None:
        """Close database connection."""
        if self._client and self._connected:
            await self._client.close()
            self._connected = False
            logger.info("Database connection closed")

    async def query(self, sql: str, vars: dict[str, Any] | None = None) -> Any:
        """Execute a SurrealQL query."""
        if not self._client:
            raise RuntimeError("Database not connected")
        return await self._client.query(sql, vars)

    async def select(self, thing: str) -> Any:
        """Select records from a table."""
        if not self._client:
            raise RuntimeError("Database not connected")
        return await self._client.select(thing)

    async def create(self, thing: str, data: dict[str, Any]) -> Any:
        """Create a record."""
        if not self._client:
            raise RuntimeError("Database not connected")
        return await self._client.create(thing, data)

    async def update(self, thing: str, data: dict[str, Any]) -> Any:
        """Update a record."""
        if not self._client:
            raise RuntimeError("Database not connected")
        return await self._client.update(thing, data)

    async def merge(self, thing: str, data: dict[str, Any]) -> Any:
        """Merge data into a record."""
        if not self._client:
            raise RuntimeError("Database not connected")
        return await self._client.merge(thing, data)

    async def delete(self, thing: str) -> Any:
        """Delete a record."""
        if not self._client:
            raise RuntimeError("Database not connected")
        return await self._client.delete(thing)


# Global database client instance
_db_client: DatabaseClient | None = None


def get_db_client() -> DatabaseClient:
    """Get the global database client instance."""
    global _db_client
    if _db_client is None:
        _db_client = DatabaseClient()
    return _db_client

