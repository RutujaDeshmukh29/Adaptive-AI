# 03 — Setup, Keys & Environment

Everything external the project depends on, and exactly how to get it.

---

## 1. What we need from the outside world

| # | Thing | Source | Cost | Needed by |
|---|---|---|---|---|
| 1 | Gemini API key | <https://aistudio.google.com/apikey> | Free tier | H8 (but get it tonight) |
| 2 | Gemini backup key | Second Google account | Free tier | Tonight |
| 3 | PostgreSQL database | <https://supabase.com> | Free tier | H0 |
| 4 | GitHub repo | <https://github.com> | Free | H0 |
| 5 | Embedding model | HuggingFace (auto-download) | Free, local | Tonight (cache it) |
| 6 | ChromaDB | pip package, local files | Free | H5 |
| 7 | Sample PDFs | Your own notes | Free | Tonight |

**No paid services. No credit card. Nothing else.**

---

## 2. Gemini API key

### Getting it

1. <https://aistudio.google.com/apikey>
2. Sign in → **Create API key** → choose or create a project
3. Copy the key immediately (it is shown once in full)
4. Store it in: your phone notes, a laptop text file, and the team group chat

### Choosing the model

Model names change often. Do not trust any hardcoded name from a tutorial, including this one.

**On the day, run this and pick a Flash model from the actual list:**

```python
from google import genai
client = genai.Client(api_key="YOUR_KEY")
for m in client.models.list():
    print(m.name)
```

