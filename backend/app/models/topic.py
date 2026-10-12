from sqlalchemy import Column, Integer, String, ForeignKey
from app.database import Base

class Topic(Base):
    __tablename__ = "topics"

    id = Column(Integer, primary_key=True, index=True)
    subject = Column(String(80), index=True)
    name = Column(String(120))
    slug = Column(String(120))
    order_index = Column(Integer)
    prerequisite_id = Column(Integer, ForeignKey("topics.id"), nullable=True)
