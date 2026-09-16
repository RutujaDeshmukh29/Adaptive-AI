# 02 — Team Roles & Task Assignment

**Team SkillMatix — 4 members, 1 coding laptop, 24 hours.**

The constraint that shapes everything: **one keyboard.** A four-person team with one laptop fails in a predictable way — three people hover, get bored, drift off, and then at hour 20 nobody can help because nobody knows the state of the project.

This document exists to prevent that. Every person has work that does **not** require the keyboard.

---

## Role summary

| Member | Role | One-line mandate |
|---|---|---|
| **Rutuja Deshmukh** | Lead Developer & Architect | Writes the code. Makes technical decisions. Protects her own focus. |
| **Rajshree Patil** | Co-Developer & QA Lead | Breaks everything before the judges do. Takes the keyboard when Rutuja rests. |
| **Prathamesh Gadakh** | AI Prompt & Content Lead | Every Gemini prompt is tested before it reaches the codebase. |
| **Manthan Hingmire** | Project Manager & Demo Lead | Owns the clock, the checklist, the deck, and the story we tell. |

> Roles 3 and 4 can be swapped between Manthan and Prathamesh based on who is more comfortable presenting. Decide tonight, not tomorrow.

---

## 👩‍💻 Rutuja — Lead Developer & Architect

### You own

- The entire codebase: backend, frontend, integration
- Architectural decisions and the cut-line calls
- Git: commits, pushes, branch decisions
- The demo laptop's environment

### Your protection rules — enforce these

1. **Nobody speaks to you while you are mid-function.** Questions go to Prathamesh, who batches them and asks at checkpoints.
2. **You do not attend discussions.** If the team needs to debate, they debate and bring you a decision.
3. **You do not fetch food, chargers or anything else.** That is logistics, and logistics has an owner.
4. **You sleep 60–90 minutes between H15 and H17.** This is a team decision already made, not something you re-decide when tired.
5. **You never debug alone for more than 20 minutes.** At 20 minutes, say it out loud to Rajshree. Explaining a bug to another person solves it more often than staring does.

### Your build order (never deviate)

```
Foundation → Auth → Profile → Learner Model → RAG
→ Diagnostic → Mastery → Adaptive Chat → Adaptive Quiz
→ Mastery Update → Next Best Action → Learning Path
→ Dashboard → Analytics → Polish
```

Each item goes **DB → service → route → test in Thunder Client → UI**. Never build UI for an endpoint you haven't tested.

### Things you must refuse to do

- Refactor after H18
- Add a library nobody asked for after H12
- "Quickly try" streaming, voice, or animations before the core loop is done
- Chase a bug on a page that isn't in the demo path, after H22

---

## 👩‍🔬 Rajshree — Co-Developer & QA Lead

You know how to code, which makes you far more useful than a second pair of hands. You are the only person who can catch a bug before a judge does.

### H0–H5 — Setup & contract

- [ ] Read `04_API_CONTRACT.md` fully; you are the reference when Rutuja forgets a field name
- [ ] Set up Thunder Client / Postman with a collection for every endpoint
- [ ] After each endpoint is built, test it: happy path, missing token, bad input, empty data
- [ ] Log bugs in the tracker as **`[page] what you did → what happened → what should happen`**

### H5–H14 — Test & pair

- [ ] Upload both sample PDFs; verify chunk counts
- [ ] Create **three** test accounts with different profiles (beginner/exam, intermediate/interview, advanced/project)
- [ ] Run the full new-user journey after every phase gate
- [ ] **The A/B personalization test at H13:40 is yours.** Put two answers side by side on screen. If a stranger couldn't tell they were tuned for different students, say so loudly — that is the most important finding of the whole event.

### H14–H19 — Break the loop deliberately

- [ ] Take quizzes answering everything wrong. Does mastery drop?
- [ ] Take quizzes answering everything right. Does difficulty increase?
- [ ] Drop a prerequisite below 50. Does the dependent topic re-lock?
- [ ] Note the Next Best Action, fail a quiz, note it again. Did it change?
- [ ] Refresh mid-quiz. Submit twice. Navigate away and back. Empty states everywhere.

### H15–H17 — **Take the keyboard**

