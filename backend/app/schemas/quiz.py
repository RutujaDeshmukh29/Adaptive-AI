from pydantic import BaseModel
from typing import List, Dict, Optional

class QuizGenerateRequest(BaseModel):
    topic_id: int
    difficulty: str
    count: Optional[int] = 5

class QuizQuestionSchema(BaseModel):
    id: int
    question: str
    options: List[str]
    concept_tag: str
    difficulty: str
    topic_id: int
    correct_index: int
    explanation: str
    
class QuizGenerateResponse(BaseModel):
    attempt_id: int
    topic_id: int
    topic: str
    difficulty: str
    selection_reason: str
    questions: List[QuizQuestionSchema]

class QuizSubmitRequest(BaseModel):
    answers: Dict[int, int] # question_id -> selected_index
