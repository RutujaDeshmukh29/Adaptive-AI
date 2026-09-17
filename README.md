# AdaptEd AI

> **Not a fixed study plan — a learning journey that adapts to you.**

**Learn → Measure → Adapt → Improve**

An AI-powered adaptive learning platform that continuously personalizes a student's learning journey based on their knowledge, performance, pace and goals.

| | |
|---|---|
| **Event** | TECHFUSION — 24-hour Hackathon |
| **College** | MET Bhujbal Knowledge City, Institute of Engineering |
| **Theme** | Smart Education |
| **Problem Statement** | PS1 — Personalized AI Learning Assistant |
| **Team** | SkillMatix |
| **Members** | Rutuja Deshmukh · Rajshree Patil · Manthan Hingmire · Prathamesh Gadakh |

---

## Table of Contents

1. [The Problem](#1-the-problem)
2. [Our Solution](#2-our-solution)
3. [What Makes It Different](#3-what-makes-it-different)
4. [Core Concepts](#4-core-concepts)
5. [Feature List](#5-feature-list)
6. [System Architecture](#6-system-architecture)
7. [Execution Flow (End to End)](#7-execution-flow-end-to-end)
8. [Directory Structure](#8-directory-structure)
9. [Technology Stack](#9-technology-stack)
10. [Database Schema](#10-database-schema)
11. [API Surface](#11-api-surface)
12. [The Adaptive Engine](#12-the-adaptive-engine)
13. [RAG Pipeline](#13-rag-pipeline)
14. [Gemini Prompt Design](#14-gemini-prompt-design)
15. [Frontend Pages](#15-frontend-pages)
16. [Local Setup](#16-local-setup)
17. [Environment Variables](#17-environment-variables)
18. [Error Handling](#18-error-handling)
19. [Responsible AI](#19-responsible-ai)
20. [Demo Story](#20-demo-story)
21. [Impact & Benefits](#21-impact--benefits)
22. [Future Scope](#22-future-scope)
23. [Team & Roles](#23-team--roles)
24. [Documentation Index](#24-documentation-index)

---

## 1. The Problem

Traditional education gives every student the same material, the same difficulty, the same sequence and the same practice — even though students differ in prior knowledge, learning speed, strengths, weaknesses, goals, available study time and performance over time.

Most existing "AI study tools" do not fix this. They are:

- **Generic chatbots** — question in, answer out, with no memory of who the learner is.
- **One-shot planners** — generate a study plan once, then never change it.

Neither of them watches the student and reacts.

| The Problem | Our Solution |
|---|---|
| Different knowledge levels | Personalized learning paths |
| Unknown learning gaps | AI diagnostic + topic mastery analysis |
| Static study plans | Continuously adapting learning path |
| Same difficulty for everyone | Performance-based adaptive practice |
| Generic learning support | Personalized adaptive learning assistant |

---

## 2. Our Solution

**AdaptEd AI** maintains a **dynamic learner model** for every student and uses it to drive every single thing the platform does — what the AI says, what questions it asks, what topic comes next, and how hard the practice is.

The product loop:

```
ASSESS  →  PROFILE  →  PERSONALIZE  →  LEARN  →  MEASURE  →  ADAPT  →  (repeat)
```

The technical loop:

```
Student Data + Learning Material + Performance
              ↓
        Learner Model
              ↓
      Adaptive AI Engine
              ↓
    Personalized Learning
              ↓
       New Performance
              ↓
   Updated Learner Model  ──→ (loop)
```

---

## 3. What Makes It Different

**A normal AI chatbot:**

```
Question → AI → Answer
```

**A normal study planner:**

```
Goal → Generate Plan → Follow Plan (forever)
```

**AdaptEd AI:**

```
Student Profile + Learning Goal + Topic Mastery
+ Uploaded Material + Recent Performance + Question
              ↓
         Adaptive AI
              ↓
  Personalized Answer + Next Best Learning Action
              ↓
        New Performance
              ↓
     Updated Learner Model
              ↓
           Adapt Again
```

The system is continuously asking one question:

> **"Based on what I know about this student right now, what should happen next?"**

---

## 4. Core Concepts

### 4.1 Dynamic Learner Model

A live profile of the student, rebuilt from the database on every request:

```text
Student Level:     Beginner
Goal:              Semester Exam
Study Time:        2 hours/day

Topic Mastery:
  Variables     85%
  Conditions    72%
  Loops         45%
  Functions     30%
  Lists         65%

Strengths:   Variables, Basic Syntax
Weaknesses:  Functions, Loops
Current Topic: Loops
Recent Trend:  declining (last 2 quizzes: 60% → 45%)

Current Recommendation:
  Practice loops before moving to functions.
```

This object is injected into **every** Gemini call, **every** quiz generation, and **every** path computation. It is the single source of personalization.

### 4.2 Topic Mastery

Every topic carries a mastery score (0–100) plus a confidence value. Mastery updates after the diagnostic, after every quiz, and after every graded practice attempt — using an exponential moving average so recent performance matters more than old performance.

### 4.3 Next Best Learning Action (NBLA)

After every interaction the engine decides exactly one thing the student should do next, and **explains why using real data**:

```text
Current Mastery:  Loops = 45%
Recent Quiz:      3/5 correct
Detected Issue:   Nested loops
Next Best Action: Practice nested loops — 3 beginner-level examples
Reason:           "Loops is at 45% and your last quiz dropped from 60%.
                   Two of the three wrong answers involved nested loops."
```

### 4.4 Explainable Recommendations

We never say *"Study Functions."* We say:

> *"Functions is recommended because your recent quiz performance is 42% and two prerequisite questions were answered incorrectly."*

Every recommendation object carries a `reason` string built from actual database values — never from a generic LLM sentence.

---

## 5. Feature List

AdaptEd AI provides an end-to-end, production-grade ecosystem spanning intelligent student learning, automated cognitive adaptation, interactive coding, architecture synthesis, and real-time parent observation.

---

### 5.1 🔐 Role-Based Authentication & Complete Access Isolation
* **Student Authentication**: Secure JWT-based signup and login with hashed passwords, persistent auth tokens, and strict student data privacy.
* **Dual-Tab Login Interface (`/login`)**:
  - **Student Login**: Email & password authentication with access to all 9 learning modules.
  - **Parent Login**: Passwordless dual-factor login using **Student Name / Username** + **Unique Parent Sync Key** (e.g., `PAR-0001` or `STUDENT-0001`).
* **Strict Parent Access Isolation**:
  - **Dedicated Parent Sidebar**: Parents only see the 5 Parent Portal sections (Overview, Mastery, Study Habits, AI Insights, Settings). All student learning panels (*Practice, Coding Challenges, Diagram Studio, AI Assistant, Knowledge Base, Learning Path, Dashboard, Profile*) are completely hidden.
  - **Streamlined Parent Header**: Replaces student search bars and countdown alarms with an active `Parent Observer Portal` badge and direct logout button.
  - **Automatic Layout Route Guard**: Intercepts any direct URL navigation to student paths and redirects parents back to `/parent-dashboard`.
* **Profile Customization**: Customizable academic grade/level, target subjects, learning goals, weekly study hour targets, cognitive caliber, and avatar photo integration.

---

### 5.2 🧠 Mathematical Adaptive Learning Engine
* **Exponential Moving Average (EMA) Mastery Tracking**: Formulates mastery dynamically ($\alpha = 0.50$ for first attempts, $\alpha = 0.30$ for repeats) to weight recent trajectory over historical attempts.
* **Cognitive Caliber Calibration**: Dynamic learner caliber classification (e.g., `Level 3.2 Dynamic`) adjusting question depths across Bayesian difficulty bands.
* **Next Best Learning Action (NBLA)**: Live decision algorithm calculating exactly one highest-impact next step with real database-backed reasoning.
* **Dynamic Prerequisite Logic**: Automated unlocking of downstream topics upon reaching mastery thresholds ($\ge 60\%$) and protective re-locking below $50\%$.

---

### 5.3 📚 Local Knowledge Base & Multimodal RAG Pipeline
* **Multi-PDF Document Ingestion**: Upload course syllabuses, lecture slides, and notes with automated PyMuPDF extraction, semantic chunking, and local ChromaDB vector embeddings (`all-MiniLM-L6-v2`).
* **Document Analytics**: Real-time extraction of file size, page count, chunk volume, and ingestion timestamps.
* **Smart Document Summarizer & Cheat Sheets**:
  - **Comprehensive Chapter Breakdown**: Structured deep-dive into major sections.
  - **Quick-Revision Cheat Sheets & Short Notes**: Key definitions, core takeaways, and formulas.
  - **ELI5 Metaphor Guide**: Conceptual analogies for difficult concepts.
* **Grounded Citations**: AI responses cite exact source documents, chapters, and page numbers to eliminate hallucinations.

---

### 5.4 💬 Adaptive AI Chat Assistant (with 6 Pedagogical Personas)
* **6 Interactive Pedagogical Personas**:
  1. **Adaptive Tutor**: Tailors pacing and vocabulary to the learner's live profile.
  2. **Socratic Guide**: Probes with conceptual questions and hints without giving away solutions.
  3. **ELI5 Explainer**: Simplifies complex theoretical concepts using everyday analogies.
  4. **Exam & Viva Prep**: High-yield definitions, scoring points, and tricky examiner viva questions.
  5. **Code-First Mentor**: Delivers runnable code snippets and architectural patterns first.
  6. **Technical Interview Coach**: Evaluates algorithmic trade-offs, Big-O complexity, and system scaling.
* **Direct Response Box & Fast Navigation**: Automatically scrolls responses directly into view with up/down navigation arrows for message history.
* **Voice Assistant (STT & TTS)**: Native hands-free speech-to-text input and natural text-to-speech voice narration.
* **Conversation Session Persistence**: Multi-thread history sidebar with timestamped sessions, message counters, rename, and delete options.
* **Rich Markdown & LaTeX**: Syntax-highlighted code blocks with 1-click clipboard copy and KaTeX mathematical notation.

---

### 5.5 📝 Adaptive Practice & Instant-Feedback Quiz Engine
* **Context-Grounded Quizzes**: Dynamically generates 5-question multiple-choice quizzes tailored directly to student documents and detected weaknesses.
* **Instant Visual Feedback**: Instant green/red highlighting with step-by-step conceptual answer explanations.
* **Dynamic Question Depth**: Automatically escalates difficulty from foundational recall to multi-step application as student mastery increases.

---

### 5.6 💻 Interactive Coding Challenges & Weak-Topic Lab
* **Weak-Concept Challenge Generator**: Automatically scans quiz errors and formulates targeted Python programming problems.
* **In-Browser Code Studio**: Full code editor with starter boilerplate, test cases, and simulated execution.
* **Progressive Hint Engine**: Tiered hints that guide students through algorithmic hurdles without spoiling the answer.
* **Real-Time AI Code Reviewer**: In-depth static analysis checking for edge cases, algorithmic efficiency, and Big-O time/space complexity.

---

### 5.7 📐 Vector Diagram Studio (Architecture & Mindmap Visualizer)
* **Multi-Archetype Synthesis**: Generates Flowcharts, Mindmaps, Sequence Diagrams, Class Diagrams, State Machines, and System Architecture graphs from natural language prompts or starter presets.
* **Infinite Pan & Zoom Canvas**: Smooth drag panning and mouse-wheel zoom (30% to 300%) with reset controls and grid/solid backgrounds.
* **Dual-View Code Editor**: Switch between interactive canvas and raw Mermaid.js syntax editor with live re-rendering.
* **High-Resolution Multi-Format Export**:
  - Clean Vector **SVG** export.
  - 192 DPI (2x Retina) **PNG** export powered by server-side PyMuPDF rasterization (100% immune to browser tainted canvas errors).
  - High-quality **JPG** export with solid contrast backgrounds.
  - 1-click Mermaid source code clipboard copy.

---

### 5.8 🗺️ Dynamic Learning Path & Curriculum Roadmap
* **Visual Graph Roadmap**: Interactive sequential node graph categorizing concepts as *Locked*, *In Progress*, or *Mastered*.
* **Prerequisite Dependencies**: Strict node locking requiring upstream competencies before unlocking advanced topics.
* **Milestone Analytics**: Estimated completion times and module mastery percentages.

---

### 5.9 👨‍👩‍👧‍👦 Parent Observer Portal & Real-Time Family Telemetry
* **Unique Student Sync Key Generator**: Student generates, copies, or regenerates unique parent sync credentials (`PAR-XXXX`) directly from their portal.
* **Live Study Activity**: Radar beacon showing what the student is studying right now, their last interaction prompt, and real-time focus metrics.
* **Enrolled Course Mastery**: Visual progress bars and projected completion milestones across active academic tracks.
* **Chronological Study Timeline**: Timestamped vertical log of daily quizzes, challenges, document uploads, and study duration.
* **Performance Metrics**: 3-card analytics strip covering Curriculum Pace, Practice Accuracy (with 5-point sparkline), and AI Tutor Assistance counts.
* **Adaptive Intelligence Insights**: Displays active remediation drills for weak topics and challenge escalation for demonstrated mastery.
* **7-Day Study Consistency Bar Chart**: Day-by-day study hour breakdown with peak-day markers and optimal focus window recommendations.
* **Official Academic Transcript Modal**: Full topic mastery index with historical assessment grades.
* **Quick Encouragement Beamer**: Allows parents to beam an instant motivational toast to the student's active screen with one click.
* **Parental Controls & Advisory**: Toggle for weekly Sunday SMS/WhatsApp summaries and a 1-on-1 Academic Advisor appointment scheduler.

---

### 5.10 📊 Student Analytics Dashboard
* Comprehensive dials for Overall Mastery and Competency.
* Active study streak tracker with fire indicator and weekly hour counters.
* Next Best Learning Action hero card with direct 1-click launcher.
* Quick-launch cards for all platform tools.

---

### 5.11 ☁️ Cloud Deployment & Production Architecture
* **Dual-Database Support**: Seamless local development on SQLite (`sqlite:///./adapted.db`) and zero-code migration to production PostgreSQL / Supabase with auto-table initialization (`Base.metadata.create_all`).
* **URL Normalization**: Automatic handling of `postgres://` to `postgresql://` connection strings for modern SQLAlchemy engines.
* **Smart CORS Handling**: Built-in support for local frontend, custom domains, and dynamic Vercel preview/production deployments (`*.vercel.app`).
* **Deploy Configurations**: Out-of-the-box `Procfile`, `railway.json`, and `render.yaml` for 1-click backend deployments, and Next.js Vercel presets for frontend.

---

## 6. System Architecture

```text
                              STUDENT
                                 │
                                 ▼
                 ┌───────────────────────────────┐
                 │      Next.js 14 Frontend      │
                 │  React · TypeScript · Tailwind│
                 │  shadcn/ui · Recharts · Lucide│
                 └───────────────┬───────────────┘
                                 │  REST (JSON + JWT)
                                 ▼
                 ┌───────────────────────────────┐
                 │       FastAPI Backend         │
                 │  Routers → Services → Models  │
                 └───────────────┬───────────────┘
                                 │
        ┌────────────────┬───────┴────────┬──────────────────┐
        ▼                ▼                ▼                  ▼
┌───────────────┐ ┌─────────────┐ ┌───────────────┐ ┌────────────────┐
│ Learner Model │ │ RAG Pipeline│ │ Adaptive      │ │ Quiz Engine    │
│ Service       │ │ Service     │ │ Engine        │ │                │
└───────┬───────┘ └──────┬──────┘ └───────┬───────┘ └────────┬───────┘
        │                │                │                  │
        ▼                ▼                ▼                  ▼
┌───────────────┐ ┌─────────────┐ ┌───────────────────────────────────┐
│  PostgreSQL   │ │  ChromaDB   │ │        Google Gemini API          │
│  (Supabase)   │ │ (local dir) │ │  explanations · questions · feedback│
└───────┬───────┘ └─────────────┘ └───────────────────────────────────┘
        │
        ▼
 Performance Data → Mastery Update → Next Best Action → ADAPT ──┐
        ▲                                                       │
        └───────────────────────────────────────────────────────┘
```

### Architecture principle

Strictly separate **UI** ← → **API** ← → **AI services** ← → **RAG** ← → **learner modelling** ← → **database**.

A router never talks to Gemini or ChromaDB directly. Routers call services. Services own the intelligence. This means any single layer can be swapped or upgraded without rewriting the app — and during the hackathon it means two people can work on different layers without merge pain.

---

## 7. Execution Flow (End to End)

### Flow A — New student onboarding

```
Signup → JWT issued
   ↓
Onboarding form (level, subject, goal, study time, experience)
   ↓
POST /api/profile/onboarding  →  learner_profiles row created
   ↓
Topic graph for chosen subject seeded into topic_mastery at 0%
   ↓
Redirect → /diagnostic
```

### Flow B — Diagnostic assessment

```
POST /api/diagnostic/start
   ↓
Gemini generates N questions across the subject's topic graph
(1–2 questions per topic, mixed difficulty, JSON output)
   ↓
Student answers
   ↓
POST /api/diagnostic/submit
   ↓
Score per topic → mastery_service.initialize_mastery()
   ↓
topic_mastery table populated
   ↓
path_service.build_path() → learning_path_items created
   ↓
adaptive_engine.next_best_action() → first recommendation
   ↓
Redirect → /dashboard
```

### Flow C — Material upload (RAG ingestion)

```
POST /api/materials/upload (multipart PDF)
   ↓
Saved to data/uploads/{user_id}/{uuid}.pdf
   ↓
PyMuPDF text extraction, page by page
   ↓
Clean → chunk (≈800 chars, 150 overlap)
   ↓
SentenceTransformer("all-MiniLM-L6-v2") → 384-dim embeddings
   ↓
Upsert into ChromaDB collection "user_{user_id}"
   (metadata: material_id, filename, page, chunk_index)
   ↓
materials.status = "ready", chunk_count saved
```

### Flow D — Adaptive chat (the headline feature)

```
POST /api/chat  { message }
   ↓
learner_model.build_snapshot(user_id)
   → level, goal, mastery map, strengths, weaknesses,
     current topic, recent quiz trend, recent mistakes
   ↓
rag_service.search(user_id, message, k=4)
   → relevant chunks from the student's OWN uploaded material
   ↓
prompts.ADAPTIVE_TUTOR_PROMPT.format(snapshot, context, question)
   ↓
Gemini → answer tuned to this learner's level and goal
   ↓
adaptive_engine.next_best_action(user_id)
   ↓
Response: { answer, sources[], next_action, learner_context_used }
   ↓
chat_messages row + learning_activity row written
```

### Flow E — Adaptive quiz (the adaptation proof)

```
POST /api/quiz/generate
   ↓
quiz_engine.select_topic(user_id)
   → weakest unlocked topic, or topic chosen by NBLA
   ↓
quiz_engine.select_difficulty(mastery, recent_trend)
   → easy / medium / hard
   ↓
rag_service.search(topic_name) → ground questions in the student's material
   ↓
Gemini generates 5 MCQs (strict JSON) at that difficulty
   ↓
quiz_attempts + quiz_questions rows created
   ↓
Student answers → POST /api/quiz/submit
   ↓
Score computed per topic
   ↓
mastery_service.update_mastery()  ← EMA update, difficulty-weighted
   ↓
path_service.recompute()          ← unlock / relock nodes
   ↓
adaptive_engine.next_best_action() ← new recommendation + reason
   ↓
Response: {
    score, correct_answers[], explanations[],
    mastery_before, mastery_after, mastery_delta,
    path_changed: true/false,
    next_action: { type, topic, reason }
}
```

**That response object is the entire pitch.** It is the screen we show judges.

### Flow F — Continuous adaptation (what the loop looks like from the outside)

```
Student Performance
        ↓
Analyze Performance (per topic, per difficulty)
        ↓
Detect Strengths / Weaknesses
        ↓
Update Topic Mastery (EMA)
        ↓
Update Learner Model
        ↓
Determine Next Best Learning Action
        ↓
Adapt Learning Path / Quiz Difficulty / AI Response Style
        ↓
Student Learns
        ↓
New Performance Data
        ↓
      (repeat)
```

---

## 8. Directory Structure

```text
adapted-ai/
│
├── README.md
├── .gitignore
├── docs/
│   ├── 00_PRE_HACKATHON_CHECKLIST.md
│   ├── 01_HACKATHON_24H_PLAN.md
│   ├── 02_TEAM_ROLES_AND_TASKS.md
│   ├── 03_SETUP_AND_ENV.md
│   ├── 04_API_CONTRACT.md
│   ├── 05_ADAPTIVE_ENGINE_SPEC.md
│   └── 06_DEMO_SCRIPT.md
│
├── backend/
│   ├── .env                          # never committed
│   ├── .env.example
│   ├── requirements.txt
│   ├── run.sh
│   └── app/
│       ├── __init__.py
│       ├── main.py                   # FastAPI app, CORS, router mounting, /health
│       ├── config.py                 # pydantic-settings, reads .env
│       ├── database.py               # engine, SessionLocal, Base, get_db()
│       ├── deps.py                   # get_current_user(), shared dependencies
│       │
│       ├── core/
│       │   ├── __init__.py
│       │   ├── security.py           # bcrypt hash/verify, JWT encode/decode
│       │   ├── constants.py          # mastery bands, difficulty weights, alphas
│       │   └── prompts.py            # ALL Gemini prompt templates (single file)
│       │
│       ├── models/                   # SQLAlchemy ORM — one file per entity
│       │   ├── __init__.py           # imports all so Base.metadata sees them
│       │   ├── user.py
│       │   ├── learner_profile.py
│       │   ├── topic.py
│       │   ├── topic_mastery.py
│       │   ├── material.py
│       │   ├── quiz.py               # QuizAttempt + QuizQuestion
│       │   ├── activity.py           # LearningActivity
│       │   ├── chat.py               # ChatMessage
│       │   └── path.py               # LearningPathItem
│       │
│       ├── schemas/                  # Pydantic request/response models
│       │   ├── __init__.py
│       │   ├── auth.py
│       │   ├── profile.py
│       │   ├── material.py
│       │   ├── diagnostic.py
│       │   ├── chat.py
│       │   ├── quiz.py
│       │   ├── path.py
│       │   └── analytics.py
│       │
│       ├── routes/                   # thin — validate, call service, return
│       │   ├── __init__.py
│       │   ├── auth.py
│       │   ├── profile.py
│       │   ├── materials.py
│       │   ├── diagnostic.py
│       │   ├── chat.py
│       │   ├── quiz.py
│       │   ├── path.py
│       │   └── analytics.py
│       │
│       ├── services/                 # all intelligence lives here
│       │   ├── __init__.py
│       │   ├── llm_service.py        # Gemini wrapper: retry, JSON mode, fallback
│       │   ├── rag_service.py        # extract, chunk, embed, upsert, search
│       │   ├── learner_model.py      # build_snapshot() — THE central object
│       │   ├── mastery_service.py    # EMA mastery updates
│       │   ├── adaptive_engine.py    # next_best_action() + reasons
│       │   ├── quiz_engine.py        # topic + difficulty selection, generation
│       │   ├── diagnostic_service.py # diagnostic generation + scoring
│       │   └── path_service.py       # build/recompute learning path
│       │
│       ├── utils/
│       │   ├── __init__.py
│       │   ├── text.py               # clean_text(), chunk_text()
│       │   ├── json_parse.py         # safe_json() — strips ```json fences
│       │   └── errors.py             # AppError + handlers
│       │
│       └── seed/
│           ├── __init__.py
│           ├── topics_python.py      # topic graph with prerequisites
│           └── seed_demo.py          # Demo Student A + Student B
│
├── data/                             # gitignored
│   ├── uploads/                      # raw PDFs, per user
│   └── chroma/                       # ChromaDB persistent store
│
└── frontend/
    ├── .env.local                    # never committed
    ├── .env.local.example
    ├── package.json
    ├── next.config.mjs
    ├── tailwind.config.ts
    ├── tsconfig.json
    ├── components.json               # shadcn config
    ├── public/
    │   └── logo.svg
    └── src/
        ├── app/
        │   ├── layout.tsx            # root layout, fonts, Toaster
        │   ├── globals.css
        │   ├── page.tsx              # LANDING PAGE
        │   │
        │   ├── (auth)/
        │   │   ├── login/page.tsx
        │   │   └── signup/page.tsx
        │   │
        │   └── (app)/
        │       ├── layout.tsx        # sidebar shell + auth guard
        │       ├── onboarding/page.tsx
        │       ├── dashboard/page.tsx
        │       ├── diagnostic/page.tsx
        │       ├── materials/page.tsx
        │       ├── assistant/page.tsx
        │       ├── path/page.tsx
        │       ├── practice/page.tsx
        │       ├── analytics/page.tsx
        │       └── profile/page.tsx
        │
        ├── components/
        │   ├── ui/                   # shadcn primitives (button, card, input…)
        │   ├── layout/
        │   │   ├── Sidebar.tsx
        │   │   └── Topbar.tsx
        │   ├── dashboard/
        │   │   ├── NextActionCard.tsx      # the star component
        │   │   ├── MasteryOverview.tsx
        │   │   ├── StatTile.tsx
        │   │   └── ProgressChart.tsx       # Recharts
        │   ├── chat/
        │   │   ├── ChatWindow.tsx
        │   │   ├── MessageBubble.tsx
        │   │   ├── SourceChips.tsx         # shows RAG sources
        │   │   └── LearnerContextBadge.tsx # "Tuned for: Beginner · Loops 45%"
        │   ├── quiz/
        │   │   ├── QuizRunner.tsx
        │   │   ├── QuestionCard.tsx
        │   │   ├── ResultSummary.tsx
        │   │   └── MasteryDelta.tsx        # 45% → 58% animation
        │   ├── path/
        │   │   ├── PathTimeline.tsx
        │   │   └── PathNode.tsx            # done / current / locked
        │   └── common/
        │       ├── MasteryBar.tsx
        │       ├── Loader.tsx
        │       ├── EmptyState.tsx
        │       └── ErrorState.tsx
        │
        ├── lib/
        │   ├── api.ts                # fetch wrapper, base URL, JWT header
        │   ├── auth.ts               # token get/set/clear, route guard
        │   ├── types.ts              # TS mirror of the API contract
        │   └── utils.ts              # cn(), formatters, mastery→colour
        │
        └── hooks/
            ├── useLearnerProfile.ts
            ├── useMastery.ts
            └── useNextAction.ts
```

### Why this structure

- **One file per entity/route/service** — four people, one laptop, but zero ambiguity about where code goes.
- **`core/prompts.py` is a single file** — the prompt engineer edits one file and never touches logic.
- **`lib/types.ts` mirrors the API contract** — frontend and backend agree before either is written.
- **`seed/` is separate** — demo data never contaminates application logic.
- **Services never import routes** — dependency flows one way only, so nothing circular ever appears at 3am.

---

## 9. Technology Stack

### Frontend

| Tech | Why |
|---|---|
| Next.js 14 (App Router) | File routing, layouts, fast setup |
| React 18 + TypeScript | Type safety against the API contract |
| Tailwind CSS | Speed — no context switching to CSS files |
| shadcn/ui | Production-quality components, copy-in (no lock-in) |
| Recharts | Mastery trend + performance charts |
| Lucide React | Consistent icon set |

### Backend

| Tech | Why |
|---|---|
| Python 3.11+ | Ecosystem for RAG/ML |
| FastAPI | Async, auto docs at `/docs`, Pydantic built in |
| Uvicorn | ASGI server |
| Pydantic v2 | Request/response validation |
| SQLAlchemy 2.0 | ORM |
| psycopg2-binary | PostgreSQL driver |
| python-jose + passlib[bcrypt] | JWT + password hashing |

### AI / RAG

| Tech | Why |
|---|---|
| Google Gemini API | Free tier, fast, strong JSON mode |
| PyMuPDF (`fitz`) | Fastest reliable PDF text extraction |
| sentence-transformers | `all-MiniLM-L6-v2`, 384-dim, runs locally, no API cost |
| ChromaDB | Zero-config persistent vector store |
| Custom Adaptive Engine | **Ours.** Pure Python. Not an LLM. This is the innovation. |

### Data

| Tech | Why |
|---|---|
| PostgreSQL via Supabase | Free hosted, no local install, whole team can inspect |
| Local filesystem | Uploaded PDFs |
| ChromaDB persistent dir | Vectors |

### Dev tooling

Git · GitHub · VS Code · Thunder Client / Postman · FastAPI `/docs` · Browser DevTools

### Non-technical assets

Presentation deck (TECHFUSION format) · demo script · sample Python PDF for RAG · two seeded demo learners · README · judge Q&A sheet

---

## 10. Database Schema

```sql
-- users
id              SERIAL PK
name            VARCHAR(120)
email           VARCHAR(160) UNIQUE
password_hash   VARCHAR(255)
created_at      TIMESTAMP

-- learner_profiles              (1:1 with users)
id              SERIAL PK
user_id         FK users.id UNIQUE
academic_level  VARCHAR(80)      -- "Diploma 2nd Year"
subject         VARCHAR(80)      -- "Python"
goal            VARCHAR(120)     -- "Semester Exam" | "Interview" | "Project"
experience_level VARCHAR(40)     -- beginner | intermediate | advanced
study_time_minutes INT           -- per day
preferences     JSONB            -- learning mode, notes
diagnostic_done BOOLEAN DEFAULT false
current_topic_id FK topics.id NULL
updated_at      TIMESTAMP

-- topics                        (seeded per subject)
id              SERIAL PK
subject         VARCHAR(80)
name            VARCHAR(120)     -- "Loops"
slug            VARCHAR(120)
order_index     INT
prerequisite_id FK topics.id NULL

-- topic_mastery                 (the heart of the learner model)
id              SERIAL PK
user_id         FK users.id
topic_id        FK topics.id
mastery_score   FLOAT DEFAULT 0      -- 0..100
attempts        INT DEFAULT 0
correct_answers INT DEFAULT 0
total_questions INT DEFAULT 0
last_difficulty VARCHAR(10) NULL
last_updated    TIMESTAMP
UNIQUE(user_id, topic_id)

-- materials
id              SERIAL PK
user_id         FK users.id
filename        VARCHAR(255)
stored_path     VARCHAR(400)
subject         VARCHAR(80)
status          VARCHAR(20)      -- processing | ready | failed
chunk_count     INT DEFAULT 0
error_message   TEXT NULL
uploaded_at     TIMESTAMP

-- quiz_attempts
id              SERIAL PK
user_id         FK users.id
topic_id        FK topics.id
difficulty      VARCHAR(10)      -- easy | medium | hard
score           FLOAT            -- 0..100
total_questions INT
correct_count   INT
source          VARCHAR(20)      -- diagnostic | practice | adaptive
mastery_before  FLOAT
mastery_after   FLOAT
created_at      TIMESTAMP

-- quiz_questions
id              SERIAL PK
attempt_id      FK quiz_attempts.id
topic_id        FK topics.id
question        TEXT
options         JSONB            -- ["A text","B text","C text","D text"]
correct_index   INT
selected_index  INT NULL
is_correct      BOOLEAN NULL
explanation     TEXT
concept_tag     VARCHAR(120)     -- "nested loops"  ← powers the reason string
difficulty      VARCHAR(10)

-- learning_path_items
id              SERIAL PK
user_id         FK users.id
topic_id        FK topics.id
order_index     INT
status          VARCHAR(20)      -- locked | current | in_progress | done
reason          TEXT             -- why it sits here
updated_at      TIMESTAMP

-- chat_messages
id              SERIAL PK
user_id         FK users.id
role            VARCHAR(10)      -- user | assistant
content         TEXT
sources         JSONB NULL       -- [{filename, page}]
topic_id        FK topics.id NULL
created_at      TIMESTAMP

-- learning_activity             (drives streak + analytics + trend)
id              SERIAL PK
user_id         FK users.id
activity_type   VARCHAR(30)      -- chat | quiz | upload | diagnostic | path_update
topic_id        FK topics.id NULL
result          JSONB NULL       -- {score: 60, delta: +8}
created_at      TIMESTAMP
```

> **Hackathon shortcut:** use `Base.metadata.create_all(bind=engine)` on startup. Skip Alembic. If the schema changes, drop and recreate — there is no production data.

---

## 11. API Surface

Base URL: `http://localhost:8000`  ·  All `/api/*` routes except auth require `Authorization: Bearer <token>`.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | Liveness |
| POST | `/api/auth/signup` | Create account → token |
| POST | `/api/auth/login` | Authenticate → token |
| GET | `/api/auth/me` | Current user + onboarding status |
| POST | `/api/profile/onboarding` | Create learner profile, seed topics |
| GET | `/api/profile` | Full learner snapshot |
| PATCH | `/api/profile` | Update goal / study time / level |
| POST | `/api/materials/upload` | Upload + ingest PDF |
| GET | `/api/materials` | List materials + status |
| DELETE | `/api/materials/{id}` | Delete material + its vectors |
| POST | `/api/diagnostic/start` | Generate diagnostic questions |
| POST | `/api/diagnostic/submit` | Score → init mastery → build path |
| GET | `/api/mastery` | Topic-wise mastery array |
| POST | `/api/chat` | Adaptive tutor response |
| GET | `/api/chat/history` | Previous messages |
| POST | `/api/quiz/generate` | Adaptive quiz (topic + difficulty chosen by engine) |
| POST | `/api/quiz/submit` | Grade → update mastery → recompute path |
| GET | `/api/quiz/history` | Past attempts |
| GET | `/api/path` | Learning path with statuses + reasons |
| POST | `/api/path/recompute` | Force recompute |
| GET | `/api/recommendation/next` | Next Best Learning Action |
| GET | `/api/analytics/overview` | Dashboard tiles |
| GET | `/api/analytics/timeline` | Mastery over time (chart data) |

Full request/response bodies: **`docs/04_API_CONTRACT.md`** — freeze this before writing any code.

---

## 12. The Adaptive Engine

This is the part that is genuinely ours. It is deterministic Python, not a prompt.

### 12.1 Mastery update (exponential moving average)

```python
DIFFICULTY_WEIGHT = {"easy": 0.80, "medium": 1.00, "hard": 1.25}

raw      = correct / total                       # 0..1
signal   = min(raw * DIFFICULTY_WEIGHT[diff], 1.0) * 100
alpha    = 0.50 if attempts == 0 else 0.30       # first result counts more
new      = round(previous + alpha * (signal - previous), 1)
new      = max(0.0, min(100.0, new))
```

Getting 4/5 on **hard** questions moves mastery further than 4/5 on **easy** ones. That is the adaptivity, expressed in one line.

### 12.2 Mastery bands

| Band | Meaning | Action |
|---|---|---|
| 0–39 | Struggling | Revise concept, easy practice, more explanation |
| 40–69 | Developing | Guided practice, medium difficulty |
| 70–84 | Competent | Harder practice, edge cases |
| 85–100 | Mastered | Unlock next topic / advanced challenge |

### 12.3 Prerequisite gate

A topic only unlocks when its prerequisite reaches **≥ 60**. If a prerequisite drops below 50 after a bad quiz, the dependent topic **re-locks** and the path visibly changes. This is the most convincing thing judges will see.

### 12.4 Next Best Learning Action

```text
INPUT  learner snapshot (mastery map, recent attempts,
       concept tags of wrong answers, goal, pace, path state)

1. Any topic that dropped >10 points in the last attempt?
      → REVISE that topic.  reason: score fell from X to Y.
2. Any unlocked topic with mastery < 40?
      → EASY PRACTICE on the weakest.  reason: mastery X%, N wrong on <concept_tag>.
3. Current topic mastery 40–69?
      → MEDIUM QUIZ.  reason: developing, needs consolidation.
4. Current topic mastery 70–84?
      → HARD QUIZ.  reason: strong, ready for harder questions.
5. Current topic mastery ≥ 85 and prerequisites satisfied?
      → ADVANCE to next topic.  reason: mastered at X%.
6. No material uploaded yet?
      → UPLOAD MATERIAL.  reason: answers will be grounded in your own notes.
7. Fallback → MOCK TEST across mastered topics.

OUTPUT { action_type, topic, difficulty, reason, evidence:{...} }
```

`evidence` carries the raw numbers, so the UI can show the recommendation *and* prove it.

Full spec with worked examples: **`docs/05_ADAPTIVE_ENGINE_SPEC.md`**

---

## 13. RAG Pipeline

```text
Upload PDF
    ↓  PyMuPDF (fitz) — page-by-page text extraction
Extract Text
    ↓  collapse whitespace, strip headers/footers/page numbers
Clean Text
    ↓  ~800 chars, 150 overlap, split on paragraph then sentence
Chunk Text
    ↓  SentenceTransformer("all-MiniLM-L6-v2") → 384-dim
Generate Embeddings
    ↓  collection "user_{user_id}", metadata {material_id, filename, page}
Store in ChromaDB
    ─────────────────────────────────────────
Student asks a question
    ↓  same embedding model
Similarity Search (k = 4)
    ↓  drop results below similarity threshold
Retrieve relevant chunks
    ↓  learner snapshot + context + question
Gemini
    ↓
Grounded, personalized response  +  source chips
```

**Important framing for judges:** RAG is *not* the identity of this project. It is one input into the adaptive engine. If the retrieval returns nothing useful, we answer from general knowledge and say so — we never pretend.

---

## 14. Gemini Prompt Design

Every prompt lives in `backend/app/core/prompts.py`. Every one receives the learner snapshot.

### Adaptive tutor prompt (conceptual shape)

```
SYSTEM
You are AdaptEd AI, an adaptive tutor. Adapt depth, vocabulary,
examples and follow-up to THIS learner.

LEARNER
  Level: {experience_level}     Goal: {goal}
  Current topic: {current_topic}
  Topic mastery: {mastery_map}
  Strengths: {strengths}        Weaknesses: {weaknesses}
  Recent performance: {trend}
  Recent mistakes: {concept_tags}

MATERIAL (from the student's own uploads)
  {retrieved_chunks}

RULES
  - mastery < 40 → simple language, one analogy, one tiny example,
                   end with a very easy check question
  - mastery 40–70 → normal explanation + worked example + 1 practice question
  - mastery > 70 → concise, edge cases, gotchas; if goal is Interview,
                   add an interview-style question
  - goal = Exam      → exam-oriented framing, likely questions
  - goal = Interview → interview framing, complexity, trade-offs
  - goal = Project   → practical, code-first
  - Use MATERIAL when relevant and mention which file it came from.
  - If MATERIAL is empty or irrelevant, answer from general knowledge
    and say so explicitly.
  - Never invent facts about the student's material.

QUESTION
  {question}
```

### Other prompt templates in the same file

| Template | Output |
|---|---|
| `DIAGNOSTIC_PROMPT` | N MCQs across the topic graph, strict JSON |
| `QUIZ_PROMPT` | 5 MCQs, fixed topic + difficulty, with `concept_tag` per question |
| `EXPLANATION_PROMPT` | Per-question explanation after submission |
| `SUMMARY_PROMPT` | Summarize an uploaded material |

All JSON-producing prompts end with:

> *Return ONLY valid JSON matching this schema. No markdown, no code fences, no commentary.*

…and are still parsed through `utils/json_parse.py::safe_json()`, which strips fences and retries once. **Always assume the model will wrap JSON in a code fence at least once during the night.**

---

## 15. Frontend Pages

| # | Route | What it must show |
|---|---|---|
| 1 | `/` | Landing — problem, solution, the adaptive loop, CTA |
| 2 | `/login`, `/signup` | Auth |
| 3 | `/onboarding` | Level, subject, goal, study time, experience |
| 4 | `/dashboard` | **Next Best Action card (with reason)**, mastery overview, streak, progress chart, quick links |
| 5 | `/diagnostic` | Question runner → results → mastery reveal |
| 6 | `/materials` | Upload, list, status badge, delete |
| 7 | `/assistant` | Chat + "Tuned for: Beginner · Loops 45%" badge + source chips |
| 8 | `/path` | Vertical timeline — done ✓ / current 🔵 / locked 🔒, each with its reason |
| 9 | `/practice` | Adaptive quiz → result → **mastery delta animation** → updated next action |
| 10 | `/analytics` | Mastery bars, mastery-over-time line, quiz history, strong/weak lists |
| 11 | `/profile` | Learner model view, editable goal/study time |

### Visual direction

Modern education SaaS. Clean white/slate surface, one accent gradient (indigo → violet), generous spacing, rounded cards, soft shadows, real progress bars, accessible type scale, fully responsive. **Do not make it look like a ChatGPT clone** — the dashboard is the hero screen, not the chat.

---

## 16. Local Setup

### Backend

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env          # then fill in the values
uvicorn app.main:app --reload --port 8000
```

API docs: <http://localhost:8000/docs>

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

App: <http://localhost:3000>

### Seed topics + demo learners

```bash
cd backend
python -m app.seed.topics_python
python -m app.seed.seed_demo
```

### requirements.txt

```txt
fastapi==0.115.0
uvicorn[standard]==0.30.6
pydantic==2.9.2
pydantic-settings==2.5.2
sqlalchemy==2.0.35
psycopg2-binary==2.9.9
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.9
python-dotenv==1.0.1
google-genai==1.0.0
PyMuPDF==1.24.10
sentence-transformers==3.1.1
chromadb==0.5.5
```

> Check the installed `google-genai` version against the current quickstart at <https://ai.google.dev/gemini-api/docs> before pinning — the SDK moves quickly.

---

## 17. Environment Variables

### `backend/.env.example`

```env
# --- Database ---
DATABASE_URL=postgresql://postgres:PASSWORD@HOST:5432/postgres

# --- Auth ---
JWT_SECRET=change-me-to-a-long-random-string
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# --- Gemini ---
GEMINI_API_KEY=your_key_from_aistudio
GEMINI_MODEL=gemini-3.6-flash
GEMINI_FALLBACK_MODEL=gemini-3.5-flash-lite

# --- RAG ---
EMBEDDING_MODEL=all-MiniLM-L6-v2
CHROMA_DIR=../data/chroma
UPLOAD_DIR=../data/uploads
CHUNK_SIZE=800
CHUNK_OVERLAP=150
TOP_K=4

# --- App ---
CORS_ORIGINS=http://localhost:3000
```

### `frontend/.env.local.example`

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

> **Model names change.** Verify the current free-tier Flash model in Google AI Studio on the day. Because the model ID is an env var, switching is a one-line change and no redeploy of logic.

Full acquisition steps (Supabase, AI Studio, connection string): **`docs/03_SETUP_AND_ENV.md`**

---

## 18. Error Handling

Every one of these has a visible, calm UI state. None of them crash the app.

| Failure | User sees |
|---|---|
| Gemini API error / quota | "AI service is temporarily unavailable. Please try again." + retry button |
| Gemini returns malformed JSON | Parser retries once, then falls back to a stored question bank |
| Empty or image-only PDF | "No readable content was found in this file." |
| Unsupported file type | "Please upload a supported PDF or text document." |
| RAG returns nothing relevant | Answer normally + badge: "Answered from general knowledge — no matching content in your uploads." |
| Database unreachable | Friendly error card, no stack trace |
| No diagnostic yet | Dashboard shows an onboarding nudge, not empty charts |
| Network timeout | Skeleton → error state with retry |

**Hackathon rule:** a fallback question bank for at least 3 topics must exist on disk by hour 20. If Gemini rate-limits during the live demo, the demo continues.

---

## 19. Responsible AI

- Ground responses in the student's uploaded material wherever relevant.
- Clearly label when an answer comes from general AI knowledge instead of the student's material.
- Never present uncertain information as fact.
- Collect the minimum personal data needed (name, email, learning preferences).
- Hash passwords; protect routes with JWT; scope every query by `user_id`.
- Students can view and delete their uploaded materials at any time.
- AdaptEd AI supports teachers and students — it does not replace educators.

---

## 20. Demo Story

> Two students ask the exact same question.
>
> **Student A** — beginner, preparing for a semester exam, Functions mastery 35%.
> **Student B** — intermediate, preparing for interviews, Functions mastery 85%.
>
> Both type: *"Explain Python functions."*

| | Student A receives | Student B receives |
|---|---|---|
| Depth | Simple explanation | Deeper, concise |
| Example | Basic + analogy | Practical use cases, edge cases |
| Practice | Easy check question | Interview question + coding challenge |
| Recommendation | "Revise function parameters" | "Try an advanced function-based problem" |

> **Same question ≠ same learning experience.**
>
> Then we take a quiz, deliberately answer badly, and the mastery score drops, the recommendation changes, and the learning path re-locks a topic — live, on screen.
>
> *"AdaptEd AI doesn't create a personalized plan once. It continuously changes the learning journey as the student changes."*

Minute-by-minute script + judge Q&A: **`docs/06_DEMO_SCRIPT.md`**

---

## 21. Impact & Benefits

**Students** — learning matched to their actual level, clear visibility of weak topics, targeted practice, efficient use of limited study time, continuous feedback, better self-awareness.

**Educators** — topic-wise learning gap insights, early identification of struggling students, targeted intervention, less repetitive manual monitoring.

**Institutions** — data-driven learning analytics, scalable personalization, subject and topic performance trends, support for large cohorts.

**Broader** — more equitable access to quality learning support, reduced learning gaps across backgrounds, a more inclusive and future-ready education system.

---

## 22. Future Scope

Multilingual AI learning · Mobile app · Teacher portal · Institutional dashboards · Advanced learner modelling (Bayesian Knowledge Tracing, IRT) · Voice-based learning · Offline / low-connectivity support · Gamification · External resource recommendation · LMS integration · Predictive at-risk analytics

---

## 23. Team & Roles

| Member | Role | Owns |
|---|---|---|
| **Rutuja Deshmukh** | Lead Developer & Architect | All code, architecture, integration, the machine we build on |
| **Rajshree Patil** | Co-Developer & QA Lead | Pair programming, manual testing, API testing, seed data, takes the keyboard during breaks |
| **Prathamesh Gadakh** | AI Prompt & Content Lead | All Gemini prompts, question banks, fallback content, test PDFs, demo copy |
| **Manthan Hingmire** | Project Manager & Demo Lead | Timeline, checklist, blockers, PPT updates, submission, demo narration, judge Q&A |

Hour-by-hour assignments: **`docs/02_TEAM_ROLES_AND_TASKS.md`**

---

## 24. Documentation Index

| File | Read it when |
|---|---|
| `README.md` | Anyone needs the full picture (this file) |
| `docs/00_PRE_HACKATHON_CHECKLIST.md` | **Tonight, before the hackathon starts** |
| `docs/01_HACKATHON_24H_PLAN.md` | Hour zero, and every hour after |
| `docs/02_TEAM_ROLES_AND_TASKS.md` | Anyone asks "what should I do now?" |
| `docs/03_SETUP_AND_ENV.md` | Getting keys, DB, env vars working |
| `docs/04_API_CONTRACT.md` | Before writing any route or any fetch call |
| `docs/05_ADAPTIVE_ENGINE_SPEC.md` | Implementing mastery / NBLA / path logic |
| `docs/06_DEMO_SCRIPT.md` | Hour 22 onwards |
| `Documents/PAGE_BY_PAGE_TEST_GUIDE.md` | **Page-by-page complete testing & QA verification manual** |
| `Documents/FEATURES.md` | Master list of all 15 features & specifications |

---

<div align="center">

**Same subject ≠ Same learner ≠ Same learning path**

*Built by Team SkillMatix · TECHFUSION*

</div>
