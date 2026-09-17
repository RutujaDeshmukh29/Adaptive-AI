import json
import logging
from typing import List, Dict, Any, Optional
from app.services.llm_service import generate_json_response

logger = logging.getLogger(__name__)

CURATED_TOPIC_DATA = {
    # Deep Learning & Transformers
    "Attention Mechanisms & Transformers": {
        "hours": 2.5,
        "checklist": [
            {"id": "c1", "title": "Scaled dot-product attention formula & Q/K/V projections", "completed": False},
            {"id": "c2", "title": "Multi-head attention dimension splitting and concatenation", "completed": False},
            {"id": "c3", "title": "Causal masking implementation in auto-regressive decoders", "completed": False},
            {"id": "c4", "title": "Sinusoidal and rotary positional embeddings (RoPE)", "completed": False},
            {"id": "c5", "title": "Layer normalization and residual skip connections", "completed": False}
        ],
        "resources": [
            {
                "title": "Attention in Transformers | Visual Deep Dive",
                "type": "youtube",
                "url": "https://www.youtube.com/watch?v=eMlx5fFNoYc",
                "channel_or_author": "3Blue1Brown",
                "duration_or_pages": "22 mins",
                "summary": "Visual geometric intuition of keys, queries, and value projection matrices."
            },
            {
                "title": "Let's build GPT: from scratch, in code, spelled out",
                "type": "youtube",
                "url": "https://www.youtube.com/watch?v=kCc8FmEb1nY",
                "channel_or_author": "Andrej Karpathy",
                "duration_or_pages": "1 hr 56 mins",
                "summary": "Step-by-step PyTorch coding of multi-head attention and transformer decoders."
            },
            {
                "title": "Attention Is All You Need (Vaswani et al., 2017)",
                "type": "paper",
                "url": "https://arxiv.org/abs/1706.03762",
                "channel_or_author": "Google Brain / arXiv",
                "duration_or_pages": "15 pages",
                "summary": "The seminal research paper introducing the Transformer architecture."
            },
            {
                "title": "PyTorch nn.MultiheadAttention Documentation",
                "type": "doc",
                "url": "https://pytorch.org/docs/stable/generated/torch.nn.MultiheadAttention.html",
                "channel_or_author": "PyTorch Docs",
                "duration_or_pages": "Reference",
                "summary": "Official API specs, batch dimensions, and forward pass argument formats."
            }
        ]
    },
    "Vector Embeddings & ChromaDB": {
        "hours": 2.0,
        "checklist": [
            {"id": "c1", "title": "Dense embedding spaces vs high-dimensional sparse representations", "completed": False},
            {"id": "c2", "title": "Cosine similarity, dot product, and Euclidean distance metrics", "completed": False},
            {"id": "c3", "title": "ChromaDB collection initialization, document indexing, and querying", "completed": False},
            {"id": "c4", "title": "Metadata filtering and vector retrieval re-ranking", "completed": False}
        ],
        "resources": [
            {
                "title": "Vector Databases and Embeddings Explained Simply",
                "type": "youtube",
                "url": "https://www.youtube.com/watch?v=klTvEwg3oJ4",
                "channel_or_author": "Fireship",
                "duration_or_pages": "8 mins",
                "summary": "High-level overview of vector embeddings, indexing, and vector DBs."
            },
            {
                "title": "ChromaDB Official Documentation & Quickstart",
                "type": "doc",
                "url": "https://docs.trychroma.com/",
                "channel_or_author": "Chroma Docs",
                "duration_or_pages": "Documentation",
                "summary": "Local vector store management and similarity querying guide."
            }
        ]
    },
    "Neural Networks & Backpropagation": {
        "hours": 3.0,
        "checklist": [
            {"id": "c1", "title": "Forward propagation activation functions (ReLU, GELU, Sigmoid)", "completed": False},
            {"id": "c2", "title": "Loss function formulation (Cross-Entropy, Mean Squared Error)", "completed": False},
            {"id": "c3", "title": "Chain rule differentiation across hidden layers", "completed": False},
            {"id": "c4", "title": "Gradient descent optimizers (SGD with momentum, AdamW)", "completed": False}
        ],
        "resources": [
            {
                "title": "What is a Neural Network? & Gradient Descent",
                "type": "youtube",
                "url": "https://www.youtube.com/watch?v=aircAruvnKk",
                "channel_or_author": "3Blue1Brown",
                "duration_or_pages": "19 mins",
                "summary": "Essential visual mathematical foundations of deep learning."
            },
            {
                "title": "The Micrograd Engine: Automatic Differentiation",
                "type": "youtube",
                "url": "https://www.youtube.com/watch?v=VMj-3S1tku0",
                "channel_or_author": "Andrej Karpathy",
                "duration_or_pages": "2 hrs 25 mins",
                "summary": "Building backprop and scalar autograd engine from the ground up."
            }
        ]
    },
    "RAG Pipeline Orchestration": {
        "hours": 2.5,
        "checklist": [
            {"id": "c1", "title": "Text chunking strategies (recursive, semantic, window-overlap)", "completed": False},
            {"id": "c2", "title": "Vector store ingestion and embedding generation", "completed": False},
            {"id": "c3", "title": "Top-K retrieval scoring and context window injection", "completed": False},
            {"id": "c4", "title": "Hallucination prevention and citation attribution", "completed": False}
        ],
        "resources": [
            {
                "title": "Retrieval-Augmented Generation (RAG) Architecture",
                "type": "youtube",
                "url": "https://www.youtube.com/watch?v=T-D1OfcDW1M",
                "channel_or_author": "IBM Technology",
                "duration_or_pages": "12 mins",
                "summary": "End-to-end architecture diagram of enterprise RAG pipelines."
            },
            {
                "title": "LangChain Retrieval Architecture Documentation",
                "type": "doc",
                "url": "https://python.langchain.com/docs/use_cases/question_answering/",
                "channel_or_author": "LangChain Docs",
                "duration_or_pages": "Guide",
                "summary": "Document loaders, vector stores, and conversational retrieval chains."
            }
        ]
    },
    "Decoder Architectures & KV Cache": {
        "hours": 2.5,
        "checklist": [
            {"id": "c1", "title": "Decoder-only autoregressive sampling loop", "completed": False},
            {"id": "c2", "title": "KV Cache tensor memory optimization and speedups", "completed": False},
            {"id": "c3", "title": "Temperature, top-p, and top-k logit post-processing", "completed": False}
        ],
        "resources": [
            {
                "title": "KV Cache Explained: Accelerating LLM Inference",
                "type": "youtube",
                "url": "https://www.youtube.com/watch?v=80bIUggRJf4",
                "channel_or_author": "StatQuest",
                "duration_or_pages": "15 mins",
                "summary": "How caching Key and Value projections avoids quadratic recomputations."
            }
        ]
    },
    "Fine-Tuning & LoRA": {
        "hours": 3.0,
        "checklist": [
            {"id": "c1", "title": "Full parameter fine-tuning vs parameter-efficient fine-tuning (PEFT)", "completed": False},
            {"id": "c2", "title": "Low-Rank Adaptation (LoRA) rank r and alpha hyperparameter tuning", "completed": False},
            {"id": "c3", "title": "QLoRA 4-bit NormalFloat quantization mechanics", "completed": False}
        ],
        "resources": [
            {
                "title": "LoRA: Low-Rank Adaptation of Large Language Models",
                "type": "paper",
                "url": "https://arxiv.org/abs/2106.09685",
                "channel_or_author": "Microsoft Research",
                "duration_or_pages": "14 pages",
                "summary": "The landmark paper on efficient adapter-based model fine-tuning."
            }
        ]
    },
    # Python Topics
    "Variables": {
        "hours": 1.5,
        "checklist": [
            {"id": "c1", "title": "Variable naming conventions and PEP 8 guidelines", "completed": False},
            {"id": "c2", "title": "Memory assignment, references, and id() introspection", "completed": False},
            {"id": "c3", "title": "Constants and scope hierarchy", "completed": False}
        ],
        "resources": [
            {
                "title": "Python Variables and Memory Layout",
                "type": "youtube",
                "url": "https://www.youtube.com/watch?v=k9TUPpGqYTo",
                "channel_or_author": "Programming with Mosh",
                "duration_or_pages": "14 mins",
                "summary": "Understanding variables, pointers, and memory in Python."
            }
        ]
    },
    "Functions": {
        "hours": 2.0,
        "checklist": [
            {"id": "c1", "title": "Function signatures, parameters, and return statements", "completed": False},
            {"id": "c2", "title": "Arbitrary arguments (*args and **kwargs) unpacking", "completed": False},
            {"id": "c3", "title": "First-class functions, closures, and higher-order decorators", "completed": False}
        ],
        "resources": [
            {
                "title": "Python Functions: Comprehensive Deep Dive",
                "type": "youtube",
                "url": "https://www.youtube.com/watch?v=9Os0o3wzS_I",
                "channel_or_author": "Corey Schafer",
                "duration_or_pages": "25 mins",
                "summary": "Functions, parameters, scope rules, and return structures."
            }
        ]
    },
    "OOP Basics": {
        "hours": 2.5,
        "checklist": [
            {"id": "c1", "title": "Class creation, self keyword, and __init__ instantiation", "completed": False},
            {"id": "c2", "title": "Instance vs class attributes and methods (@classmethod, @staticmethod)", "completed": False},
            {"id": "c3", "title": "Inheritance, super(), and polymorphism principles", "completed": False}
        ],
        "resources": [
            {
                "title": "Python OOP Tutorial: Classes and Instances",
                "type": "youtube",
                "url": "https://www.youtube.com/watch?v=ZDa-Z5JzLYM",
                "channel_or_author": "Corey Schafer",
                "duration_or_pages": "23 mins",
                "summary": "Foundations of object-oriented design patterns in modern Python."
            }
        ]
    }
}

