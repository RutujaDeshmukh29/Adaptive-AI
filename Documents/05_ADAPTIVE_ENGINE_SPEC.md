# 05 — Adaptive Engine Specification

**This is the part of AdaptEd AI that is actually ours.**

Gemini is a component we call. ChromaDB is a library we installed. The adaptive engine is deterministic Python that we designed — and it is the correct answer to the hardest judging question: *"Isn't this just a wrapper around Gemini?"*

No. Gemini writes sentences. **The engine decides what should happen.**

---

## 0. Constants — `backend/app/core/constants.py`

```python
# Mastery bands
BAND_STRUGGLING  = (0,  40)   # revise, easy practice, heavy explanation
BAND_DEVELOPING  = (40, 70)   # guided practice, medium difficulty
BAND_COMPETENT   = (70, 85)   # hard practice, edge cases
BAND_MASTERED    = (85, 101)  # advance to the next topic

# Difficulty weighting — a hard question is worth more evidence
DIFFICULTY_WEIGHT = {"easy": 0.80, "medium": 1.00, "hard": 1.25}

# EMA learning rates
ALPHA_FIRST  = 0.50   # first observation for a topic moves it a lot
ALPHA_REPEAT = 0.30   # later observations move it less

# Prerequisite gates
PREREQ_UNLOCK = 60    # prerequisite must reach this to unlock a topic
PREREQ_RELOCK = 50    # dropping below this re-locks dependents (hysteresis)

# Trend detection
TREND_WINDOW = 3      # last N attempts
TREND_DELTA  = 8.0    # points of change that counts as a real trend

# Quiz sizing
QUIZ_QUESTIONS       = 5
DIAGNOSTIC_QUESTIONS = 10
```

> The gap between `PREREQ_UNLOCK` (60) and `PREREQ_RELOCK` (50) is deliberate **hysteresis**. Without it, a topic sitting at exactly 60% would flicker between locked and unlocked on every attempt, which looks broken on stage.

---

## 1. Mastery update — `mastery_service.update_mastery()`

### The formula

```
raw     = correct / total                                    # 0.0 … 1.0
signal  = min(raw × DIFFICULTY_WEIGHT[difficulty], 1.0) × 100
alpha   = ALPHA_FIRST if attempts == 0 else ALPHA_REPEAT
new     = previous + alpha × (signal − previous)
new     = clamp(new, 0, 100)
```

### Why EMA rather than a plain average

| Approach | Problem |
|---|---|
| Overall average | A student who has improved a lot is still dragged down by their first bad quiz forever |
| Latest score only | One unlucky quiz wipes out all history; wildly unstable |
| **EMA** | Recent performance dominates, history still matters, and the number moves visibly but not violently |

EMA is one line of code and produces exactly the behaviour a demo needs: a bad quiz makes the number drop **noticeably but believably**.

### Worked examples

**A) Struggling student improving**
```
previous = 30, attempts = 2, correct = 4/5, difficulty = easy
raw    = 0.80
signal = 0.80 × 0.80 × 100 = 64.0
alpha  = 0.30
new    = 30 + 0.30 × (64 − 30) = 30 + 10.2 = 40.2
→ 30% → 40.2%   (crosses from "struggling" to "developing")
```

**B) The demo moment — deliberate failure**
```
previous = 45, attempts = 3, correct = 2/5, difficulty = easy
raw    = 0.40
signal = 0.40 × 0.80 × 100 = 32.0
alpha  = 0.30
new    = 45 + 0.30 × (32 − 45) = 45 − 3.9 = 41.1
→ 45% → 41.1%
```

**C) Same failure on hard questions**
```
previous = 45, correct = 2/5, difficulty = hard
signal = 0.40 × 1.25 × 100 = 50.0
new    = 45 + 0.30 × (50 − 45) = 46.5
→ mastery RISES, because 40% on hard questions is better evidence
  than 40% on easy ones
```

Example C is worth saying out loud to judges. It demonstrates the engine reasons about *difficulty*, not just score.

### Implementation sketch

