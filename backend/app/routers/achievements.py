from fastapi import APIRouter, HTTPException, Depends
from app.database import supabase
from app.models.achievement import AchievementCreate
from app.dependencies import get_current_user

router = APIRouter(prefix="/achievements", tags=["achievements"])


def _count_field(category: str) -> str:
    return "activities_count" if category == "activity" else "awards_count"


def _bump_profile_count(user_id: str, category: str, delta: int) -> None:
    """Держит profiles.activities_count/awards_count в синхроне со списком достижений."""
    field = _count_field(category)
    profile = (
        supabase.table("profiles").select(field).eq("id", user_id).single().execute()
    )
    current = (profile.data or {}).get(field) or 0
    supabase.table("profiles").update({field: max(0, current + delta)}).eq(
        "id", user_id
    ).execute()


@router.get("/")
async def list_achievements(user_id: str = Depends(get_current_user)):
    """Список достижений и активностей текущего студента."""
    res = (
        supabase.table("achievements")
        .select("*")
        .eq("student_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    return res.data


@router.post("/")
async def create_achievement(
    data: AchievementCreate,
    user_id: str = Depends(get_current_user),
):
    """Добавить достижение или активность (с опциональным файлом)."""
    payload = data.model_dump()
    payload["student_id"] = user_id
    try:
        res = supabase.table("achievements").insert(payload).execute()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Не удалось сохранить: {e}")
    _bump_profile_count(user_id, data.category, +1)
    return res.data[0] if res.data else {}


@router.delete("/{achievement_id}")
async def delete_achievement(
    achievement_id: str,
    user_id: str = Depends(get_current_user),
):
    """Удалить достижение/активность."""
    existing = (
        supabase.table("achievements")
        .select("category")
        .eq("id", achievement_id)
        .eq("student_id", user_id)
        .single()
        .execute()
    )
    if not existing.data:
        raise HTTPException(status_code=404, detail="Достижение не найдено")

    supabase.table("achievements").delete().eq("id", achievement_id).eq(
        "student_id", user_id
    ).execute()
    _bump_profile_count(user_id, existing.data["category"], -1)
    return {"status": "ok"}
