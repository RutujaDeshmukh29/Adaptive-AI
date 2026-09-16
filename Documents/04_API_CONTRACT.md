# 04 — API Contract

**Freeze this at hour zero. Change it only by announcing the change out loud.**

Base URL: `http://localhost:8000`
All `/api/*` routes except `signup` and `login` require:

```
Authorization: Bearer <jwt>
Content-Type: application/json
```

---

## Standard error shape

Every error, everywhere, has the same shape. The frontend handles one format, not twelve.

```json
{
  "detail": "Human-readable message",
  "code": "GEMINI_UNAVAILABLE"
}
```

| HTTP | `code` | Meaning |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Bad input |
| 401 | `UNAUTHORIZED` | Missing/expired token |
| 403 | `FORBIDDEN` | Not your resource |
| 404 | `NOT_FOUND` | Doesn't exist |
| 409 | `ALREADY_EXISTS` | Duplicate email |
| 413 | `FILE_TOO_LARGE` | Upload over `MAX_UPLOAD_MB` |
| 415 | `UNSUPPORTED_FILE` | Not a PDF/txt |
| 422 | `NO_READABLE_CONTENT` | PDF parsed empty |
| 429 | `RATE_LIMITED` | Gemini quota |
| 503 | `GEMINI_UNAVAILABLE` | LLM down after retries |
| 500 | `INTERNAL_ERROR` | Everything else |

---

## Health

### `GET /health`

```json
{ "status": "ok", "app": "AdaptEd AI", "version": "1.0" }
```

---

## Auth

### `POST /api/auth/signup`

```json
// request
{ "name": "Riya Sharma", "email": "riya@example.com", "password": "secret123" }
```
```json
// 201
{
  "access_token": "eyJhbGciOi...",
  "token_type": "bearer",
  "user": { "id": 1, "name": "Riya Sharma", "email": "riya@example.com" },
  "onboarding_complete": false
}
```

### `POST /api/auth/login`

```json
// request
{ "email": "riya@example.com", "password": "secret123" }
```
Response: identical shape to signup, with `onboarding_complete` reflecting reality.

### `GET /api/auth/me`

```json
{
  "id": 1,
  "name": "Riya Sharma",
  "email": "riya@example.com",
  "onboarding_complete": true,
  "diagnostic_done": true
}
```

---

## Profile

### `POST /api/profile/onboarding`

Creates the learner profile **and** seeds `topic_mastery` rows at 0 for every topic in the subject.

```json
// request
{
  "academic_level": "Diploma 2nd Year",
  "subject": "Python",
  "goal": "Semester Exam",
  "experience_level": "beginner",
  "study_time_minutes": 120,
  "preferences": { "learning_mode": "examples" }
}
```
```json
// 201
{
  "profile_id": 1,
  "subject": "Python",
  "topics_seeded": 10,
  "next_step": "diagnostic"
}
```

`goal` ∈ `"Semester Exam" | "Interview" | "Project" | "Self Learning"`
`experience_level` ∈ `"beginner" | "intermediate" | "advanced"`

### `GET /api/profile`

**The learner snapshot.** This is what the frontend renders and what the backend injects into every prompt.

```json
{
  "user": { "id": 1, "name": "Riya Sharma" },
  "academic_level": "Diploma 2nd Year",
  "subject": "Python",
  "goal": "Semester Exam",
  "experience_level": "beginner",
  "study_time_minutes": 120,
  "diagnostic_done": true,
  "current_topic": { "id": 5, "name": "Loops" },
  "overall_mastery": 59.4,
  "mastery": [
    { "topic_id": 1, "topic": "Variables",    "mastery": 85.0, "attempts": 2, "band": "mastered"   },
    { "topic_id": 4, "topic": "Conditionals", "mastery": 72.0, "attempts": 2, "band": "competent"  },
    { "topic_id": 5, "topic": "Loops",        "mastery": 45.0, "attempts": 3, "band": "developing" },
    { "topic_id": 6, "topic": "Functions",    "mastery": 30.0, "attempts": 1, "band": "struggling" }
  ],
  "strengths": ["Variables", "Conditionals"],
  "weaknesses": ["Functions", "Loops"],
  "recent_trend": "declining",
  "recent_mistake_tags": ["nested loops", "loop range"],
  "streak_days": 3,
  "total_quizzes": 4,
  "materials_count": 2
}
```

`band` ∈ `"struggling" (0-39) | "developing" (40-69) | "competent" (70-84) | "mastered" (85-100)`
`recent_trend` ∈ `"improving" | "stable" | "declining" | "insufficient_data"`

### `PATCH /api/profile`

```json
// request — any subset
{ "goal": "Interview", "study_time_minutes": 180 }
```
Returns the full snapshot again.

---

## Materials

### `POST /api/materials/upload`

