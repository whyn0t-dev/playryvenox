from dotenv import load_dotenv
from pathlib import Path
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import os
import logging
import bcrypt
import jwt
import secrets
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

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
async def get_current_user(request: Request) -> dict:
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
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user["_id"] = str(user["_id"])
        user.pop("password_hash", None)
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

class ClickRequest(BaseModel):
    pass

class BuyUpgradeRequest(BaseModel):
    upgrade_id: str

class LeaderboardEntry(BaseModel):
    rank: int
    username: str
    total_users_generated: float
    level: int

# Game Constants
UPGRADES = [
    # Click upgrades
    {"id": "landing_page", "name": "Landing Page", "type": "click", "effect": 1, "base_cost": 15, "description": "+1 per click"},
    {"id": "email_capture", "name": "Email Capture", "type": "click", "effect": 2, "base_cost": 100, "description": "+2 per click"},
    {"id": "growth_copywriting", "name": "Growth Copywriting", "type": "click", "effect": 5, "base_cost": 500, "description": "+5 per click"},
    {"id": "paid_ads", "name": "Paid Ads", "type": "click", "effect": 10, "base_cost": 2000, "description": "+10 per click"},
    {"id": "viral_referral", "name": "Viral Referral Loop", "type": "click", "effect": 25, "base_cost": 10000, "description": "+25 per click"},
    # Passive upgrades
    {"id": "intern", "name": "Intern", "type": "passive", "effect": 1, "base_cost": 25, "description": "+1/sec"},
    {"id": "automation_bot", "name": "Automation Bot", "type": "passive", "effect": 5, "base_cost": 200, "description": "+5/sec"},
    {"id": "ai_agent", "name": "AI Agent", "type": "passive", "effect": 20, "base_cost": 1000, "description": "+20/sec"},
    {"id": "cloud_infra", "name": "Cloud Infrastructure", "type": "passive", "effect": 75, "base_cost": 5000, "description": "+75/sec"},
    {"id": "global_expansion", "name": "Global Expansion", "type": "passive", "effect": 250, "base_cost": 25000, "description": "+250/sec"},
]

def calculate_upgrade_cost(base_cost: float, level: int) -> float:
    return round(base_cost * (1.15 ** level), 2)

async def get_or_create_player_stats(user_id: str):
    stats = await db.player_stats.find_one({"user_id": user_id})
    if not stats:
        now = datetime.now(timezone.utc)
        stats = {
            "user_id": user_id,
            "current_users": 0,
            "total_users_generated": 0,
            "click_power": 1,
            "passive_income": 0,
            "level": 1,
            "last_calculated_at": now.isoformat(),
            "created_at": now.isoformat()
        }
        await db.player_stats.insert_one(stats)
        # Initialize player upgrades
        for upgrade in UPGRADES:
            await db.player_upgrades.insert_one({
                "user_id": user_id,
                "upgrade_id": upgrade["id"],
                "level": 0
            })
        stats = await db.player_stats.find_one({"user_id": user_id})
    return stats

async def recalculate_passive_income(user_id: str, stats: dict) -> dict:
    """Recalculate passive income based on time elapsed"""
    last_calc = datetime.fromisoformat(stats["last_calculated_at"].replace("Z", "+00:00"))
    now = datetime.now(timezone.utc)
    elapsed_seconds = (now - last_calc).total_seconds()
    
    if elapsed_seconds > 0 and stats["passive_income"] > 0:
        gained = stats["passive_income"] * elapsed_seconds
        new_current = stats["current_users"] + gained
        new_total = stats["total_users_generated"] + gained
        
        await db.player_stats.update_one(
            {"user_id": user_id},
            {"$set": {
                "current_users": new_current,
                "total_users_generated": new_total,
                "last_calculated_at": now.isoformat()
            }}
        )
        stats["current_users"] = new_current
        stats["total_users_generated"] = new_total
        stats["last_calculated_at"] = now.isoformat()
    else:
        await db.player_stats.update_one(
            {"user_id": user_id},
            {"$set": {"last_calculated_at": now.isoformat()}}
        )
        stats["last_calculated_at"] = now.isoformat()
    
    return stats

