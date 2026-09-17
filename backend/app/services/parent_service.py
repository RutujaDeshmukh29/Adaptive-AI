from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Dict, Any, List, Optional
from datetime import datetime, date

from app.models.user import User
from app.models.learner_profile import LearnerProfile
from app.models.parent_student_link import ParentStudentLink
from app.models.quiz import QuizAttempt
from app.services.learner_model import build_snapshot
from app.services.activity_service import get_student_activities, get_today_study_stats
from app.services.llm_service import generate_chat_response

PARENT_ADVISOR_PROMPT = """
You are an empathetic, insightful educational mentor speaking directly to a parent about their child's learning progress on AdaptEd AI.
Tone: Warm, encouraging, non-technical, and actionable.

Student Information:
- Name: {student_name}
- Subject: {subject}
- Goal: {goal}
- Academic Level: {level}
- Overall Subject Mastery: {overall_mastery}%
- Strengths: {strengths}
- Weaknesses & Tricky Topics: {weaknesses}
- Recent Activity Summary: {recent_activities}

Generate a concise 3-part update specifically for the parent in clean Markdown:

### 🌟 This Week's Highlights
Explain what {student_name} did well, which topics they practiced or mastered, and celebrate their effort.

### 💡 Where They Need Encouragement
Explain their current challenge without technical jargon. Reassure the parent that this is a normal learning milestone.

### 💬 Parent Conversation Starter
Give the parent ONE specific, engaging question or fun analogy they can share at dinner or over the weekend to support their child.
"""

def get_linked_students(db: Session, parent_id: int) -> List[Dict[str, Any]]:
    """Returns all students linked to this parent."""
    links = db.query(ParentStudentLink).filter(ParentStudentLink.parent_id == parent_id).all()
    student_ids = [l.student_id for l in links]

    students = db.query(User).filter(User.id.in_(student_ids)).all() if student_ids else []
    
    results = []
    for s in students:
        profile = db.query(LearnerProfile).filter(LearnerProfile.user_id == s.id).first()
        subject = profile.subject if profile else "General"
        goal = profile.goal if profile else "Standard"
        
        try:
            snapshot = build_snapshot(db, s.id)
            mastery = snapshot.overall_mastery
        except Exception:
            mastery = 0.0

        results.append({
            "id": s.id,
            "name": s.name,
            "email": s.email,
            "link_code": s.link_code,
            "subject": subject,
            "goal": goal,
            "overall_mastery": mastery
        })
    return results

def link_student(db: Session, parent_id: int, code_or_email: str) -> Dict[str, Any]:
    """Links a parent to a student using link_code or email."""
    target_code = code_or_email.strip().upper()
    student = db.query(User).filter(
        (User.link_code == target_code) | (User.email == code_or_email.strip().lower())
    ).first()

    if not student:
        raise ValueError("Student not found with this Parent Link Code or email.")

    if student.id == parent_id:
        raise ValueError("Cannot link an account to itself.")

    # Check existing link
    existing = db.query(ParentStudentLink).filter(
        ParentStudentLink.parent_id == parent_id,
        ParentStudentLink.student_id == student.id
    ).first()

    if existing:
        return {"status": "already_linked", "student_name": student.name, "student_id": student.id}

    link = ParentStudentLink(parent_id=parent_id, student_id=student.id)
    db.add(link)
    db.commit()

    return {"status": "linked", "student_name": student.name, "student_id": student.id}

def generate_parent_report(db: Session, student_id: int) -> Dict[str, Any]:
    """Compiles the full live parent dashboard report."""
    student = db.query(User).filter(User.id == student_id).first()
    if not student:
        raise ValueError("Student not found")

    profile = db.query(LearnerProfile).filter(LearnerProfile.user_id == student_id).first()
    if not profile:
        raise ValueError("Student profile not yet initialized")

    snapshot = build_snapshot(db, student_id)
    today_stats = get_today_study_stats(db, student_id)
    activities = get_student_activities(db, student_id, limit=12)

    # Get recent quizzes
    recent_quizzes = (
        db.query(QuizAttempt)
        .filter(QuizAttempt.user_id == student_id, QuizAttempt.score != None)
        .order_by(desc(QuizAttempt.created_at))
        .limit(5)
        .all()
    )

    quiz_history = []
    for q in recent_quizzes:
        quiz_history.append({
            "id": q.id,
            "score": float(q.score) if q.score is not None else 0.0,
            "difficulty": q.difficulty,
            "mastery_before": q.mastery_before or 0.0,
            "mastery_after": q.mastery_after or 0.0,
            "date": q.created_at.strftime("%b %d, %Y") if q.created_at else "Recently"
        })

    # Prepare AI Advisor Prompt
    recent_activity_summary = "; ".join([a["description"] for a in activities[:5]]) if activities else "Practicing fundamentals"
    strengths_str = ", ".join(snapshot.strengths) if snapshot.strengths else "Foundational concepts"
    weaknesses_str = ", ".join(snapshot.weaknesses) if snapshot.weaknesses else "Exploring new topics"

    prompt = PARENT_ADVISOR_PROMPT.format(
        student_name=student.name,
        subject=profile.subject,
        goal=profile.goal,
        level=profile.academic_level,
        overall_mastery=snapshot.overall_mastery,
        strengths=strengths_str,
        weaknesses=weaknesses_str,
        recent_activities=recent_activity_summary
    )

    # Generate AI Advisor Note with fallback
    try:
        ai_advisor_text = generate_chat_response(prompt)
    except Exception as e:
        print(f"Gemini advisor generation fallback: {e}")
        ai_advisor_text = f"""### 🌟 This Week's Highlights
{student.name} has been steadily studying {profile.subject} and currently holds an overall mastery score of {snapshot.overall_mastery:.0f}%.

### 💡 Where They Need Encouragement
They are currently solidifying topics in {weaknesses_str}. Frequent practice with short quizzes will build their speed and confidence.

### 💬 Parent Conversation Starter
Ask {student.name}: *"What was the coolest thing you learned in your {profile.subject} notes today?"*
"""

    return {
        "student": {
            "id": student.id,
            "name": student.name,
            "email": student.email,
            "link_code": student.link_code,
            "subject": profile.subject,
            "goal": profile.goal,
            "academic_level": profile.academic_level,
            "study_time_goal": profile.study_time_minutes,
            "streak_days": snapshot.streak_days,
            "overall_mastery": snapshot.overall_mastery
        },
        "today_stats": today_stats,
        "mastery_map": [
            {
                "topic_id": m.topic_id,
                "topic": m.topic,
                "mastery": m.mastery,
                "band": m.band
            }
            for m in snapshot.mastery
        ],
        "strengths": snapshot.strengths,
        "weaknesses": snapshot.weaknesses,
        "recent_trend": snapshot.recent_trend,
        "activities": activities,
        "quiz_history": quiz_history,
        "ai_advisor": ai_advisor_text,
        "generated_at": datetime.now().strftime("%B %d, %Y at %I:%M %p")
    }
