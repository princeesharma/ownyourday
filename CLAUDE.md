# OwnYourDay — Project Instructions

## What this app is
A habit and goal tracking app that helps users understand patterns in their behaviour. Users set daily goals and recurring habits, mark them complete or missed (with a mandatory reason if missed), and get AI-powered reports over time.

## Tech stack

### Frontend
- React + Vite
- Tailwind CSS v4
- React Router v6
- Supabase JS SDK — auth only (sign in, sign up, sign out, get JWT)

### Backend
- **Python FastAPI** — all business logic lives here, never in the frontend
- Deployed on **Render** (not Vercel — Vercel is frontend only)
- `supabase-py` — connects to PostgreSQL using the service role key
- `python-jose` — verifies Supabase JWT on every request
- `anthropic` — AI reports (future)

### Database
- Supabase PostgreSQL — but it's standard PostgreSQL, portable to any provider
- Supabase Auth — JWT-based, portable (swap to Auth0/Clerk by changing frontend calls + `auth.py`)

### Architecture
```
Browser (React)
    ├── Auth calls → Supabase Auth SDK directly
    └── Everything else → FastAPI backend (JWT in Authorization header)
                              │
                        Verifies JWT → gets user_id
                              │
                        Business logic (Python)
                              │
                        PostgreSQL via supabase-py (service role key)
```

### Deployment
- Frontend → Vercel
- Backend → **Render** (set `VITE_API_URL` in Vercel to point to the Render service URL)

### Why FastAPI over Supabase Edge Functions
- Not locked to Supabase runtime — swap DB provider by changing one env var
- Python is the right ecosystem for AI/ML features
- Hirable — any Python backend engineer knows FastAPI
- Testable with pytest + httpx
- Debuggable locally like a normal server

### Backend folder structure
```
backend/
├── main.py           # FastAPI app, CORS
├── auth.py           # JWT verification → user_id
├── database.py       # supabase-py client (service role)
├── models.py         # Pydantic request/response models
├── routers/
│   ├── days.py       # GET /days/target, GET /days/{date}, POST /days/{date}/skip
│   ├── goals.py      # GET /goals, POST /goals
│   ├── logs.py       # POST /logs, DELETE /logs/{goal_id}/{date}
│   └── calendar.py   # GET /calendar/{year}/{month}
└── requirements.txt
```

### Frontend API helper
All FastAPI calls go through `src/lib/api.js` — never call FastAPI directly from components.
```js
apiFetch('/days/target')           // GET
apiFetch('/goals', { method: 'POST', body: JSON.stringify({...}) })
```

### What stays in the frontend
- Supabase Auth SDK calls only (sign in, sign up, sign out, getSession)
- UI state and rendering

### What NEVER goes in the frontend
- Direct `supabase.from(...)` database queries
- Business logic (gate logic, goal resolution, day commitment rules)
- Any API keys (Anthropic, etc.)

## Design theme — MUST follow on every page
All pages must match the light, soft aesthetic of the landing page (`App.jsx`) and auth pages (`Login.jsx`, `Signup.jsx`). Do not use dark backgrounds on any page.

### Background
The body has a diagonal pastel gradient defined in `App.css`. Pages should use `bg-transparent` or `bg-white/60` — never a solid dark background like `bg-[#0a0a0a]`.

### Colour palette
| Use | Value |
|---|---|
| Primary text | `#2B1D25` |
| Muted text | `#7A687A` |
| Pink primary (buttons, accents) | `#F9A8C0` |
| Pink primary dark (hover, text on pink) | `#B8446A` |
| Pink border / subtle | `#F5CFDC` |
| Green primary | `#98D4B0` |
| Green primary dark | `#2E7A50` |
| Green border / subtle | `#BEE8D2` |
| Error background | `#FFF0F4` |

### Typography
- Headings: `[font-family:'Lora',serif]`
- Body: DM Sans or Geist (default)

### Cards and containers
- Glass morphism: `bg-white/70 backdrop-blur-[20px] border border-[#F5CFDC] rounded-3xl shadow-sm`
- Input fields: `bg-white/80 border border-[#F5CFDC] rounded-xl focus:border-[#F9A8C0] focus:ring-2 focus:ring-[#F9A8C0]/20`

### Buttons
- Primary (pink): `bg-[#F9A8C0] text-[#B8446A] font-semibold rounded-full hover:bg-[#F094AE] hover:-translate-y-px`
- Secondary (outline): `bg-white/60 backdrop-blur-[16px] border border-[#F5CFDC] text-[#7A687A] rounded-full hover:border-[#F9A8C0]`
- Green action: `bg-[#98D4B0] text-[#2E7A50] rounded-full hover:bg-[#82C89E]`

## Database schema (Supabase / PostgreSQL)

### `goals`
- `id` uuid PK
- `user_id` uuid → auth.users
- `title` text
- `type` text — `'habit'` or `'goal'`
- `date` date — null for habits, set for one-time goals
- `created_at` timestamptz
- `archived_at` timestamptz — null = active (habits only, never hard delete)

### `goal_logs`
- `id` uuid PK
- `goal_id` uuid → goals (on delete restrict)
- `user_id` uuid → auth.users
- `date` date
- `status` text — `'completed'` or `'not_completed'`
- `reason` text — mandatory when status = `'not_completed'` (enforced by CHECK constraint)
- `created_at` timestamptz
- UNIQUE `(goal_id, date)`

### `day_records`
- `id` uuid PK
- `user_id` uuid → auth.users
- `date` date
- `status` text — `'active'` or `'skipped'`
- `reason` text — optional
- `created_at` timestamptz
- UNIQUE `(user_id, date)`

RLS is enabled on all three tables — users can only access their own rows.

## Key product rules
- Habits appear every day (from created_at onwards unless archived)
- One-time goals are tied to a specific date
- Marking not_completed requires a reason — enforced at DB level via CHECK constraint
- Gate logic: user must resolve all past unresolved days before accessing today
- A day is resolved when all active goals have a goal_log entry OR a day_record with status='skipped'
- Habits are soft-deleted via `archived_at` — never hard deleted
- Max 5 daily goals per day (habits don't count toward this limit)

## Supabase patterns
- Use `.upsert({ ... }, { onConflict: 'col1,col2' })` for goal_logs and day_records
- Never use `.insert()` where a conflict is possible
- Always scope queries with `.eq('user_id', user.id)`