While Rutuja sleeps, you do UI work only — never logic:

- Loading skeletons
- Empty states
- Error states
- Spacing, colour and typography consistency
- Landing page copy and layout

**Work only in `frontend/src/components/` and page files.** Do not touch `backend/app/services/`. Commit on a working state before Rutuja wakes; tell her exactly what you touched.

### H19–H24 — Demo QA

- [ ] Run the full demo script yourself, start to finish, twice
- [ ] Test on the actual projector resolution
- [ ] Verify the demo accounts from a fresh browser profile
- [ ] Be the backup presenter — know the demo well enough to run it if needed

---

## 🧠 Prathamesh — AI Prompt & Content Lead

**Your workspace is Google AI Studio and a text editor.** You never need the coding laptop. Everything you produce is tested *before* it reaches the codebase — which is why prompt bugs will not cost Rutuja debugging time at 3am.

### H0–H2 — Topic graph

Deliver a finished Python list (Rutuja pastes it straight into `seed/topics_python.py`):

```python
PYTHON_TOPICS = [
    {"name": "Variables",     "slug": "variables",     "order": 1,  "prerequisite": None},
    {"name": "Data Types",    "slug": "data-types",    "order": 2,  "prerequisite": "variables"},
    {"name": "Operators",     "slug": "operators",     "order": 3,  "prerequisite": "variables"},
    {"name": "Conditionals",  "slug": "conditionals",  "order": 4,  "prerequisite": "operators"},
    {"name": "Loops",         "slug": "loops",         "order": 5,  "prerequisite": "conditionals"},
    {"name": "Functions",     "slug": "functions",     "order": 6,  "prerequisite": "loops"},
    {"name": "Lists",         "slug": "lists",         "order": 7,  "prerequisite": "loops"},
    {"name": "Dictionaries",  "slug": "dictionaries",  "order": 8,  "prerequisite": "lists"},
    {"name": "Strings",       "slug": "strings",       "order": 9,  "prerequisite": "data-types"},
    {"name": "OOP Basics",    "slug": "oop",           "order": 10, "prerequisite": "functions"},
]
```

Adjust names to match the sample PDF's chapters — retrieval works better when topic names match the material's vocabulary.

### H2–H8 — Prompt engineering in AI Studio

Test each prompt **at least 5 times** before handing it over. A prompt that works once is not a prompt.

| Prompt | Must produce | Test it by |
|---|---|---|
| `DIAGNOSTIC_PROMPT` | 10 MCQs across topics, mixed difficulty, strict JSON | Running it 5 times — does the JSON shape stay identical? |
| `QUIZ_PROMPT` | 5 MCQs, one topic, one difficulty, with `concept_tag` | Running easy and hard for the same topic — are they actually different in difficulty? |
| `ADAPTIVE_TUTOR_PROMPT` | Level-appropriate explanation | Running it with a beginner snapshot and an intermediate snapshot — **are the answers obviously different?** |
| `EXPLANATION_PROMPT` | Why an answer was wrong | Feeding it a wrong answer |

**Hand-off format** — for each prompt, give Rutuja a file containing: the exact prompt string with `{placeholders}`, one sample input, one sample output, and any known failure mode.

### The JSON discipline

Every JSON prompt ends with:

> *Return ONLY valid JSON matching this exact schema. No markdown, no code fences, no explanation before or after.*

Gemini will still wrap it in fences sometimes. Tell Rutuja how often it happened in your testing so she knows how aggressive `safe_json()` needs to be.

### H8–H12 — Fallback question bank ⚠️

**This is your highest-value deliverable.** A JSON file: **4 topics × 3 difficulties × 5 questions = 60 questions**, in the exact schema the quiz engine expects.

```json
{
  "loops": {
    "easy": [
      {
        "question": "Which loop repeats a fixed number of times?",
        "options": ["while", "for", "if", "def"],
        "correct_index": 1,
        "explanation": "A for loop iterates over a known sequence.",
        "concept_tag": "for loop basics"
      }
    ],
    "medium": [],
    "hard": []
  }
}
```

If Gemini rate-limits during the live demo, this file is the reason the demo continues instead of ending.

### H12–H24 — Demo content & support

