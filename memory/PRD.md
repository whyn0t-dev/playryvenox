# AI Startup Clicker - Product Requirements Document

## Original Problem Statement
Create "AI Startup Clicker" - an idle/clicker web game where players:
- Generate "Users" by clicking
- Buy upgrades to improve click power and passive income
- Compete on a global leaderboard based on total_users_generated
- All game logic server-side (anti-cheat)

## Architecture
- **Frontend**: React with Tailwind CSS, Shadcn UI components
- **Backend**: FastAPI (Python) with rate limiting
- **Database**: Supabase PostgreSQL
- **ORM**: SQLAlchemy with asyncpg (async)
- **Auth**: JWT tokens with HTTP-only cookies (secure in production)

## Database Schema (PostgreSQL/Supabase)

### Tables
1. **users** - User accounts (id, email, username, password_hash, role, created_at)
2. **player_stats** - Game progress (user_id, current_users, total_users_generated, click_power, passive_income, level)
3. **upgrades** - Upgrade definitions (id, name, type, effect, base_cost, description)
4. **player_upgrades** - Player's upgrade levels (user_id, upgrade_id, level)

## Implementation History

### Phase 1: MVP (January 2026)
- ✅ Core game loop (click, upgrades, passive income)
- ✅ User authentication (JWT)
- ✅ 10 upgrades (5 click, 5 passive)
- ✅ Global leaderboard
- ✅ Dark tech/startup theme

### Phase 2: Hardening & Polish (January 2026)
- ✅ Password validation (8+ chars, letter + number required)
- ✅ Username validation (3-30 chars, alphanumeric + underscore)
- ✅ Rate limiting on auth endpoints (5/min register, 10/min login)
- ✅ Rate limiting on game endpoints (60/min state, 300/min click)
- ✅ Secure cookies in production (httponly, secure, samesite)
- ✅ Token refresh endpoint
- ✅ Improved error messages (user-friendly)
- ✅ Password strength indicator on registration
- ✅ Better animations (click feedback, counter bump, fade-in)
- ✅ Offline earnings cap (24 hours max)
- ✅ Health check endpoint
- ✅ Production/development environment switch
- ✅ Deployment documentation
- ✅ `.env.example` file

## Security Features
- bcrypt password hashing (12 rounds)
- JWT tokens (60 min access, 7 day refresh)
- HTTP-only cookies
- CORS configuration
- Rate limiting (slowapi)
- Input validation (Pydantic)
- Server-side game logic (anti-cheat)
- No sensitive data in responses

## API Endpoints

### Auth
- `POST /api/auth/register` - Create account (5/min)
- `POST /api/auth/login` - Login (10/min)
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh access token

### Game
- `GET /api/game/state` - Get game state (60/min)
- `POST /api/game/click` - Click action (300/min)
- `POST /api/game/buy-upgrade` - Buy upgrade (60/min)

### Other
- `GET /api/leaderboard` - Paginated leaderboard (30/min)
- `GET /api/leaderboard/top10` - Top 10 players
- `GET /api/profile` - User profile
- `GET /api/health` - Health check

## Upgrades

### Click Power
| ID | Name | Effect | Base Cost |
|----|------|--------|-----------|
| landing_page | Landing Page | +1/click | 15 |
| email_capture | Email Capture | +2/click | 100 |
| growth_copywriting | Growth Copywriting | +5/click | 500 |
| paid_ads | Paid Ads | +10/click | 2,000 |
| viral_referral | Viral Referral Loop | +25/click | 10,000 |

### Passive Income
| ID | Name | Effect | Base Cost |
|----|------|--------|-----------|
| intern | Intern | +1/sec | 25 |
| automation_bot | Automation Bot | +5/sec | 200 |
| ai_agent | AI Agent | +20/sec | 1,000 |
| cloud_infra | Cloud Infrastructure | +75/sec | 5,000 |
| global_expansion | Global Expansion | +250/sec | 25,000 |

### Cost Formula
`cost = base_cost × 1.15^level`

## Files Structure

```
/app
├── backend/
│   ├── server.py          # Main FastAPI application
│   ├── database.py        # SQLAlchemy async config
│   ├── models.py          # Database models
│   ├── requirements.txt   # Python dependencies
│   ├── schema.sql         # Reference SQL schema
│   ├── .env               # Environment variables
│   └── .env.example       # Environment template
├── frontend/
│   ├── src/
│   │   ├── App.js         # Main React component
│   │   ├── App.css        # Component styles
│   │   ├── index.css      # Global styles (Tailwind)
│   │   ├── contexts/
│   │   │   └── AuthContext.js
│   │   ├── pages/
│   │   │   ├── HomePage.js
│   │   │   ├── LoginPage.js
│   │   │   ├── RegisterPage.js
│   │   │   ├── GamePage.js
│   │   │   ├── LeaderboardPage.js
│   │   │   └── ProfilePage.js
│   │   └── components/
│   │       ├── Navbar.js
│   │       ├── ProtectedRoute.js
│   │       └── ui/ (shadcn components)
│   └── .env
├── DEPLOYMENT.md          # Deployment guide
├── PHASE3_ROADMAP.md      # Future features roadmap
└── memory/
    ├── PRD.md             # This file
    └── test_credentials.md
```

## Phase 3 Roadmap (Planned)

### Prestige System
- Reset progress for permanent multipliers
- Unlocks at 1M total users
- Formula: `prestige_points = sqrt(total_users / 1,000,000)`

### Achievements
- Click milestones (1, 100, 10K, 1M clicks)
- User milestones (100, 10K, 1M, 10B users)
- Upgrade milestones
- Prestige milestones

### Daily Bonus
- Login streak rewards
- Day 1: 100 users → Day 7: 10,000 users
- Streak resets on missed day

## Test Credentials
- Email: pguser@test.com
- Password: testpass123
- Username: PostgresPlayer