```python
def update_mastery(db, user_id, topic_id, correct, total, difficulty):
    row = get_or_create_mastery(db, user_id, topic_id)
    before = row.mastery_score

    raw    = correct / total if total else 0.0
    signal = min(raw * DIFFICULTY_WEIGHT[difficulty], 1.0) * 100
    alpha  = ALPHA_FIRST if row.attempts == 0 else ALPHA_REPEAT
    after  = max(0.0, min(100.0, before + alpha * (signal - before)))

    row.mastery_score   = round(after, 1)
    row.attempts       += 1
    row.correct_answers += correct
    row.total_questions += total
    row.last_difficulty  = difficulty
    row.last_updated     = datetime.utcnow()
    db.commit()

    return {"before": round(before, 1),
            "after":  round(after, 1),
            "delta":  round(after - before, 1)}
```

### Diagnostic initialization

The diagnostic is the **first** observation, so it writes mastery directly rather than blending against a meaningless zero:

```python
def initialize_mastery(db, user_id, per_topic_results):
    # per_topic_results = {topic_id: {"correct": 2, "total": 3, "difficulty": "medium"}}
    for topic_id, r in per_topic_results.items():
        raw    = r["correct"] / r["total"]
        signal = min(raw * DIFFICULTY_WEIGHT[r["difficulty"]], 1.0) * 100
        row = get_or_create_mastery(db, user_id, topic_id)
        row.mastery_score   = round(signal, 1)
        row.attempts        = 1
        row.correct_answers = r["correct"]
        row.total_questions = r["total"]
    db.commit()
```

Topics the diagnostic didn't cover stay at 0 with `attempts = 0` — honestly "unknown", not falsely "bad".

---

## 2. Trend detection — `learner_model.compute_trend()`

```python
def compute_trend(attempts):          # attempts newest-first
    recent = attempts[:TREND_WINDOW]
    if len(recent) < 2:
        return "insufficient_data"
    delta = recent[0].mastery_after - recent[-1].mastery_before
    if delta >   TREND_DELTA: return "improving"
    if delta < - TREND_DELTA: return "declining"
    return "stable"
```

`recent_trend` changes how Gemini is prompted:

| Trend | Prompt adjustment |
|---|---|
| `declining` | "The student's recent performance has dropped. Be encouraging, slow down, re-explain fundamentals." |
| `improving` | "The student is improving. Acknowledge it briefly and raise the challenge slightly." |
| `stable` | Normal explanation |

---

## 3. Weak concept detection

Every generated question carries a `concept_tag` ("nested loops", "range function", "function parameters"). This is what turns a vague recommendation into a specific one.

```python
def weak_concepts(db, user_id, topic_id=None, limit=5):
    """Most frequent concept_tags among recent WRONG answers."""
    q = (db.query(QuizQuestion.concept_tag, func.count().label("n"))
           .join(QuizAttempt)
           .filter(QuizAttempt.user_id == user_id,
                   QuizQuestion.is_correct.is_(False)))
    if topic_id:
        q = q.filter(QuizQuestion.topic_id == topic_id)
    return [r.concept_tag for r in
            q.group_by(QuizQuestion.concept_tag)
             .order_by(desc("n")).limit(limit).all()]
```

> Without `concept_tag`, the best you can say is *"practice loops."*
> With it, you say *"practice nested loops — that's where 3 of your 4 mistakes were."*
>
> That difference is the entire "Explainable AI" slide in your deck. **Make sure every prompt that generates a question demands a `concept_tag`.**

---

## 4. Learning path — `path_service`

### Building it

```python
def build_path(db, user_id):
    profile = get_profile(db, user_id)
    topics  = get_topics(db, profile.subject)        # ordered, with prerequisites
    mastery = mastery_map(db, user_id)               # {topic_id: score}

    items, current_assigned = [], False
    for t in topics:
        score  = mastery.get(t.id, 0.0)
        prereq = mastery.get(t.prerequisite_id, 100.0) if t.prerequisite_id else 100.0

        if score >= 85:
            status, reason = "done", f"Mastered at {score:.0f}%."
        elif prereq < PREREQ_UNLOCK:
            status = "locked"
            reason = f"Locked — {name_of(t.prerequisite_id)} must reach {PREREQ_UNLOCK}% first."
        elif not current_assigned:
            status, reason, current_assigned = "current", _current_reason(score), True
        else:
            status, reason = "in_progress", f"Upcoming. Currently at {score:.0f}%."

        items.append(PathItem(user_id=user_id, topic_id=t.id, order_index=t.order_index,
                              status=status, reason=reason))
    return items
```

