from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from app.database import Base
from sqlalchemy.orm import relationship

class LearnerProfile(Base):
    __tablename__ = "learner_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    academic_level = Column(String(80))
    subject = Column(String(80))
    goal = Column(String(120))
    experience_level = Column(String(40))
    study_time_minutes = Column(Integer)
    preferences = Column(JSON)
    diagnostic_done = Column(Boolean, default=False)
    current_topic_id = Column(Integer, ForeignKey("topics.id"), nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="profile")
