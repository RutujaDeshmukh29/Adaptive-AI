# 07 — Presentation Script (TECHFUSION Pitch Deck)

**Total run time: ~6 minutes.** Six slides, one story: a struggling student walks in at the start, and by the close, the room understands exactly why that student needed something no other platform gives them.

**Default speaker split:** Prathamesh narrates start to finish, and hands off to Rutuja for Slide 3 only — architecture questions naturally belong to whoever built it, and a voice change at the technical slide quietly tells the judges *this team has real depth, not one spokesperson carrying a script.* If your event wants all four members visibly on stage, swap notes are given under Slides 4 and 5.

Read the **bold body text** aloud almost verbatim — it's been timed. *Italic lines* are delivery notes, not spoken words.

---

## SLIDE 1 — Title: "ADAPTED AI"

**Speaker: Prathamesh** · *~35 seconds*

*Stand center. Make eye contact with the panel before your first word — don't start talking while still walking to position.*

> **"Good [morning/afternoon], judges. We are Team SkillMatix, and this is AdaptEd AI — built for the Smart Education theme, under Problem Statement 1: the Personalized AI Learning Assistant. I'm Prathamesh. With me are Rutuja, Rajshree and Manthan, from MET Bhujbal Knowledge City, Institute of Engineering."**

*Pause half a second. Drop your voice slightly — shift from formal introduction into story mode.*

> **"Before I tell you what we built, I want to ask you something. Think back to a class where the lecture moved too fast for you — but too slow for the student next to you. Everyone in this room has been that student at some point. That gap is the entire problem we spent this hackathon trying to close."**

---

## SLIDE 2 — Idea Title

**Speaker: Prathamesh** · *~75 seconds*

*Advance the slide as you say "close." Let the diagram sit on screen for a beat before you speak over it.*

> **"Every learning platform today does the same thing: one piece of content, one difficulty level, one pace — handed to every student in the room, regardless of who they actually are. AdaptEd AI does something different. Not a fixed study plan. A learning journey that adapts to you."**

*Point to the six-stage loop in the center of the diagram as you name it.*

> **"At the center sits our Adaptive Learning Engine, running six steps on a loop: Assess, Profile, Personalize, Learn, Measure, Adapt. On the left, it takes in two things — the student's own learning material, and their profile and goals. On the right, it produces four things back — a conversational AI assistant, a personalized learning path, adaptive practice, and progress tracking."**

*Move to the "Innovation & Uniqueness" panel.*

> **"But here's the part that actually matters. Most tools generate a study plan once, at the start, and never touch it again. Ours doesn't. Student performance flows into the engine, the engine re-analyzes exactly where that student stands, and it decides the next best learning action — every single time. The plan doesn't just exist. It changes with new evidence."**

---

## SLIDE 3 — Technical Approach

**Speaker: hands off to Rutuja** · *~85 seconds*

*Prathamesh, one sentence to hand off — don't over-explain the transition, just make it clean.*

> **Prathamesh: "Rutuja led the architecture — I'll let her walk you through how it actually works."**

*Rutuja steps forward. Slower pace than Prathamesh — this is the credibility beat, not the hype beat.*

> **"Think of it like a GPS. A normal study app is a GPS that gives you directions once, at the start of the trip, and never looks at the road again. Ours recalculates — not when you signal a turn, but the moment you actually take a wrong one."**

*Trace the diagram left to right with your hand as you speak.*

> **"On the left, a student's learning material — PDFs, notes, textbooks — goes through our RAG pipeline: PyMuPDF extracts the text, we chunk it, convert it into embeddings with Sentence Transformers, and store it in ChromaDB. That means every answer the assistant gives is grounded in that student's own syllabus, not generic internet knowledge."**

> **"In parallel, a diagnostic assessment measures where the student actually stands, topic by topic. Both feed into the center of this diagram — the Dynamic Learner Model: topic mastery, strengths and weaknesses, current level, and learning goals. That model is the single source of truth the rest of the system reads from."**

> **"The Adaptive AI Engine — Gemini API plus that retrieved context — turns the model into three personalized outputs: a chat assistant that answers differently depending on who's asking, a learning path that reorders itself, and a quiz engine whose difficulty tracks the student in real time."**

> **"And then the loop closes: learn, practice, measure, analyze the gaps, update the profile, adapt again. That feedback loop — not any single AI call — is what makes this adaptive rather than just personalized once."**

