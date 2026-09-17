from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
import os
import shutil
import uuid
from typing import Optional

from app.database import get_db
from app.models.user import User
from app.models.material import Material
from app.deps import get_current_user
from app.services.rag_service import process_and_ingest_pdf, delete_material_vectors
from app.config import settings
from app.schemas.material import MaterialResponse

router = APIRouter(prefix="/api/materials", tags=["materials"])

@router.post("/upload", response_model=MaterialResponse, status_code=status.HTTP_201_CREATED)
async def upload_material(
    file: UploadFile = File(...),
    subject: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=415, detail="Only PDF files are supported")
        
    upload_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../", settings.UPLOAD_DIR, str(current_user.id)))
    os.makedirs(upload_dir, exist_ok=True)
    
    file_uuid = str(uuid.uuid4())
    file_path = os.path.join(upload_dir, f"{file_uuid}.pdf")
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    material = Material(
        user_id=current_user.id,
        filename=file.filename,
        stored_path=file_path,
        subject=subject,
        status="processing"
    )
    db.add(material)
    db.commit()
    db.refresh(material)
    
    try:
        chunks = process_and_ingest_pdf(current_user.id, material.id, file_path, file.filename)
        material.status = "ready"
        material.chunk_count = chunks
    except Exception as e:
        material.status = "failed"
        material.error_message = str(e)
        
    db.commit()
    db.refresh(material)
    
    return MaterialResponse(
        id=material.id,
        filename=material.filename,
        status=material.status,
        chunk_count=material.chunk_count,
        uploaded_at=material.uploaded_at.isoformat()
    )

@router.get("", response_model=dict)
def list_materials(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    materials = db.query(Material).filter(Material.user_id == current_user.id).all()
    total_chunks = sum(m.chunk_count for m in materials if m.chunk_count)
    
    return {
        "materials": [
            {
                "id": m.id,
                "filename": m.filename,
                "status": m.status,
                "chunk_count": m.chunk_count,
                "uploaded_at": m.uploaded_at.isoformat() if m.uploaded_at else None
            } for m in materials
        ],
        "total_chunks": total_chunks
    }

@router.delete("/{material_id}")
def delete_material(material_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    material = db.query(Material).filter(Material.user_id == current_user.id, Material.id == material_id).first()
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
        
    # Delete from chroma
    delete_material_vectors(current_user.id, material.id)
    
    # Delete file
    try:
        if os.path.exists(material.stored_path):
            os.remove(material.stored_path)
    except Exception:
        pass
        
    db.delete(material)
    db.commit()
    
    return {"deleted": True, "id": material_id}
