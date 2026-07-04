from pydantic import BaseModel
from typing import Optional, List
from datetime import date


class Activity(BaseModel):
    id: str
    title: str
    org: Optional[str] = None
    category: str
    country: Optional[str] = None
    format: Optional[str] = None
    cost: Optional[str] = None
    cost_label: Optional[str] = None
    grades: List[int] = []
    level: Optional[str] = None
    deadline: Optional[date] = None
    duration: Optional[str] = None
    tags: List[str] = []
    prestige: Optional[int] = None
    about: Optional[str] = None
    link: Optional[str] = None
    source: str = "curated"
    verified: bool = True
