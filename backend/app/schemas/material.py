from pydantic import BaseModel
from typing import Optional

class MaterialResponse(BaseModel):
    id: int
    filename: str
    status: str
    chunk_count: int
    uploaded_at: Optional[str]
