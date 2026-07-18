from typing import Optional
from fastapi import HTTPException, Header
from app.database import supabase


async def get_current_user(authorization: Optional[str] = Header(None)) -> str:
    """Извлекает user_id из Supabase JWT-токена."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Не авторизован")
    token = authorization.replace("Bearer ", "")
    try:
        user = supabase.auth.get_user(token)
        return user.user.id
    except Exception:
        raise HTTPException(status_code=401, detail="Недействительный токен")
