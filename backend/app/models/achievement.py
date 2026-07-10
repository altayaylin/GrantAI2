from pydantic import BaseModel
from typing import Optional


class AchievementCreate(BaseModel):
    title: str
    description: Optional[str] = None
    category: str = "activity"  # 'activity' | 'award'
    type: Optional[str] = None  # olympiad | volunteering | internship | leadership | project | research
    level: Optional[str] = None  # school | city | national | international (только для type=olympiad)
    file_url: Optional[str] = None
    file_name: Optional[str] = None


class Achievement(AchievementCreate):
    id: str
    student_id: str
    created_at: str
