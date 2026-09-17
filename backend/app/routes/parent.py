from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from app.database import get_db
from app.models.user import User
from app.deps import get_current_user
from app.services.parent_service import (
    get_linked_students,
    link_student,
    generate_parent_report
)

router = APIRouter(prefix="/api/parent", tags=["parent"])

class LinkStudentRequest(BaseModel):
    code: str

@router.get("/sync-key")
def get_sync_key(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Returns or seeds the unique Parent Sync Key for the student."""
    if not current_user.link_code:
        current_user.link_code = f"PAR-{current_user.id:04d}"
        db.commit()
        db.refresh(current_user)
    elif current_user.link_code.startswith("STUDENT-"):
        current_user.link_code = current_user.link_code.replace("STUDENT-", "PAR-")
        db.commit()
        db.refresh(current_user)

    return {
        "student_id": current_user.id,
        "student_name": current_user.name,
        "sync_key": current_user.link_code
    }

@router.post("/generate-sync-key")
def generate_new_sync_key(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generates a fresh unique Parent Sync Key for the student."""
    import secrets
    suffix = secrets.token_hex(2).upper()
    current_user.link_code = f"PAR-{current_user.id:04d}-{suffix}"
    db.commit()
    db.refresh(current_user)
    return {
        "student_id": current_user.id,
        "student_name": current_user.name,
        "sync_key": current_user.link_code
    }

@router.get("/students")
def list_students(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Returns list of students linked to this parent."""
    students = get_linked_students(db, current_user.id)
    return {"students": students}

@router.post("/link")
def link_student_endpoint(
    req: LinkStudentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Links a student to the parent using the student's Link Code or email."""
    try:
        result = link_student(db, current_user.id, req.code)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/report")
def get_report(
    student_id: Optional[int] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generates the live Parent Dashboard report for a linked student."""
    target_student_id = student_id
    
    if not target_student_id:
        # Check linked students
        linked = get_linked_students(db, current_user.id)
        if linked:
            target_student_id = linked[0]["id"]
        elif current_user.role == "student":
            # If a student visits their own parent report preview
            target_student_id = current_user.id
        else:
            # Fallback to demo student or prompt to link
            first_student = db.query(User).filter(User.role == "student").first()
            if first_student:
                target_student_id = first_student.id
            else:
                raise HTTPException(status_code=404, detail="No students found or linked to this account.")

    try:
        report = generate_parent_report(db, target_student_id)
        return report
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/public/{link_code}")
def get_public_parent_report(link_code: str, db: Session = Depends(get_db)):
    """Public read-only parent report accessed via student's Parent Link Code."""
    code = link_code.strip().upper()
    student = db.query(User).filter(User.link_code == code).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found with this Parent Link Code")

    try:
        report = generate_parent_report(db, student.id)
        return report
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
