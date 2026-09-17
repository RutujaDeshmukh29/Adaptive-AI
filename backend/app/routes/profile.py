from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.learner_profile import LearnerProfile
from app.models.topic import Topic
from app.models.topic_mastery import TopicMastery
from app.schemas.profile import OnboardingRequest, OnboardingResponse, LearnerSnapshot, ProfileUpdateRequest
from app.services.learner_model import build_snapshot
from app.deps import get_current_user

router = APIRouter(prefix="/api/profile", tags=["profile"])

@router.post("/onboarding", response_model=OnboardingResponse, status_code=status.HTTP_201_CREATED)
def onboard_user(data: OnboardingRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Check if already onboarded
    existing = db.query(LearnerProfile).filter(LearnerProfile.user_id == current_user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="User already onboarded")

    # Create profile
    profile = LearnerProfile(
        user_id=current_user.id,
        academic_level=data.academic_level,
        subject=data.subject,
        goal=data.goal,
        experience_level=data.experience_level,
        study_time_minutes=data.study_time_minutes,
        preferences=data.preferences,
        diagnostic_done=False
    )
    db.add(profile)
    
    # Seed topic_mastery rows for the selected subject at 0%
    topics = db.query(Topic).filter(Topic.subject == data.subject).all()
    for t in topics:
        mastery = TopicMastery(
            user_id=current_user.id,
            topic_id=t.id,
            mastery_score=0.0,
            attempts=0
        )
        db.add(mastery)
        
    db.commit()
    db.refresh(profile)
    
    return OnboardingResponse(
        profile_id=profile.id,
        subject=profile.subject,
        topics_seeded=len(topics),
        next_step="diagnostic"
    )

@router.get("", response_model=LearnerSnapshot)
def get_user_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        return build_snapshot(db, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.patch("", response_model=LearnerSnapshot)
def update_user_profile(data: ProfileUpdateRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(LearnerProfile).filter(LearnerProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
        
    if data.goal:
        profile.goal = data.goal
    if data.study_time_minutes:
        profile.study_time_minutes = data.study_time_minutes
    if data.experience_level:
        profile.experience_level = data.experience_level
        
    db.commit()
    
    return build_snapshot(db, current_user.id)
