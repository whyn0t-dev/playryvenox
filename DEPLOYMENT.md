# AI Startup Clicker - Deployment Guide

## Prerequisites

- Node.js 18+ (for frontend build)
- Python 3.10+ (for backend)
- Supabase account with PostgreSQL database

---

## 1. Database Setup (Supabase)

### Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the database to be provisioned

### Get Connection String
1. Go to **Project Settings** → **Database**
2. Click **Connect**
3. Select **Transaction Pooler** (important: NOT Direct Connection)
4. Copy the connection string (should be on port 6543)

Example format:
```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

### Tables (Auto-created on first run)
The backend automatically creates tables on startup:
- `users` - User accounts
- `player_stats` - Game progress
- `upgrades` - Upgrade definitions (seeded automatically)
- `player_upgrades` - Player's upgrade levels

---

## 2. Backend Deployment

### Environment Variables
Create `.env` file from `.env.example`:

```bash
cp .env.example .env
```

Required variables:
```env
DATABASE_URL="postgresql://postgres.xxx:password@aws-0-region.pooler.supabase.com:6543/postgres"
JWT_SECRET="your-64-character-secret-key-generate-with-secrets.token_hex(32)"
CORS_ORIGINS="https://yourdomain.com"
ENVIRONMENT="production"
```

Generate JWT secret:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

### Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### Run Server
Development:
```bash
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

Production (with gunicorn):
```bash
pip install gunicorn
gunicorn server:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8001
```

### Health Check
```bash
curl http://localhost:8001/api/health
# Should return: {"status":"healthy","environment":"production"}
```

---

## 3. Frontend Deployment

### Environment Variables
Create `.env` in frontend folder:

```env
REACT_APP_BACKEND_URL=https://api.yourdomain.com
```

### Build
```bash
cd frontend
yarn install
yarn build
```

### Deploy Static Files
The `build/` folder contains static files. Deploy to:
- **Vercel**: Connect GitHub repo, auto-deploys
- **Netlify**: Drag & drop build folder
- **AWS S3 + CloudFront**: Upload build folder
- **Any static hosting**: Serve the build folder

### Important: SPA Routing
Configure your hosting to redirect all routes to `index.html`:

Netlify `_redirects`:
```
/*    /index.html   200
```

Vercel `vercel.json`:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## 4. Production Checklist

### Security
- [ ] Generate strong JWT_SECRET (64+ chars)
- [ ] Set CORS_ORIGINS to your specific domain(s)
- [ ] Set ENVIRONMENT="production"
- [ ] Enable HTTPS on both frontend and backend
- [ ] Change Supabase database password

### Performance
- [ ] Enable gzip compression on backend
- [ ] Use CDN for frontend assets
- [ ] Consider Redis for session storage (future)

### Monitoring
- [ ] Set up error logging (Sentry, etc.)
- [ ] Monitor database connections
- [ ] Set up uptime monitoring

---

## 5. Architecture Overview

```
┌─────────────────┐     HTTPS      ┌─────────────────┐
│                 │ ◄────────────► │                 │
│  React Frontend │                │  FastAPI Backend │
│  (Static Files) │                │  (Python)       │
│                 │                │                 │
└─────────────────┘                └────────┬────────┘
                                           │
                                           │ PostgreSQL
                                           │ (Port 6543)
                                           ▼
                                   ┌─────────────────┐
                                   │                 │
                                   │    Supabase     │
                                   │   PostgreSQL    │
                                   │                 │
                                   └─────────────────┘
```

### API Endpoints

**Auth:**
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh token

**Game:**
- `GET /api/game/state` - Get game state
- `POST /api/game/click` - Click action
- `POST /api/game/buy-upgrade` - Buy upgrade

**Other:**
- `GET /api/leaderboard` - Paginated leaderboard
- `GET /api/leaderboard/top10` - Top 10 players
- `GET /api/profile` - User profile
- `GET /api/health` - Health check

---

## 6. Troubleshooting

### "could not translate host name" error
You're using Direct Connection URI instead of Transaction Pooler.
Use port 6543 URL from Supabase Connect → Transaction Pooler.

### "prepared statement does not exist" error
The `statement_cache_size=0` setting is missing in database.py.
This is required for Supabase's connection pooler.

### CORS errors
Check that CORS_ORIGINS in backend .env matches your frontend domain exactly.

### 401 Unauthorized after some time
Token expired. The frontend should auto-refresh tokens.
Check that cookies are being sent with `withCredentials: true`.

---

## 7. Local Development

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your Supabase credentials
uvicorn server:app --reload --port 8001
```

### Frontend
```bash
cd frontend
yarn install
# Create .env with REACT_APP_BACKEND_URL=http://localhost:8001
yarn start
```

---

## Support

For issues, check:
1. Backend logs for Python errors
2. Browser console for frontend errors
3. Supabase dashboard for database issues
