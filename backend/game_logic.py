from datetime import datetime, timezone
from sqlalchemy import select, update
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from models import PlayerStats, PlayerUpgrade


async def recalculate_passive_income(db: AsyncSession, stats: PlayerStats):
    now = datetime.now(timezone.utc)
    last_calc = stats.last_calculated_at
    if last_calc.tzinfo is None:
        last_calc = last_calc.replace(tzinfo=timezone.utc)

    elapsed_seconds = (now - last_calc).total_seconds()

    max_offline_seconds = 24 * 60 * 60
    elapsed_seconds = min(elapsed_seconds, max_offline_seconds)

    gained = 0.0

    if elapsed_seconds > 0 and stats.passive_income > 0:
        gained = stats.passive_income * elapsed_seconds
        stats.current_users += gained
        stats.total_users_generated += gained

    stats.last_calculated_at = now
    await db.commit()
    await db.refresh(stats)

    return stats, gained


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