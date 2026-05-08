from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from db.database import get_db
from routers.auth import get_current_user
from services.analytics_service import analytics_service
from models import models

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/")
async def get_analytics(
    role: str = Query("studio_owner"),
    timeframe: str = Query("1M"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Returns aggregated data based on the selected role (photographer/studio_owner) 
    and timeframe (1W, 1M, etc.).
    """
    # Map 'photographer' to 'freelancer' role in analytics logic if needed
    # But internal logic uses 'photographer' as Studio and 'freelancer' as External
    # Wait, the user said: Photographer = Studio Owner, Freelancer = External
    # Let's standardize
    internal_role = 'photographer' if role == 'photographer' else 'freelancer'
    
    return analytics_service.get_role_analytics(db, current_user.id, internal_role, timeframe)

@router.get("/rankings")
async def get_photographer_rankings(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Returns the top collaborators (photographers) for the current user.
    """
    return analytics_service.get_top_photographers(db, current_user.id)
