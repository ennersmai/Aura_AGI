"""FastAPI dependencies."""

from typing import Annotated

from fastapi import Depends

from aura.db.client import DatabaseClient, get_db_client

# Database dependency
DatabaseDep = Annotated[DatabaseClient, Depends(get_db_client)]

