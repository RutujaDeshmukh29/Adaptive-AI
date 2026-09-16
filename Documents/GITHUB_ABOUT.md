# GitHub Repo Metadata

Copy-paste material for the repository page. Not part of the project — just the packaging.

---

## 1. "About" description (the field at the top-right of the repo page)

**Use this one** (167 characters, fits the limit):

```
AI-powered adaptive learning platform that builds a live model of each student and continuously changes their learning path, practice difficulty and AI tutoring.
```

**Shorter alternative:**

```
Adaptive AI learning platform. Learner modelling + RAG + adaptive assessment — the study plan changes as the student changes.
```

**Punchiest:**

```
Not a fixed study plan — a learning journey that adapts to you. Adaptive learning powered by learner modelling, RAG and Gemini.
```

---

## 2. Repository topics (tags)

```
adaptive-learning  edtech  personalized-learning  learner-model  rag
fastapi  nextjs  typescript  python  gemini-api  chromadb
sentence-transformers  postgresql  ai-tutor  hackathon  smart-education
```

---

## 3. Website field

```
http://localhost:3000
```

Replace with the deployed URL if you get one up (Vercel for the frontend, Render/Railway for the backend). Do not spend hackathon hours on deployment — a working local demo beats a broken deployed one.

---

## 4. Social preview line (for LinkedIn / portfolio)

> **AdaptEd AI** — Built in 24 hours at TECHFUSION. An adaptive learning platform that maintains a live mastery model per student and regenerates their explanations, quiz difficulty and learning path from it. Stack: Next.js · FastAPI · Gemini · ChromaDB · PostgreSQL.

---

## 5. Condensed public README

If you ever want a shorter front page than the full `README.md`, use this and move the detailed version to `docs/FULL_README.md`. **During the hackathon, keep the full one** — judges who open the repo should see depth.

````markdown
# AdaptEd AI

> Not a fixed study plan — a learning journey that adapts to you.

**Learn → Measure → Adapt → Improve**

An AI-powered adaptive learning platform that maintains a live model of what each
student knows and continuously regenerates their learning experience from it.

Built in 24 hours at **TECHFUSION** (Smart Education · PS1) by **Team SkillMatix** —
MET Bhujbal Knowledge City, Institute of Engineering.

---

## The problem

Most learning platforms give every student the same material, the same difficulty
and the same sequence. Most "AI tutors" are chatbots with no memory of who is asking.
Most "personalized planners" generate a plan once and never change it.

## What we built

AdaptEd AI keeps a **dynamic learner model** — topic-wise mastery, strengths,
weaknesses, goal, pace and recent performance — and uses it to drive everything:

| | |
|---|---|
| 🎯 **AI diagnostic** | Maps what the student already knows, topic by topic |
| 📊 **Live mastery model** | Difficulty-weighted EMA, updated after every quiz |
| 💬 **Adaptive tutor** | Same question → different answer per learner |
| 📚 **RAG over your notes** | Answers grounded in the student's own uploaded PDFs |
| 🧩 **Adaptive quizzes** | Topic and difficulty chosen by the engine, not the student |
| 🗺️ **Living learning path** | Prerequisite gating — failing a topic re-locks the next one |
| 💡 **Explainable recommendations** | Every suggestion cites the numbers behind it |

## The difference

```
Chatbot:          Question → AI → Answer
Static planner:   Goal → Plan → (forever)

AdaptEd AI:       Profile + Goal + Mastery + Material + Performance + Question
                       ↓
                  Adaptive AI
                       ↓
                  Personalized Answer + Next Best Learning Action
                       ↓
                  New Performance → Updated Learner Model → Adapt Again
```

Two students ask *"Explain Python functions."* A beginner preparing for an exam gets
an analogy and an easy check question. An intermediate learner preparing for
interviews gets edge cases and an interview problem. Then they take a quiz, their
mastery moves, and their learning path rearranges itself.

## Stack

**Frontend** Next.js 14 · React · TypeScript · Tailwind · shadcn/ui · Recharts
**Backend** FastAPI · Python · SQLAlchemy · Pydantic · JWT
**AI** Google Gemini API · custom adaptive engine (pure Python)
**RAG** PyMuPDF · Sentence Transformers · ChromaDB
**Data** PostgreSQL (Supabase)

## Quick start

```bash
# backend
cd backend
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env                              # add GEMINI_API_KEY + DATABASE_URL
uvicorn app.main:app --reload --port 8000

# frontend
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

App → http://localhost:3000 · API docs → http://localhost:8000/docs

## Documentation

| Doc | What's in it |
|---|---|
| [`docs/04_API_CONTRACT.md`](docs/04_API_CONTRACT.md) | Every endpoint, request and response |
| [`docs/05_ADAPTIVE_ENGINE_SPEC.md`](docs/05_ADAPTIVE_ENGINE_SPEC.md) | Mastery maths, Next Best Action, path logic |
| [`docs/03_SETUP_AND_ENV.md`](docs/03_SETUP_AND_ENV.md) | Keys, database, environment variables |

## Team

Rutuja Deshmukh · Rajshree Patil · Manthan Hingmire · Prathamesh Gadakh

---

**Same subject ≠ Same learner ≠ Same learning path**
````

---

## 6. Portfolio blurb (for your own site, after the event)

> **AdaptEd AI** — adaptive learning platform built in a 24-hour hackathon.
> Maintains a per-student mastery model updated with a difficulty-weighted
> exponential moving average, and drives AI tutoring, quiz difficulty and
> learning-path sequencing from it. Prerequisite gating means poor performance
> re-locks downstream topics; every recommendation is explained with the
> underlying data. FastAPI + Next.js + Gemini + ChromaDB.

---

## 7. Before you make the repo public

- [ ] `.env` is in `.gitignore` and has never been committed
- [ ] No API keys anywhere in the git **history** (`git log -p | grep -i "AIza"`)
- [ ] `data/` is gitignored — no uploaded PDFs, no ChromaDB files
- [ ] `README.md` renders correctly on GitHub (check tables and code fences)
- [ ] Add a LICENSE if the event requires one (MIT is the safe default)
- [ ] Add 3–4 screenshots to a `screenshots/` folder and embed them in the README
- [ ] Add the deck as `docs/presentation.pdf`

> If a key was ever committed: **revoke it in AI Studio and generate a new one.**
> Removing it in a later commit does not remove it from history.
