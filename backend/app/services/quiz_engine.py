from sqlalchemy.orm import Session
from app.models.quiz import QuizAttempt, QuizQuestion
from app.models.topic import Topic
from app.services.llm_service import generate_json_response
from app.core.prompts import QUIZ_GENERATION_PROMPT
from app.services.rag_service import search

def generate_quiz(db: Session, user_id: int, topic_id: int, difficulty: str, level: str, goal: str, count: int = 5):
    topic = db.query(Topic).filter(Topic.id == topic_id).first()
    if not topic:
        raise ValueError(f"Topic with id {topic_id} not found")
    
    # RAG search for the topic
    rag_results = search(user_id, topic.name, k=3)
    rag_text = "\n\n".join([r["text"] for r in rag_results])
    
    prompt = QUIZ_GENERATION_PROMPT.format(
        topic=topic.name,
        difficulty=difficulty,
        level=level,
        goal=goal,
        count=count,
        rag_context=rag_text if rag_text else "No uploaded documents found."
    )
    
    questions_data = generate_json_response(prompt)
    if not questions_data or not isinstance(questions_data, list):
        raise ValueError("Failed to generate quiz questions")
        
    attempt = QuizAttempt(
        user_id=user_id,
        topic_id=topic_id,
        difficulty=difficulty,
        total_questions=len(questions_data),
        source="practice",
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)
    
    q_models = []
    for qd in questions_data:
        q = QuizQuestion(
            attempt_id=attempt.id,
            topic_id=topic_id,
            question=qd["question"],
            options=qd["options"],
            correct_index=qd["correct_index"],
            explanation=qd["explanation"],
            concept_tag=qd.get("concept_tag", "general"),
            difficulty=difficulty
        )
        db.add(q)
        q_models.append(q)
        
    db.commit()
    
    return attempt, q_models, topic.name
