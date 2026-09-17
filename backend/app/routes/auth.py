from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.user import User
from app.models.learner_profile import LearnerProfile
from app.models.parent_student_link import ParentStudentLink
from app.schemas.auth import UserCreate, UserLogin, ParentKeyLogin, AuthResponse, MeResponse
from app.core.security import get_password_hash, verify_password, create_access_token
from app.deps import get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def signup(user_data: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user_data.email).first()
    if db_user:
        raise HTTPException(status_code=409, detail="Email already registered")
    
    user_role = (user_data.role or "student").lower()
    if user_role not in ["student", "parent"]:
        user_role = "student"
        
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        name=user_data.name,
        email=user_data.email,
        password_hash=hashed_password,
        role=user_role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    prefix = "PARENT" if user_role == "parent" else "STUDENT"
    new_user.link_code = f"{prefix}-{new_user.id:04d}"
    db.commit()
    db.refresh(new_user)
    
    access_token = create_access_token(data={"sub": str(new_user.id)})
    
    return AuthResponse(
        access_token=access_token,
        token_type="bearer",
        user=new_user,
        onboarding_complete=user_role == "parent"
    )

@router.post("/login", response_model=AuthResponse)
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user_data.email).first()
    if not db_user or not verify_password(user_data.password, db_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
        
    # Ensure link_code exists
    if not db_user.link_code:
        prefix = "PARENT" if db_user.role == "parent" else "STUDENT"
        db_user.link_code = f"{prefix}-{db_user.id:04d}"
        db.commit()
        db.refresh(db_user)

    access_token = create_access_token(data={"sub": str(db_user.id)})
    profile = db.query(LearnerProfile).filter(LearnerProfile.user_id == db_user.id).first()
    
    return AuthResponse(
        access_token=access_token,
        token_type="bearer",
        user=db_user,
        onboarding_complete=(db_user.role == "parent") or (profile is not None)
    )

@router.post("/parent-login", response_model=AuthResponse)
def parent_login(user_data: ParentKeyLogin, db: Session = Depends(get_db)):
    student_name = (user_data.student_name or "").strip()
    parent_key = (user_data.parent_key or "").strip().upper()

    if not student_name or not parent_key:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Both Student Name / Username and Parent Sync Key are required.",
        )

    # Build possible key variations (PAR-XXXX or STUDENT-XXXX)
    possible_keys = [parent_key]
    if parent_key.startswith("PAR-"):
        possible_keys.append(parent_key.replace("PAR-", "STUDENT-"))
    elif parent_key.startswith("STUDENT-"):
        possible_keys.append(parent_key.replace("STUDENT-", "PAR-"))

    # Case-insensitive search on student name or email with link_code matching
    student = db.query(User).filter(
        (func.lower(User.name) == student_name.lower()) | (func.lower(User.email) == student_name.lower()),
        User.link_code.in_(possible_keys)
    ).first()

    # Fallback search if key without prefix or name contains match
    if not student:
        student = db.query(User).filter(
            (func.lower(User.name) == student_name.lower()) | (func.lower(User.email) == student_name.lower()),
            User.link_code.ilike(f"%{parent_key}%")
        ).first()

    if not student:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Student Name or Parent Sync Key. Please verify the sync key provided by the student.",
        )

    # Ensure student profile exists with reasonable defaults
    profile = db.query(LearnerProfile).filter(LearnerProfile.user_id == student.id).first()
    if not profile:
        profile = LearnerProfile(
            user_id=student.id,
            academic_level="Grade 11 ML & CS Track",
            subject="Machine Learning & CS",
            goal="National CS & AI Foundation",
            experience_level="Intermediate",
            study_time_minutes=300,
            preferences={"learning_mode": "visual", "pace": "adaptive"},
            diagnostic_done=True
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)

    # Find or create a dedicated parent account for this student
    parent_email = f"parent_{student.id}@adapted.ai"
    parent_user = db.query(User).filter(User.email == parent_email).first()
    if not parent_user:
        hashed_pwd = get_password_hash("parent_sync_access_secure")
        parent_user = User(
            name=f"Parent of {student.name}",
            email=parent_email,
            password_hash=hashed_pwd,
            role="parent",
            link_code=f"PARENT-{student.id:04d}"
        )
        db.add(parent_user)
        db.commit()
        db.refresh(parent_user)

    # Ensure parent is linked to this student
    existing_link = db.query(ParentStudentLink).filter(
        ParentStudentLink.parent_id == parent_user.id,
        ParentStudentLink.student_id == student.id
    ).first()
    if not existing_link:
        link = ParentStudentLink(parent_id=parent_user.id, student_id=student.id)
        db.add(link)
        db.commit()

    access_token = create_access_token(data={"sub": str(parent_user.id)})

    return AuthResponse(
        access_token=access_token,
        token_type="bearer",
        user=parent_user,
        onboarding_complete=True
    )

@router.get("/me", response_model=MeResponse)
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(LearnerProfile).filter(LearnerProfile.user_id == current_user.id).first()
    return MeResponse(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        role=current_user.role or "student",
        link_code=current_user.link_code,
        onboarding_complete=(current_user.role == "parent") or (profile is not None),
        diagnostic_done=profile.diagnostic_done if profile else False
    )