async def recalculate_player_stats(user_id: str):
    """Recalculate click_power and passive_income from upgrades"""
    player_upgrades = await db.player_upgrades.find({"user_id": user_id}).to_list(100)
    
    click_power = 1
    passive_income = 0
    
    for pu in player_upgrades:
        upgrade = next((u for u in UPGRADES if u["id"] == pu["upgrade_id"]), None)
        if upgrade and pu["level"] > 0:
            if upgrade["type"] == "click":
                click_power += upgrade["effect"] * pu["level"]
            else:
                passive_income += upgrade["effect"] * pu["level"]
    
    # Calculate level based on total upgrades
    total_levels = sum(pu["level"] for pu in player_upgrades)
    level = 1 + (total_levels // 5)
    
    await db.player_stats.update_one(
        {"user_id": user_id},
        {"$set": {"click_power": click_power, "passive_income": passive_income, "level": level}}
    )

# Create the main app
app = FastAPI(title="AI Startup Clicker")

# Create routers
api_router = APIRouter(prefix="/api")
auth_router = APIRouter(prefix="/auth", tags=["auth"])
game_router = APIRouter(prefix="/game", tags=["game"])

# Auth Routes
@auth_router.post("/register")
async def register(data: UserRegister, response: Response):
    email = data.email.lower()
    
    # Check if email exists
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Check if username exists
    existing_username = await db.users.find_one({"username": data.username})
    if existing_username:
        raise HTTPException(status_code=400, detail="Username already taken")
    
    # Create user
    now = datetime.now(timezone.utc)
    user_doc = {
        "email": email,
        "username": data.username,
        "password_hash": hash_password(data.password),
        "role": "player",
        "created_at": now.isoformat()
    }
    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)
    
    # Create tokens
    access_token = create_access_token(user_id, email)
    refresh_token = create_refresh_token(user_id)
    
    # Set cookies
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=3600, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")
    
    # Initialize player stats
    await get_or_create_player_stats(user_id)
    
    return {"id": user_id, "email": email, "username": data.username, "role": "player"}

@auth_router.post("/login")
async def login(data: UserLogin, response: Response):
    email = data.email.lower()
    
    user = await db.users.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    user_id = str(user["_id"])
    
    # Create tokens
    access_token = create_access_token(user_id, email)
    refresh_token = create_refresh_token(user_id)
    
    # Set cookies
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=3600, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")
    
    return {"id": user_id, "email": email, "username": user["username"], "role": user["role"]}

@auth_router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"message": "Logged out successfully"}

@auth_router.get("/me")
async def get_me(user: dict = Depends(get_current_user)):
    return {"id": user["_id"], "email": user["email"], "username": user["username"], "role": user["role"]}

# Game Routes
@game_router.get("/state")
async def get_game_state(user: dict = Depends(get_current_user)):
    user_id = user["_id"]
    
    # Get and update stats with passive income
    stats = await get_or_create_player_stats(user_id)
    stats = await recalculate_passive_income(user_id, stats)
    
    # Get player upgrades
    player_upgrades = await db.player_upgrades.find({"user_id": user_id}, {"_id": 0}).to_list(100)
    
    # Build upgrades with costs
    upgrades_data = []
    for upgrade in UPGRADES:
        pu = next((p for p in player_upgrades if p["upgrade_id"] == upgrade["id"]), {"level": 0})
        level = pu.get("level", 0)
        cost = calculate_upgrade_cost(upgrade["base_cost"], level)
        upgrades_data.append({
            "id": upgrade["id"],
            "name": upgrade["name"],
            "type": upgrade["type"],
            "effect": upgrade["effect"],
            "description": upgrade["description"],
            "level": level,
            "cost": cost,
            "can_afford": stats["current_users"] >= cost
        })
    
    return {
        "current_users": round(stats["current_users"], 2),
        "total_users_generated": round(stats["total_users_generated"], 2),
        "click_power": stats["click_power"],
        "passive_income": stats["passive_income"],
        "level": stats["level"],
        "upgrades": upgrades_data
    }

@game_router.post("/click")
async def click(user: dict = Depends(get_current_user)):
    user_id = user["_id"]
    
    # Get current stats
    stats = await get_or_create_player_stats(user_id)
    stats = await recalculate_passive_income(user_id, stats)
    
    # Add click power
    click_power = stats["click_power"]
    new_current = stats["current_users"] + click_power
    new_total = stats["total_users_generated"] + click_power
    
    await db.player_stats.update_one(
        {"user_id": user_id},
        {"$set": {
            "current_users": new_current,
            "total_users_generated": new_total
        }}
    )
    
    return {
        "gained": click_power,
        "current_users": round(new_current, 2),
        "total_users_generated": round(new_total, 2)
    }

