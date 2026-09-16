# 01 — The 24-Hour Execution Plan

> Clock times below assume a **10:00 AM start**. If your event starts at a different time, shift every row by the same offset. `H` = hours elapsed.
>
> **Prathamesh owns this file during the event.** He calls out each checkpoint aloud. A plan nobody reads is decoration.

---

## Governing rules

1. **Vertical slices, not horizontal layers.** Finish a feature end to end (DB → service → route → UI) before starting the next. A half-finished backend and a half-finished frontend at hour 20 is a loss; five complete features and six missing ones is a win.
2. **Commit every 45–60 minutes**, always on a working state. `git push` every commit. The laptop is a single point of failure.
3. **Never refactor after hour 18.** Working ugly code beats broken clean code.
4. **Checkpoint gates are real.** If a gate is missed by more than 45 minutes, execute the fallback in that row. Do not negotiate with the clock.
5. **The last 2 hours are frozen.** No new features. Only demo rehearsal, README, and bug triage.
6. **`main` must always run.** If a commit breaks the app, fix it or revert it immediately.

---

## Phase map

| Phase | Hours | Goal |
|---|---|---|
| 0 — Foundation | H0–H2 | Repo, DB, auth, both servers talking |
| 1 — Learner identity | H2–H5 | Onboarding, profile, dashboard shell |
| 2 — Knowledge base | H5–H8 | Upload → RAG ingestion → retrieval works |
| 3 — Assessment | H8–H11 | Diagnostic → initial mastery map |
| 4 — Adaptive assistant | H11–H14 | The headline feature |
| 5 — Adaptive practice | H14–H17 | Quiz → mastery update loop |
| 6 — The adaptive loop | H17–H19 | Path + Next Best Action + explainability |
| 7 — Polish | H19–H21 | Dashboard, analytics, visual quality |
| 8 — Demo hardening | H21–H23 | Seed data, fallbacks, rehearsal |
| 9 — Freeze | H23–H24 | Submission, final run-through |

---

## PHASE 0 — Foundation · H0–H2 · 10:00–12:00

**Goal:** by noon, a logged-in user exists and the frontend can call a protected endpoint.

| Time | Task | Who |
|---|---|---|
| H0:00 | Create repo, `.gitignore`, folder skeleton, first commit | Rutuja |
| H0:10 | Backend venv, `pip install -r requirements.txt` (cache is warm) | Rutuja |
| H0:10 | `create-next-app` in parallel terminal | Rajshree (dictating) |
| H0:20 | `config.py`, `database.py`, `.env` filled in, DB connection verified | Rutuja |
| H0:35 | All SQLAlchemy models written, `create_all()` runs, tables visible in Supabase | Rutuja |
| H1:00 | `core/security.py` — bcrypt + JWT; `routes/auth.py` — signup/login/me | Rutuja |
| H1:00 | Test auth in Thunder Client; record working request bodies | Rajshree |
| H1:20 | `lib/api.ts`, `lib/auth.ts`, `lib/types.ts` (paste from API contract) | Rutuja |
| H1:30 | Login + signup pages, token stored, redirect to `/dashboard` | Rutuja |
| H1:45 | Sidebar shell + route guard + placeholder pages for all 8 app routes | Rutuja |
| H0:00→ | Seed `topics_python.py` content (topic names, order, prerequisites) — **hand Rutuja a finished Python list** | Manthan |
| H0:00→ | Set up the tracking board; start the hourly checkpoint calls | Prathamesh |

### ✅ GATE H2 — do not proceed until all are true

- [ ] Signup and login work from the browser
- [ ] `/api/auth/me` returns the user with a JWT
- [ ] Tables exist in Supabase
- [ ] Sidebar navigates to all placeholder pages
- [ ] Pushed to GitHub

**Fallback if the DB isn't connected by H1:00:** switch `DATABASE_URL` to `sqlite:///./adapted.db`, change `JSONB` → `JSON` in models, continue. Cost: 10 minutes. Debating the network instead: 3 hours.

---

## PHASE 1 — Learner identity · H2–H5 · 12:00–15:00

**Goal:** a student can describe themselves, and the system stores a learner profile plus an empty mastery map.

