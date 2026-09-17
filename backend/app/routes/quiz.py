from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.quiz import QuizAttempt, QuizQuestion
from app.models.learner_profile import LearnerProfile
from app.models.topic import Topic
from app.deps import get_current_user
from app.schemas.quiz import QuizGenerateRequest, QuizGenerateResponse, QuizSubmitRequest
from app.services.quiz_engine import generate_quiz
from app.services.mastery_service import update_mastery
from app.services.activity_service import log_activity

router = APIRouter(prefix="/api/quiz", tags=["quiz"])

@router.post("/generate", response_model=QuizGenerateResponse)
def generate(req: QuizGenerateRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(LearnerProfile).filter(LearnerProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=400, detail="Profile not found")
        
    try:
        # Enforce valid bounds: minimum 3, maximum 20 MCQs
        quiz_count = min(20, max(3, req.count or 5))
        attempt, questions, topic_name = generate_quiz(
            db, 
            current_user.id, 
            req.topic_id, 
            req.difficulty, 
            profile.academic_level, 
            profile.goal,
            count=quiz_count
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
    return {
        "attempt_id": attempt.id,
        "topic_id": attempt.topic_id,
        "topic": topic_name,
        "difficulty": attempt.difficulty,
        "selection_reason": "Adaptive practice selected based on your recent performance.",
        "questions": [
            {
                "id": q.id,
                "question": q.question,
                "options": q.options,
                "concept_tag": q.concept_tag,
                "difficulty": q.difficulty,
                "topic_id": q.topic_id,
                "correct_index": q.correct_index,
                "explanation": q.explanation
            } for q in questions
        ]
    }

@router.post("/{attempt_id}/submit")
def submit_quiz(attempt_id: int, req: QuizSubmitRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    attempt = db.query(QuizAttempt).filter(QuizAttempt.id == attempt_id, QuizAttempt.user_id == current_user.id).first()
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")
        
    questions = db.query(QuizQuestion).filter(QuizQuestion.attempt_id == attempt_id).all()
    
    review_items = []
    for q in questions:
        selected = req.answers.get(str(q.id)) or req.answers.get(q.id)
        if selected is not None:
            q.selected_index = selected
            q.is_correct = (selected == q.correct_index)
        else:
            q.is_correct = False
            
        review_items.append({
            "question_id": q.id,
            "question": q.question,
            "your_answer": q.options[selected] if selected is not None else "No answer",
            "correct_answer": q.options[q.correct_index],
            "is_correct": q.is_correct,
            "explanation": q.explanation,
            "concept_tag": q.concept_tag
        })
        
    db.commit()
    
    # Update Mastery Math
    updated_attempt = update_mastery(db, current_user.id, attempt_id)

    # Fetch actual topic
    topic_record = db.query(Topic).filter(Topic.id == updated_attempt.topic_id).first()
    topic_name = topic_record.name if topic_record else f"Topic {updated_attempt.topic_id}"

    # Extract weak concepts from questions answered incorrectly
    weak_concepts = list({q.concept_tag for q in questions if not q.is_correct and q.concept_tag})

    # Determine adaptive next action
    if updated_attempt.score >= 70.0:
        action_type = "advance"
        action_reason = f"Excellent! You scored {updated_attempt.score:.0f}% on {topic_name}. Ready to advance!"
    elif updated_attempt.score >= 50.0:
        action_type = "practice_medium"
        action_reason = f"Good effort on {topic_name}. Practice a few more medium questions to solidify."
    else:
        action_type = "revise"
        action_reason = f"Review foundational concepts in {topic_name} and try again."

    band_after = "mastered" if updated_attempt.mastery_after >= 70 else "competent" if updated_attempt.mastery_after >= 50 else "developing" if updated_attempt.mastery_after >= 30 else "struggling"
    band_before = "mastered" if updated_attempt.mastery_before >= 70 else "competent" if updated_attempt.mastery_before >= 50 else "developing" if updated_attempt.mastery_before >= 30 else "struggling"

    delta = updated_attempt.mastery_after - updated_attempt.mastery_before
    log_activity(
        db,
        current_user.id,
        "quiz",
        topic_id=updated_attempt.topic_id,
        description=f'Completed {topic_name} Quiz: {updated_attempt.score:.0f}% (Mastery: {updated_attempt.mastery_after:.0f}%, {delta:+.0f}%)',
        result_data={
            "score": updated_attempt.score,
            "difficulty": updated_attempt.difficulty,
            "mastery_before": updated_attempt.mastery_before,
            "mastery_after": updated_attempt.mastery_after,
            "mastery_delta": delta,
            "topic": topic_name
        }
    )

    return {
        "attempt_id": updated_attempt.id,
        "topic_id": updated_attempt.topic_id,
        "topic": topic_name,
        "difficulty": updated_attempt.difficulty,
        "score": updated_attempt.score,
        "correct_count": updated_attempt.correct_count,
        "total_questions": updated_attempt.total_questions,
        "mastery_before": updated_attempt.mastery_before,
        "mastery_after": updated_attempt.mastery_after,
        "mastery_delta": updated_attempt.mastery_after - updated_attempt.mastery_before,
        "band_before": band_before,
        "band_after": band_after,
        "review": review_items,
        "weak_concepts": weak_concepts,
        "path_changed": False,
        "path_changes": [],
        "next_action": {
            "action_type": action_type,
            "topic_id": updated_attempt.topic_id,
            "topic": topic_name,
            "difficulty": updated_attempt.difficulty,
            "reason": action_reason
        }
    }