```python
def _current_reason(score):
    if score < 40:  return f"Currently at {score:.0f}%. Needs revision and easy practice."
    if score < 70:  return f"Currently at {score:.0f}%. Continue guided practice."
    return f"Currently at {score:.0f}%. Ready for harder questions."
```

### Recomputing after a quiz — where the magic shows

```python
def recompute(db, user_id):
    old = {i.topic_id: i.status for i in get_path(db, user_id)}
    new_items = build_path(db, user_id)
    save(db, new_items)

    changes = [
        {"topic": name_of(i.topic_id),
         "from":  old.get(i.topic_id),
         "to":    i.status,
         "reason": i.reason}
        for i in new_items
        if old.get(i.topic_id) and old[i.topic_id] != i.status
    ]
    return {"path_changed": bool(changes), "path_changes": changes}
```

`path_changes` is returned from `/api/quiz/submit`. When it is non-empty, the UI shows a toast:

> **Your learning path changed.** Functions is locked again — Loops dropped to 37%.

That toast is worth more to a judge than any chart on the dashboard.

---

## 5. Next Best Learning Action — `adaptive_engine.next_best_action()`

### The rule ladder (first match wins)

```
INPUT: learner snapshot

R0  No materials uploaded AND no diagnostic
       → action: take_diagnostic
       → reason: "Start with a short diagnostic so we can map what you already know."

R1  Diagnostic not done
       → action: take_diagnostic

R2  Last attempt dropped mastery by more than 8 points
       → action: revise (that topic)
       → reason: "{Topic} fell from {before}% to {after}%.
                  {n} of {total} wrong answers involved {top_concept}."

R3  Any UNLOCKED topic with mastery < 40
       → action: practice_easy (weakest such topic)
       → reason: "{Topic} is your weakest area at {m}%.
                  Recent mistakes were in {concepts}."

R4  Current topic mastery in 40–69
       → action: practice_medium
       → reason: "{Topic} is at {m}%. Medium practice will consolidate it."

R5  Current topic mastery in 70–84
       → action: practice_hard
       → reason: "{Topic} is at {m}%. You're ready for harder questions."

R6  Current topic mastery ≥ 85 and next topic's prerequisite satisfied
       → action: advance
       → reason: "{Topic} mastered at {m}%. Moving on to {NextTopic}."

R7  No materials uploaded
       → action: upload_material
       → reason: "Upload your notes so answers can be grounded in your own syllabus."

R8  ≥ 3 unreviewed wrong answers
       → action: review_mistakes
       → reason: "You have {n} unreviewed mistakes across {topics}."

R9  All topics ≥ 70
       → action: mock_test
       → reason: "You're competent across all topics. Time for a full mock test."

R10 Fallback
       → action: learn (current topic)
```

### Implementation shape

```python
def next_best_action(db, user_id):
    s = build_snapshot(db, user_id)

    if not s.diagnostic_done:
        return _action("take_diagnostic", None,
                       "Start with a short diagnostic so we can map what you already know.")

    last = latest_attempt(db, user_id)
    if last and (last.mastery_after - last.mastery_before) < -TREND_DELTA:
        tags = weak_concepts(db, user_id, last.topic_id, limit=2)
        return _action(
            "revise", last.topic_id,
            f"{name_of(last.topic_id)} fell from {last.mastery_before:.0f}% "
            f"to {last.mastery_after:.0f}%. "
            f"Most mistakes involved {', '.join(tags)}.",
            difficulty="easy",
            evidence={"mastery_before": last.mastery_before,
                      "mastery_after":  last.mastery_after,
                      "concept_tags":   tags},
        )

    weakest = weakest_unlocked_topic(db, user_id)
    if weakest and weakest.mastery < 40:
        tags = weak_concepts(db, user_id, weakest.topic_id, limit=2)
        return _action("practice_easy", weakest.topic_id,
                       f"{weakest.topic} is your weakest area at {weakest.mastery:.0f}%."
                       + (f" Recent mistakes were in {', '.join(tags)}." if tags else ""),
                       difficulty="easy")

    cur = current_topic(db, user_id)
    if cur:
        m = cur.mastery
        if m < 70:
            return _action("practice_medium", cur.topic_id,
                           f"{cur.topic} is at {m:.0f}%. Medium practice will consolidate it.",
                           difficulty="medium")
        if m < 85:
            return _action("practice_hard", cur.topic_id,
                           f"{cur.topic} is at {m:.0f}%. You're ready for harder questions.",
                           difficulty="hard")
        nxt = next_unlockable_topic(db, user_id)
        if nxt:
            return _action("advance", nxt.topic_id,
                           f"{cur.topic} mastered at {m:.0f}%. Moving on to {nxt.topic}.")

    if s.materials_count == 0:
        return _action("upload_material", None,
                       "Upload your notes so answers can be grounded in your own syllabus.")

    return _action("mock_test", None,
                   "You're competent across all topics. Time for a full mock test.")
```

