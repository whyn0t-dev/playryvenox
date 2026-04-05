-- AI Startup Clicker - PostgreSQL Schema for Supabase
-- Run this in Supabase SQL Editor if you want to create tables manually

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'player',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Player stats table
CREATE TABLE IF NOT EXISTS player_stats (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    current_users FLOAT DEFAULT 0,
    total_users_generated FLOAT DEFAULT 0,
    click_power INTEGER DEFAULT 1,
    passive_income FLOAT DEFAULT 0,
    level INTEGER DEFAULT 1,
    last_calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_player_stats_user_id ON player_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_player_stats_total_users ON player_stats(total_users_generated DESC);

-- Upgrades table (reference data)
CREATE TABLE IF NOT EXISTS upgrades (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL,
    effect INTEGER NOT NULL,
    base_cost FLOAT NOT NULL,
    description VARCHAR(255),
    sort_order INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_upgrades_type ON upgrades(type);

-- Player upgrades table (junction)
CREATE TABLE IF NOT EXISTS player_upgrades (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    upgrade_id VARCHAR(50) NOT NULL REFERENCES upgrades(id) ON DELETE CASCADE,
    level INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_player_upgrades_user_id ON player_upgrades(user_id);
CREATE INDEX IF NOT EXISTS idx_player_upgrades_upgrade_id ON player_upgrades(upgrade_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_player_upgrade_user_upgrade ON player_upgrades(user_id, upgrade_id);

-- Initial upgrades data
INSERT INTO upgrades (id, name, type, effect, base_cost, description, sort_order) VALUES
    ('landing_page', 'Landing Page', 'click', 1, 15, '+1 per click', 1),
    ('email_capture', 'Email Capture', 'click', 2, 100, '+2 per click', 2),
    ('growth_copywriting', 'Growth Copywriting', 'click', 5, 500, '+5 per click', 3),
    ('paid_ads', 'Paid Ads', 'click', 10, 2000, '+10 per click', 4),
    ('viral_referral', 'Viral Referral Loop', 'click', 25, 10000, '+25 per click', 5),
    ('intern', 'Intern', 'passive', 1, 25, '+1/sec', 6),
    ('automation_bot', 'Automation Bot', 'passive', 5, 200, '+5/sec', 7),
    ('ai_agent', 'AI Agent', 'passive', 20, 1000, '+20/sec', 8),
    ('cloud_infra', 'Cloud Infrastructure', 'passive', 75, 5000, '+75/sec', 9),
    ('global_expansion', 'Global Expansion', 'passive', 250, 25000, '+250/sec', 10)
ON CONFLICT (id) DO NOTHING;
