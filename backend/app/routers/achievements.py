import io
import json

import fitz  # PyMuPDF
import pytesseract
from openai import OpenAI
from PIL import Image
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from app.config import settings
from app.database import supabase
from app.models.achievement import AchievementCreate
from app.dependencies import get_current_user

router = APIRouter(prefix="/achievements", tags=["achievements"])

deepseek_client = OpenAI(
    api_key=settings.deepseek_api_key,
    base_url="https://api.deepseek.com",
)

EXTRACTION_MODEL = "deepseek-v4-flash"

TESSERACT_LANG = "rus+eng"

ACHIEVEMENT_TYPES = ("olympiad", "volunteering", "internship", "leadership", "project", "research")
ACHIEVEMENT_LEVELS = ("school", "city", "national", "international")

EXTRACTION_SYSTEM_PROMPT = (
    "Ты помогаешь заполнить профиль школьника по OCR-тексту документа о достижении "
    "(сертификат, диплом, грамота, рекомендательное письмо, справка об участии). "
    "Текст мог быть распознан с ошибками — исправляй очевидные опечатки OCR по смыслу. "
    "Верни ТОЛЬКО JSON вида "
    '{"title": string, "category": "activity" | "award", '
    '"type": "olympiad" | "volunteering" | "internship" | "leadership" | "project" | "research", '
    '"level": "school" | "city" | "national" | "international" | null, "description": string}. '
    "category = 'award', если это награда/победа (медаль, диплом победителя, призовое "
    "место); 'activity' — если это участие, активность или волонтёрство без явной победы. "
    "type определи по смыслу документа: 'olympiad' — олимпиада или предметный конкурс, "
    "'volunteering' — волонтёрство, 'internship' — стажировка, 'leadership' — организаторская "
    "или лидерская роль (совет, клуб, капитан команды), 'project' — самостоятельный проект, "
    "'research' — исследовательская работа или публикация. level указывай ТОЛЬКО если "
    "type = 'olympiad': 'school' — школьный уровень, 'city' — городской/областной, "
    "'national' — республиканский/национальный, 'international' — международный. Для остальных "
    "type всегда ставь level = null. title — короткое название (до 80 символов). description — "
    "1-2 предложения на русском. Если текст слишком скудный или нечитаемый, сделай наилучшее "
    "предположение, не отказывайся."
)


def _ocr_file(content: bytes, media_type: str) -> str:
    """Извлекает текст из изображения или PDF через Tesseract OCR."""
    if media_type == "application/pdf":
        pages = []
        with fitz.open(stream=content, filetype="pdf") as doc:
            for page in doc:
                pix = page.get_pixmap(dpi=200)
                img = Image.open(io.BytesIO(pix.tobytes("png")))
                pages.append(pytesseract.image_to_string(img, lang=TESSERACT_LANG))
        return "\n".join(pages).strip()
    if media_type.startswith("image/"):
        img = Image.open(io.BytesIO(content))
        return pytesseract.image_to_string(img, lang=TESSERACT_LANG).strip()
    raise HTTPException(status_code=400, detail="Поддерживаются только изображения и PDF")


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


@router.post("/extract")
async def extract_achievement(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user),
):
    """Распознать достижение из загруженного документа: OCR (Tesseract) + DeepSeek."""
    content = await file.read()
    media_type = file.content_type or ""

    ocr_text = _ocr_file(content, media_type)
    if not ocr_text:
        raise HTTPException(
            status_code=400, detail="Не удалось распознать текст в документе"
        )

    try:
        response = deepseek_client.chat.completions.create(
            model=EXTRACTION_MODEL,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": EXTRACTION_SYSTEM_PROMPT},
                {"role": "user", "content": f"OCR-текст документа:\n\n{ocr_text}"},
            ],
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Не удалось распознать документ: {e}")

    text = response.choices[0].message.content
    if not text:
        raise HTTPException(status_code=400, detail="Пустой ответ от модели распознавания")

    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Не удалось разобрать ответ модели")

    if data.get("category") not in ("activity", "award"):
        data["category"] = "activity"
    if data.get("type") not in ACHIEVEMENT_TYPES:
        data["type"] = None
    if data.get("type") != "olympiad" or data.get("level") not in ACHIEVEMENT_LEVELS:
        data["level"] = None
    return data


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
