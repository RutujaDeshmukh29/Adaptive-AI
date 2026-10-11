# 02 — Team Roles, Responsibilities & Hackathon History

## 👥 Team SkillMatrix

AdaptEd AI is developed by **Team SkillMatrix** as a competitive, multi-hackathon Smart Education and adaptive learning platform.

---

## Team Roster & Core Responsibilities

| Team Member         | Role                                        | Key Responsibilities                                                                                                     |
| ------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **Rutuja Deshmukh** | **Project Lead & Full-Stack AI Developer**  | Led the project and handled the primary development of the application, including frontend, backend, and AI integration. |
| **Prathamesh**      | UI Developer                                | Developed the UI pages and contributed to the application's user interface.                                              |
| **Rajshree**        | UI Development Support                      | Assisted Prathamesh with UI design and implementation.                                                                   |
| **Aaryan**          | Research & Documentation                    | Contributed to technical research and project documentation.                                                             |
| **Utkarsha**        | Documentation, Presentation & Poster Design | Contributed to project documentation, presentation preparation, and poster design.                                       |
| **Manthan**         | Project Support & Event Coordination (Tech Fusion) | Supported the team with event coordination, presentation updates, and logistics during the Tech Fusion hackathon.        |

---

## 🏆 Hackathon Participations

### Tech Fusion 24H Hackathon 2026

* **Project**: AdaptEd AI — Personalized AI Learning Assistant
* **Domain**: Smart Education
* **Category**: Software
* **Team Members**: Rutuja Deshmukh, Rajshree, Prathamesh, Manthan
* **Result**: Participation

### AITHON 2.0 — National-Level Hackathon 2026

* **Project**: AdaptEd AI — Personalized AI Learning Assistant
* **Domain**: Smart Education / EdTech
* **Category**: Software
* **Team Members**: Rutuja Deshmukh, Rajshree, Prathamesh, Aaryan, Utkarsha
* **Stage**: Selected as a Grand Finale finalist

> *Update the AITHON result after the finale.*

---

## Detailed Member Task Breakdowns

### 👩‍💻 Rutuja Deshmukh — Project Lead & Full-Stack AI Developer

**Mandate**: Architecture, backend, frontend integration, adaptive learning engine, and end-to-end technical execution.

- **System Architecture**:
  - Designed the end-to-end system architecture linking Next.js 16 (App Router), FastAPI, ChromaDB, and PostgreSQL/Supabase.
  - Implemented the database schema (users, profiles, topics, user_mastery, quizzes, quiz_attempts, learning_paths, notes).
- **Backend Development (FastAPI)**:
  - Auth system: JWT token issuance, password hashing (`passlib`/`bcrypt`), protected router dependencies.
  - REST API surface across `/auth`, `/profile`, `/adaptive`, `/quiz`, `/notes`, `/rag`.
  - Built SQLite/PostgreSQL failover and asynchronous database connectivity.
- **AI & Adaptive Engine**:
  - Implemented the Difficulty-Weighted Exponential Moving Average (EMA) mastery calculation engine.
  - Implemented the Next Best Learning Action (NBLA) recommendation algorithm.
  - Built the prerequisite gating engine for dynamic learning paths (re-locking downstream nodes upon prerequisite regression).
  - Designed structured Gemini API prompts with strict JSON schema validation, error correction, and fallback safety layers.
- **RAG (Retrieval-Augmented Generation) Pipeline**:
  - Ingestion pipeline with PyMuPDF document extraction and sentence-aware chunking.
  - ChromaDB vector store integration with Sentence Transformers embeddings.
  - Hybrid context injection into Gemini tutoring queries with citation metadata.
- **Frontend Core & Integration**:
  - Integrated Next.js client-side services with backend REST APIs.
  - Handled JWT session state and route protection.
  - Resolved cross-origin, export, and SVG-to-Canvas rasterization issues.

---

### 🎨 Prathamesh — UI Developer

**Mandate**: User experience design, page implementation, interactive visualizations, and component styling.

- **Frontend Page Development**:
  - Built core Next.js application routes:
    - `/dashboard`: Real-time analytics, mastery progress rings, and quick action cards.
    - `/visualizer`: Interactive Mermaid diagrams with dynamic type toggling (Flowchart, Mindmap, Concept Map, Dependency Graph) and image export utilities.
    - `/knowledge-map`: Interactive node-based curriculum dependency visualization.
    - `/diagnostic` & `/quiz`: Adaptive assessment interfaces with timers, option selectors, and immediate feedback.
    - `/assistant`: Adaptive AI tutor chat interface with source citation badges.
    - `/materials`: Note upload and document ingestion manager.
    - `/learning-path`: Dynamic path tracker reflecting prerequisite gating.
