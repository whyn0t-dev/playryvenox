from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, field_validator
from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from dependencies import get_current_user
from models import BaseBuilding, BaseStats, PlayerStats, Upgrade, PlayerUpgrade, User

base_router = APIRouter(prefix="/base", tags=["base"])

GRID_WIDTH = 10
GRID_HEIGHT = 10

BUILDING_COSTS = {
    "core": 0,
    "generator": 100,
    "storage": 150,
    "wall": 50,
}


class BuildRequest(BaseModel):
    building_type: str
    x: int
    y: int

    @field_validator("building_type")
    @classmethod
    def validate_building_type(cls, v: str):
        if v not in BUILDING_COSTS:
            raise ValueError("Invalid building type")
        return v

    @field_validator("x")
    @classmethod
    def validate_x(cls, v: int):
        if v < 0 or v >= GRID_WIDTH:
            raise ValueError("Invalid x position")
        return v

    @field_validator("y")
    @classmethod
    def validate_y(cls, v: int):
        if v < 0 or v >= GRID_HEIGHT:
            raise ValueError("Invalid y position")
        return v

    rotation: int = 0

    @field_validator("rotation")
    @classmethod
    def validate_rotation(cls, v: int):
        if v not in (0, 90, 180, 270):
            raise ValueError("Invalid rotation")
        return v


async def get_or_create_player_stats(db: AsyncSession, user_id) -> PlayerStats:
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
            player_upgrade = PlayerUpgrade(
                user_id=user_id, upgrade_id=upgrade.id, level=0
            )
            db.add(player_upgrade)

        await db.commit()

    return stats


async def get_or_create_base_stats(db: AsyncSession, user_id) -> BaseStats:
    result = await db.execute(select(BaseStats).where(BaseStats.user_id == user_id))
    stats = result.scalar_one_or_none()

    if not stats:
        stats = BaseStats(
            user_id=user_id, grid_width=GRID_WIDTH, grid_height=GRID_HEIGHT
        )
        db.add(stats)

        core = BaseBuilding(
            user_id=user_id,
            building_type="core",
            level=1,
            grid_x=GRID_WIDTH // 2,
            grid_y=GRID_HEIGHT // 2,
        )
        db.add(core)

        await db.commit()
        await db.refresh(stats)

    return stats


async def is_cell_occupied(db: AsyncSession, user_id, x: int, y: int) -> bool:
    result = await db.execute(
        select(BaseBuilding).where(
            and_(
                BaseBuilding.user_id == user_id,
                BaseBuilding.grid_x == x,
                BaseBuilding.grid_y == y,
            )
        )
    )
    building = result.scalar_one_or_none()
    return building is not None


@base_router.get("/state")
async def get_base_state(
    user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    base_stats = await get_or_create_base_stats(db, user.id)
    player_stats = await get_or_create_player_stats(db, user.id)

    result = await db.execute(
        select(BaseBuilding).where(BaseBuilding.user_id == user.id)
    )
    buildings = result.scalars().all()

    return {
        "grid": {"width": base_stats.grid_width, "height": base_stats.grid_height},
        "buildings": [
            {
                "type": building.building_type,
                "level": building.level,
                "x": building.grid_x,
                "y": building.grid_y,
                "rotation": building.rotation,
            }
            for building in buildings
        ],
        "player": {"current_users": round(player_stats.current_users, 2)},
        "building_costs": BUILDING_COSTS,
    }


@base_router.post("/build")
async def build_structure(
    data: BuildRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await get_or_create_base_stats(db, user.id)
    player_stats = await get_or_create_player_stats(db, user.id)

    if await is_cell_occupied(db, user.id, data.x, data.y):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Cell already occupied"
        )

    if data.building_type == "core":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Core already exists"
        )

    cost = BUILDING_COSTS[data.building_type]

    if player_stats.current_users < cost:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Not enough users. Need {cost}, have {round(player_stats.current_users, 2)}",
        )

    player_stats.current_users -= cost

    building = BaseBuilding(
        user_id=user.id,
        building_type=data.building_type,
        level=1,
        grid_x=data.x,
        grid_y=data.y,
        rotation=data.rotation,
    )
    db.add(building)

    await db.commit()
    await db.refresh(player_stats)

    return {
        "success": True,
        "building": {"type": data.building_type, "x": data.x, "y": data.y, "level": 1},
        "cost": cost,
        "remaining_users": round(player_stats.current_users, 2),
    }


@base_router.post("/reset")
async def reset_base(
    user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    await db.execute(
        BaseBuilding.__table__.delete().where(BaseBuilding.user_id == user.id)
    )

    await db.execute(BaseStats.__table__.delete().where(BaseStats.user_id == user.id))

    base_stats = BaseStats(
        user_id=user.id, grid_width=GRID_WIDTH, grid_height=GRID_HEIGHT
    )
    db.add(base_stats)

    core = BaseBuilding(
        user_id=user.id,
        building_type="core",
        level=1,
        grid_x=GRID_WIDTH // 2,
        grid_y=GRID_HEIGHT // 2,
    )
    db.add(core)

    await db.commit()

    return {"success": True}
