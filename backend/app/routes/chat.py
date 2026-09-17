from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.deps import get_current_user
from app.schemas.chat import ChatMessageRequest, ChatResponse
from app.services.learner_model import build_snapshot
from app.services.rag_service import search
from app.services.llm_service import generate_chat_response
from app.core.prompts import ADAPTIVE_TUTOR_PROMPT, LEARNING_MODES
from app.services.adaptive_engine import next_best_action

router = APIRouter(prefix="/api/chat", tags=["chat"])

@router.post("", response_model=ChatResponse)
def send_message(req: ChatMessageRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    question = req.message
    selected_mode = (req.mode or "adaptive").lower()
    mode_info = LEARNING_MODES.get(selected_mode, LEARNING_MODES["adaptive"])
    
    # 1. Build profile snapshot
    snapshot = build_snapshot(db, current_user.id)
    
    # 2. RAG search over user's documents
    rag_results = search(current_user.id, question, k=3)
    rag_text = "\n\n".join([r["text"] for r in rag_results])
    
    # 3. Format Prompt
    prompt = ADAPTIVE_TUTOR_PROMPT.format(
        level=snapshot.academic_level,
        goal=snapshot.goal,
        overall_mastery=snapshot.overall_mastery,
        strengths=", ".join(snapshot.strengths) if snapshot.strengths else "None yet",
        weaknesses=", ".join(snapshot.weaknesses) if snapshot.weaknesses else "None yet",
        recent_trend=snapshot.recent_trend,
        recent_mistakes=", ".join(snapshot.recent_mistake_tags) if snapshot.recent_mistake_tags else "None yet",
        mode_instruction=mode_info["instruction"],
        question=question,
        rag_context=rag_text if rag_text else "No uploaded documents found."
    )
    
    # 4. Generate AI Answer
    answer = generate_chat_response(prompt)
    
    # 5. Determine Next Best Action
    nba = next_best_action(db, current_user.id)
    
    return ChatResponse(
        answer=answer,
        sources=[{"filename": r["metadata"]["filename"], "page": r["metadata"]["page"]} for r in rag_results],
        grounded=len(rag_results) > 0,
        learner_context_used={
            "level": snapshot.academic_level,
            "goal": snapshot.goal,
            "topic": snapshot.current_topic["name"] if snapshot.current_topic else None,
            "mastery": snapshot.overall_mastery,
            "mode": selected_mode,
            "mode_name": mode_info["name"],
            "adaptation": f"{mode_info['name']} mode · Tuned for {snapshot.academic_level}"
        },
        next_action=nba,
        message_id=1
    )
