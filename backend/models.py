import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, ForeignKey, Index, Text
from sqlalchemy.orm import relationship
from database import Base

def generate_uuid():
    return str(uuid.uuid4())

def utc_now():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = 'users'
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default='player')
    created_at = Column(DateTime(timezone=True), default=utc_now)
    
    # Relationships
    player_stats = relationship('PlayerStats', back_populates='user', uselist=False, cascade='all, delete-orphan')
    player_upgrades = relationship('PlayerUpgrade', back_populates='user', cascade='all, delete-orphan')


class PlayerStats(Base):
    __tablename__ = 'player_stats'
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE'), unique=True, nullable=False, index=True)
    current_users = Column(Float, default=0)
    total_users_generated = Column(Float, default=0, index=True)  # Indexed for leaderboard sorting
    click_power = Column(Integer, default=1)
    passive_income = Column(Float, default=0)
    level = Column(Integer, default=1)
    last_calculated_at = Column(DateTime(timezone=True), default=utc_now)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    
    # Relationships
    user = relationship('User', back_populates='player_stats')


class Upgrade(Base):
    __tablename__ = 'upgrades'
    
    id = Column(String(50), primary_key=True)  # e.g., 'landing_page', 'intern'
    name = Column(String(100), nullable=False)
    type = Column(String(20), nullable=False, index=True)  # 'click' or 'passive'
    effect = Column(Integer, nullable=False)  # +X per click or +X per second
    base_cost = Column(Float, nullable=False)
    description = Column(String(255))
    sort_order = Column(Integer, default=0)
    
    # Relationships
    player_upgrades = relationship('PlayerUpgrade', back_populates='upgrade')


class PlayerUpgrade(Base):
    __tablename__ = 'player_upgrades'
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    upgrade_id = Column(String(50), ForeignKey('upgrades.id', ondelete='CASCADE'), nullable=False, index=True)
    level = Column(Integer, default=0)
    
    # Relationships
    user = relationship('User', back_populates='player_upgrades')
    upgrade = relationship('Upgrade', back_populates='player_upgrades')
    
    # Composite unique constraint
    __table_args__ = (
        Index('idx_player_upgrade_user_upgrade', 'user_id', 'upgrade_id', unique=True),
    )
