# AI Startup Clicker - Phase 3 Roadmap

## Overview
Phase 3 focuses on long-term engagement features: Prestige system, Achievements, and Daily Bonuses.

---

## 1. Prestige System

### Concept
Players can "prestige" (reset progress) to earn permanent multipliers.

### Mechanics
- **Prestige Points**: Earned based on total_users_generated at reset
- **Formula**: `prestige_points = floor(sqrt(total_users_generated / 1,000,000))`
- **Multiplier**: `1 + (prestige_points * 0.1)` (10% bonus per point)
- **Reset**: current_users, upgrades reset; prestige_points are permanent

### Database Changes
```sql
ALTER TABLE player_stats ADD COLUMN prestige_points INTEGER DEFAULT 0;
ALTER TABLE player_stats ADD COLUMN prestige_multiplier FLOAT DEFAULT 1.0;
ALTER TABLE player_stats ADD COLUMN total_prestiges INTEGER DEFAULT 0;
```

### API Endpoint
```
POST /api/game/prestige
- Requires minimum 1M total_users_generated
- Returns new prestige_points and multiplier
```

### UI Changes
- Prestige button (unlocks at 1M users)
- Prestige counter display
- Confirmation modal with projected gains

---

## 2. Achievements System

### Categories
1. **Click Milestones**
   - First Click (1 click)
   - Clicker (100 clicks)
   - Click Master (10,000 clicks)
   - Click Legend (1,000,000 clicks)

2. **User Milestones**
   - Startup Founded (100 users)
   - Growing Business (10,000 users)
   - Unicorn (1,000,000 users)
   - Decacorn (10,000,000,000 users)

3. **Upgrade Milestones**
   - First Upgrade (buy 1)
   - Diversified (buy all types)
   - Maxed Out (any upgrade level 100)

4. **Prestige Milestones**
   - Fresh Start (1 prestige)
   - Veteran (10 prestiges)
   - Immortal (100 prestiges)

### Database Schema
```sql
CREATE TABLE achievements (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    category VARCHAR(50),
    icon VARCHAR(50),
    requirement_type VARCHAR(50),
    requirement_value BIGINT,
    reward_type VARCHAR(50),
    reward_value FLOAT
);

CREATE TABLE player_achievements (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) REFERENCES users(id),
    achievement_id VARCHAR(50) REFERENCES achievements(id),
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);
```

### API Endpoints
```
GET /api/achievements - List all achievements with unlock status
POST /api/achievements/claim/{id} - Claim reward (if any)
```

### Rewards
- Bonus users
- Permanent click power boost
- Cosmetic badges

---

## 3. Daily Bonus System

### Mechanics
- **Daily Login Streak**: Consecutive days played
- **Bonus Scaling**: Day 1 = 100 users, Day 7 = 10,000 users
- **Streak Break**: Missing a day resets to Day 1
- **Max Streak**: 30 days (then cycles with better rewards)

### Bonus Table
| Day | Reward |
|-----|--------|
| 1 | 100 users |
| 2 | 250 users |
| 3 | 500 users |
| 4 | 1,000 users |
| 5 | 2,500 users |
| 6 | 5,000 users |
| 7 | 10,000 users + 1 hour offline earnings |

### Database Changes
```sql
ALTER TABLE player_stats ADD COLUMN last_daily_claim DATE;
ALTER TABLE player_stats ADD COLUMN daily_streak INTEGER DEFAULT 0;
ALTER TABLE player_stats ADD COLUMN total_daily_claims INTEGER DEFAULT 0;
```

### API Endpoints
```
GET /api/daily - Get daily bonus status
POST /api/daily/claim - Claim daily bonus
```

### UI
- Daily bonus popup on login
- Streak calendar display
- Animated reward collection

---

## 4. Implementation Priority

### Week 1: Daily Bonus
1. Add database columns
2. Implement claim logic
3. Create popup UI
4. Add streak display to profile

### Week 2: Achievements
1. Create achievement tables
2. Seed initial achievements
3. Implement unlock detection
4. Create achievements page UI

### Week 3: Prestige
1. Add prestige columns
2. Implement prestige logic
3. Create prestige UI/modal
4. Update game calculations for multiplier

### Week 4: Polish
1. Animations for unlocks
2. Toast notifications
3. Sound effects (optional)
4. Testing & bug fixes

---

## 5. Future Considerations

### Monetization (if desired)
- Premium cosmetics
- Ad-skip for offline earnings
- Starter packs

### Social Features
- Friends list
- Guilds/Clans
- Global chat

### Events
- Double XP weekends
- Limited-time achievements
- Seasonal themes

---

## Technical Notes

### Offline Earnings Cap
Current: 24 hours max
Consider: Achievements that increase cap

### Anti-Cheat Considerations
- All calculations server-side ✓
- Validate prestige requirements
- Rate limit achievement claims
- Log suspicious activity

### Performance
- Cache leaderboard (Redis)
- Batch achievement checks
- Lazy load achievement icons
