from dotenv import load_dotenv
from pathlib import Path
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, status
from fastapi.responses import JSONResponse
from starlette.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from sqlalchemy import select, func, update, Column, String, Float, Integer, DateTime, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
import os
import logging
import re
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel, EmailStr, field_validator, ConfigDict
from typing import List, Optional

from database import get_db, engine, Base, AsyncSessionLocal
from models import User, PlayerStats, Upgrade, PlayerUpgrade, UserTransfer

from supabase import create_client, Client

import uuid

# ===========================================
# CONFIGURATION
# ===========================================
ENVIRONMENT = os.environ.get("ENV", "development")
IS_PRODUCTION = ENVIRONMENT == "production"

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise ValueError("Missing Supabase config")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

# Rate limiting
limiter = Limiter(key_func=get_remote_address)

# ===========================================
# PASSWORD & SECURITY UTILITIES
# ===========================================

def validate_password_strength(password: str) -> tuple[bool, str]:
    """Validate password meets security requirements"""
    if len(password) < 8:
        return False, "Password must be at least 8 characters"
    if len(password) > 128:
        return False, "Password must not exceed 128 characters"
    if not re.search(r"[a-zA-Z]", password):
        return False, "Password must contain at least one letter"
    if not re.search(r"\d", password):
        return False, "Password must contain at least one number"
    return True, ""

def validate_username(username: str) -> tuple[bool, str]:
    """Validate username format"""
    if len(username) < 3:
        return False, "Username must be at least 3 characters"
    if len(username) > 30:
        return False, "Username must not exceed 30 characters"
    if not re.match(r"^[a-zA-Z0-9_]+$", username):
        return False, "Username can only contain letters, numbers, and underscores"
    return True, ""

# ===========================================
# TOKEN UTILITIES
# ===========================================

# ===========================================
# AUTH DEPENDENCY
# ===========================================

