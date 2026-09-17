from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from app.schemas.auth import UserResponse

class TopicMasteryDTO(BaseModel):
    topic_id: int
    topic: str
    mastery: float
    band: str
    attempts: int
    correct_answers: int
    total_questions: int
    last_updated: Optional[str]

    class Config:
        from_attributes = True

class LearnerSnapshot(BaseModel):
    user: UserResponse
    academic_level: str
    subject: str
    goal: str
    experience_level: str
    study_time_minutes: int
    diagnostic_done: bool
    current_topic: Optional[Dict[str, Any]]
    overall_mastery: float
    mastery: List[TopicMasteryDTO]
    strengths: List[str]
    weaknesses: List[str]
    recent_trend: str
    recent_mistake_tags: List[str]
    streak_days: int
    total_quizzes: int
    materials_count: int

class ProfileUpdateRequest(BaseModel):
    goal: Optional[str] = None
    study_time_minutes: Optional[int] = None
    experience_level: Optional[str] = None

class OnboardingRequest(BaseModel):
    academic_level: str
    subject: str
    goal: str
    experience_level: str
    study_time_minutes: int
    preferences: Dict[str, Any]

class OnboardingResponse(BaseModel):
    profile_id: int
    subject: str
    topics_seeded: int
    next_step: str