def calculate_day_spans(total_topics: int, total_days: int = 14) -> List[str]:
    """Generates contiguous Day ranges for each milestone based on total available days."""
    if total_topics <= 0:
        return []
    
    spans = []
    days_per_topic = max(1, total_days // total_topics)
    current_day = 1

    for i in range(total_topics):
        if i == total_topics - 1:
            end_day = total_days
        else:
            end_day = min(total_days, current_day + days_per_topic - 1)
            if end_day < current_day:
                end_day = current_day
        
        if current_day == end_day:
            spans.append(f"Day {current_day}")
        else:
            spans.append(f"Day {current_day}–{end_day}")
            
        current_day = end_day + 1
        if current_day > total_days:
            current_day = total_days

    return spans

def get_topic_enrichment(topic_name: str, order: int, total_topics: int, total_days: int = 14) -> Dict[str, Any]:
    """Returns checklist, curated resources, estimated hours, and day span for a topic."""
    # Find matching curated data
    match_key = None
    for k in CURATED_TOPIC_DATA.keys():
        if k.lower() in topic_name.lower() or topic_name.lower() in k.lower():
            match_key = k
            break
            
    if match_key:
        curated = CURATED_TOPIC_DATA[match_key]
        hours = curated["hours"]
        checklist = [item.copy() for item in curated["checklist"]]
        resources = [res.copy() for res in curated["resources"]]
    else:
        # High quality synthesized fallback
        hours = 2.0
        checklist = [
            {"id": "c1", "title": f"Core theoretical fundamentals and definitions of {topic_name}", "completed": False},
            {"id": "c2", "title": f"Applied algorithmic derivations and implementation patterns", "completed": False},
            {"id": "c3", "title": f"Edge-case handling, failure modes, and performance optimization", "completed": False},
            {"id": "c4", "title": f"Verification through practical adaptive quizzes and exercises", "completed": False}
        ]
        resources = [
            {
                "title": f"{topic_name} - Fundamentals & Practical Concepts",
                "type": "youtube",
                "url": f"https://www.youtube.com/results?search_query={topic_name.replace(' ', '+')}+tutorial",
                "channel_or_author": "Curated Tech Channels",
                "duration_or_pages": "20 mins",
                "summary": f"In-depth walkthrough of {topic_name} concepts and applications."
            },
            {
                "title": f"Official Reference Manual & Documentation",
                "type": "doc",
                "url": f"https://www.google.com/search?q={topic_name.replace(' ', '+')}+documentation",
                "channel_or_author": "Official Documentation",
                "duration_or_pages": "Standard Guide",
                "summary": f"Complete API specs, code snippets, and design best practices."
            }
        ]

    # Always ensure a practice drill resource exists
    resources.append({
        "title": f"Adaptive Practice Drill: {topic_name}",
        "type": "practice",
        "url": f"/practice",
        "channel_or_author": "AdaptEd AI Interactive Engine",
        "duration_or_pages": "10–15 mins",
        "summary": "Real-time calibrated MCQ questions to verify mastery band."
    })

    return {
        "estimated_hours": hours,
        "checklist": checklist,
        "resources": resources
    }

def generate_ai_custom_roadmap(prompt: str, days: int = 14, user_level: str = "Undergraduate") -> Dict[str, Any]:
    """Uses LLM to synthesize a custom day-wise roadmap when the user enters a custom goal."""
    ai_prompt = f"""
You are an expert AI curriculum designer.
The student has requested a customized learning roadmap:
User Request: "{prompt}"
Target Timeline: {days} Days
Learner Academic Level: {user_level}

TASK:
Design a structured, rigorous, day-by-day roadmap with 4 to 6 sequential milestones.
Divide the {days} days realistically across the milestones.
For EACH milestone, provide:
1. "order": integer (1, 2, 3...)
2. "topic": string (concise catchy milestone name)
3. "day_range": string (e.g. "Day 1–3", "Day 4–7", etc.)
4. "reason": string (why this milestone is taught here and what it achieves)
5. "estimated_hours": float (e.g. 2.5)
6. "checklist": list of 3-4 specific, actionable sub-topic items (each with "id" like "c1", "title", "completed": false)
7. "resources": list of 2-3 curated learning resources (each with "title", "type": "youtube"|"doc"|"paper", "url", "channel_or_author", "duration_or_pages", "summary")

Output MUST be a strict JSON object with this format:
{{
  "goal": "{prompt}",
  "subject": "Custom Learning Track",
  "overall_progress": 0.0,
  "target_days": {days},
  "items": [
    ...milestones
  ]
}}
"""
    data = generate_json_response(ai_prompt)
    if data and isinstance(data, dict) and "items" in data and len(data["items"]) > 0:
        # Set first item as current and subsequent as locked
        items = data["items"]
        for idx, it in enumerate(items):
            it["topic_id"] = 1000 + idx
            it["mastery"] = 0.0
            if idx == 0:
                it["status"] = "current"
                it["reason"] = "Your initial starting milestone."
            else:
                it["status"] = "locked"
        return data

    # Fallback if AI service is not reachable
    day_spans = calculate_day_spans(4, days)
    return {
        "goal": prompt,
        "subject": "Custom AI Curriculum",
        "overall_progress": 0.0,
        "target_days": days,
        "items": [
            {
                "order": 1,
                "topic_id": 1001,
                "topic": f"Foundations & Core Prerequisites of {prompt[:30]}",
                "status": "current",
                "mastery": 0.0,
                "reason": "Master foundational definitions and establish initial environment setup.",
                "day_range": day_spans[0] if len(day_spans) > 0 else "Day 1–3",
                "estimated_hours": 2.5,
                "checklist": [
                    {"id": "c1", "title": "Core mathematical & algorithmic terminology", "completed": False},
                    {"id": "c2", "title": "Environment configuration and sample test harness", "completed": False},
                    {"id": "c3", "title": "First baseline execution and sanity verification", "completed": False}
                ],
                "resources": [
                    {
                        "title": f"Getting Started with {prompt[:30]}",
                        "type": "youtube",
                        "url": f"https://www.youtube.com/results?search_query={prompt.replace(' ', '+')}+tutorial",
                        "channel_or_author": "Curated Tech Channel",
                        "duration_or_pages": "25 mins",
                        "summary": "Practical quickstart and fundamentals overview."
                    }
                ]
            },
            {
                "order": 2,
                "topic_id": 1002,
                "topic": "Core Implementation & Architectural Patterns",
                "status": "locked",
                "mastery": 0.0,
                "reason": "Construct the main operational components and internal logic.",
                "day_range": day_spans[1] if len(day_spans) > 1 else "Day 4–7",
                "estimated_hours": 3.0,
                "checklist": [
                    {"id": "c1", "title": "Pipeline architecture design and data flow", "completed": False},
                    {"id": "c2", "title": "Modular function decomposition and abstractions", "completed": False},
                    {"id": "c3", "title": "Comprehensive unit tests and edge cases", "completed": False}
                ],
                "resources": [
                    {
                        "title": "Architecture & Clean Code Walkthrough",
                        "type": "doc",
                        "url": "https://docs.python.org/3/",
                        "channel_or_author": "Official Documentation",
                        "duration_or_pages": "Reference",
                        "summary": "Design patterns and reference manual."
                    }
                ]
            },
            {
                "order": 3,
                "topic_id": 1003,
                "topic": "Advanced Optimization & Production Scaling",
                "status": "locked",
                "mastery": 0.0,
                "reason": "Optimize memory, compute efficiency, and scalability bottlenecks.",
                "day_range": day_spans[2] if len(day_spans) > 2 else "Day 8–11",
                "estimated_hours": 3.0,
                "checklist": [
                    {"id": "c1", "title": "Time and space complexity profiling", "completed": False},
                    {"id": "c2", "title": "Caching mechanisms and async operations", "completed": False},
                    {"id": "c3", "title": "Failure recovery and fault tolerance", "completed": False}
                ],
                "resources": [
                    {
                        "title": "Production Deployment & Optimization Guide",
                        "type": "paper",
                        "url": "https://arxiv.org/",
                        "channel_or_author": "Technical Research",
                        "duration_or_pages": "Guide",
                        "summary": "Scaling insights and operational trade-offs."
                    }
                ]
            },
            {
                "order": 4,
                "topic_id": 1004,
                "topic": "Capstone Integration & Mastery Verification",
                "status": "locked",
                "mastery": 0.0,
                "reason": "Comprehensive evaluation, interview readiness, and final project integration.",
                "day_range": day_spans[3] if len(day_spans) > 3 else "Day 12–14",
                "estimated_hours": 2.5,
                "checklist": [
                    {"id": "c1", "title": "End-to-end integration and demonstration", "completed": False},
                    {"id": "c2", "title": "Mock interview and technical defense", "completed": False},
                    {"id": "c3", "title": "Final adaptive assessment submission", "completed": False}
                ],
                "resources": [
                    {
                        "title": "Comprehensive Knowledge Review",
                        "type": "practice",
                        "url": "/practice",
                        "channel_or_author": "AdaptEd AI",
                        "duration_or_pages": "Interactive",
                        "summary": "Mastery certification drill."
                    }
                ]
            }
        ]
    }