### Non-negotiable rule for the `reason` string

> **Every `reason` must contain at least one number that came out of the database.**

Not *"You should practice loops."*
But *"Loops is at 37% and dropped 8 points in your last quiz."*

If you can generate the sentence without querying the database, it is not explainable AI — it is a template. When a judge asks *"is this recommendation real or hardcoded?"*, the numbers in the sentence are the proof.

---

## 6. Quiz engine — `quiz_engine`

### Topic selection

```python
def select_topic(db, user_id, requested_topic_id=None):
    if requested_topic_id:
        return requested_topic_id                  # student chose explicitly

    action = next_best_action(db, user_id)         # engine-driven default
    if action["topic_id"]:
        return action["topic_id"], action["reason"]

    weakest = weakest_unlocked_topic(db, user_id)
    return weakest.topic_id, f"{weakest.topic} is your weakest unlocked topic."
```

### Difficulty selection

```python
def select_difficulty(mastery, trend, last_difficulty=None):
    if mastery < 40:  base = "easy"
    elif mastery < 70: base = "medium"
    else:              base = "hard"

    # Two consecutive failures at a level → step down, don't grind the student
    if trend == "declining" and base != "easy":
        base = "medium" if base == "hard" else "easy"

    # Strong improvement at easy → step up
    if trend == "improving" and base == "easy" and mastery > 30:
        base = "medium"

    return base
```

This is what makes *"difficulty adapts to performance"* a true statement rather than a slide bullet. Rajshree must verify both branches at H17.

### Generation (grounded)

```python
def generate_quiz(db, user_id, topic_id, difficulty, n=5):
    topic   = get_topic(db, topic_id)
    context = rag_service.search(user_id, topic.name, k=3)   # ground in their material
    tags    = weak_concepts(db, user_id, topic_id, limit=3)  # target known mistakes

    prompt = QUIZ_PROMPT.format(
        topic=topic.name, difficulty=difficulty, count=n,
        context="\n\n".join(c.text for c in context) or "(no uploaded material)",
        focus_concepts=", ".join(tags) or "core concepts",
    )
    try:
        data = safe_json(llm_service.generate(prompt))
        return data["questions"]
    except Exception:
        return fallback_bank(topic.slug, difficulty, n)      # Manthan's JSON file
```

Targeting `focus_concepts` at the student's known weak tags is a small detail with big demo value: the questions the system asks are aimed at the specific mistakes the student has already made.

---

## 7. The learner snapshot — `learner_model.build_snapshot()`

The single most important function in the codebase. Everything reads from it.

```python
def build_snapshot(db, user_id) -> LearnerSnapshot:
    profile  = get_profile(db, user_id)
    mastery  = get_all_mastery(db, user_id)              # ordered by topic order
    attempts = recent_attempts(db, user_id, limit=5)

    scored = [m for m in mastery if m.attempts > 0]
    overall = round(sum(m.mastery_score for m in scored) / len(scored), 1) if scored else 0.0

    return LearnerSnapshot(
        user               = profile.user,
        academic_level     = profile.academic_level,
        subject            = profile.subject,
        goal               = profile.goal,
        experience_level   = profile.experience_level,
        study_time_minutes = profile.study_time_minutes,
        diagnostic_done    = profile.diagnostic_done,
        current_topic      = current_topic(db, user_id),
        overall_mastery    = overall,
        mastery            = [to_dto(m) for m in mastery],
        strengths          = [m.topic for m in scored if m.mastery_score >= 70][:3],
        weaknesses         = [m.topic for m in scored if m.mastery_score <  50][:3],
        recent_trend       = compute_trend(attempts),
        recent_mistake_tags= weak_concepts(db, user_id, limit=4),
        streak_days        = compute_streak(db, user_id),
        total_quizzes      = len(attempts),
        materials_count    = count_materials(db, user_id),
    )
}
```

