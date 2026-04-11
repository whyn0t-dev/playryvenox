import os
import re
import uuid
from fastapi import Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from supabase import create_client, Client

from database import get_db
from models import User

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise ValueError("Missing Supabase config")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)


async def get_current_user(
    request: Request, db: AsyncSession = Depends(get_db)
) -> User:
    auth_header = request.headers.get("Authorization", "")

    if not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required"
        )

    token = auth_header[7:].strip()

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required"
        )

    try:
        user_response = supabase.auth.get_user(token)
        user_data = user_response.user

        if not user_data or not user_data.email:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token",
            )

        supabase_user_id = uuid.UUID(user_data.id)

        result = await db.execute(select(User).where(User.id == supabase_user_id))
        user = result.scalar_one_or_none()

        if user:
            if user.email != user_data.email.lower():
                user.email = user_data.email.lower()
                await db.commit()
                await db.refresh(user)

            return user

        base_username = (user_data.user_metadata or {}).get(
            "username"
        ) or user_data.email.split("@")[0]

        username = re.sub(r"[^a-zA-Z0-9_]", "_", base_username)[:30] or "player"

        candidate = username
        suffix = 1

        while True:
            existing = await db.execute(select(User).where(User.username == candidate))
            existing_user = existing.scalar_one_or_none()

            if not existing_user:
                break

            suffix_str = str(suffix)
            candidate = f"{username[:30-len(suffix_str)-1]}_{suffix_str}"
            suffix += 1

        user = User(
            id=supabase_user_id,
            email=user_data.email.lower(),
            username=candidate,
            role="player",
        )

        db.add(user)
        await db.commit()
        await db.refresh(user)

        return user

    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during user sync",
        )
