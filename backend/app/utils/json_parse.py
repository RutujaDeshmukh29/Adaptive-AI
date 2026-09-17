import json
import re

def clean_text(text: str) -> str:
    return text.replace('\n', ' ').strip()

def safe_json(text: str):
    """
    Strips ```json markdown fences if the LLM includes them, 
    then parses the JSON safely.
    """
    text = text.strip()
    if text.startswith("```json"):
        text = text[7:]
    if text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
        
    try:
        return json.loads(text.strip())
    except json.JSONDecodeError as e:
        print(f"JSON Parse Error: {e}")
        print(f"Raw Text: {text}")
        return None
