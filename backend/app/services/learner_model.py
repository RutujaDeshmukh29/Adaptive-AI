from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from app.models.user import User
from app.models.learner_profile import LearnerProfile
from app.models.topic import Topic
from app.models.topic_mastery import TopicMastery
from app.models.quiz import QuizAttempt, QuizQuestion
from app.models.material import Material
from app.models.activity import LearningActivity
from app.schemas.profile import LearnerSnapshot, TopicMasteryDTO
from app.schemas.auth import UserResponse
from app.core.constants import BAND_STRUGGLING, BAND_DEVELOPING, BAND_COMPETENT, BAND_MASTERED, TREND_WINDOW, TREND_DELTA

def get_band(score: float) -> str:
    if score < BAND_DEVELOPING[0]: return "struggling"
    if score < BAND_COMPETENT[0]: return "developing"
    if score < BAND_MASTERED[0]: return "competent"
    return "mastered"

def get_profile(db: Session, user_id: int) -> LearnerProfile:
    return db.query(LearnerProfile).filter(LearnerProfile.user_id == user_id).first()

def get_topics(db: Session, subject: str):
    return db.query(Topic).filter(Topic.subject == subject).order_by(Topic.order_index).all()

def get_all_mastery(db: Session, user_id: int):
    # Join with Topic to order by order_index and get name
    return db.query(TopicMastery, Topic.name)\
        .join(Topic, TopicMastery.topic_id == Topic.id)\
        .filter(TopicMastery.user_id == user_id)\
        .order_by(Topic.order_index).all()

def current_topic(db: Session, user_id: int):
    profile = get_profile(db, user_id)
    if profile and profile.current_topic_id:
        return db.query(Topic).filter(Topic.id == profile.current_topic_id).first()
    return None

def compute_trend(attempts: list) -> str:
    valid = [a for a in attempts if a.mastery_after is not None and a.mastery_before is not None]
    recent = valid[:TREND_WINDOW]
    if len(recent) < 2:
        return "insufficient_data"
    delta = recent[0].mastery_after - recent[-1].mastery_before
    if delta > TREND_DELTA: return "improving"
    if delta < -TREND_DELTA: return "declining"
    return "stable"

def weak_concepts(db: Session, user_id: int, topic_id: int = None, limit: int = 5) -> list[str]:
    q = (db.query(QuizQuestion.concept_tag, func.count().label("n"))
           .join(QuizAttempt, QuizQuestion.attempt_id == QuizAttempt.id)
           .filter(QuizAttempt.user_id == user_id,
                   QuizQuestion.is_correct.is_(False)))
    if topic_id:
        q = q.filter(QuizQuestion.topic_id == topic_id)
    
    # Ignore empty or null concept tags
    q = q.filter(QuizQuestion.concept_tag != None).filter(QuizQuestion.concept_tag != "")
    
    res = q.group_by(QuizQuestion.concept_tag).order_by(desc("n")).limit(limit).all()
    return [r.concept_tag for r in res]

def compute_streak(db: Session, user_id: int) -> int:
    # A simple implementation: counting distinct days of activity up to today
    # For a hackathon, just returning 1 is fine or calculating from learning_activity
    # We'll just return a placeholder based on activity count
    count = db.query(LearningActivity).filter(LearningActivity.user_id == user_id).count()
    return min(count, 3) # capped for demo purposes or implement real date logic

def count_materials(db: Session, user_id: int) -> int:
    return db.query(Material).filter(Material.user_id == user_id, Material.status == 'ready').count()

def build_snapshot(db: Session, user_id: int) -> LearnerSnapshot:
    profile = get_profile(db, user_id)
    if not profile:
        raise ValueError("Profile not found")
        
    mastery_data = get_all_mastery(db, user_id) 
    attempts = db.query(QuizAttempt).filter(QuizAttempt.user_id == user_id).order_by(desc(QuizAttempt.created_at)).limit(5).all()

    scored_mastery = [m for m, _ in mastery_data if m.attempts > 0]
    overall = round(sum(m.mastery_score for m in scored_mastery) / len(scored_mastery), 1) if scored_mastery else 0.0

    mastery_dtos = []
    for m, t_name in mastery_data:
        mastery_dtos.append(
            TopicMasteryDTO(
                topic_id=m.topic_id,
                topic=t_name,
                mastery=m.mastery_score,
                band=get_band(m.mastery_score),
                attempts=m.attempts,
                correct_answers=m.correct_answers,
                total_questions=m.total_questions,
                last_updated=m.last_updated.isoformat() if m.last_updated else None
            )
        )

    user = db.query(User).filter(User.id == user_id).first()
    cur_topic = current_topic(db, user_id)

    return LearnerSnapshot(
        user=UserResponse.model_validate(user),
        academic_level=profile.academic_level,
        subject=profile.subject,
        goal=profile.goal,
        experience_level=profile.experience_level,
        study_time_minutes=profile.study_time_minutes,
        diagnostic_done=profile.diagnostic_done,
        current_topic={"id": cur_topic.id, "name": cur_topic.name} if cur_topic else None,
        overall_mastery=overall,
        mastery=mastery_dtos,
        strengths=[t_name for m, t_name in mastery_data if m.attempts > 0 and m.mastery_score >= BAND_COMPETENT[0]][:3],
        weaknesses=[t_name for m, t_name in mastery_data if m.attempts > 0 and m.mastery_score < BAND_DEVELOPING[0]][:3],
        recent_trend=compute_trend(attempts),
        recent_mistake_tags=weak_concepts(db, user_id, limit=4),
        streak_days=compute_streak(db, user_id),
        total_quizzes=db.query(QuizAttempt).filter(QuizAttempt.user_id == user_id).count(),
        materials_count=count_materials(db, user_id),
        preferences=profile.preferences or {},
    )
