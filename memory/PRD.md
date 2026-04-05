# AI Startup Clicker - Product Requirements Document

## Original Problem Statement
Create "AI Startup Clicker" - an idle/clicker web game where players:
- Generate "Users" by clicking
- Buy upgrades to improve click power and passive income
- Compete on a global leaderboard based on total_users_generated
- All game logic server-side (anti-cheat)

## User Personas
1. **Casual Gamer**: Plays during breaks, enjoys simple progression mechanics
2. **Competitive Player**: Aims to climb the leaderboard, optimizes upgrade purchases
3. **Idle Game Enthusiast**: Values passive income, checks progress periodically

## Core Requirements (Static)
- [x] User authentication (JWT)
- [x] Click to gain users
- [x] 10 upgrades (5 click power, 5 passive income)
- [x] Server-side game logic (anti-cheat)
- [x] Global leaderboard
- [x] User profile with stats
- [x] Responsive dark tech theme

## Architecture
- **Frontend**: React with Tailwind CSS, Shadcn UI components
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **Auth**: JWT tokens with HTTP-only cookies

## What's Been Implemented (January 2026)

### Backend (FastAPI)
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

## Prioritized Backlog

### P0 (Critical) - DONE
- [x] Core game loop (click, upgrades, passive income)
- [x] User authentication
- [x] Leaderboard

### P1 (High Priority) - Future
- [ ] Prestige system (reset with permanent bonuses)
- [ ] Achievements/badges
- [ ] Sound effects

### P2 (Medium Priority) - Future
- [ ] Daily login rewards
- [ ] Milestones and rewards
- [ ] Social sharing

### P3 (Low Priority) - Future
- [ ] Themes/customization
- [ ] Friends list
- [ ] Chat/guilds

## Next Tasks
1. Add prestige system for long-term engagement
2. Implement achievements to reward milestones
3. Add sound effects for clicks and purchases
4. Consider adding daily rewards for retention
