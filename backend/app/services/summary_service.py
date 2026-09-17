import fitz  # PyMuPDF
import os
from typing import Dict, Any
from app.services.llm_service import generate_chat_response

SUMMARY_PROMPTS = {
    "detailed": """You are an expert academic tutor on AdaptEd AI.
Generate a comprehensive, structured summary of the following educational document.
Document Title: {filename}
Student Academic Level: {level}
Student Target Goal: {goal}

Document Content:
--------------------------------------------------
{doc_text}
--------------------------------------------------

Instructions:
1. Provide a well-structured summary in clean Markdown.
2. Structure with these sections:
   # 📖 Comprehensive Study Summary: {filename}
   ## 🎯 Core Themes & Key Objectives
   ## 📑 Detailed Section-by-Section Breakdown (explain key sub-topics thoroughly with bullet points and code/math examples where relevant)
   ## 💡 Critical Concept Takeaways
   ## ⚠️ Common Pitfalls & Mistakes to Avoid
3. Be thorough, accurate to the document, and easy to study from.
""",

    "cheatsheet": """You are an expert technical revision creator on AdaptEd AI.
Create an ultra-high-yield, compact Cheat Sheet for rapid revision from the following document.
Document Title: {filename}
Student Academic Level: {level}
Student Target Goal: {goal}

Document Content:
--------------------------------------------------
{doc_text}
--------------------------------------------------

Instructions:
1. Provide a compact, high-density reference sheet in clean Markdown.
2. Structure with these sections:
   # ⚡ Quick Revision Cheat Sheet: {filename}
   ## 📌 Key Definitions & Terminology (compact bullet points or markdown table)
   ## 💻 Syntax, Code Patterns & Formulas (clean, runnable code snippets)
   ## ⏱️ High-Yield Rules of Thumb (exam & interview essentials)
   ## 🚨 Quick Mnemonics & Memory Hooks
3. Keep it punchy, fast to scan, and focused on practical recall.
""",

    "shortnotes": """You are an expert revision note creator on AdaptEd AI.
Create concise, high-yield Short Revision Notes from the following document.
Document Title: {filename}
Student Academic Level: {level}
Student Target Goal: {goal}

Document Content:
--------------------------------------------------
{doc_text}
--------------------------------------------------

Instructions:
1. Provide concise, bulleted revision notes in clean Markdown.
2. Structure with these sections:
   # 📝 Short Revision Notes: {filename}
   ## 📌 Core Definitions & Formulas (1-line definitions)
   ## ⚡ High-Yield Bullet Points (key principles, rules, theorems)
   ## 💡 Exam & Interview Rapid Recall Points
   ## 🎯 5-Minute Quick Recap Checklist
3. Keep sentences short, dense with information, and ideal for fast pre-exam revision.
""",

    "eli5": """You are a master educator on AdaptEd AI specializing in intuitive, metaphor-driven learning.
Explain the entire core concept of this document as if explaining to a 5-year-old (ELI5).
Document Title: {filename}

Document Content:
--------------------------------------------------
{doc_text}
--------------------------------------------------

Instructions:
1. Use ultra-simple language, playful real-world analogies, and everyday metaphors.
2. Avoid unexplained technical jargon completely.
3. Structure with these sections:
   # 👶 ELI5 Concept Breakdown: {filename}
   ## 🎈 The Big Picture (An engaging everyday story / metaphor)
   ## 🧩 How the Pieces Fit Together (Fun analogies for each component)
   ## 🚀 Why This Matters (Simple, real-life practical scenario)
   ## 🧠 One-Sentence Memory Hook (Unforgettable takeaway)
"""
}

MODE_TITLES = {
    "detailed": "Comprehensive Summary",
    "shortnotes": "Short Revision Notes",
    "cheatsheet": "Quick Cheat Sheet",
    "eli5": "ELI5 Breakdown"
}

def extract_document_text(file_path: str, max_pages: int = 15) -> str:
    """Extracts clean text from the first N pages of a PDF."""
    if not os.path.exists(file_path):
        return ""
    try:
        doc = fitz.open(file_path)
        pages_text = []
        for p in range(min(len(doc), max_pages)):
            t = doc[p].get_text("text").strip()
            if t:
                pages_text.append(f"--- Page {p+1} ---\n" + t)
        return "\n\n".join(pages_text)
    except Exception as e:
        print(f"Error extracting PDF text: {e}")
        return ""

def generate_document_summary(
    file_path: str,
    filename: str,
    mode: str = "detailed",
    level: str = "Beginner",
    goal: str = "Exam Preparation"
) -> Dict[str, str]:
    """Generates an AI summary for a document in the requested mode."""
    target_mode = mode.lower() if mode.lower() in SUMMARY_PROMPTS else "detailed"
    mode_name = MODE_TITLES.get(target_mode, "Comprehensive Summary")

    doc_text = extract_document_text(file_path, max_pages=15)
    if not doc_text:
        doc_text = f"Educational document covering {filename}."

    prompt = SUMMARY_PROMPTS[target_mode].format(
        filename=filename,
        level=level,
        goal=goal,
        doc_text=doc_text[:12000]  # Respect token window
    )

    summary_text = generate_chat_response(prompt)
    return {
        "mode": target_mode,
        "mode_name": mode_name,
        "summary": summary_text
    }