`multipart/form-data`, field `file`. Optional field `subject`.

```json
// 201
{
  "id": 3,
  "filename": "python_notes.pdf",
  "status": "ready",
  "chunk_count": 148,
  "pages_processed": 22,
  "uploaded_at": "2026-09-17T11:04:00Z"
}
```

Errors: `413 FILE_TOO_LARGE` · `415 UNSUPPORTED_FILE` · `422 NO_READABLE_CONTENT`

### `GET /api/materials`

```json
{
  "materials": [
    { "id": 3, "filename": "python_notes.pdf", "status": "ready", "chunk_count": 148,
      "uploaded_at": "2026-09-17T11:04:00Z" }
  ],
  "total_chunks": 148
}
```

`status` ∈ `"processing" | "ready" | "failed"`

### `DELETE /api/materials/{id}`

```json
{ "deleted": true, "id": 3, "vectors_removed": 148 }
```

---

## Diagnostic

### `POST /api/diagnostic/start`

```json
// request
{ "question_count": 10 }
```
```json
// 200
{
  "attempt_id": 12,
  "questions": [
    {
      "id": 101,
      "topic_id": 5,
      "topic": "Loops",
      "difficulty": "easy",
      "question": "Which loop runs a fixed number of times?",
      "options": ["while loop", "for loop", "if statement", "function"],
      "concept_tag": "for loop basics"
    }
  ]
}
```

> `correct_index` and `explanation` are **never** sent to the client before submission.

### `POST /api/diagnostic/submit`

```json
// request
{
  "attempt_id": 12,
  "answers": [ { "question_id": 101, "selected_index": 1 } ]
}
```
```json
// 200
{
  "score": 60.0,
  "correct_count": 6,
  "total_questions": 10,
  "mastery": [
    { "topic_id": 1, "topic": "Variables", "mastery": 85.0, "band": "mastered" },
    { "topic_id": 5, "topic": "Loops",     "mastery": 45.0, "band": "developing" }
  ],
  "strengths": ["Variables"],
  "weaknesses": ["Functions", "Loops"],
  "review": [
    {
      "question_id": 101,
      "question": "Which loop runs a fixed number of times?",
      "your_answer": "while loop",
      "correct_answer": "for loop",
      "is_correct": false,
      "explanation": "A for loop iterates over a known sequence.",
      "concept_tag": "for loop basics"
    }
  ],
  "path_created": true,
  "next_action": {
    "action_type": "practice_easy",
    "topic_id": 6,
    "topic": "Functions",
    "difficulty": "easy",
    "reason": "Functions is your weakest topic at 30%. You missed both function questions in the diagnostic.",
    "evidence": { "mastery": 30.0, "wrong_count": 2, "concept_tags": ["parameters", "return values"] }
  }
}
```

---

## Mastery

### `GET /api/mastery`

```json
{
  "overall": 59.4,
  "topics": [
    { "topic_id": 5, "topic": "Loops", "mastery": 45.0, "band": "developing",
      "attempts": 3, "correct_answers": 7, "total_questions": 15,
      "last_updated": "2026-09-17T13:20:00Z" }
  ]
}
```

---

## Chat — the adaptive assistant

### `POST /api/chat`

```json
// request
{ "message": "Explain Python functions", "topic_id": null }
```
```json
// 200
{
  "answer": "Think of a function as a small machine you build once and use many times...",
  "sources": [
    { "material_id": 3, "filename": "python_notes.pdf", "page": 12, "similarity": 0.81 }
  ],
  "grounded": true,
  "learner_context_used": {
    "level": "beginner",
    "goal": "Semester Exam",
    "topic": "Functions",
    "mastery": 30.0,
    "adaptation": "simplified explanation, analogy, easy practice question"
  },
  "next_action": {
    "action_type": "practice_easy",
    "topic_id": 6,
    "topic": "Functions",
    "difficulty": "easy",
    "reason": "You are at 30% on Functions. Practice with easy questions before moving on."
  },
  "message_id": 45
}
```

> **`learner_context_used` is not decoration.** The UI renders it as a badge above the answer, so judges can *see* that the response was tuned. When `grounded` is `false`, the UI shows: *"Answered from general knowledge — no matching content found in your uploads."*

### `GET /api/chat/history?limit=50`

```json
{
  "messages": [
    { "id": 44, "role": "user", "content": "Explain Python functions",
      "created_at": "2026-09-17T13:10:00Z" },
    { "id": 45, "role": "assistant", "content": "Think of a function as...",
      "sources": [{ "filename": "python_notes.pdf", "page": 12 }],
      "created_at": "2026-09-17T13:10:04Z" }
  ]
}
```

---

## Quiz — adaptive practice

### `POST /api/quiz/generate`

