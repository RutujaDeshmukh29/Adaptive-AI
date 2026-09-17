from sqlalchemy.orm import Session
from app.schemas.profile import LearnerSnapshot
from app.services.learner_model import build_snapshot

def next_best_action(db: Session, user_id: int):
    snapshot = build_snapshot(db, user_id)
    
    # 1. If diagnostic isn't done, do diagnostic
    if not snapshot.diagnostic_done:
        return {
            "action_type": "take_diagnostic",
            "topic_id": None,
            "topic": None,
            "difficulty": None,
            "reason": "We need to understand your current baseline to build your path."
        }

    # 2. If recent trend is declining, practice weak topic
    if snapshot.recent_trend == "declining" and snapshot.weaknesses:
        return {
            "action_type": "practice_easy",
            "topic_id": None, 
            "topic": snapshot.weaknesses[0],
            "difficulty": "easy",
            "reason": f"Your recent quiz performance dropped. Let's rebuild confidence in {snapshot.weaknesses[0]}."
        }
        
    # 3. Default: practice current topic
    return {
        "action_type": "learn",
        "topic_id": snapshot.current_topic["id"] if snapshot.current_topic else 1,
        "topic": snapshot.current_topic["name"] if snapshot.current_topic else "Variables",
        "difficulty": "medium",
        "reason": "Continue learning your current path."
    }
