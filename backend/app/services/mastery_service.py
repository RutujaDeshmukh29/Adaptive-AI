from sqlalchemy.orm import Session
from app.models.topic_mastery import TopicMastery
from app.models.quiz import QuizAttempt, QuizQuestion
from app.core.constants import ALPHA_FIRST, ALPHA_REPEAT, DIFFICULTY_WEIGHT

def update_mastery(db: Session, user_id: int, attempt_id: int):
    attempt = db.query(QuizAttempt).filter(QuizAttempt.id == attempt_id).first()
    questions = db.query(QuizQuestion).filter(QuizQuestion.attempt_id == attempt_id).all()
    
    mastery_record = db.query(TopicMastery).filter(
        TopicMastery.user_id == user_id, 
        TopicMastery.topic_id == attempt.topic_id
    ).first()
    
    correct_count = sum(1 for q in questions if q.is_correct)
    score_pct = (correct_count / len(questions)) * 100.0 if questions else 0.0
    
    weight = DIFFICULTY_WEIGHT.get(attempt.difficulty, 1.0)
    effective_score = min(score_pct * weight, 100.0) 
    
    mastery_before = mastery_record.mastery_score
    
    if mastery_record.attempts == 0:
        new_mastery = effective_score * ALPHA_FIRST
    else:
        new_mastery = (mastery_before * (1 - ALPHA_REPEAT)) + (effective_score * ALPHA_REPEAT)
        
    mastery_record.mastery_score = new_mastery
    mastery_record.attempts += 1
    mastery_record.correct_answers += correct_count
    mastery_record.total_questions += len(questions)
    mastery_record.last_difficulty = attempt.difficulty
    
    attempt.correct_count = correct_count
    attempt.score = score_pct
    attempt.mastery_before = mastery_before
    attempt.mastery_after = new_mastery
    
    db.commit()
    return attempt
