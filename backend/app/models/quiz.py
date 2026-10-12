from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.sql import func
from app.database import Base
from sqlalchemy.orm import relationship

class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    topic_id = Column(Integer, ForeignKey("topics.id"), nullable=False)
    difficulty = Column(String(10)) # easy | medium | hard
    score = Column(Float)
    total_questions = Column(Integer)
    correct_count = Column(Integer)
    source = Column(String(20)) # diagnostic | practice | adaptive
    mastery_before = Column(Float)
    mastery_after = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    questions = relationship("QuizQuestion", back_populates="attempt")

class QuizQuestion(Base):
    __tablename__ = "quiz_questions"

    id = Column(Integer, primary_key=True, index=True)
    attempt_id = Column(Integer, ForeignKey("quiz_attempts.id"), nullable=False)
    topic_id = Column(Integer, ForeignKey("topics.id"), nullable=False)
    question = Column(Text)
    options = Column(JSON) # ["A", "B", "C", "D"]
    correct_index = Column(Integer)
    selected_index = Column(Integer, nullable=True)
    is_correct = Column(Boolean, nullable=True)
    explanation = Column(Text)
    concept_tag = Column(String(120))
    difficulty = Column(String(10))
    
    attempt = relationship("QuizAttempt", back_populates="questions")