@game_router.post("/buy-upgrade")
async def buy_upgrade(data: BuyUpgradeRequest, user: dict = Depends(get_current_user)):
    user_id = user["_id"]
    upgrade_id = data.upgrade_id
    
    # Validate upgrade exists
    upgrade = next((u for u in UPGRADES if u["id"] == upgrade_id), None)
    if not upgrade:
        raise HTTPException(status_code=400, detail="Invalid upgrade")
    
    # Get current stats
    stats = await get_or_create_player_stats(user_id)
    stats = await recalculate_passive_income(user_id, stats)
    
    # Get current upgrade level
    player_upgrade = await db.player_upgrades.find_one({"user_id": user_id, "upgrade_id": upgrade_id})
    if not player_upgrade:
        player_upgrade = {"level": 0}
    
    # Calculate cost
    cost = calculate_upgrade_cost(upgrade["base_cost"], player_upgrade["level"])
    
    # Check if can afford
    if stats["current_users"] < cost:
        raise HTTPException(status_code=400, detail="Not enough users")
    
    # Deduct cost and increase level
    new_current = stats["current_users"] - cost
    new_level = player_upgrade["level"] + 1
    
    await db.player_stats.update_one(
        {"user_id": user_id},
        {"$set": {"current_users": new_current}}
    )
    
    await db.player_upgrades.update_one(
        {"user_id": user_id, "upgrade_id": upgrade_id},
        {"$set": {"level": new_level}},
        upsert=True
    )
    
    # Recalculate player stats
    await recalculate_player_stats(user_id)
    
    # Get updated stats
    updated_stats = await db.player_stats.find_one({"user_id": user_id})
    
    return {
        "success": True,
        "upgrade_id": upgrade_id,
        "new_level": new_level,
        "cost": cost,
        "current_users": round(new_current, 2),
        "click_power": updated_stats["click_power"],
        "passive_income": updated_stats["passive_income"]
    }

# Leaderboard Route
@api_router.get("/leaderboard")
async def get_leaderboard(page: int = 1, limit: int = 10):
    skip = (page - 1) * limit
    
    # Get top players
    pipeline = [
        {"$lookup": {
            "from": "users",
            "localField": "user_id",
            "foreignField": "_id",
            "as": "user"
        }},
        {"$unwind": {"path": "$user", "preserveNullAndEmptyArrays": True}},
        {"$sort": {"total_users_generated": -1}},
        {"$skip": skip},
        {"$limit": limit},
        {"$project": {
            "_id": 0,
            "username": "$user.username",
            "total_users_generated": 1,
            "level": 1
        }}
    ]
    
    # Fix: lookup by string user_id
    players = await db.player_stats.find({}, {"_id": 0}).sort("total_users_generated", -1).skip(skip).limit(limit).to_list(limit)
    
    result = []
    for i, player in enumerate(players):
        user = await db.users.find_one({"_id": ObjectId(player["user_id"])})
        username = user["username"] if user else "Unknown"
        result.append({
            "rank": skip + i + 1,
            "username": username,
            "total_users_generated": round(player["total_users_generated"], 2),
            "level": player["level"]
        })
    
    # Get total count for pagination
    total = await db.player_stats.count_documents({})
    
    return {
        "players": result,
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit
    }

@api_router.get("/leaderboard/top10")
async def get_top10():
    players = await db.player_stats.find({}, {"_id": 0}).sort("total_users_generated", -1).limit(10).to_list(10)
    
    result = []
    for i, player in enumerate(players):
        user = await db.users.find_one({"_id": ObjectId(player["user_id"])})
        username = user["username"] if user else "Unknown"
        result.append({
            "rank": i + 1,
            "username": username,
            "total_users_generated": round(player["total_users_generated"], 2),
            "level": player["level"]
        })
    
    return result

# Profile Route
@api_router.get("/profile")
async def get_profile(user: dict = Depends(get_current_user)):
    user_id = user["_id"]
    
    # Get stats
    stats = await get_or_create_player_stats(user_id)
    stats = await recalculate_passive_income(user_id, stats)
    
    # Get rank
    higher_count = await db.player_stats.count_documents({"total_users_generated": {"$gt": stats["total_users_generated"]}})
    rank = higher_count + 1
    
    # Get player upgrades
    player_upgrades = await db.player_upgrades.find({"user_id": user_id}, {"_id": 0}).to_list(100)
    total_upgrades = sum(pu["level"] for pu in player_upgrades)
    
    return {
        "username": user["username"],
        "email": user["email"],
        "current_users": round(stats["current_users"], 2),
        "total_users_generated": round(stats["total_users_generated"], 2),
        "click_power": stats["click_power"],
        "passive_income": stats["passive_income"],
        "level": stats["level"],
        "rank": rank,
        "total_upgrades": total_upgrades,
        "created_at": user.get("created_at", "Unknown")
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

# Startup event
@app.on_event("startup")
async def startup():
    # Create indexes
    await db.users.create_index("email", unique=True)
    await db.users.create_index("username", unique=True)
    await db.player_stats.create_index("user_id", unique=True)
    await db.player_stats.create_index([("total_users_generated", -1)])
    await db.player_upgrades.create_index([("user_id", 1), ("upgrade_id", 1)], unique=True)
    logger.info("Database indexes created")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

# Root endpoint
@api_router.get("/")
async def root():
    return {"message": "AI Startup Clicker API", "version": "1.0.0"}
