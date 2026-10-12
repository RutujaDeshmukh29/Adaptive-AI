"""
AdaptEd AI - Root Entry Point
This allows Railway, Render, or any cloud platform to run seamlessly
even when the root directory is set to '/' instead of '/backend'.
"""
import sys
import os

# Add backend directory to Python system path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "backend"))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Import the FastAPI application
from app.main import app

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port)
