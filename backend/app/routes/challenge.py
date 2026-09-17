from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models.user import User
from app.models.topic import Topic
from app.models.topic_mastery import TopicMastery
from app.deps import get_current_user
from app.schemas.challenge import (
    ChallengeGenerateRequest,
    ChallengeResponse,
    ChallengeEvaluateRequest,
    ChallengeEvaluationResponse,
    WeakTopicsSummary
)
from app.services.challenge_service import generate_coding_challenge, evaluate_challenge_solution
from app.services.mastery_service import update_mastery_from_challenge
from app.services.learner_model import weak_concepts, current_topic, get_all_mastery
from app.services.activity_service import log_activity

router = APIRouter(prefix="/api/challenge", tags=["challenge"])

@router.get("/weak-topics", response_model=WeakTopicsSummary)
def get_weak_topics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Returns detected weak concepts and low-mastery topics for targeted practice."""
    c_topic = current_topic(db, current_user.id)
    c_topic_dict = {"id": c_topic.id, "name": c_topic.name} if c_topic else None
    
    # Get overall weak concepts across user's quiz attempts
    weak_list = weak_concepts(db, current_user.id, limit=6)
    
    # Topics where mastery is below 75%
    mastery_list = get_all_mastery(db, current_user.id)
    recommended = []
    for tm, topic_name in mastery_list:
        if tm.mastery_score < 75.0:
            recommended.append({
                "topic_id": tm.topic_id,
                "name": topic_name,
                "mastery": tm.mastery_score,
                "attempts": tm.attempts
            })
            
    return WeakTopicsSummary(
        current_topic=c_topic_dict,
        weak_concepts=weak_list,
        recommended_topics=recommended
    )

@router.post("/generate", response_model=ChallengeResponse)
def generate_challenge(
    req: ChallengeGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generates an AI coding or interview challenge targeting specific weak concepts."""
    try:
        challenge = generate_coding_challenge(
            db=db,
            user_id=current_user.id,
            topic_id=req.topic_id,
            difficulty=req.difficulty,
            challenge_type=req.type,
            concept_focus=req.concept_focus
        )
        return challenge
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Challenge generation failed: {str(e)}")

@router.post("/evaluate", response_model=ChallengeEvaluationResponse)
def evaluate_challenge(
    req: ChallengeEvaluateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Evaluates student's code/answer, returns feedback, Big-O analysis, and updates topic mastery."""
    topic = db.query(Topic).filter(Topic.id == req.topic_id).first()
    topic_name = topic.name if topic else (req.topic_name or "General Topic")

    try:
        eval_result = evaluate_challenge_solution(
            title=req.title,
            topic_name=topic_name,
            difficulty=req.difficulty,
            scenario=req.scenario,
            user_code=req.user_code,
            solution=req.solution
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Challenge evaluation failed: {str(e)}")

    score = eval_result.get("score", 70)
    passed = eval_result.get("passed", score >= 70)
    
    # Log activity for student and Parent sync
    log_activity(
        db,
        current_user.id,
        "coding_challenge",
        f"Completed challenge '{req.title}' on {topic_name} (Score: {score}%)"
    )

    # Update mastery if student solved it well
    new_mastery = None
    mastery_updated = False
    if passed and score >= 60:
        new_mastery = update_mastery_from_challenge(
            db=db,
            user_id=current_user.id,
            topic_id=req.topic_id,
            score=score,
            difficulty=req.difficulty
        )
        mastery_updated = True

    return ChallengeEvaluationResponse(
        passed=passed,
        score=score,
        summary=eval_result.get("summary", ""),
        strengths=eval_result.get("strengths", []),
        areas_for_improvement=eval_result.get("areas_for_improvement", []),
        efficiency_analysis=eval_result.get("efficiency_analysis", ""),
        edge_cases_analyzed=eval_result.get("edge_cases_analyzed", []),
        mastery_updated=mastery_updated,
        new_mastery=new_mastery
    )