| Time | Task | Who |
|---|---|---|
| H2:00 | `seed/topics_python.py` — insert topic graph with prerequisites | Rutuja |
| H2:20 | `routes/profile.py` — POST onboarding, GET profile, PATCH profile | Rutuja |
| H2:20 | On onboarding, create a `topic_mastery` row at 0 for every topic in the subject | Rutuja |
| H2:45 | `services/learner_model.py` → `build_snapshot(user_id)` — **the most important function in the codebase** | Rutuja |
| H3:15 | `/onboarding` page — form, validation, submit, redirect | Rutuja |
| H3:50 | `/dashboard` skeleton — stat tiles, mastery section, next-action placeholder | Rutuja |
| H4:30 | `/profile` page — read-only learner model view | Rutuja |
| — | Write `DIAGNOSTIC_PROMPT` and `QUIZ_PROMPT` in a scratch file, **test them directly in AI Studio** until JSON comes out clean | Manthan |
| — | Manual test of every endpoint built so far; log bugs in the tracker | Rajshree |

### ✅ GATE H5

- [ ] New user → onboarding → profile saved → dashboard renders
- [ ] `build_snapshot()` returns a complete learner object (print it, read it)
- [ ] `topic_mastery` rows exist at 0% for all topics
- [ ] Manthan's prompts produce clean JSON in AI Studio
- [ ] Pushed

**Eat lunch during this block. Not after it.**

---

## PHASE 2 — Knowledge base · H5–H8 · 15:00–18:00

**Goal:** upload a PDF; ask a question; get chunks back from that PDF.

| Time | Task | Who |
|---|---|---|
| H5:00 | `utils/text.py` — `clean_text()`, `chunk_text()` | Rutuja |
| H5:20 | `services/rag_service.py` — extract (PyMuPDF), embed, upsert to Chroma | Rutuja |
| H6:00 | `routes/materials.py` — upload (multipart), list, delete | Rutuja |
| H6:30 | **Test retrieval in isolation:** a script that prints top-4 chunks for "what is a loop" | Rutuja |
| H7:00 | `/materials` page — drag-drop upload, status badges, list, delete | Rutuja |
| H7:40 | Upload both sample PDFs end to end; verify `chunk_count > 0` | Rajshree |
| — | Test the sample PDFs; if extraction is poor, source a better PDF now | Manthan |

### ✅ GATE H8 — the critical technical gate

- [ ] Upload a PDF → status goes `processing` → `ready`
- [ ] `chunk_count` is non-zero and sensible
- [ ] A retrieval test returns **visibly relevant** chunks, not noise
- [ ] Deleting a material removes its vectors
- [ ] Pushed

**Fallback if embedding is too slow or Chroma misbehaves by H7:30:** cap ingestion at the first 30 pages, and/or switch retrieval to keyword search over stored chunks in Postgres. Retrieval quality matters far less than retrieval *existing* — and it is one input among many, not the product.

---

## PHASE 3 — Assessment · H8–H11 · 18:00–21:00

**Goal:** a new student gets a real diagnostic and walks away with a real mastery map.

| Time | Task | Who |
|---|---|---|
| H8:00 | `services/llm_service.py` — Gemini wrapper: retry, fallback model, `safe_json()` | Rutuja |
| H8:30 | `core/prompts.py` — paste in Manthan's tested prompts | Rutuja + Manthan |
| H8:45 | `services/diagnostic_service.py` — generate ~10 questions across topics | Rutuja |
| H9:15 | `services/mastery_service.py` — `initialize_mastery()` from diagnostic results | Rutuja |
| H9:35 | `routes/diagnostic.py` — start + submit | Rutuja |
| H10:00 | `/diagnostic` page — question runner, progress bar, submit | Rutuja |
| H10:30 | Results screen — topic-wise mastery reveal with bars | Rutuja |
| — | **Build the fallback question bank now** — 5 questions × 4 topics × 3 difficulties, as JSON on disk. This is your insurance against a rate limit at 4am. | Manthan |
| — | Run the full new-user journey 3 times; log every bug | Rajshree |

### ✅ GATE H11

- [ ] Diagnostic generates questions from Gemini
- [ ] Submitting produces different mastery scores per topic
- [ ] Mastery persists and is visible on the dashboard
- [ ] Fallback question bank JSON exists on disk
- [ ] Pushed

**Dinner during this block.**

---

## PHASE 4 — Adaptive assistant · H11–H14 · 21:00–00:00

**Goal:** the headline feature. Same question, different answer, provably.

