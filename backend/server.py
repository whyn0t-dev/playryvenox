from dotenv import load_dotenv
from pathlib import Path
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from starlette.middleware.cors import CORSMiddleware
from sqlalchemy import select, func, update, delete
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
import os
import logging
import bcrypt
import jwt
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel, EmailStr
from typing import List, Optional

from database import get_db, engine, Base
from models import User, PlayerStats, Upgrade, PlayerUpgrade

# JWT Config
JWT_ALGORITHM = "HS256"

def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]

# Password utilities
def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

# Token utilities
def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=60),
        "type": "access"
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

def create_refresh_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "type": "refresh"
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

# Auth helper
async def get_current_user(request: Request, db: AsyncSession = Depends(get_db)) -> User:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        
        result = await db.execute(select(User).where(User.id == payload["sub"]))
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Pydantic Models
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    username: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    username: str
    role: str

class BuyUpgradeRequest(BaseModel):
    upgrade_id: str

# Game Constants - Initial upgrades data
INITIAL_UPGRADES = [
    # Click upgrades
    {"id": "landing_page", "name": "Landing Page", "type": "click", "effect": 1, "base_cost": 15, "description": "+1 per click", "sort_order": 1},
    {"id": "email_capture", "name": "Email Capture", "type": "click", "effect": 2, "base_cost": 100, "description": "+2 per click", "sort_order": 2},
    {"id": "growth_copywriting", "name": "Growth Copywriting", "type": "click", "effect": 5, "base_cost": 500, "description": "+5 per click", "sort_order": 3},
    {"id": "paid_ads", "name": "Paid Ads", "type": "click", "effect": 10, "base_cost": 2000, "description": "+10 per click", "sort_order": 4},
    {"id": "viral_referral", "name": "Viral Referral Loop", "type": "click", "effect": 25, "base_cost": 10000, "description": "+25 per click", "sort_order": 5},
    # Passive upgrades
    {"id": "intern", "name": "Intern", "type": "passive", "effect": 1, "base_cost": 25, "description": "+1/sec", "sort_order": 6},
    {"id": "automation_bot", "name": "Automation Bot", "type": "passive", "effect": 5, "base_cost": 200, "description": "+5/sec", "sort_order": 7},
    {"id": "ai_agent", "name": "AI Agent", "type": "passive", "effect": 20, "base_cost": 1000, "description": "+20/sec", "sort_order": 8},
    {"id": "cloud_infra", "name": "Cloud Infrastructure", "type": "passive", "effect": 75, "base_cost": 5000, "description": "+75/sec", "sort_order": 9},
    {"id": "global_expansion", "name": "Global Expansion", "type": "passive", "effect": 250, "base_cost": 25000, "description": "+250/sec", "sort_order": 10},
]

def calculate_upgrade_cost(base_cost: float, level: int) -> float:
    return round(base_cost * (1.15 ** level), 2)

async def get_or_create_player_stats(db: AsyncSession, user_id: str) -> PlayerStats:
    result = await db.execute(select(PlayerStats).where(PlayerStats.user_id == user_id))
    stats = result.scalar_one_or_none()
    
    if not stats:
        # Create new stats
        stats = PlayerStats(user_id=user_id)
        db.add(stats)
        await db.commit()
        await db.refresh(stats)
        
        # Initialize player upgrades
        result = await db.execute(select(Upgrade))
        upgrades = result.scalars().all()
        for upgrade in upgrades:
            player_upgrade = PlayerUpgrade(user_id=user_id, upgrade_id=upgrade.id, level=0)
            db.add(player_upgrade)
        await db.commit()
        
    return stats

async def recalculate_passive_income(db: AsyncSession, stats: PlayerStats) -> PlayerStats:
    """Recalculate passive income based on time elapsed"""
    now = datetime.now(timezone.utc)
    last_calc = stats.last_calculated_at
    if last_calc.tzinfo is None:
        last_calc = last_calc.replace(tzinfo=timezone.utc)
    
    elapsed_seconds = (now - last_calc).total_seconds()
    
    if elapsed_seconds > 0 and stats.passive_income > 0:
        gained = stats.passive_income * elapsed_seconds
        stats.current_users += gained
        stats.total_users_generated += gained
    
    stats.last_calculated_at = now
    await db.commit()
    await db.refresh(stats)
    
    return stats

async def recalculate_player_stats(db: AsyncSession, user_id: str):
    """Recalculate click_power and passive_income from upgrades"""
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

# Create the main app
app = FastAPI(title="AI Startup Clicker")

# Create routers
api_router = APIRouter(prefix="/api")
auth_router = APIRouter(prefix="/auth", tags=["auth"])
game_router = APIRouter(prefix="/game", tags=["game"])

