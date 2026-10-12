from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from app.database import Base

class LearningActivity(Base):
    __tablename__ = "learning_activity"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    activity_type = Column(String(30)) # chat | quiz | upload | diagnostic | path_update
    topic_id = Column(Integer, ForeignKey("topics.id"), nullable=True)
    description = Column(String(255), nullable=True)
    result = Column(JSON, nullable=True) # {score: 60, delta: +8}
    created_at = Column(DateTime(timezone=True), server_default=func.now())
