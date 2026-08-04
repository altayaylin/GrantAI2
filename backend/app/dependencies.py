from typing import Optional
from fastapi import Depends, HTTPException, Header
from app.database import supabase


async def get_current_user_object(authorization: Optional[str] = Header(None)):
    """Извлекает пользователя Supabase (id, email, ...) из JWT-токена."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Не авторизован")
    token = authorization.replace("Bearer ", "")
    try:
        return supabase.auth.get_user(token).user
    except Exception:
        raise HTTPException(status_code=401, detail="Недействительный токен")


async def get_current_user(user=Depends(get_current_user_object)) -> str:
    """Извлекает user_id из Supabase JWT-токена."""
    return user.id