```json
// request — every field optional; omit them and the engine decides
{ "topic_id": null, "difficulty": null, "question_count": 5 }
```
```json
// 200
{
  "attempt_id": 30,
  "topic_id": 5,
  "topic": "Loops",
  "difficulty": "easy",
  "selection_reason": "Loops is your weakest unlocked topic at 45%, and your last attempt dropped from 60%.",
  "questions": [
    {
      "id": 301,
      "question": "What does range(3) produce?",
      "options": ["1,2,3", "0,1,2", "0,1,2,3", "3"],
      "concept_tag": "range function",
      "difficulty": "easy"
    }
  ]
}
```

### `POST /api/quiz/submit` — ⭐ the most important response in the project

```json
// request
{
  "attempt_id": 30,
  "answers": [ { "question_id": 301, "selected_index": 1 } ]
}
```
```json
// 200
{
  "attempt_id": 30,
  "topic_id": 5,
  "topic": "Loops",
  "difficulty": "easy",
  "score": 40.0,
  "correct_count": 2,
  "total_questions": 5,

  "mastery_before": 45.0,
  "mastery_after": 36.6,
  "mastery_delta": -8.4,
  "band_before": "developing",
  "band_after": "struggling",

  "review": [
    {
      "question_id": 301,
      "question": "What does range(3) produce?",
      "your_answer": "0,1,2,3",
      "correct_answer": "0,1,2",
      "is_correct": false,
      "explanation": "range(3) is exclusive of the stop value, so it yields 0, 1 and 2.",
      "concept_tag": "range function"
    }
  ],

  "weak_concepts": ["range function", "nested loops"],

  "path_changed": true,
  "path_changes": [
    { "topic": "Functions", "from": "current", "to": "locked",
      "reason": "Loops dropped to 37%, below the 60% required to unlock Functions." }
  ],

  "next_action": {
    "action_type": "revise",
    "topic_id": 5,
    "topic": "Loops",
    "difficulty": "easy",
    "reason": "Loops fell from 45% to 37%. Two of three wrong answers involved the range function.",
    "evidence": {
      "mastery_before": 45.0,
      "mastery_after": 36.6,
      "wrong_count": 3,
      "concept_tags": ["range function", "nested loops"]
    }
  }
}
```

**This single response object is the demo.** Everything that makes AdaptEd AI different is visible in it: the mastery moved, the path changed, and the recommendation explains itself with real numbers.

### `GET /api/quiz/history?limit=20`

```json
{
  "attempts": [
    { "id": 30, "topic": "Loops", "difficulty": "easy", "score": 40.0,
      "mastery_before": 45.0, "mastery_after": 36.6,
      "created_at": "2026-09-17T14:02:00Z" }
  ]
}
```

---

## Learning path

### `GET /api/path`

```json
{
  "goal": "Semester Exam",
  "overall_progress": 42.0,
  "items": [
    { "order": 1, "topic_id": 1, "topic": "Variables", "status": "done",
      "mastery": 85.0, "reason": "Mastered at 85%." },
    { "order": 2, "topic_id": 4, "topic": "Conditionals", "status": "done",
      "mastery": 72.0, "reason": "Competent at 72%." },
    { "order": 3, "topic_id": 5, "topic": "Loops", "status": "current",
      "mastery": 36.6, "reason": "Currently at 37%. Needs revision before progressing." },
    { "order": 4, "topic_id": 6, "topic": "Functions", "status": "locked",
      "mastery": 30.0, "reason": "Locked — Loops must reach 60% first." }
  ]
}
```

`status` ∈ `"done" | "current" | "in_progress" | "locked"`

### `POST /api/path/recompute`

Forces a rebuild. Same response shape, plus `"changes": [...]`.

---

## Recommendation

### `GET /api/recommendation/next`

```json
{
  "action_type": "revise",
  "topic_id": 5,
  "topic": "Loops",
  "difficulty": "easy",
  "title": "Revise Loops",
  "description": "Work through 3 beginner examples focusing on the range function.",
  "reason": "Loops fell from 45% to 37% in your last quiz. Two of three wrong answers involved range.",
  "evidence": { "mastery": 36.6, "trend": "declining", "concept_tags": ["range function"] },
  "cta": { "label": "Practice now", "route": "/practice?topic_id=5&difficulty=easy" }
}
```

`action_type` ∈
`"upload_material" | "take_diagnostic" | "learn" | "revise" | "practice_easy" | "practice_medium" | "practice_hard" | "review_mistakes" | "advance" | "mock_test"`

---

## Analytics

### `GET /api/analytics/overview`

```json
{
  "overall_mastery": 52.1,
  "topics_completed": 2,
  "topics_total": 10,
  "quizzes_taken": 5,
  "questions_answered": 27,
  "accuracy": 58.6,
  "streak_days": 3,
  "study_minutes_today": 45,
  "strongest_topic": { "topic": "Variables", "mastery": 85.0 },
  "weakest_topic": { "topic": "Functions", "mastery": 30.0 }
}
```