**Rule: no route, prompt or engine function may read `topic_mastery` directly.** Everything goes through `build_snapshot()`. One source of truth means one place to fix a bug at 4am.

---

## 8. Prompt integration — how the snapshot reaches Gemini

```python
def format_learner_block(s: LearnerSnapshot) -> str:
    lines = [
        f"Level: {s.experience_level}",
        f"Goal: {s.goal}",
        f"Current topic: {s.current_topic.name if s.current_topic else 'not set'}",
        f"Overall mastery: {s.overall_mastery}%",
        "Topic mastery: " + ", ".join(f"{m['topic']} {m['mastery']:.0f}%"
                                      for m in s.mastery if m["attempts"] > 0),
        f"Strengths: {', '.join(s.strengths) or 'none yet'}",
        f"Weaknesses: {', '.join(s.weaknesses) or 'none yet'}",
        f"Recent trend: {s.recent_trend}",
        f"Recent mistakes: {', '.join(s.recent_mistake_tags) or 'none recorded'}",
    ]
    return "\n".join(lines)
```

### Adaptation rules block (goes into every tutor prompt)

```
ADAPTATION RULES
  If mastery < 40:
      simple language, one analogy, one minimal example,
      finish with a very easy check question.
  If mastery 40–70:
      normal explanation, one worked example, one practice question.
  If mastery > 70:
      concise, focus on edge cases and common mistakes.

  If goal = "Semester Exam":
      frame for exams, mention likely exam questions.
  If goal = "Interview":
      add an interview-style question and discuss trade-offs.
  If goal = "Project":
      practical, code-first, show real usage.

  If recent trend = declining:
      be encouraging, slow down, revisit fundamentals.

  Use MATERIAL when relevant and name the file it came from.
  If MATERIAL is empty or irrelevant, answer from general knowledge
  and say so explicitly. Never invent content about the student's files.
```

### Sanity check to run at H14

Call `/api/chat` with the same question for two accounts and diff the answers.

| | Student A | Student B |
|---|---|---|
| Profile | beginner / Exam / Functions 35% | intermediate / Interview / Functions 85% |
| Expected | analogy, tiny example, easy check question | concise, edge cases, interview question |

If the two outputs look similar, the fault is almost always one of three things: the snapshot isn't reaching the prompt, the adaptation rules are too vague, or the rules are buried at the top of a long prompt instead of near the question. Check in that order.

---

## 9. Testing the engine without the UI

Write this at H16. It takes ten minutes and pays for itself immediately.

```python
# backend/test_engine.py
from app.database import SessionLocal
from app.services import mastery_service, adaptive_engine, path_service

db, USER = SessionLocal(), 1

def show(label):
    a = adaptive_engine.next_best_action(db, USER)
    print(f"\n=== {label} ===")
    print("action:", a["action_type"], "| topic:", a["topic"])
    print("reason:", a["reason"])
    for i in path_service.get_path(db, USER):
        print(f"  {i.status:<12} {i.topic:<14} {i.mastery:>5.1f}%")

show("initial")

print("\n>> simulating a BAD quiz on Loops (1/5 easy)")
mastery_service.update_mastery(db, USER, topic_id=5, correct=1, total=5, difficulty="easy")
path_service.recompute(db, USER)
show("after failure")

print("\n>> simulating a GOOD quiz on Loops (5/5 medium)")
mastery_service.update_mastery(db, USER, topic_id=5, correct=5, total=5, difficulty="medium")
path_service.recompute(db, USER)
show("after success")
```

**Expected output:** the action changes, the reason changes, and at least one path status flips. If it doesn't, the adaptive loop is broken — and you would rather find that out in a terminal at hour 16 than on a projector at hour 24.

---

## 10. Judge-facing summary

> *"The LLM generates language. Our engine makes the decisions.*
>
> *We maintain a mastery score per topic, updated with an exponential moving average weighted by question difficulty — so four out of five on hard questions moves the score differently from four out of five on easy ones.*
>
> *A rule ladder over that model decides the single next best action, and every recommendation is explained with the actual numbers behind it. Topics gate on prerequisites, so failing loops re-locks functions — live, as you just saw.*
>
> *You could swap Gemini for any other model and the adaptive behaviour would be unchanged. That's the difference between an adaptive learning system and a chatbot with a nice UI."*
