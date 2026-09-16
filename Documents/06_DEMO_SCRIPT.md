# 06 — Demo Script & Judge Q&A

**Target: 4 minutes of demo, 2–3 minutes of questions.**

Judges see dozens of projects. Most of them will be chatbots. Your entire job is to make one thing unmistakable within the first 30 seconds: **this system watches the student and changes.**

---

## Roles during the demo

| Role | Person | Job |
|---|---|---|
| Narrator | **Manthan** | Talks. Never touches the laptop. |
| Driver | **Rutuja** | Clicks. Says nothing unless asked a technical question. |
| Technical answers | **Rutuja** | Architecture, engine, stack |
| Content answers | **Prathamesh** | Prompts, question generation |
| Testing answers | **Rajshree** | Edge cases, validation |

A silent screen loses the room. Someone must be speaking at all times.

---

## Pre-demo setup (do this before you are called)

- [ ] Backend running, frontend running, both verified
- [ ] **Browser window 1** — Student A, already logged in, on `/dashboard`
- [ ] **Browser window 2** — a separate profile or incognito window, Student B, logged in, on `/assistant`
- [ ] Landing page open in a third tab
- [ ] Zoom set to 100–110% (projectors clip at higher zoom)
- [ ] Notifications off, Do Not Disturb on
- [ ] Small demo PDF on the desktop, ready to drag
- [ ] Backend terminal visible somewhere — scrolling logs are quietly persuasive
- [ ] Battery charged / plugged in
- [ ] Projector tested at this resolution

---

## The script

### [0:00–0:25] The hook

> *"Two students in the same class ask the same question. Today, every learning platform gives them the same answer. We think that's the problem worth solving.*
>
> *This is AdaptEd AI — not a fixed study plan, but a learning journey that adapts to you."*

*Driver: landing page, scroll once through the adaptive loop diagram, then switch to Student A's dashboard.*

---

### [0:25–1:00] The learner model

*Driver: `/dashboard` for Student A.*

> *"This is Riya. Diploma second year, preparing for her semester exam. The system already knows what she knows — Variables 85%, Loops 45%, Functions 30%.*
>
> *These aren't decorative numbers. They came from a diagnostic she took, and they update every time she practices.*
>
> *And look at the recommendation. It doesn't just say 'study functions.' It says why."*

*Driver: point at the Next Action card's reason line.*

> *"'Functions is at 30%, and you missed both function questions in the diagnostic.' Every recommendation in this system is backed by real data, and it shows you that data."*

---

### [1:00–2:10] ⭐ The personalization proof

**This is the heart of the demo. Do not rush it.**

*Driver: Student A's `/assistant`. Type: `Explain Python functions`*

> *"Riya is a beginner preparing for an exam. Watch what she gets."*

*Answer appears — simple explanation, analogy, easy practice question.*

*Driver: point at the learner-context badge above the answer.*

> *"Notice the system is telling us how it adapted: beginner level, exam goal, Functions at 30% — so it simplified, added an analogy, and ended with an easy check question. And it pulled from her own uploaded notes, page 12."*

*Driver: switch to window 2 — Student B.*

> *"Now Arjun. Intermediate, preparing for interviews, Functions at 85%. Exact same question."*

*Driver: type the identical question: `Explain Python functions`*

*Answer appears — concise, edge cases, interview question.*

> *"Same question. Completely different answer. Deeper explanation, edge cases, and an interview-style follow-up — because the system knows he already understands the basics and knows what he's preparing for.*
>
> ***Same question. Different learner. Different learning experience.***"

> **Pause here for two full seconds.** Let it land. This is the moment judges remember.

---

### [2:10–3:20] ⭐⭐ The adaptation proof

**This is what makes you different from every "personalized AI tutor" in the room.**

*Driver: back to Student A. Open `/path`.*

> *"Here's Riya's current learning path. Variables done, Conditionals done, Loops is current, Functions locked until Loops reaches 60%."*

*Driver: open `/practice`.*

> *"The system picked this quiz itself — Loops, easy difficulty — because Loops is her weakest unlocked topic. It tells us that too."*

*Driver: point at `selection_reason`. Then take the quiz and answer deliberately badly. Submit.*

> *"Watch the mastery score."*

*Mastery delta animates: 45% → 36.6%*

> *"Forty-five to thirty-seven. Not just a quiz score — the system's actual model of what she knows just changed."*

*Toast appears: "Your learning path changed."*

> *"And now the path changed with it."*

*Driver: `/path` — Functions is locked again.*

> *"Functions was next. It's locked again, because Loops dropped below the threshold. The system didn't just record a bad score — it rearranged her learning journey.*
>
> *And the recommendation changed too."*

*Driver: `/dashboard`.*

> *"'Loops fell from 45% to 37%. Most mistakes involved the range function.' It identified the specific concept she's struggling with, not just the topic."*

---

### [3:20–4:00] The close

> *"So that's the difference.*
>
> *A chatbot answers questions. A study planner makes a plan once. AdaptEd AI keeps a live model of the learner and regenerates everything from it — the explanations, the question difficulty, the topic order, the next action.*
>
> *Under the hood: Next.js and FastAPI, Gemini for language, RAG over the student's own uploaded notes so answers come from their syllabus, and our own adaptive engine — mastery tracking with difficulty-weighted updates, prerequisite gating, and explainable recommendations.*
>
> ***AdaptEd AI doesn't create a personalized plan once. It continuously changes the learning journey as the student changes.***
>
> *Same subject, same question — different learner, different path."*

