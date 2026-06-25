from typing import Optional
from datetime import date
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from app.database import supabase
from app.dependencies import get_current_user

router = APIRouter(prefix="/deadlines", tags=["deadlines"])


class DeadlineCreate(BaseModel):
    title: str
    due_date: date
    category: Optional[str] = None
    source_type: str = "manual"
    source_id: Optional[str] = None


class DeadlineUpdate(BaseModel):
    title: Optional[str] = None
    due_date: Optional[date] = None
    category: Optional[str] = None
    completed: Optional[bool] = None


@router.get("/")
async def get_deadlines(user_id: str = Depends(get_current_user)):
    """Все дедлайны текущего студента, отсортированные по дате."""
    res = (
        supabase.table("deadlines")
        .select("*")
        .eq("student_id", user_id)
        .order("due_date")
        .execute()
    )
    return res.data


@router.post("/")
async def create_deadline(
    data: DeadlineCreate,
    user_id: str = Depends(get_current_user),
):
    """Создать дедлайн вручную."""
    payload = data.model_dump()
    payload["student_id"] = user_id
    payload["due_date"] = str(payload["due_date"])
    res = supabase.table("deadlines").insert(payload).execute()
    return res.data[0] if res.data else {}


@router.patch("/{deadline_id}")
async def update_deadline(
    deadline_id: str,
    data: DeadlineUpdate,
    user_id: str = Depends(get_current_user),
):
    """Обновить дедлайн (отметить выполненным, изменить дату и т.д.)."""
    payload = data.model_dump(exclude_none=True)
    if not payload:
        raise HTTPException(status_code=400, detail="Нечего обновлять")
    if "due_date" in payload:
        payload["due_date"] = str(payload["due_date"])
    res = (
        supabase.table("deadlines")
        .update(payload)
        .eq("id", deadline_id)
        .eq("student_id", user_id)
        .execute()
    )
    return res.data[0] if res.data else {}


@router.delete("/{deadline_id}")
async def delete_deadline(
    deadline_id: str,
    user_id: str = Depends(get_current_user),
):
    """Удалить дедлайн."""
    supabase.table("deadlines").delete().eq("id", deadline_id).eq(
        "student_id", user_id
    ).execute()
    return {"status": "deleted"}
