from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # DATABASE
    DATABASE_URL: str = "sqlite:///./adapted.db"

    # AUTH
    JWT_SECRET: str = "supersecretkey-change-me-later-for-prod-32-chars"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    # GEMINI
    GEMINI_API_KEY: str = "your_key_here"
    GEMINI_MODEL: str = "gemini-3.6-flash"
    GEMINI_FALLBACK_MODEL: str = "gemini-3.5-flash-lite"
    GEMINI_TIMEOUT_SECONDS: int = 45
    GEMINI_MAX_RETRIES: int = 2
    
    # GROQ
    GROQ_API_KEY: str = ""

    # RAG
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"
    CHROMA_DIR: str = "../data/chroma"
    UPLOAD_DIR: str = "../data/uploads"
    CHUNK_SIZE: int = 800
    CHUNK_OVERLAP: int = 150
    TOP_K: int = 4
    MAX_UPLOAD_MB: int = 20
    MAX_PAGES: int = 80

    # ADAPTIVE ENGINE
    MASTERY_ALPHA_FIRST: float = 0.50
    MASTERY_ALPHA_REPEAT: float = 0.30
    PREREQ_UNLOCK_THRESHOLD: int = 60
    PREREQ_RELOCK_THRESHOLD: int = 50
    QUIZ_QUESTION_COUNT: int = 5
    DIAGNOSTIC_QUESTION_COUNT: int = 10

    # APP
    APP_NAME: str = "AdaptEd AI"
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"
    DEBUG: bool = True

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