# Auth Routes
@auth_router.post("/register")
async def register(data: UserRegister, response: Response, db: AsyncSession = Depends(get_db)):
    email = data.email.lower()
    
    # Check if email exists
    result = await db.execute(select(User).where(User.email == email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Check if username exists
    result = await db.execute(select(User).where(User.username == data.username))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Username already taken")
    
    # Create user
    user = User(
        email=email,
        username=data.username,
        password_hash=hash_password(data.password),
        role="player"
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    # Create tokens
    access_token = create_access_token(user.id, email)
    refresh_token = create_refresh_token(user.id)
    
    # Set cookies
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=3600, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")
    
    # Initialize player stats
    await get_or_create_player_stats(db, user.id)
    
    return {"id": user.id, "email": email, "username": data.username, "role": "player"}

@auth_router.post("/login")
async def login(data: UserLogin, response: Response, db: AsyncSession = Depends(get_db)):
    email = data.email.lower()
    
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Create tokens
    access_token = create_access_token(user.id, email)
    refresh_token = create_refresh_token(user.id)
    
    # Set cookies
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=3600, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")
    
    return {"id": user.id, "email": email, "username": user.username, "role": user.role}

@auth_router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"message": "Logged out successfully"}

@auth_router.get("/me")
async def get_me(user: User = Depends(get_current_user)):
    return {"id": user.id, "email": user.email, "username": user.username, "role": user.role}

# Game Routes
@game_router.get("/state")
async def get_game_state(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # Get and update stats with passive income
    stats = await get_or_create_player_stats(db, user.id)
    stats = await recalculate_passive_income(db, stats)
    
    # Get player upgrades with upgrade data
    result = await db.execute(
        select(PlayerUpgrade)
        .options(selectinload(PlayerUpgrade.upgrade))
        .where(PlayerUpgrade.user_id == user.id)
    )
    player_upgrades = result.scalars().all()
    
    # Get all upgrades for ordering
    result = await db.execute(select(Upgrade).order_by(Upgrade.sort_order))
    all_upgrades = result.scalars().all()
    
    # Build upgrades with costs
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
async def click(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # Get current stats
    stats = await get_or_create_player_stats(db, user.id)
    stats = await recalculate_passive_income(db, stats)
    
    # Add click power
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
async def buy_upgrade(data: BuyUpgradeRequest, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    upgrade_id = data.upgrade_id
    
    # Validate upgrade exists
    result = await db.execute(select(Upgrade).where(Upgrade.id == upgrade_id))
    upgrade = result.scalar_one_or_none()
    if not upgrade:
        raise HTTPException(status_code=400, detail="Invalid upgrade")
    
    # Get current stats
    stats = await get_or_create_player_stats(db, user.id)
    stats = await recalculate_passive_income(db, stats)
    
    # Get current upgrade level
    result = await db.execute(
        select(PlayerUpgrade).where(
            PlayerUpgrade.user_id == user.id,
            PlayerUpgrade.upgrade_id == upgrade_id
        )
    )
    player_upgrade = result.scalar_one_or_none()
    current_level = player_upgrade.level if player_upgrade else 0
    
    # Calculate cost
    cost = calculate_upgrade_cost(upgrade.base_cost, current_level)
    
    # Check if can afford
    if stats.current_users < cost:
        raise HTTPException(status_code=400, detail="Not enough users")
    
    # Deduct cost
    stats.current_users -= cost
    
    # Increase level
    if player_upgrade:
        player_upgrade.level += 1
        new_level = player_upgrade.level
    else:
        player_upgrade = PlayerUpgrade(user_id=user.id, upgrade_id=upgrade_id, level=1)
        db.add(player_upgrade)
        new_level = 1
    
    await db.commit()
    
    # Recalculate player stats
    await recalculate_player_stats(db, user.id)
    
    # Get updated stats
    result = await db.execute(select(PlayerStats).where(PlayerStats.user_id == user.id))
    updated_stats = result.scalar_one()
    
    return {
        "success": True,
        "upgrade_id": upgrade_id,
        "new_level": new_level,
        "cost": cost,
        "current_users": round(stats.current_users, 2),
        "click_power": updated_stats.click_power,
        "passive_income": updated_stats.passive_income
    }

# Leaderboard Route
@api_router.get("/leaderboard")
async def get_leaderboard(page: int = 1, limit: int = 10, db: AsyncSession = Depends(get_db)):
    skip = (page - 1) * limit
    
    # Get top players with user info
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
    
    # Get total count
    result = await db.execute(select(func.count(PlayerStats.id)))
    total = result.scalar()
    
    return {
        "players": result_list,
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit if total > 0 else 1
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
    
    result_list = []
    for i, player in enumerate(players):
        result_list.append({
            "rank": i + 1,
            "username": player.user.username if player.user else "Unknown",
            "total_users_generated": round(player.total_users_generated, 2),
            "level": player.level
        })
    
    return result_list

# Profile Route
@api_router.get("/profile")
async def get_profile(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # Get stats
    stats = await get_or_create_player_stats(db, user.id)
    stats = await recalculate_passive_income(db, stats)
    
    # Get rank
    result = await db.execute(
        select(func.count(PlayerStats.id))
        .where(PlayerStats.total_users_generated > stats.total_users_generated)
    )
    higher_count = result.scalar()
    rank = higher_count + 1
    
    # Get total upgrades
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
        "total_upgrades": total_upgrades,
        "created_at": user.created_at.isoformat() if user.created_at else "Unknown"
    }

# Include routers
api_router.include_router(auth_router)
api_router.include_router(game_router)
app.include_router(api_router)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Startup event - seed upgrades
@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        # Create all tables
        await conn.run_sync(Base.metadata.create_all)
    
    # Seed upgrades if not exists
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
        else:
            logger.info(f"Found {count} upgrades, skipping seed")
    
    logger.info("Database initialized")

# Import AsyncSessionLocal for startup
from database import AsyncSessionLocal

# Root endpoint
@api_router.get("/")
async def root():
    return {"message": "AI Startup Clicker API", "version": "1.0.0", "database": "PostgreSQL/Supabase"}
