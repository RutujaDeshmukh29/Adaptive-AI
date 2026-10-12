from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON
from sqlalchemy.sql import func
from app.database import Base

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role = Column(String(10)) # user | assistant
    content = Column(Text)
    sources = Column(JSON, nullable=True) # [{filename, page}]
    topic_id = Column(Integer, ForeignKey("topics.id"), nullable=True)
    session_id = Column(String(60), nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