*Hand back with one line.*

> **Rutuja: "Back to Prathamesh for what this actually means in practice."**

---

## SLIDE 4 — Feasibility and Viability

**Speaker: Prathamesh** (or swap to **Rajshree**, if you want the QA/testing lead to own the risk conversation — she's the one who actually broke things trying to find these gaps) · *~55 seconds*

> **"None of this works if it can't actually be built in the time we have, or run without a server farm behind it. So we were deliberate about staying feasible. Every technology here — Next.js, FastAPI, Gemini, ChromaDB, PostgreSQL — is mature and freely accessible. The architecture is modular by design, so frontend, backend, the AI layer and the learner model can each be built and tested independently — which is exactly what let a four-person team split this work in 24 hours."**

*Shift tone slightly — slower, more serious. This is the "we thought about what could go wrong" beat, and judges notice when a team volunteers its own risks instead of waiting to be asked.*

> **"We also looked honestly at what could break. RAG retrieval can miss context. Language models can hallucinate. An external API can rate-limit at the worst possible moment. Student data needs real protection. And early on, we simply don't have much data to model a learner from."**

> **"So we built mitigations directly into the design — validating retrieval before trusting it, collecting the minimum data necessary by default, and treating feedback and evaluation as a continuous part of the system, not an afterthought. Low infrastructure, modular, and scalable — that's not a slogan for us, it's how we built it."**

---

## SLIDE 5 — Impact and Benefits

**Speaker: Prathamesh** (or swap to **Manthan**, if he's presenting — this slide is the human story, and he's spent the most time thinking about what students actually experience) · *~55 seconds*

*Callback moment — return to the student from your opening hook.*

> **"Remember that student from the start — the one the lecture moved too fast or too slow for? This is where they land. Assessment leads to a learner profile, which leads to personalized learning, targeted practice, and continuous adaptation — and what comes out the other end is better understanding, better engagement, and better retention."**

> **"For students, that means a path built around their actual goals, and a clear picture of exactly where they're weak. For educators, it means visibility — which students are struggling, and where, without hours of manual tracking. For institutions, it means scalable, data-driven learning support across an entire student population, not just the students who happen to ask for help."**

*Slow down for the last line of this slide — let it be a statement, not a list item.*

> **"Zoom out far enough, and this isn't just a feature. It's more equitable access to quality education, for every learner — regardless of where they started."**

---

## SLIDE 6 — Research and References + Conclusion

**Speaker: Prathamesh** · *~50 seconds*

> **"We didn't build this on instinct alone. Our approach rests on five research foundations — adaptive learning, learner modelling, adaptive assessment, AI-powered personalization, and responsible generative AI — backed by recent work from ScienceDirect, Springer, and UNESCO's own guidance on GenAI in education."**

*Move to the conclusion box. This is your closing line — the one thing you want them to remember. Slow all the way down. Let it land in silence for a second before you say thank you.*

> **"So here's what we actually believe: same subject does not mean same learner, and same learner does not mean same learning path. Learn, measure, adapt, improve — that loop is the product."**

*Beat.*

> **"That's AdaptEd AI. Thank you."**

---

## Delivery notes

- **Pace:** Slides 1, 4 and 6 can move briskly — they're context and credibility. Slides 2, 3 and 5 are where the judges decide whether they're impressed; slow down there, especially on the sentences marked as callback or closing lines.
- **Eye contact:** Land the two lines *"That gap is the entire problem..."* and *"same subject does not mean same learner"* while looking at the panel, not the slide. Those are the two lines you want them repeating back to you in Q&A.
- **The Rutuja handoff:** Don't announce it as a formality ("now my teammate will talk about the tech"). Say it like you mean it — she built it, she should be the one explaining it. Judges read confidence in how a team hands off, not just in what's said.
- **Silence is a tool.** The half-second pauses marked above aren't padding — a pitch that never breathes sounds rehearsed in the wrong way. A pitch with two deliberate silences sounds like people who believe what they're saying.
- **If you're cut short:** Slides 2, 3 and 6 are the ones to protect. If a timer forces a cut, compress Slide 4 into one sentence — *"Everything here is low-infrastructure, modular and scalable, and we've already mapped our biggest risks and how we handle them"* — and move straight to Impact.


