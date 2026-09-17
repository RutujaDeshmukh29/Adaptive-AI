from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class ChatMessageRequest(BaseModel):
    message: str
    
class ChatResponse(BaseModel):
    answer: str
    sources: List[Dict[str, Any]]
    grounded: bool
    learner_context_used: Dict[str, Any]
    next_action: Dict[str, Any]
    message_id: int
