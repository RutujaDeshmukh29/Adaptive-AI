import sys
import os

# Ensure backend root directory is in sys.path so 'app.*' imports resolve from anywhere
_backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
import app.models  # This ensures all models are registered with Base
from app.routes import auth, profile, materials, chat, quiz, path, parent, challenge, diagram

# Initialize DB tables
Base.metadata.create_all(bind=engine)

# Auto-seed initial curriculum topics if database is newly initialized
try:
    from app.seed.topics_python import seed_topics
    from app.database import SessionLocal
    with SessionLocal() as _db:
        seed_topics(_db)
except Exception as _e:
    print(f"Curriculum auto-seed note: {_e}")

app = FastAPI(
    title=settings.APP_NAME,
    description="Adaptive Learning Platform API",
    version="1.0.0"
)

# Configure CORS
raw_origins = [origin.strip().rstrip("/") for origin in settings.CORS_ORIGINS.split(",") if origin.strip()]

if "*" in raw_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origin_regex="https?://.*",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=raw_origins,
        allow_origin_regex=r"https://.*\.vercel\.app",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Include routers
app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(materials.router)
app.include_router(chat.router)
app.include_router(quiz.router)
app.include_router(path.router)
app.include_router(parent.router)
app.include_router(challenge.router)
app.include_router(diagram.router, prefix="/api/diagram", tags=["Diagram"])

@app.get("/health", tags=["system"])
def health_check():
    return {"status": "ok", "app": settings.APP_NAME, "version": "1.0"}
