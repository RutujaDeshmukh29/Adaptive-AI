import logging
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.deps import get_current_user
from app.models.user import User
from app.services.llm_service import generate_chat_response

router = APIRouter()
logger = logging.getLogger(__name__)

class DiagramRequest(BaseModel):
    prompt: str
    diagram_type: str = "flowchart"

class DiagramResponse(BaseModel):
    mermaid_code: str

@router.post("/generate", response_model=DiagramResponse)
def generate_diagram(
    req: DiagramRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    system_prompt = (
        f"You are an expert Mermaid.js diagram generator. "
        f"The user wants a '{req.diagram_type}'. "
        f"Output ONLY valid Mermaid code. Do not wrap it in markdown codeblocks (```mermaid). "
        f"Do not output any explanation. Start directly with the graph definition "
        f"(e.g., 'flowchart TD', 'mindmap', 'sequenceDiagram')."
    )
    
    user_prompt = f"System Instruction: {system_prompt}\n\nUser Request: {req.prompt}"
    
    try:
        raw_output = generate_chat_response(user_prompt)
        
        # Clean up any accidental markdown formatting the LLM might have included
        cleaned_code = raw_output.strip()
        if cleaned_code.startswith("```mermaid"):
            cleaned_code = cleaned_code[10:]
        elif cleaned_code.startswith("```"):
            cleaned_code = cleaned_code[3:]
            
        if cleaned_code.endswith("```"):
            cleaned_code = cleaned_code[:-3]
            
        cleaned_code = cleaned_code.strip()
        
        return DiagramResponse(mermaid_code=cleaned_code)
    except Exception as e:
        logger.error(f"Diagram generation error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate diagram.")

class DiagramExportRequest(BaseModel):
    svg: str
    format: str = "png"
    is_dark: bool = False

@router.post("/export")
def export_diagram(req: DiagramExportRequest):
    try:
        from fastapi.responses import Response
        import pymupdf

        fmt = req.format.lower().strip()
        if fmt in ["jpg", "jpeg"]:
            target_fmt = "jpeg"
            media_type = "image/jpeg"
            ext = "jpg"
        else:
            target_fmt = "png"
            media_type = "image/png"
            ext = "png"

        # Open and render the SVG in-memory with PyMuPDF
        doc = pymupdf.open(stream=req.svg.encode("utf-8"), filetype="svg")
        page = doc[0]
        # Crisp 2x Retina equivalent (192 DPI)
        pix = page.get_pixmap(dpi=192)
        img_bytes = pix.tobytes(target_fmt)

        return Response(
            content=img_bytes,
            media_type=media_type,
            headers={
                "Content-Disposition": f'attachment; filename="adapted-ai-diagram.{ext}"'
            }
        )
    except Exception as e:
        logger.error(f"Diagram export error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to export diagram: {str(e)}")
