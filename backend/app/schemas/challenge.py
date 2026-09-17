from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class ChallengeGenerateRequest(BaseModel):
    topic_id: int
    difficulty: str = "medium"
    type: str = "code"  # "code" or "interview"
    concept_focus: Optional[str] = None
    language: Optional[str] = "python"

class TestCaseItem(BaseModel):
    input: str
    expected: str
    explanation: Optional[str] = None

class ChallengeResponse(BaseModel):
    id: str
    title: str
    topic_id: int
    topic_name: str
    targeted_weakness: str
    difficulty: str
    type: str
    scenario: str
    requirements: List[str]
    starter_code: str
    test_cases: List[TestCaseItem]
    hints: List[str]
    solution: str
    explanation: str
    language: Optional[str] = "python"

class ChallengeEvaluateRequest(BaseModel):
    challenge_id: Optional[str] = None
    title: str
    topic_id: int
    topic_name: Optional[str] = None
    difficulty: str = "medium"
    type: str = "code"
    scenario: str
    user_code: str
    solution: str
    language: Optional[str] = "python"

class EdgeCaseItem(BaseModel):
    case: str
    handled: bool
    notes: Optional[str] = None

class ChallengeEvaluationResponse(BaseModel):
    passed: bool
    score: int
    summary: str
    strengths: List[str]
    areas_for_improvement: List[str]
    efficiency_analysis: str
    edge_cases_analyzed: List[EdgeCaseItem]
    mastery_updated: bool = False
    new_mastery: Optional[float] = None

class WeakTopicsSummary(BaseModel):
    current_topic: Optional[Dict[str, Any]] = None
    weak_concepts: List[str]
    recommended_topics: List[Dict[str, Any]]
