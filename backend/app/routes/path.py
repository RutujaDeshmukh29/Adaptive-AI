from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import asc
from app.database import get_db
from app.models.user import User
from app.models.learner_profile import LearnerProfile
from app.models.topic import Topic
from app.models.topic_mastery import TopicMastery
from app.deps import get_current_user
from pydantic import BaseModel
from typing import List

router = APIRouter(prefix="/api/path", tags=["path"])

class PathItem(BaseModel):
    order: int
    topic_id: int
    topic: str
    status: str  # "done" | "current" | "in_progress" | "locked"
    mastery: float
    reason: str

class PathResponse(BaseModel):
    goal: str
    overall_progress: float
    items: List[PathItem]

@router.get("", response_model=PathResponse)
def get_learning_path(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(LearnerProfile).filter(LearnerProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    topics = db.query(Topic).filter(Topic.subject == profile.subject).order_by(asc(Topic.order_index)).all()
    masteries = {m.topic_id: m for m in db.query(TopicMastery).filter(TopicMastery.user_id == current_user.id).all()}

    items = []
    overall_score = 0.0
    current_found = False

    for t in topics:
        m = masteries.get(t.id)
        score = m.mastery_score if m else 0.0
        overall_score += score
        
        status = "locked"
        reason = "Prerequisites not met."

        if score >= 70.0:
            status = "done"
            reason = "Mastered!"
        else:
            if not current_found:
                status = "current"
                reason = "Your current focus area."
                current_found = True
                
                # Update current topic in profile if needed
                if profile.current_topic_id != t.id:
                    profile.current_topic_id = t.id
                    db.commit()
            else:
                if score > 0:
                    status = "in_progress"
                    reason = "Started, but finish previous topics first."
                else:
                    status = "locked"
                    reason = "Complete current topic to unlock."

        items.append(PathItem(
            order=t.order_index,
            topic_id=t.id,
            topic=t.name,
            status=status,
            mastery=score,
            reason=reason
        ))

    overall_progress = (overall_score / len(topics)) if topics else 0.0

    return PathResponse(
        goal=profile.goal,
        overall_progress=overall_progress,
        items=items
    )
