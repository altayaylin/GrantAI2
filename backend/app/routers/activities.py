from typing import Optional
from fastapi import APIRouter
from app.database import supabase

router = APIRouter(prefix="/activities", tags=["activities"])


@router.get("/")
async def list_activities(category: Optional[str] = None, verified_only: bool = True):
    """Список активностей (стажировки/research/олимпиады/волонтёрство)."""
    query = supabase.table("activities").select("*")
    if category:
        query = query.eq("category", category)
    if verified_only:
        query = query.eq("verified", True)
    response = query.order("deadline").execute()
    return response.data