- **UI Components & Styling**:
  - Developed responsive components using Tailwind CSS and Radix UI primitives.
  - Integrated Recharts for mastery analytics, score trends, and difficulty distribution graphs.
  - Ensured dark/light theme consistency, polished typography, and intuitive navigation.

---

### 🖌️ Rajshree — UI Development Support & QA

**Mandate**: UI development assistance, layout polishing, responsiveness, and end-to-end testing.

- **UI Development Support**:
  - Assisted Prathamesh in developing frontend layouts and component styles.
  - Optimized UI for different screen sizes, mobile viewports, and projector resolutions.
  - Crafted loading skeletons, error fallbacks, and intuitive empty states across all pages.
- **Quality Assurance & Verification**:
  - Performed cross-browser testing across Chrome, Edge, and Firefox.
  - Conducted edge-case testing: invalid inputs, empty notes, rapid quiz submissions, and token expiration handling.
  - Verified personalization divergence: validated that beginner and advanced profiles receive distinctly tuned AI responses.

---

### 🔬 Aaryan — Research & Documentation

**Mandate**: Academic and technical research, educational frameworks, and technical documentation.

- **Pedagogical & Technical Research**:
  - Researched adaptive learning models, Bloom's Taxonomy progressions, and Item Response Theory (IRT) / Bayesian Knowledge Tracing (BKT) foundations.
  - Analyzed competitive platforms (Khan Academy, Duolingo, Coursera) to define AdaptEd AI's unique value proposition: adapting around the student's own uploaded notes.
  - Synthesized UNESCO guidelines on Responsible Generative AI in education for privacy and algorithmic transparency.
- **Documentation Engineering**:
  - Authored and maintained technical specifications (`04_API_CONTRACT.md`, `05_ADAPTIVE_ENGINE_SPEC.md`).
  - Documented feature specifications (`FEATURES.md`) and page-by-page test cases (`PAGE_BY_PAGE_TEST_GUIDE.md`).
  - Formatted repository guides for seamless developer onboarding and reproducible setup.

---

### 📢 Utkarsha — Documentation, Presentation & Poster Design

**Mandate**: Visual branding, pitch deck creation, poster design, and hackathon presentation delivery.

- **Presentation & Pitch Decks**:
  - Designed the pitch deck highlighting problem statement, adaptive loop, technical architecture, and impact.
  - Created high-impact visual slides explaining the 6-stage adaptive cycle (Assess → Profile → Personalize → Learn → Measure → Adapt).
  - Scripted timing guidelines for hackathon pitch presentations (timed under 5–6 minutes).
- **Poster Design & Visual Collateral**:
  - Designed official exhibition and showcase posters for hackathon booths and judging stalls.
  - Created architectural diagrams and product showcase graphics.
- **Showcase Materials**:
  - Coordinated submission deliverables, project abstracts, and summary sheets.
  - Prepared judge demonstration walkthrough notes and Q&A talking points.

---

### 📋 Manthan — Project Support & Coordination (Tech Fusion)

**Mandate**: Side role support, event coordination, presentation assistance, and team logistics during the Tech Fusion hackathon.

- **Event Coordination & Logistics**:
  - Assisted the team with event schedule tracking and time checkpoints during the 24-hour Tech Fusion sprint.
  - Provided logistics assistance and team support throughout the event.
- **Presentation Support**:
  - Assisted with initial slide deck updates and formatting.
  - Supported preparation for hackathon submission deliverables.

---

## 🎤 Who Answers What During Judging

| Question Area | Primary Responder | Supporting Responder |
|---|---|---|
| **System Architecture & AI Integration** | Rutuja Deshmukh | Prathamesh |
| **Adaptive Engine & Mastery Maths** | Rutuja Deshmukh | Aaryan |
| **UI/UX Design, Components & Pages** | Prathamesh | Rajshree |
| **Frontend Responsiveness & QA Testing** | Rajshree | Prathamesh |
| **Research Foundation & Educational Impact** | Aaryan | Utkarsha |
| **Pitch Presentation, Poster & Problem Scope** | Utkarsha | Rutuja Deshmukh |
| **"Is this just a wrapper around Gemini?"** | **Rutuja Deshmukh** (Explains that Gemini writes text, while our internal engine owns all mastery models, prerequisite gating, and pedagogical decisions) | Aaryan |

---

## Core Pitch Sentence

Every team member should know the core concept by heart:

> **"AdaptEd AI maintains a live mastery model of what each student knows, and generates every explanation, practice question, and recommendation from that model — so when performance changes, the entire learning journey adapts with it."**
