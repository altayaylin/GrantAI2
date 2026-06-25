from pydantic import BaseModel
from typing import Optional, List
from datetime import date


class University(BaseModel):
    id: str
    name: str
    country: str
    qs_rank: Optional[int] = None
    acceptance_rate: Optional[float] = None
    sat_25th: Optional[int] = None
    sat_75th: Optional[int] = None
    avg_gpa: Optional[float] = None
    min_ielts: Optional[float] = None
    min_toefl: Optional[int] = None
    majors: List[str] = []
    deadline: Optional[date] = None
    tuition_usd: Optional[int] = None
    has_scholarship: bool = False


class MatchResult(BaseModel):
    university: University
    match_score: float
    category: str        # 'safety' | 'match' | 'reach'
    reasons: List[str]
