import os
import fitz  # PyMuPDF
from typing import List, Dict, Any
from chromadb import PersistentClient
from sentence_transformers import SentenceTransformer
from app.config import settings

# Initialize Chroma DB
# Ensure absolute/relative path resolution works
chroma_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../", settings.CHROMA_DIR))
os.makedirs(chroma_path, exist_ok=True)
chroma_client = PersistentClient(path=chroma_path)

# Initialize embedding model (downloads locally on first run)
embed_model = SentenceTransformer(settings.EMBEDDING_MODEL)

def clean_text(text: str) -> str:
    return text.replace('\n', ' ').strip()

def process_and_ingest_pdf(user_id: int, material_id: int, file_path: str, filename: str) -> int:
    try:
        doc = fitz.open(file_path)
    except Exception as e:
        raise ValueError(f"Could not open PDF: {e}")

    collection_name = f"user_{user_id}"
    collection = chroma_client.get_or_create_collection(name=collection_name)

    chunk_count = 0
    
    for page_num in range(len(doc)):
        page = doc[page_num]
        text = page.get_text("text")
        if not text.strip():
            continue
            
        clean = clean_text(text)
        
        char_i = 0
        while char_i < len(clean):
            chunk = clean[char_i : char_i + settings.CHUNK_SIZE]
            if len(chunk) < 50:
                char_i += (settings.CHUNK_SIZE - settings.CHUNK_OVERLAP)
                continue
                
            embedding = embed_model.encode(chunk).tolist()
            chunk_id = f"mat_{material_id}_p{page_num+1}_c{chunk_count}"
            
            collection.add(
                ids=[chunk_id],
                embeddings=[embedding],
                documents=[chunk],
                metadatas=[{"material_id": material_id, "filename": filename, "page": page_num + 1}]
            )
            
            chunk_count += 1
            char_i += (settings.CHUNK_SIZE - settings.CHUNK_OVERLAP)

    return chunk_count

def search(user_id: int, query: str, k: int = 3) -> List[Dict[str, Any]]:
    collection_name = f"user_{user_id}"
    try:
        collection = chroma_client.get_collection(name=collection_name)
    except Exception:
        return [] 
        
    query_embedding = embed_model.encode(query).tolist()
    
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=k
    )
    
    formatted_results = []
    if results['documents'] and len(results['documents']) > 0:
        for i in range(len(results['documents'][0])):
            formatted_results.append({
                "text": results['documents'][0][i],
                "metadata": results['metadatas'][0][i]
            })
            
    return formatted_results

def delete_material_vectors(user_id: int, material_id: int):
    collection_name = f"user_{user_id}"
    try:
        collection = chroma_client.get_collection(name=collection_name)
        collection.delete(where={"material_id": material_id})
    except Exception:
        pass