| Time | Task | Who |
|---|---|---|
| H11:00 | `ADAPTIVE_TUTOR_PROMPT` in `core/prompts.py` | Rutuja + Manthan |
| H11:30 | `routes/chat.py` — snapshot + RAG search + Gemini + persist | Rutuja |
| H12:15 | Return `sources[]` and `learner_context_used` in the response | Rutuja |
| H12:30 | `/assistant` page — chat window, bubbles, loading state | Rutuja |
| H13:10 | `LearnerContextBadge` — "Tuned for: Beginner · Exam · Loops 45%" | Rutuja |
| H13:25 | `SourceChips` — "from python_notes.pdf, p.12" | Rutuja |
| H13:40 | **Personalization A/B test** — two accounts with different profiles, same question, compare the answers side by side | Rajshree |
| — | Tune the prompt until the two answers are *obviously* different to a non-technical observer | Manthan |

### ✅ GATE H14 — the gate that wins or loses the hackathon

- [ ] Beginner/Exam profile and Intermediate/Interview profile get **visibly different** answers to *"Explain Python functions"*
- [ ] Answers reference uploaded material when relevant
- [ ] Source chips display
- [ ] The learner-context badge is visible on screen — judges must *see* the personalization, not just hear about it
- [ ] Pushed

If the difference isn't obvious to someone who doesn't know the system, **it does not exist**. Keep tuning until it is unmistakable.

---

## PHASE 5 — Adaptive practice · H14–H17 · 00:00–03:00

**Goal:** the feedback loop closes. A quiz changes the learner model.

| Time | Task | Who |
|---|---|---|
| H14:00 | `services/quiz_engine.py` — `select_topic()`, `select_difficulty()` | Rutuja |
| H14:30 | Quiz generation grounded in RAG context, strict JSON, `concept_tag` per question | Rutuja |
| H15:00 | `routes/quiz.py` — generate + submit | Rutuja |
| H15:20 | `mastery_service.update_mastery()` — EMA, difficulty-weighted (spec in `05_`) | Rutuja |
| H15:45 | `/practice` page — quiz runner, option selection, submit | Rutuja |
| H16:20 | Result screen — score, per-question explanations, **mastery before → after** | Rutuja |
| H16:45 | `MasteryDelta` — animate 45% → 58% (or downward) | Rutuja |
| — | Take quizzes deliberately badly and deliberately well; confirm mastery moves in both directions | Rajshree |

### ✅ GATE H17

- [ ] Quiz difficulty changes with mastery (verify with two different accounts)
- [ ] Answering badly **lowers** mastery; answering well **raises** it
- [ ] The result screen shows the mastery delta explicitly
- [ ] `quiz_attempts` and `quiz_questions` rows are written correctly
- [ ] Pushed

### 😴 Sleep rotation — mandatory

- **Rutuja: 60–90 minutes somewhere between H15 and H17.** Hand the keyboard to Rajshree for the UI work, or just stop. Non-negotiable. Hours 18–24 are the hardest hours and you will be the only one who can do them.
- Manthan + Prathamesh: split the night, one awake at all times to track and wake people.
- Set actual alarms. "I'll just rest my eyes" is how teams lose three hours.

---

## PHASE 6 — The adaptive loop · H17–H19 · 03:00–05:00

**Goal:** the thing that separates us from a quiz app. Performance visibly changes the plan.

| Time | Task | Who |
|---|---|---|
| H17:00 | `services/path_service.py` — `build_path()`, `recompute()` with prerequisite gates | Rutuja |
| H17:30 | `services/adaptive_engine.py` — `next_best_action()` with `reason` + `evidence` | Rutuja |
| H18:00 | Wire recompute into quiz submit; return `path_changed` in the response | Rutuja |
| H18:15 | `/path` page — timeline with done ✓ / current 🔵 / locked 🔒 + reason per node | Rutuja |
| H18:40 | `NextActionCard` on the dashboard — action + the explanation sentence | Rutuja |
| — | **Loop verification:** note the path → fail a quiz → confirm the path and recommendation actually changed | Rajshree |

### ✅ GATE H19 — the differentiator gate

- [ ] Failing a quiz changes the Next Best Action text
- [ ] Failing a prerequisite **re-locks** a downstream topic on the path
- [ ] Every recommendation shows a reason containing **real numbers** from the database
- [ ] The dashboard reflects all of this without a manual refresh hack
- [ ] Pushed

---

## PHASE 7 — Polish · H19–H21 · 05:00–07:00

**Goal:** it must *look* like a product, because judges evaluate with their eyes first.

| Time | Task | Who |
|---|---|---|
| H19:00 | `/analytics` — mastery bars, mastery-over-time line (Recharts), quiz history | Rutuja |
| H19:40 | Dashboard final pass — stat tiles, streak, spacing, hierarchy | Rutuja |
| H20:10 | Landing page — problem, solution, the adaptive loop diagram, CTA | Rutuja |
| H20:40 | Loading skeletons, empty states, error states everywhere | Rutuja |
| H20:55 | Consistent colours, spacing, rounded corners, one accent gradient | Rutuja |
| — | Click every page on a phone-width window; report anything broken | Rajshree |

