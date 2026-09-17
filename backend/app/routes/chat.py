from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc
from datetime import datetime
from typing import Optional, List, Dict, Any

from app.database import get_db
from app.models.user import User
from app.models.chat import ChatMessage
from app.deps import get_current_user
from app.schemas.chat import (
    ChatMessageRequest, 
    ChatResponse, 
    ChatMessageDTO, 
    ChatSessionSummary
)
from app.services.learner_model import build_snapshot
from app.services.rag_service import search
from app.services.llm_service import generate_chat_response
from app.core.prompts import ADAPTIVE_TUTOR_PROMPT, LEARNING_MODES
from app.services.adaptive_engine import next_best_action
from app.services.activity_service import log_activity

router = APIRouter(prefix="/api/chat", tags=["chat"])

@router.post("", response_model=ChatResponse)
def send_message(req: ChatMessageRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    question = req.message
    selected_mode = (req.mode or "adaptive").lower()
    mode_info = LEARNING_MODES.get(selected_mode, LEARNING_MODES["adaptive"])
    
    # Establish or continue session
    session_id = req.session_id or f"sess_{current_user.id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

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
    
    # 6. Log Activity for Parent & Student Timeline
    topic_name = snapshot.current_topic["name"] if snapshot.current_topic else "General"
    log_activity(
        db, 
        current_user.id, 
        "chat", 
        topic_id=snapshot.current_topic["id"] if snapshot.current_topic else None,
        description=f'Asked tutor ({mode_info["name"]}): "{question[:50]}..."',
        result_data={"mode": selected_mode, "topic": topic_name, "grounded": len(rag_results) > 0}
    )

    # 7. Persist conversation history to DB
    user_chat_record = ChatMessage(
        user_id=current_user.id,
        role="user",
        content=question,
        session_id=session_id,
        topic_id=snapshot.current_topic["id"] if snapshot.current_topic else None
    )
    db.add(user_chat_record)
    db.flush()

    sources_data = [{"filename": r["metadata"]["filename"], "page": r["metadata"]["page"]} for r in rag_results]
    asst_chat_record = ChatMessage(
        user_id=current_user.id,
        role="assistant",
        content=answer,
        sources=sources_data,
        session_id=session_id,
        topic_id=snapshot.current_topic["id"] if snapshot.current_topic else None
    )
    db.add(asst_chat_record)
    db.commit()

    return ChatResponse(
        answer=answer,
        sources=sources_data,
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
        message_id=asst_chat_record.id,
        session_id=session_id
    )

@router.get("/sessions")
def list_chat_sessions(
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    """Returns past conversation sessions grouped by session_id."""
    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.user_id == current_user.id)
        .order_by(desc(ChatMessage.created_at))
        .all()
    )

    sessions_map: Dict[str, Dict[str, Any]] = {}
    for m in messages:
        sid = m.session_id or f"sess_legacy_{m.created_at.strftime('%Y%m%d') if m.created_at else 'default'}"
        if sid not in sessions_map:
            # First encountered message in desc order is latest
            sessions_map[sid] = {
                "session_id": sid,
                "title": m.content[:45] + ("..." if len(m.content) > 45 else ""),
                "last_active": m.created_at.strftime("%b %d, %I:%M %p") if m.created_at else "Recently",
                "message_count": 0
            }
        sessions_map[sid]["message_count"] += 1
        # If user message, prefer as title
        if m.role == "user" and len(m.content) > 3:
            sessions_map[sid]["title"] = m.content[:45] + ("..." if len(m.content) > 45 else "")

    return {"sessions": list(sessions_map.values())}

@router.get("/history")
def get_chat_history(
    session_id: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves messages for a session, or the most recent 30 messages."""
    query = db.query(ChatMessage).filter(ChatMessage.user_id == current_user.id)
    
    if session_id:
        query = query.filter(ChatMessage.session_id == session_id)
    else:
        # If no session specified, fetch recent messages
        latest = query.order_by(desc(ChatMessage.created_at)).first()
        if latest and latest.session_id:
            query = query.filter(ChatMessage.session_id == latest.session_id)

    messages = query.order_by(asc(ChatMessage.created_at)).limit(50).all()

    return {
        "messages": [
            {
                "id": m.id,
                "role": m.role,
                "content": m.content,
                "sources": m.sources,
                "session_id": m.session_id,
                "created_at": m.created_at.isoformat() if m.created_at else None
            }
            for m in messages
        ]
    }

@router.delete("/clear")
def clear_chat_history(
    session_id: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Clears messages for a session or resets all user chat history."""
    query = db.query(ChatMessage).filter(ChatMessage.user_id == current_user.id)
    if session_id:
        query = query.filter(ChatMessage.session_id == session_id)
        
    count = query.delete(synchronize_session=False)
    db.commit()
    return {"cleared": True, "count": count}
