from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.learner_profile import LearnerProfile
from app.schemas.auth import UserCreate, UserLogin, AuthResponse, MeResponse
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