### ✅ GATE H21

- [ ] No raw JSON, no `undefined`, no console errors visible anywhere
- [ ] Every page has a loading state and an empty state
- [ ] Charts render with real data
- [ ] Landing page explains the product in under 10 seconds of reading
- [ ] Pushed

---

## PHASE 8 — Demo hardening · H21–H23 · 07:00–09:00

**Goal:** make the demo impossible to break.

| Time | Task | Who |
|---|---|---|
| H21:00 | `seed/seed_demo.py` — **Student A** (beginner/exam/Functions 35%) and **Student B** (intermediate/interview/Functions 85%), both with materials pre-ingested | Rutuja |
| H21:30 | Wire the fallback question bank into `llm_service` on API failure | Rutuja |
| H21:50 | Full dry run of the demo path, timed | Whole team |
| H22:10 | Fix only demo-path bugs. **Bugs outside the demo path are now WONTFIX.** | Rutuja |
| H22:30 | README finalized; screenshots captured | Rutuja + Prathamesh |
| H22:30 | Deck updated with real screenshots and final architecture diagram | Prathamesh |
| H22:45 | Rehearsal #2, timed and narrated | Prathamesh |

### ✅ GATE H23

- [ ] Demo accounts log in instantly and land on a populated dashboard
- [ ] The full demo runs in **under 5 minutes** without a single error
- [ ] The demo has been rehearsed **twice** out loud, with the projector
- [ ] Fallbacks tested by deliberately breaking the API key
- [ ] README + deck + screenshots done
- [ ] Pushed

---

## PHASE 9 — Freeze · H23–H24 · 09:00–10:00

| Time | Task |
|---|---|
| H23:00 | **CODE FREEZE.** Last commit. Tag it `v1.0-demo`. |
| H23:10 | Final push; verify the repo opens cleanly in a browser |
| H23:20 | Submit per event instructions (repo link, deck, form) |
| H23:30 | Final rehearsal #3 |
| H23:45 | Charge everything. Eat. Wash your face. Change shirt. |
| H23:55 | Servers running, browser tabs pre-opened, demo accounts pre-logged-in |

### Pre-demo tab layout (open before you are called)

1. Landing page
2. Dashboard (Student A, logged in)
3. Assistant (Student A)
4. A second browser **profile or incognito window** with Student B logged in
5. Practice page
6. Backend terminal (visible — running logs are quietly convincing)

---

## Cut lines — decide these in advance, not at 4am

| If at… | And this isn't done… | Then cut… |
|---|---|---|
| H8 | RAG retrieval | Switch to keyword search over stored chunks |
| H11 | Diagnostic generation | Use the static fallback question bank; still score it and still build real mastery |
| H14 | Chat personalization is not visibly different | Stop everything else and fix it — this IS the project |
| H17 | Quiz → mastery update | **Cut nothing above it — build this instead.** Without it there is no adaptive loop and no project |
| H19 | Learning path | Keep the Next Best Action card only; drop the timeline UI |
| H21 | Analytics charts | Drop charts, keep mastery bars |
| H22 | Anything at all | Cut it. Rehearse instead. |

**Never cut:** auth · onboarding · mastery · adaptive chat · quiz→mastery update · next best action. That set *is* AdaptEd AI. Everything else is decoration.

---

## Energy & health

| Hour | Do this |
|---|---|
| Every 90 min | Stand up, walk, look at something 20 feet away for 20 seconds |
| H5 | Real lunch |
| H11 | Real dinner |
| H15–H17 | **Rutuja sleeps 60–90 min** |
| H19 | Coffee/tea, wash face, 10-minute walk outside if possible |
| H21 | Breakfast — do not skip; you present on this fuel |
| Always | Water. Dehydration is the most common cause of hour-16 bugs that take an hour to find and turn out to be a typo. |

---

## Git discipline

```bash
# every 45-60 minutes, on a working state
git add -A
git commit -m "feat(quiz): adaptive difficulty selection + mastery update"
git push

# before starting a risky change
git checkout -b experiment/streaming
# if it fails after 20 minutes:
git checkout main   # walk away, no regrets
```

Commit prefixes: `feat` · `fix` · `ui` · `docs` · `chore`

**The rule:** if it works, commit it. Right then. Not after "just one more thing."
