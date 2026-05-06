from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.database import get_db
from models import models
from routers.auth import get_current_user
from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

router = APIRouter(prefix="/jobs", tags=["Jobs"])

class JobCreate(BaseModel):
    title: str
    category: str
    date: Optional[datetime] = None

class JobResponse(BaseModel):
    id: int
    title: str
    category: Optional[str]
    date: datetime
    status: str

    class Config:
        from_attributes = True

@router.post("/", response_model=JobResponse)
async def create_job(
    job: JobCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    new_job = models.Job(
        title=job.title,
        category=job.category,
        date=job.date or datetime.utcnow(),
        studio_owner_id=current_user.id,
        status="open"
    )
    db.add(new_job)
    db.commit()
    db.refresh(new_job)
    return new_job

@router.get("/", response_model=List[JobResponse])
async def get_jobs(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return db.query(models.Job).filter(models.Job.studio_owner_id == current_user.id).all()
