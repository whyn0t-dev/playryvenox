import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from database import Base

def utc_now():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = 'users'
    
    id = Column(UUID(as_uuid=True), primary_key=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    role = Column(String(50), default='player')
    created_at = Column(DateTime(timezone=True), default=utc_now)

    player_stats = relationship('PlayerStats', back_populates='user', uselist=False, cascade='all, delete-orphan')
    player_upgrades = relationship('PlayerUpgrade', back_populates='user', cascade='all, delete-orphan')


class PlayerStats(Base):
    __tablename__ = 'player_stats'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), unique=True, nullable=False, index=True)
    current_users = Column(Float, default=0)
    total_users_generated = Column(Float, default=0, index=True)
    click_power = Column(Integer, default=1)
    passive_income = Column(Float, default=0)
    level = Column(Integer, default=1)
    last_calculated_at = Column(DateTime(timezone=True), default=utc_now)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    last_daily_claim = Column(DateTime(timezone=True), nullable=True)
    daily_streak = Column(Integer, default=0)
    total_daily_claims = Column(Integer, default=0)

    user = relationship('User', back_populates='player_stats')


class Upgrade(Base):
    __tablename__ = 'upgrades'
    
    id = Column(String(50), primary_key=True)
    name = Column(String(100), nullable=False)
    type = Column(String(20), nullable=False, index=True)
    effect = Column(Integer, nullable=False)
    base_cost = Column(Float, nullable=False)
    description = Column(String(255))
    sort_order = Column(Integer, default=0)

    player_upgrades = relationship('PlayerUpgrade', back_populates='upgrade')


class PlayerUpgrade(Base):
    __tablename__ = 'player_upgrades'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    upgrade_id = Column(String(50), ForeignKey('upgrades.id', ondelete='CASCADE'), nullable=False, index=True)
    level = Column(Integer, default=0)

    user = relationship('User', back_populates='player_upgrades')
    upgrade = relationship('Upgrade', back_populates='player_upgrades')

    __table_args__ = (
        Index('idx_player_upgrade_user_upgrade', 'user_id', 'upgrade_id', unique=True),
    )