from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from typing import Optional
import uuid

from db.models import PlatformConnection, User

# -- User CRUD --
async def create_user(db: AsyncSession, email: str, name: str, hashed_password: str) -> User:
    user = User(email=email, name=name, hashed_password=hashed_password)
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user

async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()

async def get_user_by_id(db: AsyncSession, user_id: uuid.UUID) -> Optional[User]:
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


# -- Connection CRUD --
async def upsert_connection(db: AsyncSession, user_id: uuid.UUID, platform: str, **kwargs) -> PlatformConnection:
    """
    Insert or update a platform connection for a specific user.
    If a connection for `platform` already exists for this user, update its credentials.
    """
    result = await db.execute(
        select(PlatformConnection).where(PlatformConnection.platform == platform, PlatformConnection.user_id == user_id)
    )
    existing = result.scalar_one_or_none()

    if existing:
        for key, value in kwargs.items():
            setattr(existing, key, value)
        conn = existing
    else:
        conn = PlatformConnection(user_id=user_id, platform=platform, **kwargs)
        db.add(conn)

    await db.commit()
    await db.refresh(conn)
    return conn


async def get_connection(db: AsyncSession, user_id: uuid.UUID, platform: str) -> Optional[PlatformConnection]:
    """Fetch the stored credentials for a given platform and user."""
    result = await db.execute(
        select(PlatformConnection).where(PlatformConnection.platform == platform, PlatformConnection.user_id == user_id)
    )
    return result.scalar_one_or_none()


async def list_connections(db: AsyncSession, user_id: uuid.UUID) -> list[PlatformConnection]:
    """Return all stored platform connections for a user."""
    result = await db.execute(select(PlatformConnection).where(PlatformConnection.user_id == user_id))
    return list(result.scalars().all())


async def delete_connection(db: AsyncSession, user_id: uuid.UUID, connection_id: uuid.UUID) -> bool:
    """Remove a connection by its UUID, verifying ownership. Returns True if a row was deleted."""
    result = await db.execute(
        delete(PlatformConnection).where(PlatformConnection.id == connection_id, PlatformConnection.user_id == user_id)
    )
    await db.commit()
    return result.rowcount > 0
