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
from sqlalchemy import select, func, update
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
import os
import logging
import re
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel, EmailStr, field_validator, ConfigDict
from typing import List, Optional

from database import get_db, engine, Base, AsyncSessionLocal
from models import User, PlayerStats, Upgrade, PlayerUpgrade

from supabase import create_client, Client

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
        result = await db.execute(
            select(User).where(User.id == user_data.id)
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
            id=user_data["id"],
            email=user_data["email"].lower(),
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

# ===========================================
# GAME CONSTANTS
# ===========================================
INITIAL_UPGRADES = [
    {"id": "landing_page", "name": "Landing Page", "type": "click", "effect": 1, "base_cost": 15, "description": "+1 per click", "sort_order": 1},
    {"id": "email_capture", "name": "Email Capture", "type": "click", "effect": 2, "base_cost": 100, "description": "+2 per click", "sort_order": 2},
    {"id": "growth_copywriting", "name": "Growth Copywriting", "type": "click", "effect": 5, "base_cost": 500, "description": "+5 per click", "sort_order": 3},
    {"id": "paid_ads", "name": "Paid Ads", "type": "click", "effect": 10, "base_cost": 2000, "description": "+10 per click", "sort_order": 4},
    {"id": "viral_referral", "name": "Viral Referral Loop", "type": "click", "effect": 25, "base_cost": 10000, "description": "+25 per click", "sort_order": 5},
    {"id": "intern", "name": "Intern", "type": "passive", "effect": 1, "base_cost": 25, "description": "+1/sec", "sort_order": 6},
    {"id": "automation_bot", "name": "Automation Bot", "type": "passive", "effect": 5, "base_cost": 200, "description": "+5/sec", "sort_order": 7},
    {"id": "ai_agent", "name": "AI Agent", "type": "passive", "effect": 20, "base_cost": 1000, "description": "+20/sec", "sort_order": 8},
    {"id": "cloud_infra", "name": "Cloud Infrastructure", "type": "passive", "effect": 75, "base_cost": 5000, "description": "+75/sec", "sort_order": 9},
    {"id": "global_expansion", "name": "Global Expansion", "type": "passive", "effect": 250, "base_cost": 25000, "description": "+250/sec", "sort_order": 10},
]

VALID_UPGRADE_IDS = {u["id"] for u in INITIAL_UPGRADES}

def calculate_upgrade_cost(base_cost: float, level: int) -> float:
    return round(base_cost * (1.15 ** level), 2)

# ===========================================
# DAILY BONUS CONSTANTS
# ===========================================
DAILY_BONUS_COOLDOWN_HOURS = 24
DAILY_BONUS_BASE_REWARD = 100  # Base users reward
DAILY_STREAK_MULTIPLIERS = {
    1: 1.0,    # Day 1: 100 users
    2: 1.5,    # Day 2: 150 users
    3: 2.0,    # Day 3: 200 users
    4: 3.0,    # Day 4: 300 users
    5: 4.0,    # Day 5: 400 users
    6: 5.0,    # Day 6: 500 users
    7: 10.0,   # Day 7: 1000 users (big bonus!)
}
MAX_STREAK_DAYS = 7  # Streak resets after day 7

def calculate_daily_bonus(level: int, streak: int) -> int:
    """Calculate daily bonus based on player level and streak"""
    # Base reward scales with level
    level_bonus = DAILY_BONUS_BASE_REWARD * (1 + (level - 1) * 0.5)
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
async def get_or_create_player_stats(db: AsyncSession, user_id: str) -> PlayerStats:
    result = await db.execute(select(PlayerStats).where(PlayerStats.user_id == user_id))
    stats = result.scalar_one_or_none()
    
    if not stats:
        stats = PlayerStats(user_id=user_id)
        db.add(stats)
        await db.commit()
        await db.refresh(stats)
        
        result = await db.execute(select(Upgrade))
        upgrades = result.scalars().all()
        for upgrade in upgrades:
            player_upgrade = PlayerUpgrade(user_id=user_id, upgrade_id=upgrade.id, level=0)
            db.add(player_upgrade)
        await db.commit()
        
    return stats

async def recalculate_passive_income(db: AsyncSession, stats: PlayerStats) -> PlayerStats:
    now = datetime.now(timezone.utc)
    last_calc = stats.last_calculated_at
    if last_calc.tzinfo is None:
        last_calc = last_calc.replace(tzinfo=timezone.utc)
    
    elapsed_seconds = (now - last_calc).total_seconds()
    
    # Cap offline earnings to 24 hours max
    max_offline_seconds = 24 * 60 * 60
    elapsed_seconds = min(elapsed_seconds, max_offline_seconds)
    
    if elapsed_seconds > 0 and stats.passive_income > 0:
        gained = stats.passive_income * elapsed_seconds
        stats.current_users += gained
        stats.total_users_generated += gained
    
    stats.last_calculated_at = now
    await db.commit()
    await db.refresh(stats)
    
    return stats

async def recalculate_player_stats(db: AsyncSession, user_id: str):
    result = await db.execute(
        select(PlayerUpgrade)
        .options(selectinload(PlayerUpgrade.upgrade))
        .where(PlayerUpgrade.user_id == user_id)
    )
    player_upgrades = result.scalars().all()
    
    click_power = 1
    passive_income = 0
    total_levels = 0
    
    for pu in player_upgrades:
        if pu.level > 0:
            total_levels += pu.level
            if pu.upgrade.type == "click":
                click_power += pu.upgrade.effect * pu.level
            else:
                passive_income += pu.upgrade.effect * pu.level
    
    level = 1 + (total_levels // 5)
    
    await db.execute(
        update(PlayerStats)
        .where(PlayerStats.user_id == user_id)
        .values(click_power=click_power, passive_income=passive_income, level=level)
    )
    await db.commit()

# ===========================================
# FASTAPI APP
# ===========================================
app = FastAPI(
    title="AI Startup Clicker",
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
    stats = await recalculate_passive_income(db, stats)
    
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
        "upgrades": upgrades_data
    }

@game_router.post("/click")
@limiter.limit("300/minute")
async def click(request: Request, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    stats = await get_or_create_player_stats(db, user.id)
    stats = await recalculate_passive_income(db, stats)
    
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
    upgrade_id = data.upgrade_id
    
    # Validate upgrade exists
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
    stats = await recalculate_passive_income(db, stats)
    
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
            detail=f"Not enough users. Need {cost:.0f}, have {stats.current_users:.0f}"
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
    
    result = await db.execute(select(PlayerStats).where(PlayerStats.user_id == user.id))
    updated_stats = result.scalar_one()
    
    return {
        "success": True,
        "upgrade_id": upgrade_id,
        "upgrade_name": upgrade.name,
        "new_level": new_level,
        "cost": cost,
        "current_users": round(stats.current_users, 2),
        "click_power": updated_stats.click_power,
        "passive_income": updated_stats.passive_income
    }

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
    stats = await recalculate_passive_income(db, stats)
    
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
    stats = await recalculate_passive_income(db, stats)
    
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
        "message": "AI Startup Clicker API",
        "version": "1.0.0",
        "database": "PostgreSQL/Supabase"
    }

api_router.include_router(auth_router)
api_router.include_router(game_router)
api_router.include_router(daily_router)
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


