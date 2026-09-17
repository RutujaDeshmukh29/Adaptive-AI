from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.quiz import QuizAttempt, QuizQuestion
from app.models.learner_profile import LearnerProfile
from app.deps import get_current_user
from app.schemas.quiz import QuizGenerateRequest, QuizGenerateResponse, QuizSubmitRequest
from app.services.quiz_engine import generate_quiz
from app.services.mastery_service import update_mastery

router = APIRouter(prefix="/api/quiz", tags=["quiz"])

@router.post("/generate", response_model=QuizGenerateResponse)
def generate(req: QuizGenerateRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(LearnerProfile).filter(LearnerProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=400, detail="Profile not found")
        
    try:
        attempt, questions, topic_name = generate_quiz(
            db, 
            current_user.id, 
            req.topic_id, 
            req.difficulty, 
            profile.academic_level, 
            profile.goal,
            count=3  # Short quiz for demo purposes
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
    
    return {
        "attempt_id": updated_attempt.id,
        "topic_id": updated_attempt.topic_id,
        "topic": "Topic Name", # Could be joined
        "difficulty": updated_attempt.difficulty,
        "score": updated_attempt.score,
        "correct_count": updated_attempt.correct_count,
        "total_questions": updated_attempt.total_questions,
        "mastery_before": updated_attempt.mastery_before,
        "mastery_after": updated_attempt.mastery_after,
        "mastery_delta": updated_attempt.mastery_after - updated_attempt.mastery_before,
        "band_before": "developing", # Placeholder
        "band_after": "competent", # Placeholder
        "review": review_items,
        "weak_concepts": [],
        "path_changed": False,
        "path_changes": [],
        "next_action": {
            "action_type": "learn",
            "topic_id": updated_attempt.topic_id,
            "topic": "Variables",
            "difficulty": "medium",
            "reason": "Good job! Keep learning."
        }
    }
