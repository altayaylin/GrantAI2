from fastapi import APIRouter, Depends, HTTPException, Request
from polar.v2026_04 import Polar
from polar.webhooks import (
    PolarWebhookUnknownTypeError,
    PolarWebhookVerificationError,
    validate_event,
)

from app.config import settings
from app.database import supabase
from app.dependencies import get_current_user, get_current_user_object

router = APIRouter(prefix="/billing", tags=["billing"])

_ACTIVE_STATUSES = {"active", "trialing"}
_INACTIVE_EVENT_TYPES = {"subscription.canceled", "subscription.revoked"}
_SYNC_EVENT_TYPES = {
    "subscription.created",
    "subscription.updated",
    "subscription.active",
    "subscription.uncanceled",
}


@router.get("/status")
async def get_billing_status(user_id: str = Depends(get_current_user)):
    """Возвращает текущий Pro-статус пользователя."""
    res = (
        supabase.table("profiles")
        .select("is_pro, pro_current_period_end, polar_subscription_id")
        .eq("id", user_id)
        .single()
        .execute()
    )
    if not res.data:
        return {"is_pro": False, "pro_current_period_end": None}
    return {
        "is_pro": bool(res.data.get("is_pro")),
        "pro_current_period_end": res.data.get("pro_current_period_end"),
    }


@router.post("/checkout")
async def create_checkout(user=Depends(get_current_user_object)):
    """Создаёт сессию оплаты Polar для подписки Pro текущего пользователя."""
    if not settings.polar_access_token or not settings.polar_pro_product_id:
        raise HTTPException(status_code=503, detail="Оплата пока не настроена")

    try:
        env = "sandbox" if settings.polar_server == "sandbox" else "production"
        with Polar(access_token=settings.polar_access_token, environment=env) as polar:
            checkout = polar.checkouts.create(
                products=[settings.polar_pro_product_id],
                customer_email=user.email,
                external_customer_id=user.id,
                success_url=f"{settings.frontend_url}/dashboard?upgraded=1",
            )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Не удалось создать сессию оплаты: {e}")

    return {"url": checkout.url}


@router.post("/webhook")
async def polar_webhook(request: Request):
    """Принимает вебхуки Polar и обновляет статус Pro-подписки в профиле."""
    body = await request.body()
    try:
        event = validate_event(body=body, headers=request.headers, secret=settings.polar_webhook_secret)
    except PolarWebhookVerificationError:
        raise HTTPException(status_code=403, detail="Недействительная подпись вебхука")
    except PolarWebhookUnknownTypeError:
        return {"received": True}

    data = getattr(event, "data", None)
    data_dict = data.model_dump() if hasattr(data, "model_dump") else (data if isinstance(data, dict) else {})

    external_id = data_dict.get("external_customer_id")
    if not external_id:
        external_id = (data_dict.get("customer") or {}).get("external_id")
    if not external_id:
        return {"received": True}

    event_type = getattr(event, "type", "")
    if event_type in _SYNC_EVENT_TYPES:
        supabase.table("profiles").upsert(
            {
                "id": external_id,
                "is_pro": data_dict.get("status") in _ACTIVE_STATUSES,
                "polar_customer_id": data_dict.get("customer_id"),
                "polar_subscription_id": data_dict.get("id"),
                "pro_current_period_end": data_dict.get("current_period_end"),
            }
        ).execute()
    elif event_type in _INACTIVE_EVENT_TYPES:
        supabase.table("profiles").upsert({"id": external_id, "is_pro": False}).execute()

    return {"received": True}

