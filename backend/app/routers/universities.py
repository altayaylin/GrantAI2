from typing import Optional, List
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from app.database import supabase
from app.models.profile import StudentProfile
from app.models.university import University, MatchResult
from app.services.matching import match_universities
from app.dependencies import get_current_user

router = APIRouter(prefix="/universities", tags=["universities"])


class AddToListBody(BaseModel):
    category: Optional[str] = None  # 'reach' | 'match' | 'safety'


class UpdateListBody(BaseModel):
    category: str


@router.get("/")
async def list_universities(country: Optional[str] = None, major: Optional[str] = None):
    """Список вузов с опциональной фильтрацией по стране."""
    query = supabase.table("universities").select("*")
    if country:
        query = query.eq("country", country)
    response = query.execute()
    return response.data


@router.get("/match", response_model=List[MatchResult])
async def get_my_matches(user_id: str = Depends(get_current_user)):
    """Подбор вузов под профиль авторизованного студента."""
    try:
        profile_res = (
            supabase.table("profiles")
            .select("*")
            .eq("id", user_id)
            .single()
            .execute()
        )
    except Exception:
        raise HTTPException(status_code=404, detail="Профиль не найден — заполните его сначала")

    student = StudentProfile(**profile_res.data)

    uni_res = supabase.table("universities").select("*").execute()
    universities = [University(**u) for u in uni_res.data]

    return match_universities(student, universities)


@router.get("/my-list")
async def get_my_list(user_id: str = Depends(get_current_user)):
    """Список вузов, добавленных студентом, с данными о вузе."""
    res = (
        supabase.table("student_university_list")
        .select("*, universities(*)")
        .eq("student_id", user_id)
        .execute()
    )
    return res.data


@router.post("/list/{university_id}")
async def add_to_list(
    university_id: str,
    body: AddToListBody = AddToListBody(),
    user_id: str = Depends(get_current_user),
):
    """Добавить вуз в список студента + автосоздать дедлайн."""
    try:
        uni_res = (
            supabase.table("universities")
            .select("*")
            .eq("id", university_id)
            .single()
            .execute()
        )
    except Exception:
        raise HTTPException(status_code=404, detail="Университет не найден")
    uni = uni_res.data

    existing = (
        supabase.table("student_university_list")
        .select("id")
        .eq("student_id", user_id)
        .eq("university_id", university_id)
        .execute()
    )
    if existing.data:
        return {"status": "already_exists"}

    supabase.table("student_university_list").insert({
        "student_id": user_id,
        "university_id": university_id,
        "category": body.category,
    }).execute()

    if uni.get("deadline"):
        supabase.table("deadlines").insert({
            "student_id": user_id,
            "title": f"Подача: {uni['name']}",
            "source_type": "university",
            "source_id": university_id,
            "due_date": str(uni["deadline"]),
            "category": "Вуз",
        }).execute()

    return {"status": "added", "university": uni["name"]}


@router.patch("/list/{university_id}")
async def update_list_item(
    university_id: str,
    body: UpdateListBody,
    user_id: str = Depends(get_current_user),
):
    """Обновить категорию вуза в списке (reach / match / safety)."""
    supabase.table("student_university_list").update({
        "category": body.category,
    }).eq("student_id", user_id).eq("university_id", university_id).execute()
    return {"status": "updated"}


@router.delete("/list/{university_id}")
async def remove_from_list(university_id: str, user_id: str = Depends(get_current_user)):
    """Удалить вуз из списка студента."""
    supabase.table("student_university_list").delete().eq(
        "student_id", user_id
    ).eq("university_id", university_id).execute()
    return {"status": "removed"}