Current guidance (verify at <https://ai.google.dev/gemini-api/docs/models>):

- The **free tier covers Flash and Flash-Lite models only**. Pro models require billing enabled.
- Stable Flash options at time of writing include `gemini-3.6-flash`, `gemini-3.5-flash` and `gemini-3.5-flash-lite`, with newer Flash releases appearing regularly.
- **Use a specific stable model string, not a `-latest` alias.** Latest aliases can hot-swap to a preview or experimental model with tighter rate limits — exactly what you don't want during a live demo.

Set two in `.env`:

```env
GEMINI_MODEL=gemini-3.6-flash
GEMINI_FALLBACK_MODEL=gemini-3.5-flash-lite
```

`llm_service.py` tries the primary, and on a rate-limit or 5xx error retries once on the fallback. This costs ten lines of code and saves the demo.

### Rate limits

Free tiers are metered per minute and per day. Practical implications:

- **Do not call Gemini on page load.** Only on explicit user action.
- **Cache diagnostic questions** — regenerate only if the student restarts.
- **Never call Gemini inside a loop.** Generate 5 questions in one request, not five requests.
- Keep the **backup key** in `.env.backup`. If you hit the daily cap at 4am, swapping one line beats panic.
- The fallback question bank (Manthan's deliverable) is the final safety net.

---

## 3. Supabase (PostgreSQL)

### Creating the project

1. <https://supabase.com> → **Sign in with GitHub**
2. **New Project**
   - Name: `adapted-ai`
   - Database password: **generate a strong one and save it** — it cannot be recovered, only reset
   - Region: closest to you (Mumbai / Singapore for India)
3. Wait ~2 minutes for provisioning

### Getting the connection string

**Project Settings → Database → Connection string → URI**

```
postgresql://postgres:[YOUR-PASSWORD]@db.abcdefghijk.supabase.co:5432/postgres
```

Replace `[YOUR-PASSWORD]` with the actual password (URL-encode any special characters: `@` → `%40`, `#` → `%23`).

### If port 5432 is blocked

College and venue networks frequently block it. Use the **Session pooler** string from the same page instead — it runs on port `6543` and generally passes through.

### Verify it before you need it

```python
from sqlalchemy import create_engine, text
e = create_engine("YOUR_DATABASE_URL")
with e.connect() as c:
    print(c.execute(text("select version()")).scalar())
```

### SQLite fallback (decide the rule now)

**Rule: if Postgres is not connected by H1:00, switch to SQLite and move on.**

```env
DATABASE_URL=sqlite:///./adapted.db
```

Changes required:

- `JSONB` columns → `JSON` in models
- In `database.py`: `create_engine(url, connect_args={"check_same_thread": False})` for SQLite

Total cost: ten minutes. Everything else works identically. Nobody will ask you which database you used, and if they do, "SQLite locally, Postgres-ready via SQLAlchemy" is a perfectly good answer.

### Viewing data during the event

Supabase has a **Table Editor** in the dashboard. Rajshree can inspect `topic_mastery` rows in a browser — on her own phone or laptop — without touching the dev machine. Use this constantly for QA.

---

## 4. Full `.env` files

### `backend/.env`

```env
# ============ DATABASE ============
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.xxxx.supabase.co:5432/postgres

# ============ AUTH ============
JWT_SECRET=replace-with-a-long-random-string-at-least-32-chars
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# ============ GEMINI ============
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-3.6-flash
GEMINI_FALLBACK_MODEL=gemini-3.5-flash-lite
GEMINI_TIMEOUT_SECONDS=45
GEMINI_MAX_RETRIES=2

# ============ RAG ============
EMBEDDING_MODEL=all-MiniLM-L6-v2
CHROMA_DIR=../data/chroma
UPLOAD_DIR=../data/uploads
CHUNK_SIZE=800
CHUNK_OVERLAP=150
TOP_K=4
MAX_UPLOAD_MB=20
MAX_PAGES=80

# ============ ADAPTIVE ENGINE ============
MASTERY_ALPHA_FIRST=0.50
MASTERY_ALPHA_REPEAT=0.30
PREREQ_UNLOCK_THRESHOLD=60
PREREQ_RELOCK_THRESHOLD=50
QUIZ_QUESTION_COUNT=5
DIAGNOSTIC_QUESTION_COUNT=10

# ============ APP ============
APP_NAME=AdaptEd AI
CORS_ORIGINS=http://localhost:3000
DEBUG=true
```

Generate a JWT secret:

```bash
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

### `frontend/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=AdaptEd AI
```

> Any variable the browser needs **must** start with `NEXT_PUBLIC_`. Anything secret must not — and nothing secret belongs in the frontend at all. The Gemini key lives only on the backend.

### `.gitignore` (repo root — write this at H0:00)

```gitignore
# Python
__pycache__/
*.py[cod]
venv/
.venv/
*.egg-info/

# Env — the most important lines in this file
.env
.env.*
!.env.example
.env.local
!.env.local.example

# Data
data/
*.db
*.sqlite3
chroma/
uploads/

# Node
node_modules/
.next/
out/
npm-debug.log*

# Editor / OS
.vscode/
.idea/
.DS_Store
Thumbs.db
```

> If a key is ever committed by accident: **revoke it immediately in AI Studio and generate a new one.** Deleting the file in a later commit does not remove it from git history.

---

## 5. Commands cheat sheet

### First-time setup

```bash
# --- Backend ---
cd backend
python -m venv venv
venv\Scripts\activate              # Windows
source venv/bin/activate           # macOS / Linux
pip install -r requirements.txt
cp .env.example .env               # then fill it in

# --- Frontend ---
cd ../frontend
npx create-next-app@latest . --ts --tailwind --eslint --app --src-dir --import-alias "@/*"
npm install recharts lucide-react clsx tailwind-merge class-variance-authority
npx shadcn@latest init
npx shadcn@latest add button card input label select progress tabs dialog badge avatar skeleton toast textarea separator
cp .env.local.example .env.local
```

### Every session

```bash
# Terminal 1 — backend
cd backend && source venv/bin/activate && uvicorn app.main:app --reload --port 8000

# Terminal 2 — frontend
cd frontend && npm run dev
```

| URL | What |
|---|---|
| <http://localhost:3000> | The app |
| <http://localhost:8000/docs> | FastAPI interactive docs — **your best testing tool** |
| <http://localhost:8000/health> | Liveness check |

### Seeding

```bash
cd backend
python -m app.seed.topics_python     # topic graph
python -m app.seed.seed_demo         # Student A + Student B
```

### Nuking the database (schema changed and you don't care about data)

```python
# backend/reset_db.py
from app.database import Base, engine
import app.models            # ensures every model is registered
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)
print("database reset")
```

```bash
python reset_db.py && python -m app.seed.topics_python
```

---

## 6. Fast fixes for predictable problems

| Symptom | Cause | Fix |
|---|---|---|
| `ModuleNotFoundError: app` | Running from the wrong directory | `cd backend`, run `uvicorn app.main:app` |
| CORS error in browser console | Origin not allowed | Add `http://localhost:3000` to `CORS_ORIGINS`; restart uvicorn |
| `psycopg2.OperationalError` | Network blocks 5432 | Use the Supabase session pooler (6543), or switch to SQLite |
| `401 Unauthorized` everywhere | Token not attached | Check `lib/api.ts` sends `Authorization: Bearer ${token}` |
| Gemini `429` | Rate limit | Fallback model → backup key → fallback question bank |
| `json.JSONDecodeError` on LLM output | Model wrapped JSON in code fences | `safe_json()` — strip ` ```json ` and ` ``` `, then parse |
| PDF extracts empty text | Scanned/image PDF | Use a different, text-based PDF. No OCR time tonight. |
| First embedding call takes 30s | Model loading from cache | Load the SentenceTransformer **once at app startup**, not per request |
| ChromaDB "collection not found" | Querying before any upload | Use `get_or_create_collection()` everywhere |
| Next.js hydration error | `localStorage` read during SSR | Read tokens inside `useEffect`, never at module top level |
| Tailwind classes do nothing | Content paths wrong | Check `content` globs in `tailwind.config.ts` |
| `bcrypt` install fails on Windows | Build tools missing | `pip install bcrypt --only-binary :all:` |

---

## 7. Performance notes that matter at 3am

```python
# ✅ Load the embedding model ONCE, at import/startup
_model = None
def get_model():
    global _model
    if _model is None:
        _model = SentenceTransformer(settings.EMBEDDING_MODEL)
    return _model
```

- **Embed in batches**, not one chunk at a time: `model.encode(list_of_chunks)`
- **Cap ingestion** at `MAX_PAGES` — a 300-page textbook will eat five minutes you don't have
- **One Gemini call per user action.** Never per question, never per chunk.
- **Index the hot columns:** `topic_mastery(user_id, topic_id)`, `quiz_attempts(user_id, created_at)`
- If upload feels slow in the demo, ingest the demo material **during seeding**, before judging — the live upload we show can be a small 5-page file

---

## 8. Two-minute health check

Run this any time something feels wrong:

```bash
curl http://localhost:8000/health
```

- [ ] Backend responds
- [ ] `/docs` loads and lists every route
- [ ] Frontend loads at :3000
- [ ] Login works
- [ ] Supabase Table Editor shows rows in `users` and `topic_mastery`
- [ ] A Gemini call succeeds from the terminal
- [ ] `git status` is clean or intentionally dirty

If all eight pass, the problem is in the feature you just wrote — not in the environment. That knowledge alone saves an hour.
