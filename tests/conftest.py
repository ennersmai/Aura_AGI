"""Pytest configuration and fixtures."""

import pytest
import pytest_asyncio
from aura.config import Settings


@pytest.fixture
def test_settings() -> Settings:
    """Test settings fixture."""
    return Settings(
        surreal_url="ws://localhost:8000/rpc",
        surreal_ns="test",
        surreal_db="test",
        environment="test",
    )


@pytest_asyncio.fixture
async def db_client(test_settings: Settings):
    """Database client fixture."""
    from aura.db.client import DatabaseClient

    client = DatabaseClient()
    # Note: Actual connection would require running SurrealDB
    # For unit tests, mock the client
    return client