async def get_current_user(request: Request, db: AsyncSession = Depends(get_db)) -> User:
    auth_header = request.headers.get("Authorization", "")

    if not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )

    token = auth_header[7:].strip()

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )

    try:
        user_response = supabase.auth.get_user(token)
        user_data = user_response.user

        if not user_data or not user_data.email:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token"
            )

        # 🔑 On cherche par ID (correct)
        supabase_user_id = uuid.UUID(user_data.id)
        result = await db.execute(
            select(User).where(User.id == supabase_user_id)
        )
        user = result.scalar_one_or_none()

        # ✅ Si user existe → update email si besoin
        if user:
            if user.email != user_data.email.lower():
                user.email = user_data.email.lower()
                await db.commit()
                await db.refresh(user)

            return user

        # 🚀 Création user si inexistant
        base_username = (
            (user_data.user_metadata or {}).get("username")
            or user_data.email.split("@")[0]
        )

        username = re.sub(r"[^a-zA-Z0-9_]", "_", base_username)[:30] or "player"

        candidate = username
        suffix = 1

        while True:
            existing = await db.execute(
                select(User).where(User.username == candidate)
            )
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
            role="player"
        )

        db.add(user)
        await db.commit()
        await db.refresh(user)

        return user

    except HTTPException:
        raise
    except Exception as e:
        print("AUTH ERROR:", repr(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during user sync"
        )

# ===========================================
# PYDANTIC MODELS WITH VALIDATION
# ===========================================
class UserRegister(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    
    email: EmailStr
    password: str
    username: str
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        valid, msg = validate_password_strength(v)
        if not valid:
            raise ValueError(msg)
        return v
    
    @field_validator('username')
    @classmethod
    def validate_username(cls, v):
        valid, msg = validate_username(v)
        if not valid:
            raise ValueError(msg)
        return v

class UserLogin(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    
    email: EmailStr
    password: str

class BuyUpgradeRequest(BaseModel):
    upgrade_id: str
    
    @field_validator('upgrade_id')
    @classmethod
    def validate_upgrade_id(cls, v):
        if not v or len(v) > 50:
            raise ValueError("Invalid upgrade ID")
        if not re.match(r"^[a-z_]+$", v):
            raise ValueError("Invalid upgrade ID format")
        return v
    
class TransferUsersRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    recipient_username: str
    amount: float

    @field_validator("recipient_username")
    @classmethod
    def validate_recipient_username(cls, v):
        valid, msg = validate_username(v)
        if not valid:
            raise ValueError(msg)
        return v

    @field_validator("amount")
    @classmethod
    def validate_amount(cls, v):
        if v <= 0:
            raise ValueError("Amount must be greater than 0")
        if v > 1000:
            raise ValueError("Maximum transfer is 1000")
        return round(v, 2)

# ===========================================
# GAME CONSTANTS
# ===========================================
INITIAL_UPGRADES = [
    {"id": "landing_page", "name": "Landing Page", "type": "click", "effect": 1, "base_cost": 15, "description": "+1 per click", "sort_order": 1},
    {"id": "email_capture", "name": "Email Capture", "type": "click", "effect": 2, "base_cost": 120, "description": "+2 per click", "sort_order": 2},
    {"id": "growth_copywriting", "name": "Growth Copywriting", "type": "click", "effect": 4, "base_cost": 650, "description": "+4 per click", "sort_order": 3},
    {"id": "paid_ads", "name": "Paid Ads", "type": "click", "effect": 8, "base_cost": 2800, "description": "+8 per click", "sort_order": 4},
    {"id": "viral_referral", "name": "Viral Referral Loop", "type": "click", "effect": 18, "base_cost": 14000, "description": "+18 per click", "sort_order": 5},

    {"id": "intern", "name": "Intern", "type": "passive", "effect": 1, "base_cost": 40, "description": "+1/sec", "sort_order": 6},
    {"id": "automation_bot", "name": "Automation Bot", "type": "passive", "effect": 3, "base_cost": 350, "description": "+3/sec", "sort_order": 7},
    {"id": "ai_agent", "name": "AI Agent", "type": "passive", "effect": 10, "base_cost": 1800, "description": "+10/sec", "sort_order": 8},
    {"id": "cloud_infra", "name": "Cloud Infrastructure", "type": "passive", "effect": 40, "base_cost": 9000, "description": "+40/sec", "sort_order": 9},
    {"id": "global_expansion", "name": "Global Expansion", "type": "passive", "effect": 120, "base_cost": 45000, "description": "+120/sec", "sort_order": 10},
]

VALID_UPGRADE_IDS = {u["id"] for u in INITIAL_UPGRADES}

# ===========================================
# TRANSFER CONSTANTS
# ===========================================
TRANSFER_MAX_AMOUNT = 1000
TRANSFER_WINDOW_DAYS = 5
TRANSFER_FEE_PERCENT = 0.10  # 10%
TRANSFER_MIN_LEVEL = 500

def calculate_upgrade_cost(base_cost: float, level: int) -> float:
    return round(base_cost * (1.85 ** level), 2)

# ===========================================
# DAILY BONUS CONSTANTS
# ===========================================
DAILY_BONUS_COOLDOWN_HOURS = 24
DAILY_BONUS_BASE_REWARD = 50  # Base users reward
DAILY_STREAK_MULTIPLIERS = {
    1: 1.0,
    2: 1.2,
    3: 1.5,
    4: 2.0,
    5: 2.5,
    6: 3.0,
    7: 5.0,
}
MAX_STREAK_DAYS = 7  # Streak resets after day 7

def calculate_daily_bonus(level: int, streak: int) -> int:
    """Calculate daily bonus based on player level and streak"""
    # Base reward scales with level
    level_bonus = DAILY_BONUS_BASE_REWARD * (1 + (level - 1) * 0.15)
    # Apply streak multiplier
    streak_day = min(streak + 1, MAX_STREAK_DAYS)  # +1 because streak is current, we're calculating next
    multiplier = DAILY_STREAK_MULTIPLIERS.get(streak_day, 1.0)
    return int(level_bonus * multiplier)

def get_daily_bonus_status(stats: PlayerStats) -> dict:
    """Get the status of daily bonus for a player"""
    now = datetime.now(timezone.utc)
    
    if stats.last_daily_claim is None:
        # Never claimed - available immediately
        return {
            "available": True,
            "seconds_until_available": 0,
            "current_streak": 0,
            "next_reward": calculate_daily_bonus(stats.level, 0),
            "total_claims": stats.total_daily_claims or 0
        }
    
    last_claim = stats.last_daily_claim
    if last_claim.tzinfo is None:
        last_claim = last_claim.replace(tzinfo=timezone.utc)
    
    time_since_claim = now - last_claim
    cooldown = timedelta(hours=DAILY_BONUS_COOLDOWN_HOURS)
    streak_expiry = timedelta(hours=48)  # Streak breaks after 48 hours
    
    if time_since_claim >= cooldown:
        # Bonus is available
        # Check if streak should reset (more than 48 hours since last claim)
        if time_since_claim >= streak_expiry:
            current_streak = 0
        else:
            current_streak = stats.daily_streak or 0
        
        return {
            "available": True,
            "seconds_until_available": 0,
            "current_streak": current_streak,
            "next_reward": calculate_daily_bonus(stats.level, current_streak),
            "total_claims": stats.total_daily_claims or 0
        }
    else:
        # Still on cooldown
        seconds_remaining = int((cooldown - time_since_claim).total_seconds())
        return {
            "available": False,
            "seconds_until_available": seconds_remaining,
            "current_streak": stats.daily_streak or 0,
            "next_reward": calculate_daily_bonus(stats.level, stats.daily_streak or 0),
            "total_claims": stats.total_daily_claims or 0
        }

# ===========================================
# GAME LOGIC HELPERS
# ===========================================
async def get_or_create_player_stats(db: AsyncSession, user_id) -> PlayerStats:
    result = await db.execute(
        select(PlayerStats).where(PlayerStats.user_id == user_id)
    )
    stats = result.scalar_one_or_none()

    if not stats:
        stats = PlayerStats(user_id=user_id)
        db.add(stats)
        await db.commit()
        await db.refresh(stats)

    result = await db.execute(select(Upgrade.id))
    all_upgrade_ids = set(result.scalars().all())

    result = await db.execute(
        select(PlayerUpgrade.upgrade_id).where(PlayerUpgrade.user_id == user_id)
    )
    existing_upgrade_ids = set(result.scalars().all())

    missing_upgrade_ids = all_upgrade_ids - existing_upgrade_ids

    for upgrade_id in missing_upgrade_ids:
        db.add(PlayerUpgrade(user_id=user_id, upgrade_id=upgrade_id, level=0))

    if missing_upgrade_ids:
        await db.commit()

    return stats

async def recalculate_passive_income(db: AsyncSession, stats: PlayerStats) -> tuple[PlayerStats, float]:
    now = datetime.now(timezone.utc)
    last_calc = stats.last_calculated_at
    if last_calc.tzinfo is None:
        last_calc = last_calc.replace(tzinfo=timezone.utc)

    elapsed_seconds = (now - last_calc).total_seconds()

    # Cap offline earnings to 4 hours max
    max_offline_seconds = 4 * 60 * 60
    elapsed_seconds = min(elapsed_seconds, max_offline_seconds)

    offline_multiplier = 0.5
    gained = 0.0

    if elapsed_seconds > 0 and stats.passive_income > 0:
        gained = stats.passive_income * elapsed_seconds * offline_multiplier
        stats.current_users += gained
        stats.total_users_generated += gained

    stats.last_calculated_at = now
    await db.commit()
    await db.refresh(stats)

    return stats, gained

async def recalculate_player_stats(db: AsyncSession, user_id):
    result = await db.execute(
        select(
            PlayerUpgrade.level,
            Upgrade.type,
            Upgrade.effect
        )
        .join(Upgrade, Upgrade.id == PlayerUpgrade.upgrade_id)
        .where(PlayerUpgrade.user_id == user_id)
    )
    rows = result.all()

    click_power = 1
    passive_income = 0.0
    total_levels = 0

    for level, upgrade_type, effect in rows:
        if level > 0:
            total_levels += level
            if upgrade_type == "click":
                click_power += max(1, int(effect * level * 0.7))
            else:
                passive_income += effect * (level ** 0.85)

    computed_level = 1 + (total_levels // 10)

    await db.execute(
        update(PlayerStats)
        .where(PlayerStats.user_id == user_id)
        .values(
            click_power=click_power,
            passive_income=passive_income,
            level=computed_level
        )
    )
    await db.commit()

# ===========================================
# FASTAPI APP
# ===========================================
app = FastAPI(
    title="Ryvenox Empire",
    version="1.0.0",
    docs_url="/api/docs" if not IS_PRODUCTION else None,
    redoc_url="/api/redoc" if not IS_PRODUCTION else None,
)

# CORS
origins = [
    origin.strip()
    for origin in os.environ.get("CORS_ORIGINS", "").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Create routers
api_router = APIRouter(prefix="/api")
auth_router = APIRouter(prefix="/auth", tags=["auth"])
game_router = APIRouter(prefix="/game", tags=["game"])
daily_router = APIRouter(prefix="/daily", tags=["daily"])
transfer_router = APIRouter(prefix="/transfer", tags=["transfer"])

# ===========================================
# AUTH ROUTES
# ===========================================
@auth_router.post("/register")
@limiter.limit("10/minute")
async def register(request: Request, data: UserRegister):
    """
    Registration must be done from the frontend with Supabase Auth.
    This endpoint is kept only to avoid breaking old clients.
    """
    raise HTTPException(
        status_code=status.HTTP_410_GONE,
        detail="Use Supabase Auth signUp() from the frontend"
    )

@auth_router.post("/login")
@limiter.limit("20/minute")
async def login(request: Request, data: UserLogin):
    """
    Login must be done from the frontend with Supabase Auth.
    This endpoint is kept only to avoid breaking old clients.
    """
    raise HTTPException(
        status_code=status.HTTP_410_GONE,
        detail="Use Supabase Auth signInWithPassword() from the frontend"
    )

@auth_router.post("/logout")
async def logout():
    """
    Logout must be done from the frontend with Supabase Auth.
    """
    return {"message": "Logout must be handled by Supabase on the frontend"}

@auth_router.get("/me")
async def get_me(user: User = Depends(get_current_user)):
    return {
        "id": user.id,
        "email": user.email,
        "username": user.username,
        "role": user.role
    }

# ===========================================
# GAME ROUTES
# ===========================================
@game_router.get("/state")
@limiter.limit("60/minute")
async def get_game_state(request: Request, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    stats = await get_or_create_player_stats(db, user.id)
    stats, offline_earned = await recalculate_passive_income(db, stats)
    
    result = await db.execute(
        select(PlayerUpgrade)
        .options(selectinload(PlayerUpgrade.upgrade))
        .where(PlayerUpgrade.user_id == user.id)
    )
    player_upgrades = result.scalars().all()
    
    result = await db.execute(select(Upgrade).order_by(Upgrade.sort_order))
    all_upgrades = result.scalars().all()
    
    upgrades_data = []
    for upgrade in all_upgrades:
        pu = next((p for p in player_upgrades if p.upgrade_id == upgrade.id), None)
        level = pu.level if pu else 0
        cost = calculate_upgrade_cost(upgrade.base_cost, level)
        upgrades_data.append({
            "id": upgrade.id,
            "name": upgrade.name,
            "type": upgrade.type,
            "effect": upgrade.effect,
            "description": upgrade.description,
            "level": level,
            "cost": cost,
            "can_afford": stats.current_users >= cost
        })
    
    return {
        "current_users": round(stats.current_users, 2),
        "total_users_generated": round(stats.total_users_generated, 2),
        "click_power": stats.click_power,
        "passive_income": stats.passive_income,
        "level": stats.level,
        "upgrades": upgrades_data,
        "offline_earned": round(offline_earned, 2)
    }

@game_router.post("/click")
@limiter.limit("300/minute")
async def click(request: Request, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    stats = await get_or_create_player_stats(db, user.id)
    stats, _ = await recalculate_passive_income(db, stats)
    
    click_power = stats.click_power
    stats.current_users += click_power
    stats.total_users_generated += click_power
    
    await db.commit()
    await db.refresh(stats)
    
    return {
        "gained": click_power,
        "current_users": round(stats.current_users, 2),
        "total_users_generated": round(stats.total_users_generated, 2)
    }

@game_router.post("/buy-upgrade")
@limiter.limit("60/minute")
async def buy_upgrade(request: Request, data: BuyUpgradeRequest, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    try:
        upgrade_id = data.upgrade_id

        if upgrade_id not in VALID_UPGRADE_IDS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid upgrade"
            )

        result = await db.execute(select(Upgrade).where(Upgrade.id == upgrade_id))
        upgrade = result.scalar_one_or_none()
        if not upgrade:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Upgrade not found")

        stats = await get_or_create_player_stats(db, user.id)
        stats, _ = await recalculate_passive_income(db, stats)

        result = await db.execute(
            select(PlayerUpgrade).where(
                PlayerUpgrade.user_id == user.id,
                PlayerUpgrade.upgrade_id == upgrade_id
            )
        )
        player_upgrade = result.scalar_one_or_none()
        current_level = player_upgrade.level if player_upgrade else 0

        cost = calculate_upgrade_cost(upgrade.base_cost, current_level)

        if stats.current_users < cost:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Not enough users. Need {cost:.2f}, have {stats.current_users:.2f}"
            )

        stats.current_users -= cost

        if player_upgrade:
            player_upgrade.level += 1
            new_level = player_upgrade.level
        else:
            player_upgrade = PlayerUpgrade(user_id=user.id, upgrade_id=upgrade_id, level=1)
            db.add(player_upgrade)
            new_level = 1

        await db.commit()
        await recalculate_player_stats(db, user.id)

        result = await db.execute(
            select(PlayerStats).where(PlayerStats.user_id == user.id)
        )
        updated_stats = result.scalar_one()

        return {
            "success": True,
            "upgrade_id": upgrade_id,
            "upgrade_name": upgrade.name,
            "new_level": new_level,
            "cost": cost,
            "current_users": round(updated_stats.current_users, 2),
            "click_power": updated_stats.click_power,
            "passive_income": updated_stats.passive_income
        }

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.exception("BUY_UPGRADE ERROR user=%s upgrade=%s", user.id, data.upgrade_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

# ===========================================
# LEADERBOARD ROUTES
# ===========================================
@api_router.get("/leaderboard")
@limiter.limit("30/minute")
async def get_leaderboard(request: Request, page: int = 1, limit: int = 10, db: AsyncSession = Depends(get_db)):
    # Validate pagination
    page = max(1, min(page, 1000))
    limit = max(1, min(limit, 100))
    skip = (page - 1) * limit
    
    result = await db.execute(
        select(PlayerStats)
        .options(selectinload(PlayerStats.user))
        .order_by(PlayerStats.total_users_generated.desc())
        .offset(skip)
        .limit(limit)
    )
    players = result.scalars().all()
    
    result_list = []
    for i, player in enumerate(players):
        result_list.append({
            "rank": skip + i + 1,
            "username": player.user.username if player.user else "Unknown",
            "total_users_generated": round(player.total_users_generated, 2),
            "level": player.level
        })
    
    result = await db.execute(select(func.count(PlayerStats.id)))
    total = result.scalar()
    
    return {
        "players": result_list,
        "total": total,
        "page": page,
        "pages": max(1, (total + limit - 1) // limit)
    }

@api_router.get("/leaderboard/top10")
async def get_top10(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(PlayerStats)
        .options(selectinload(PlayerStats.user))
        .order_by(PlayerStats.total_users_generated.desc())
        .limit(10)
    )
    players = result.scalars().all()
    
    return [
        {
            "rank": i + 1,
            "username": player.user.username if player.user else "Unknown",
            "total_users_generated": round(player.total_users_generated, 2),
            "level": player.level
        }
        for i, player in enumerate(players)
    ]

# ===========================================
# PROFILE ROUTE
# ===========================================
@api_router.get("/profile")
async def get_profile(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    stats = await get_or_create_player_stats(db, user.id)
    stats, _ = await recalculate_passive_income(db, stats)
    
    result = await db.execute(
        select(func.count(PlayerStats.id))
        .where(PlayerStats.total_users_generated > stats.total_users_generated)
    )
    higher_count = result.scalar()
    rank = higher_count + 1
    
    result = await db.execute(
        select(func.sum(PlayerUpgrade.level))
        .where(PlayerUpgrade.user_id == user.id)
    )
    total_upgrades = result.scalar() or 0
    
    return {
        "username": user.username,
        "email": user.email,
        "current_users": round(stats.current_users, 2),
        "total_users_generated": round(stats.total_users_generated, 2),
        "click_power": stats.click_power,
        "passive_income": stats.passive_income,
        "level": stats.level,
        "rank": rank,
        "total_upgrades": int(total_upgrades),
        "created_at": user.created_at.isoformat() if user.created_at else None
    }

@api_router.delete("/profile", status_code=status.HTTP_204_NO_CONTENT)
async def delete_profile(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        # Supprimer d'abord le compte Auth côté Supabase
        supabase.auth.admin.delete_user(str(user.id))

        # Puis supprimer les données locales
        await db.execute(
            PlayerUpgrade.__table__.delete().where(PlayerUpgrade.user_id == user.id)
        )

        await db.execute(
            UserTransfer.__table__.delete().where(
                (UserTransfer.sender_id == user.id) | (UserTransfer.recipient_id == user.id)
            )
        )

        await db.execute(
            PlayerStats.__table__.delete().where(PlayerStats.user_id == user.id)
        )

        await db.execute(
            User.__table__.delete().where(User.id == user.id)
        )

        await db.commit()

        return Response(status_code=status.HTTP_204_NO_CONTENT)

    except Exception as e:
        await db.rollback()
        logger.error(f"Delete profile error for user {user.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to delete profile"
        )

# ===========================================
# DAILY BONUS ROUTES
# ===========================================
@daily_router.get("/status")
async def get_daily_status(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Get daily bonus status for the current user"""
    stats = await get_or_create_player_stats(db, user.id)
    status = get_daily_bonus_status(stats)
    
    return {
        "available": status["available"],
        "seconds_until_available": status["seconds_until_available"],
        "current_streak": status["current_streak"],
        "next_streak": min(status["current_streak"] + 1, MAX_STREAK_DAYS) if status["available"] else status["current_streak"],
        "next_reward": status["next_reward"],
        "total_claims": status["total_claims"],
        "max_streak": MAX_STREAK_DAYS
    }

@daily_router.post("/claim")
@limiter.limit("5/minute")
async def claim_daily_bonus(request: Request, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Claim daily bonus reward"""
    stats = await get_or_create_player_stats(db, user.id)
    
    # Also recalculate passive income while we're here
    stats, _ = await recalculate_passive_income(db, stats)
    
    bonus_status = get_daily_bonus_status(stats)
    
    if not bonus_status["available"]:
        hours_remaining = bonus_status["seconds_until_available"] // 3600
        minutes_remaining = (bonus_status["seconds_until_available"] % 3600) // 60
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Daily bonus not available yet. Come back in {hours_remaining}h {minutes_remaining}m."
        )
    
    # Calculate reward
    reward = bonus_status["next_reward"]
    new_streak = bonus_status["current_streak"] + 1
    
    # Reset streak after max days
    if new_streak > MAX_STREAK_DAYS:
        new_streak = 1
    
    now = datetime.now(timezone.utc)
    
    # Update player stats
    stats.current_users += reward
    stats.total_users_generated += reward
    stats.last_daily_claim = now
    stats.daily_streak = new_streak
    stats.total_daily_claims = (stats.total_daily_claims or 0) + 1
    
    await db.commit()
    await db.refresh(stats)
    
    # Calculate next reward preview
    next_streak = new_streak + 1 if new_streak < MAX_STREAK_DAYS else 1
    next_reward = calculate_daily_bonus(stats.level, new_streak)
    
    return {
        "success": True,
        "reward": reward,
        "new_streak": new_streak,
        "total_claims": stats.total_daily_claims,
        "current_users": round(stats.current_users, 2),
        "next_reward": next_reward,
        "next_available_in": DAILY_BONUS_COOLDOWN_HOURS * 3600  # seconds
    }

# ===========================================
# TRANSFER ROUTES
# ===========================================
@transfer_router.get("/status")
async def get_transfer_status(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    now = datetime.now(timezone.utc)
    window_start = now - timedelta(days=TRANSFER_WINDOW_DAYS)

    result = await db.execute(
        select(func.coalesce(func.sum(UserTransfer.amount_sent), 0.0)).where(
            UserTransfer.sender_id == user.id,
            UserTransfer.created_at >= window_start
        )
    )
    sent_in_window = float(result.scalar() or 0.0)
    remaining = max(0.0, TRANSFER_MAX_AMOUNT - sent_in_window)

    stats = await get_or_create_player_stats(db, user.id)
    stats, _ = await recalculate_passive_income(db, stats)

    return {
        "enabled": True,
        "min_level_required": TRANSFER_MIN_LEVEL,
        "current_level": stats.level,
        "can_send": stats.level >= TRANSFER_MIN_LEVEL,
        "window_days": TRANSFER_WINDOW_DAYS,
        "window_limit": TRANSFER_MAX_AMOUNT,
        "sent_in_window": round(sent_in_window, 2),
        "remaining_in_window": round(remaining, 2),
        "fee_percent": int(TRANSFER_FEE_PERCENT * 100)
    }


@transfer_router.post("/send")
@limiter.limit("20/day")
async def send_users(
    request: Request,
    data: TransferUsersRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    sender_stats = await get_or_create_player_stats(db, user.id)
    sender_stats, _ = await recalculate_passive_income(db, sender_stats)

    if sender_stats.level < TRANSFER_MIN_LEVEL:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"You must be at least level {TRANSFER_MIN_LEVEL} to send Users"
        )

    recipient_result = await db.execute(
        select(User).where(User.username == data.recipient_username)
    )
    recipient = recipient_result.scalar_one_or_none()

    if not recipient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recipient not found"
        )

    if recipient.id == user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot send Users to yourself"
        )

    now = datetime.now(timezone.utc)
    window_start = now - timedelta(days=TRANSFER_WINDOW_DAYS)

    sent_result = await db.execute(
        select(func.coalesce(func.sum(UserTransfer.amount_sent), 0.0)).where(
            UserTransfer.sender_id == user.id,
            UserTransfer.created_at >= window_start
        )
    )
    total_sent_in_window = float(sent_result.scalar() or 0.0)

    if total_sent_in_window + data.amount > TRANSFER_MAX_AMOUNT:
        remaining = max(0.0, TRANSFER_MAX_AMOUNT - total_sent_in_window)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Transfer limit exceeded. You can still send {remaining:.2f} Users in the current {TRANSFER_WINDOW_DAYS}-day window."
        )

    if sender_stats.current_users < data.amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Not enough Users. Have {sender_stats.current_users:.2f}, need {data.amount:.2f}"
        )

    recipient_stats = await get_or_create_player_stats(db, recipient.id)
    recipient_stats, _ = await recalculate_passive_income(db, recipient_stats)

    fee_amount = round(data.amount * TRANSFER_FEE_PERCENT, 2)
    amount_received = round(data.amount - fee_amount, 2)

    sender_stats.current_users -= data.amount
    recipient_stats.current_users += amount_received

    transfer = UserTransfer(
        sender_id=user.id,
        recipient_id=recipient.id,
        amount_sent=data.amount,
        fee_amount=fee_amount,
        amount_received=amount_received
    )
    db.add(transfer)

    await db.commit()
    await db.refresh(sender_stats)
    await db.refresh(recipient_stats)

    new_remaining = max(0.0, TRANSFER_MAX_AMOUNT - (total_sent_in_window + data.amount))

    return {
        "success": True,
        "recipient_username": recipient.username,
        "amount_sent": round(data.amount, 2),
        "fee_amount": fee_amount,
        "amount_received": amount_received,
        "sender_current_users": round(sender_stats.current_users, 2),
        "recipient_current_users": round(recipient_stats.current_users, 2),
        "window_limit": TRANSFER_MAX_AMOUNT,
        "window_days": TRANSFER_WINDOW_DAYS,
        "remaining_in_window": round(new_remaining, 2)
    }


@transfer_router.get("/history")
async def get_transfer_history(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    sent_result = await db.execute(
        select(UserTransfer, User.username)
        .join(User, User.id == UserTransfer.recipient_id)
        .where(UserTransfer.sender_id == user.id)
        .order_by(UserTransfer.created_at.desc())
        .limit(20)
    )
    sent_rows = sent_result.all()

    received_result = await db.execute(
        select(UserTransfer, User.username)
        .join(User, User.id == UserTransfer.sender_id)
        .where(UserTransfer.recipient_id == user.id)
        .order_by(UserTransfer.created_at.desc())
        .limit(20)
    )
    received_rows = received_result.all()

    return {
        "sent": [
            {
                "to_username": username,
                "amount_sent": round(transfer.amount_sent, 2),
                "fee_amount": round(transfer.fee_amount, 2),
                "amount_received": round(transfer.amount_received, 2),
                "created_at": transfer.created_at.isoformat()
            }
            for transfer, username in sent_rows
        ],
        "received": [
            {
                "from_username": username,
                "amount_sent": round(transfer.amount_sent, 2),
                "fee_amount": round(transfer.fee_amount, 2),
                "amount_received": round(transfer.amount_received, 2),
                "created_at": transfer.created_at.isoformat()
            }
            for transfer, username in received_rows
        ]
    }

# ===========================================
# INCLUDE ROUTERS & MIDDLEWARE
# ===========================================
# Health check
@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "environment": ENVIRONMENT}

# Root endpoint
@api_router.get("/")
async def root():
    return {
        "message": "Ryvenox Empire API",
        "version": "1.0.0",
        "database": "PostgreSQL/Supabase"
    }

api_router.include_router(auth_router)
api_router.include_router(game_router)
api_router.include_router(daily_router)
api_router.include_router(transfer_router)
app.include_router(api_router)

# ===========================================
# STARTUP
# ===========================================
@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(func.count(Upgrade.id)))
        count = result.scalar()
        
        if count == 0:
            logger.info("Seeding upgrades...")
            for upgrade_data in INITIAL_UPGRADES:
                upgrade = Upgrade(**upgrade_data)
                db.add(upgrade)
            await db.commit()
            logger.info("Upgrades seeded successfully")
    
    logger.info(f"Database initialized (Environment: {ENVIRONMENT})")