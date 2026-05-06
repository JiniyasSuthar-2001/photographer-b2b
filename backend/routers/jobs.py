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
    pending_count: int = 0
    accepted_count: int = 0
    declined_count: int = 0

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
    
    # Return with 0 counts
    return {
        **new_job.__dict__,
        "pending_count": 0,
        "accepted_count": 0,
        "declined_count": 0
    }

@router.get("/", response_model=List[JobResponse])
async def get_jobs(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    jobs = db.query(models.Job).filter(models.Job.studio_owner_id == current_user.id).all()
    
    result = []
    for job in jobs:
        pending = db.query(models.JobRequest).filter(models.JobRequest.job_id == job.id, models.JobRequest.status == "pending").count()
        accepted = db.query(models.JobRequest).filter(models.JobRequest.job_id == job.id, models.JobRequest.status == "accepted").count()
        declined = db.query(models.JobRequest).filter(models.JobRequest.job_id == job.id, models.JobRequest.status == "declined").count()
        
        # Merge counts into response
        job_data = {
            "id": job.id,
            "title": job.title,
            "category": job.category,
            "date": job.date,
            "status": job.status,
            "pending_count": pending,
            "accepted_count": accepted,
            "declined_count": declined
        }
        result.append(job_data)
        
    return result
