from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class ChatMessageRequest(BaseModel):
    message: str
    mode: Optional[str] = "adaptive"
    session_id: Optional[str] = None
    
class ChatResponse(BaseModel):
    answer: str
    sources: List[Dict[str, Any]]
    grounded: bool
    learner_context_used: Dict[str, Any]
    next_action: Dict[str, Any]
    message_id: int
    session_id: Optional[str] = None

class ChatMessageDTO(BaseModel):
    id: int
    role: str
    content: str
    sources: Optional[List[Dict[str, Any]]] = None
    session_id: Optional[str] = None
    created_at: str

class ChatSessionSummary(BaseModel):
    session_id: str
    title: str
    last_active: str
    message_count: int
