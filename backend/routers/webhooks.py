# ==================================================================================
# WEBHOOKS ROUTER
# Purpose: Handles inbound events from external services or internal system triggers.
# Proper Connection: Bridges external state changes (like payments or SMS) to internal pages.
# ==================================================================================

from fastapi import APIRouter, Depends, HTTPException, Header, Request
from sqlalchemy.orm import Session
from db.database import get_db
from models import models
from core.websocket import manager
import json

router = APIRouter(prefix="/webhooks", tags=["Webhooks"])

@router.post("/external-event")
async def handle_external_webhook(
    request: Request,
    db: Session = Depends(get_db),
    x_webhook_signature: str = Header(None)
):
    """
    Standard webhook receiver for external integrations (Meta, Stripe, etc.).
    Connection: Receives a POST, processes logic, and notifies the connected 'Pages' in real-time.
    """
    # Verification logic would go here
    payload = await request.json()
    event_type = payload.get("event")
    
    # Example logic: If an external system confirms a photographer's equipment update
    if event_type == "equipment_verified":
        user_id = payload.get("user_id")
        # 1. Update DB
        # 2. Create internal notification
        new_notif = models.Notification(
            user_id=user_id,
            title="Verification Success",
            message="Your equipment has been verified by the system.",
            type="system",
            redirect_to="/profile"
        )
        db.add(new_notif)
        db.commit()
        
        # 3. Push real-time update to the user's page via WebSocket
        await manager.send_personal_message({
            "type": "NEW_NOTIFICATION",
            "data": {
                "title": new_notif.title,
                "message": new_notif.message,
                "redirect_to": new_notif.redirect_to
            }
        }, user_id)

    return {"status": "success"}

@router.post("/trigger-refresh")
async def trigger_page_refresh(
    user_id: int,
    page: str,
    db: Session = Depends(get_db)
):
    """
    Internal 'webhook' to force a frontend page to refresh its data.
    Connection: Allows the backend to 'command' a page to update without a browser refresh.
    """
    await manager.send_personal_message({
        "type": "REFRESH_PAGE",
        "page": page
    }, user_id)
    return {"message": f"Refresh triggered for {page}"}