- [ ] Write the exact questions we will type during the demo (tested, known-good answers)
- [ ] Write the two demo learner profiles' exact values for `seed_demo.py`
- [ ] Proofread all UI copy for spelling and tone
- [ ] Write the landing page text
- [ ] Prepare the "Responsible AI" talking points for judge Q&A

---

## 📋Manthan — Project Manager & Demo Lead

**You do not need to write code to be the reason this team wins.** Hackathons are lost to time, not to technical difficulty. You own time.

### Your permanent job: the checkpoint call

**Every hour, on the hour, out loud:**

> *"H7. We should have finished RAG ingestion. Where are we? Anything blocking?"*

Write down the answer. If the phase is more than 45 minutes behind, say the sentence:

> *"We're 45 minutes behind on Phase 2. Do we execute the fallback?"*

You are not asking Rutuja to hurry. You are asking her to make a decision at the right moment, which is exactly what tired people forget to do.

### Your board (notebook or whiteboard — visible to everyone)

```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│    TO DO     │ IN PROGRESS  │   TESTING    │     DONE     │
├──────────────┼──────────────┼──────────────┼──────────────┤
│ Learning path│ Quiz engine  │ Adaptive chat│ Auth         │
│ Analytics    │              │              │ Onboarding   │
│ Landing page │              │              │ RAG upload   │
│              │              │              │ Diagnostic   │
└──────────────┴──────────────┴──────────────┴──────────────┘
Current phase: 5   |   Gate: H17   |   Status: ON TRACK
```

Update it every hour. When someone asks "how are we doing," point at the board.

### The question filter

All questions route through you. Batch them. Interrupting a developer costs roughly 15 minutes of recovered focus per interruption; over 24 hours that is hours of lost work. You are the buffer.

### Logistics (yours alone)

- [ ] Food and water arrive before people notice they are hungry
- [ ] Chargers plugged in, power strip secured
- [ ] Hotspot ready; monitor internet stability
- [ ] Track event announcements, deadline changes, mentor-round timings
- [ ] Know the submission process **before** hour 23, not at hour 23

### Sleep rotation enforcement

You own the alarm clock. Rutuja sleeps H15–H17. You wake her. You do not let her talk you out of it at H15, and you do not let her oversleep past H17.

### H20–H24 — Demo Lead

- [ ] Update the TECHFUSION deck with real screenshots
- [ ] Rehearse the narration out loud **three times**
- [ ] Time it — must be under 5 minutes
- [ ] Prepare judge Q&A answers (see `06_DEMO_SCRIPT.md`)
- [ ] Handle submission: repo link, deck, forms
- [ ] During the demo: **you talk, Rutuja clicks.** She cannot narrate and operate simultaneously, and a silent screen loses the room.

---

## Who answers what during judging

| Question type | Answers |
|---|---|
| "What does it do?" | Prathamesh |
| "How is this different from ChatGPT?" | Prathamesh (rehearsed answer) |
| "How does the adaptation actually work?" | Rutuja |
| "What's your tech stack?" | Rutuja |
| "How do you generate the questions?" | Manthan |
| "Did you test edge cases?" | Rajshree |
| "What would you build next?" | Prathamesh |
| "Is this just a wrapper around Gemini?" | **Rutuja** — this is the most dangerous question. See `06_DEMO_SCRIPT.md`. |

**Everyone must be able to explain the core loop in one sentence:**

> *"We keep a live model of what the student knows, and every answer, quiz and recommendation is generated from that model — so when performance changes, the whole learning journey changes."*

Say it out loud tonight until all four of you can say it without thinking.

---

## Anti-patterns to name and kill on sight

| Anti-pattern | Fix |
|---|---|
| Three people watching one screen | Only the coder and the tester look at the screen |
| "Let me just try one thing" at H22 | Code freeze is a rule, not a suggestion |
| Debugging by committee | One person debugs, one person rubber-ducks, the rest keep working |
| Nobody knows the current state | Prathamesh's board is always current |
| Everyone awake at hour 4, everyone dead at hour 20 | Enforce the rotation |
| Building features the demo never shows | If it's not in the demo script, it's not a priority |
| Discovering the projector doesn't work at hour 24 | Test the adapter at hour 20 |
