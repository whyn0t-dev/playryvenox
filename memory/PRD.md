# AI Startup Clicker - Product Requirements Document

## Original Problem Statement
Create "AI Startup Clicker" - an idle/clicker web game where players:
- Generate "Users" by clicking
- Buy upgrades to improve click power and passive income
- Compete on a global leaderboard based on total_users_generated
- All game logic server-side (anti-cheat)

## Architecture (UPDATED)
- **Frontend**: React with Tailwind CSS, Shadcn UI components
- **Backend**: FastAPI (Python)
- **Database**: **Supabase PostgreSQL** (migrated from MongoDB)
- **ORM**: SQLAlchemy with asyncpg (async)
- **Auth**: JWT tokens with HTTP-only cookies

## Database Schema (PostgreSQL/Supabase)

### Tables
1. **users** - User accounts (id, email, username, password_hash, role, created_at)
2. **player_stats** - Game progress (user_id, current_users, total_users_generated, click_power, passive_income, level)
3. **upgrades** - Upgrade definitions (id, name, type, effect, base_cost, description)
4. **player_upgrades** - Player's upgrade levels (user_id, upgrade_id, level)

### Indexes
- users.email (unique)
- users.username (unique)
- player_stats.user_id (unique)
- player_stats.total_users_generated (DESC - for leaderboard)
- player_upgrades (user_id, upgrade_id) composite unique

## What's Been Implemented (January 2026)

### Backend (FastAPI + PostgreSQL)
- `/api/auth/register` - User registration
- `/api/auth/login` - User login with JWT
- `/api/auth/logout` - Clear session
- `/api/auth/me` - Get current user
- `/api/game/state` - Get full game state with upgrades
- `/api/game/click` - Process click action
- `/api/game/buy-upgrade` - Purchase upgrade
- `/api/leaderboard` - Paginated leaderboard
- `/api/leaderboard/top10` - Top 10 players
- `/api/profile` - User profile with stats

### Frontend (React)
- Home page with hero and top 10 leaderboard
- Login/Register pages
- Game page with clicker, stats, and upgrades
- Leaderboard page with pagination
- Profile page with user stats
- Responsive navbar with mobile menu

### Game Mechanics
- Click power starts at 1, increases with click upgrades
- Passive income calculated based on time elapsed
- Upgrade costs: base_cost × 1.15^level
- Level = 1 + (total_upgrades / 5)

### Upgrades Implemented
**Click Power:**
- Landing Page (+1, cost: 15)
- Email Capture (+2, cost: 100)
- Growth Copywriting (+5, cost: 500)
- Paid Ads (+10, cost: 2000)
- Viral Referral Loop (+25, cost: 10000)

**Passive Income:**
- Intern (+1/sec, cost: 25)
- Automation Bot (+5/sec, cost: 200)
- AI Agent (+20/sec, cost: 1000)
- Cloud Infrastructure (+75/sec, cost: 5000)
- Global Expansion (+250/sec, cost: 25000)

## Migration Log
- **2026-01-XX**: Migrated from MongoDB to Supabase PostgreSQL
- SQLAlchemy ORM with async support (asyncpg)
- Transaction Pooler connection (port 6543)
- Tables created via SQLAlchemy Base.metadata.create_all()

## Next Tasks
1. Add prestige system for long-term engagement
2. Implement achievements to reward milestones
3. Add sound effects for clicks and purchases
4. Consider adding daily rewards for retention
