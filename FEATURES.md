# 🌟 AdaptED AI - Complete Feature Masterlist

This document serves as the master record of all features built and planned for the AdaptED AI platform.

## 🟢 Currently Built & Functioning Features

### 1. Secure Authentication & Data Isolation (JWT)
*   **Description:** A secure JSON Web Token (JWT) login system. Every student has a completely isolated database space, ensuring their uploaded documents, chat histories, and mastery scores remain entirely private and secure.

### 2. Goal-Oriented Onboarding & Profiling 🎯
*   **Description:** Upon signup, students define their Academic Level, Study Goal, Subject, and available study time. This dynamic profile acts as the "North Star" for the AI, altering how it teaches, speaks, and tests the student.
*   **Addresses:** *Developed according to their requirement.*

### 3. Local Knowledge Base & Multi-PDF Upload (RAG) 📚
*   **Description:** Students can upload their own course PDFs or syllabuses. The system uses a local vector database (ChromaDB) to process and store these documents on the backend.
*   **Addresses Data Security:** We do not send whole private documents to cloud AI servers. The local RAG pipeline ensures that only tiny, highly relevant text snippets are sent to Gemini when answering a specific question.

### 4. Hybrid AI Adaptive Chat (with Citations) 💬
*   **Description:** An interactive chat interface. The AI searches the uploaded PDFs first. If it uses the PDF, it explicitly cites the filename and page number (e.g., *"According to Physics_Notes.pdf on page 4..."*). It uses Markdown to render beautiful, syntax-highlighted code blocks.
*   **Addresses:** *User friendly UI and reliable, grounded answers.*

### 5. Instant-Feedback Quiz Engine ❓
*   **Description:** Generates custom multiple-choice quizzes strictly based on the content of the uploaded PDFs. It provides interactive, immediate feedback—highlighting answers green or red the moment they are clicked, alongside a detailed explanation.

### 6. Continuous Mastery Tracking (EMA Math) 🧠
*   **Description:** The invisible mathematical core of the platform. It uses an Exponential Moving Average (EMA) algorithm to continuously track the student's true mastery of topics based on their quiz performance, dynamically detecting specific weak sub-concepts.

### 7. Student Analytics Dashboard 📊
*   **Description:** A visually appealing home screen acting as a complete history and report of the student. It displays overall mastery percentages, daily study streaks, strong concepts, and topics that need review.
*   **Addresses:** *History of student - present reports.*

### 8. Dynamic Learning Paths (Roadmap Generator) 🗺️
*   **Description:** A step-by-step visual curriculum roadmap. Topics unlock sequentially; if a student's mastery score for "Variables" is below 70%, the subsequent "Loops" topic remains strictly locked until they prove they are ready.

---

## 🟡 Planned Features (To Be Built)

### 9. Parent Sync Portal & Activity Tracker 👨‍👩‍👧‍👦
*   **Description:** A separate login role for parents. Parents can link their accounts to their children to view a read-only dashboard.
*   **Daily Timeline:** Tracks exact timestamps of what the student studied (e.g., "10:15 AM - Took a Quiz on Thermodynamics").
*   **AI Parent Advisor:** Uses Gemini to generate a plain-English weekly summary for the parent (e.g., *"Sarah is struggling with Genetics. We recommend having her generate a cheat sheet this weekend."*)
*   **Addresses:** *Should be sync with parents of student.*

### 10. 6 Learning Modes Dropdown 🎓
*   **Description:** A dropdown in the chat allowing the student to instantly switch the AI’s personality (e.g., "Beginner", "Exam Prep", "Practical Application").

### 11. Diagram Generation (Mermaid.js) 🔀
*   **Description:** The AI can generate instant flowcharts, mind-maps, and architecture diagrams inside the chat using Mermaid.js rendering.

### 12. Smart Summaries 📋
*   **Description:** A UI feature to instantly generate a "Detailed Chapter Summary," a "Quick Cheat Sheet," or an "Explain Like I'm 5" breakdown from the PDFs.

### 13. Voice Assistant 🔊
*   **Description:** A microphone button in the chat allowing students to ask questions using their voice and hear the AI speak the answers back (using browser native Speech APIs).

### 14. Coding Challenges & Interview Prep 🏆
*   **Description:** Expands the Quiz Engine to dynamically generate coding problems or short-answer interview questions based on the student's weakest topics.

---

## 💡 Innovative Suggestions (For Extra Hackathon Polish)

*   **YouTube Video Ingestion:** Allow users to paste a YouTube link. The backend extracts the transcript and adds it to the Local Knowledge Base alongside their PDFs.
*   **Spaced Repetition Flashcards:** The AI automatically scans the PDFs and generates interactive Flashcards (like Anki) specifically for concepts the student got wrong in quizzes, scheduling them for review.
*   **Peer Benchmarking (Anonymous):** A widget on the dashboard showing the student how they compare to the average user (e.g., *"You are in the top 20% of students learning Python Variables!"*).
*   **Built-in Pomodoro Study Timer:** A beautiful study timer at the top of the screen that tracks "Focus Time" and pauses the app when it's time for a break.
