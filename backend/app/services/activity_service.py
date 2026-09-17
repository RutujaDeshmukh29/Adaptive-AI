from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from datetime import datetime, date
from typing import Optional, Dict, Any, List
from app.models.activity import LearningActivity
from app.models.topic import Topic

def log_activity(
    db: Session,
    user_id: int,
    activity_type: str,
    topic_id: Optional[int] = None,
    description: Optional[str] = None,
    result_data: Optional[Dict[str, Any]] = None
) -> LearningActivity:
    """Records a learner activity event in the audit trail."""
    try:
        activity = LearningActivity(
            user_id=user_id,
            activity_type=activity_type,
            topic_id=topic_id,
            description=description,
            result=result_data
        )
        db.add(activity)
        db.commit()
        db.refresh(activity)
        return activity
    except Exception as e:
        db.rollback()
        print(f"Failed to log learning activity: {e}")
        return None

def get_student_activities(db: Session, user_id: int, limit: int = 20) -> List[Dict[str, Any]]:
    """Retrieves recent activities with formatted metadata and relative timestamps."""
    records = (
        db.query(LearningActivity, Topic.name)
        .outerjoin(Topic, LearningActivity.topic_id == Topic.id)
        .filter(LearningActivity.user_id == user_id)
        .order_by(desc(LearningActivity.created_at))
        .limit(limit)
        .all()
    )

    results = []
    for act, topic_name in records:
        results.append({
            "id": act.id,
            "activity_type": act.activity_type,
            "topic_id": act.topic_id,
            "topic_name": topic_name or (act.result.get("topic") if act.result else None),
            "description": act.description or f"Activity in {act.activity_type}",
            "result": act.result,
            "timestamp": act.created_at.isoformat() if act.created_at else None,
            "time_str": act.created_at.strftime("%I:%M %p") if act.created_at else "Earlier",
            "date_str": act.created_at.strftime("%b %d, %Y") if act.created_at else "Today"
        })
    return results

def get_today_study_stats(db: Session, user_id: int) -> Dict[str, Any]:
    """Computes today's active study metrics for the student."""
    today_start = datetime.combine(date.today(), datetime.min.time())

    today_activities = (
        db.query(LearningActivity)
        .filter(LearningActivity.user_id == user_id, LearningActivity.created_at >= today_start)
        .all()
    )

    # Calculate estimated active time:
    # ~5 mins per chat interaction, ~10 mins per quiz, ~5 mins per material uploaded
    active_minutes = 0
    quiz_count = 0
    chat_count = 0
    upload_count = 0

    for act in today_activities:
        if act.activity_type == "quiz":
            active_minutes += 10
            quiz_count += 1
        elif act.activity_type == "chat":
            active_minutes += 5
            chat_count += 1
        elif act.activity_type == "upload":
            active_minutes += 5
            upload_count += 1
        else:
            active_minutes += 5

    # Floor at 15 if there was at least one action today
    if len(today_activities) > 0 and active_minutes < 15:
        active_minutes = 15

    return {
        "active_minutes_today": active_minutes,
        "total_actions_today": len(today_activities),
        "quizzes_today": quiz_count,
        "chat_queries_today": chat_count,
        "uploads_today": upload_count
    }
