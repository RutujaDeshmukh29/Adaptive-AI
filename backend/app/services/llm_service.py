import json
import time
from app.config import settings
from app.utils.json_parse import safe_json
from groq import Groq

# Optional Gemini support
try:
    import google.generativeai as genai
    if settings.GEMINI_API_KEY:
        genai.configure(api_key=settings.GEMINI_API_KEY)
        chat_model = genai.GenerativeModel(settings.GEMINI_MODEL)
    else:
        chat_model = None
except ImportError:
    genai = None
    chat_model = None

if settings.GROQ_API_KEY:
    groq_client = Groq(api_key=settings.GROQ_API_KEY)
else:
    groq_client = None

def generate_chat_response(prompt: str, retries: int = 3, delay: int = 15) -> str:
    if not groq_client:
        return "I'm sorry, I'm having trouble connecting to my AI brain right now."
        
    for attempt in range(retries):
        try:
            chat_completion = groq_client.chat.completions.create(
                messages=[
                    {"role": "user", "content": prompt}
                ],
                model="openai/gpt-oss-20b",
            )
            return chat_completion.choices[0].message.content
        except Exception as e:
            error_msg = str(e)
            print(f"Groq API Error (Attempt {attempt+1}/{retries}): {error_msg}")
            if "429" in error_msg and attempt < retries - 1:
                print(f"Rate limited. Waiting {delay} seconds before retrying...")
                time.sleep(delay)
            else:
                return "I'm sorry, I'm having trouble connecting to my AI brain right now. (Groq Error)"

def generate_json_response(prompt: str, retries: int = 3, delay: int = 15) -> dict | list:
    if not groq_client:
        return []
        
    # Groq requires the prompt to explicitly ask for JSON when using json_object mode
    prompt = prompt + "\n\nIMPORTANT: You must return ONLY a valid JSON object or array. No other text."
    
    for attempt in range(retries):
        try:
            chat_completion = groq_client.chat.completions.create(
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that strictly outputs valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                model="openai/gpt-oss-20b",
                response_format={"type": "json_object"},
            )
            response_text = chat_completion.choices[0].message.content
            return safe_json(response_text)
        except Exception as e:
            error_msg = str(e)
            print(f"Groq API Error (Attempt {attempt+1}/{retries}): {error_msg}")
            if "429" in error_msg and attempt < retries - 1:
                print(f"Rate limited. Waiting {delay} seconds before retrying...")
                time.sleep(delay)
            else:
                return []