### `GET /api/analytics/timeline?days=7`

```json
{
  "series": [
    { "date": "2026-09-14", "overall_mastery": 38.0, "quizzes": 1 },
    { "date": "2026-09-15", "overall_mastery": 47.5, "quizzes": 2 },
    { "date": "2026-09-16", "overall_mastery": 52.1, "quizzes": 2 }
  ],
  "by_topic": [
    { "topic": "Loops", "points": [
      { "date": "2026-09-14", "mastery": 20.0 },
      { "date": "2026-09-16", "mastery": 36.6 }
    ]}
  ]
}
```

Feed `series` directly into a Recharts `<LineChart>`.

---

## `frontend/src/lib/types.ts`

Paste this at H1:20. It is the contract, in TypeScript.

```ts
export type Band = "struggling" | "developing" | "competent" | "mastered";
export type Difficulty = "easy" | "medium" | "hard";
export type PathStatus = "done" | "current" | "in_progress" | "locked";
export type Trend = "improving" | "stable" | "declining" | "insufficient_data";

export type ActionType =
  | "upload_material" | "take_diagnostic" | "learn" | "revise"
  | "practice_easy" | "practice_medium" | "practice_hard"
  | "review_mistakes" | "advance" | "mock_test";

export interface User { id: number; name: string; email: string; }

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
  onboarding_complete: boolean;
}

export interface TopicMastery {
  topic_id: number;
  topic: string;
  mastery: number;
  band: Band;
  attempts?: number;
  correct_answers?: number;
  total_questions?: number;
  last_updated?: string;
}

export interface NextAction {
  action_type: ActionType;
  topic_id: number | null;
  topic: string | null;
  difficulty: Difficulty | null;
  title?: string;
  description?: string;
  reason: string;
  evidence?: Record<string, unknown>;
  cta?: { label: string; route: string };
}

export interface LearnerSnapshot {
  user: User;
  academic_level: string;
  subject: string;
  goal: string;
  experience_level: string;
  study_time_minutes: number;
  diagnostic_done: boolean;
  current_topic: { id: number; name: string } | null;
  overall_mastery: number;
  mastery: TopicMastery[];
  strengths: string[];
  weaknesses: string[];
  recent_trend: Trend;
  recent_mistake_tags: string[];
  streak_days: number;
  total_quizzes: number;
  materials_count: number;
}

export interface Material {
  id: number;
  filename: string;
  status: "processing" | "ready" | "failed";
  chunk_count: number;
  uploaded_at: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  concept_tag: string;
  difficulty: Difficulty;
  topic?: string;
  topic_id?: number;
}

export interface QuizGenerateResponse {
  attempt_id: number;
  topic_id: number;
  topic: string;
  difficulty: Difficulty;
  selection_reason: string;
  questions: QuizQuestion[];
}

export interface ReviewItem {
  question_id: number;
  question: string;
  your_answer: string;
  correct_answer: string;
  is_correct: boolean;
  explanation: string;
  concept_tag: string;
}

export interface QuizSubmitResponse {
  attempt_id: number;
  topic_id: number;
  topic: string;
  difficulty: Difficulty;
  score: number;
  correct_count: number;
  total_questions: number;
  mastery_before: number;
  mastery_after: number;
  mastery_delta: number;
  band_before: Band;
  band_after: Band;
  review: ReviewItem[];
  weak_concepts: string[];
  path_changed: boolean;
  path_changes: { topic: string; from: PathStatus; to: PathStatus; reason: string }[];
  next_action: NextAction;
}

export interface ChatSource {
  material_id: number;
  filename: string;
  page: number;
  similarity: number;
}

export interface ChatResponse {
  answer: string;
  sources: ChatSource[];
  grounded: boolean;
  learner_context_used: {
    level: string;
    goal: string;
    topic: string | null;
    mastery: number | null;
    adaptation: string;
  };
  next_action: NextAction;
  message_id: number;
}

export interface PathItem {
  order: number;
  topic_id: number;
  topic: string;
  status: PathStatus;
  mastery: number;
  reason: string;
}

export interface PathResponse {
  goal: string;
  overall_progress: number;
  items: PathItem[];
}

export interface ApiError { detail: string; code: string; }
```

---

## Build order for endpoints

Never build a UI page before its endpoint passes a Thunder Client test.

| Order | Endpoint group | Gate |
|---|---|---|
| 1 | auth | H2 |
| 2 | profile | H5 |
| 3 | materials | H8 |
| 4 | diagnostic + mastery | H11 |
| 5 | chat | H14 |
| 6 | quiz | H17 |
| 7 | path + recommendation | H19 |
| 8 | analytics | H21 |
