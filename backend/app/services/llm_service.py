import google.generativeai as genai
import json
from app.config import settings
from app.utils.json_parse import safe_json

genai.configure(api_key=settings.GEMINI_API_KEY)

# Use standard model for chat
chat_model = genai.GenerativeModel(settings.GEMINI_MODEL)

# Use JSON-enforced model for quizzes (if the model supports it, else just standard)
try:
    json_model = genai.GenerativeModel(settings.GEMINI_MODEL, generation_config={"response_mime_type": "application/json"})
except Exception:
    json_model = chat_model

def generate_chat_response(prompt: str) -> str:
    try:
        response = chat_model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Gemini API Error: {e}")
        return "I'm sorry, I'm having trouble connecting to my AI brain right now. Please check the Gemini API key."

def generate_json_response(prompt: str) -> dict | list:
    try:
        response = json_model.generate_content(prompt)
        return safe_json(response.text)
    except Exception as e:
        print(f"Gemini API Error: {e}")
        return []
