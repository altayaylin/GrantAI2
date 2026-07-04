from fastapi import APIRouter, HTTPException, Depends
from app.database import supabase
from app.models.profile import ProfileCreate, ProfileUpdate
from app.dependencies import get_current_user

router = APIRouter(prefix="/profiles", tags=["profiles"])


@router.get("/me")
async def get_my_profile(user_id: str = Depends(get_current_user)):
    """Получить профиль текущего пользователя."""
    try:
        res = (
            supabase.table("profiles")
            .select("*")
            .eq("id", user_id)
            .single()
            .execute()
        )
    except Exception:
        raise HTTPException(status_code=404, detail="Профиль не найден")
    return res.data


@router.post("/me")
async def create_or_update_profile(
    data: ProfileCreate,
    user_id: str = Depends(get_current_user),
):
    """Создать или обновить профиль (upsert)."""
    payload = {k: v for k, v in data.model_dump().items() if v is not None}
    payload["id"] = user_id
    try:
        res = supabase.table("profiles").upsert(payload).execute()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Не удалось сохранить профиль: {e}")
    return res.data[0] if res.data else {}


@router.put("/me")
async def update_profile(
    data: ProfileUpdate,
    user_id: str = Depends(get_current_user),
):
    """Частично обновить профиль."""
    payload = data.model_dump(exclude_none=True)
    if not payload:
        raise HTTPException(status_code=400, detail="Нечего обновлять")
    try:
        res = (
            supabase.table("profiles")
            .update(payload)
            .eq("id", user_id)
            .execute()
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Не удалось обновить профиль: {e}")
    return res.data[0] if res.data else {}
