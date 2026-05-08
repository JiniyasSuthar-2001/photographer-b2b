# ==================================================================================
# ROUTER: SUBSCRIPTION & BILLING
# Purpose: Manages user plans, trial periods, and premium feature access.
# Impact: Updates User model fields (plan, is_pro) and triggers WebSocket alerts.
# ==================================================================================

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.database import get_db
from models import models
from routers.auth import get_current_user
from core.websocket import manager
from pydantic import BaseModel

router = APIRouter(prefix="/subscription", tags=["Subscription"])

class UpgradeRequest(BaseModel):
    plan: str # 'Pro' or 'Enterprise'

@router.post("/upgrade")
async def upgrade_plan(
    request: UpgradeRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Upgrades the user to a premium plan.
    Frontend Impact: Triggered from Pricing.jsx.
    WebSocket Impact: Sends a 'SUBSCRIPTION_UPDATED' message to refresh the UI.
    """
    if request.plan not in ["Pro", "Enterprise"]:
        raise HTTPException(status_code=400, detail="Invalid plan selected")
    
    # Update database
    current_user.plan = request.plan

    current_user.is_pro = True
    current_user.is_on_trial = False
    db.commit()
    
    # Notify user via WebSocket to refresh state/sidebar
    await manager.send_personal_message({
        "type": "SUBSCRIPTION_UPDATED",
        "plan": request.plan_name,
        "is_pro": True
    }, current_user.id)
    
    return {
        "status": "success",
        "message": f"Successfully upgraded to {request.plan_name}",
        "user": {
            "id": current_user.id,
            "plan": current_user.plan,
            "is_pro": current_user.is_pro
        }
    }

@router.get("/status")
async def get_subscription_status(current_user: models.User = Depends(get_current_user)):
    """
    Returns the current user's subscription details.
    """
    return current_user