---

## Timing discipline

| Segment | Budget | If you're over |
|---|---|---|
| Hook | 0:25 | Cut the landing page scroll |
| Learner model | 0:35 | Skip the mastery list, keep the reason line |
| Personalization | 1:10 | **Never cut this** |
| Adaptation | 1:10 | **Never cut this** |
| Close | 0:40 | Drop the tech stack sentence |

**If you only have 2 minutes:** do the personalization proof and the adaptation proof. Nothing else. Those two segments are the project.

---

## If something breaks live

| Failure | Recovery line |
|---|---|
| Gemini is slow | *"It's generating a fresh response from her learner profile — this is live, not cached."* Keep talking. Do not stare at the spinner. |
| Gemini errors out | *"That's our fallback handling — we planned for API limits."* Show the fallback question bank working. **A handled failure impresses judges more than a lucky success.** |
| Page won't load | Refresh once. Keep narrating. If it fails twice, move to the next segment — never debug on stage. |
| Internet drops | Fall back to the deck's screenshots and narrate from those. You rehearsed this. |
| Wrong answer appears | *"That's the system reacting to a different learner state than I expected — let me show you the model behind it."* Open the profile. Turn it into a feature. |

**Never say:** "it worked before", "one second", "that's weird", "let me just restart."
**Always say:** the next sentence in your script.

---

## Judge Q&A

### ⚠️ "Isn't this just a wrapper around ChatGPT/Gemini?"

**The most dangerous question in the room. Rutuja answers.**

> *"Gemini writes the sentences. It doesn't make any decisions.*
>
> *What topic to ask about, what difficulty, whether to advance or revise, whether to lock a topic — all of that is our engine. It's a mastery model updated with an exponential moving average weighted by question difficulty, sitting under a rule ladder with prerequisite gating.*
>
> *You could swap Gemini for any other model and the adaptive behaviour would be identical. The LLM is a component. The engine is the product."*

### "How is this different from Khan Academy or Duolingo?"

> *"They adapt inside their own fixed content library. We adapt around the student's own material — their syllabus, their notes, their teacher's PDFs. And we're subject-agnostic: the topic graph is data, so the same engine works for any subject."*

### "How do you know the mastery score is accurate?"

> *"We don't claim clinical accuracy, and we'd be wrong to. It's an exponential moving average weighted by difficulty — recent performance dominates, history still counts, and confidence grows with the number of attempts. It's directionally correct and it's transparent: every score shows how many attempts produced it. The architecture is modular, so upgrading to Bayesian Knowledge Tracing or Item Response Theory is a change to one service, not a rewrite."*

### "What if the AI gives wrong information?"

> *"Three things. We ground answers in the student's own uploaded material through RAG and show the source file and page. When retrieval finds nothing relevant, we say so explicitly instead of pretending. And we're clear that this supports teachers, it doesn't replace them — a student can always check the cited page."*

### "What about student data privacy?"

> *"Minimal collection — name, email, learning preferences. Passwords are hashed, routes are JWT-protected, and every query is scoped to the user. Uploaded materials are per-user and deletable at any time. Learning material stays the student's."*

### "Did you build this in 24 hours?"

> *"Yes, from scratch. We came in with architecture and documentation — the plan, the API contract, the engine spec — but every line of code was written here. The planning is why we got this far in the time."*

### "What's the business/deployment model?"

> *"Institutional licensing. A college deploys it, students get adaptive support at scale, teachers get the learning-gap dashboard. Infrastructure cost is low — one LLM API, a Postgres instance, and embeddings that run locally."*

### "What would you build next, with more time?"

> *"Three things, in order. A teacher portal showing class-wide gaps — the institutional value is higher than the individual value. Multilingual support, which matters a lot in Indian classrooms. And a stronger learner model — Bayesian Knowledge Tracing instead of our EMA."*

### "What was the hardest part?"

> *"Making adaptation genuinely visible. It's easy to claim a system is personalized. It's hard to prove it on a screen in thirty seconds. That's why every recommendation carries its own reason with the actual numbers, and why the path visibly re-locks when performance drops."*

### "Does it work for subjects other than Python?"

> *"Yes. The topic graph is seeded data, not code. Add a subject's topics and prerequisites and the same engine, the same prompts and the same UI all work. We built Python because it's what we could demo credibly in 24 hours."*

---

## The one-sentence version

Every team member must be able to say this without thinking:

> **"AdaptEd AI keeps a live model of what each student knows, and generates every explanation, question and recommendation from that model — so when their performance changes, the whole learning journey changes with it."**

Say it out loud tonight. All four of you. Until it's automatic.

---

## Post-demo

- [ ] Leave the dashboard on screen, not a terminal
- [ ] Thank the judges
- [ ] Offer the repo link if they ask — have it written on a card
- [ ] Write down every question asked; the next judging round will repeat them
- [ ] Do not change code between rounds unless something is genuinely broken
