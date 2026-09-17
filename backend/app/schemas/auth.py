from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Optional[str] = "student"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class ParentKeyLogin(BaseModel):
    student_name: str
    parent_key: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str = "student"
    link_code: Optional[str] = None

    class Config:
        from_attributes = True

class AuthResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse
    onboarding_complete: bool

class MeResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str = "student"
    link_code: Optional[str] = None
    onboarding_complete: bool
    diagnostic_done: bool
