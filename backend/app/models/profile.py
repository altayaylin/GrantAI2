from pydantic import BaseModel
from typing import Optional, List


class StudentProfile(BaseModel):
    id: str
    major: Optional[str] = None
    target_countries: List[str] = []
    gpa: Optional[float] = None
    gpa_scale: float = 4.0
    sat_total: Optional[int] = None
    sat_math: Optional[int] = None
    sat_ebrw: Optional[int] = None
    ielts: Optional[float] = None
    toefl: Optional[int] = None
    activities_count: int = 0
    awards_count: int = 0


class ProfileCreate(BaseModel):
    full_name: Optional[str] = None
    school: Optional[str] = None
    grade: Optional[int] = None
    city: Optional[str] = None
    major: Optional[str] = None
    target_countries: Optional[List[str]] = None
    gpa: Optional[float] = None
    gpa_scale: float = 4.0
    sat_total: Optional[int] = None
    sat_math: Optional[int] = None
    sat_ebrw: Optional[int] = None
    ielts: Optional[float] = None
    toefl: Optional[int] = None
    activities_count: int = 0
    awards_count: int = 0


class ProfileUpdate(ProfileCreate):
    pass
