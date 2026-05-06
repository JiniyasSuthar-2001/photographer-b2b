from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_
from db.database import get_db
from models import models
from models.schemas import NotificationResponse
from routers.auth import get_current_user
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/requests", tags=["Job Requests"])

class JobRequestCreate(BaseModel):
    job_id: int
    receiver_id: int
    role: str
    budget: int

@router.post("/")
async def send_job_request(
    request: JobRequestCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Create Job Request
    new_request = models.JobRequest(
        job_id=request.job_id,
        sender_id=current_user.id,
        receiver_id=request.receiver_id,
        role=request.role,
        budget=request.budget,
        status="pending"
    )
    db.add(new_request)
    db.commit()
    db.refresh(new_request)

    # Get job title for notification
    job = db.query(models.Job).filter(models.Job.id == request.job_id).first()
    job_title = job.title if job else "a job"

    # Create notification for receiver
    notification = models.Notification(
        user_id=request.receiver_id,
        title="New Job Invite",
        message=f"{current_user.full_name} has invited you to work on '{job_title}' as {request.role}.",
        type="job_invite",
        reference_id=new_request.id,
        redirect_to="/job-hub"
    )
    db.add(notification)
    db.commit()

    return new_request

@router.patch("/{id}")
async def respond_to_job_request(
    id: int,
    status: str = Query(..., pattern="^(accepted|declined)$"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    job_request = db.query(models.JobRequest).filter(
        and_(
            models.JobRequest.id == id,
            models.JobRequest.receiver_id == current_user.id
        )
    ).first()

    if not job_request:
        raise HTTPException(status_code=404, detail="Job request not found")

    job_request.status = status
    
    # If accepted, create an assignment
    if status == "accepted":
        assignment = models.Assignment(
            job_id=job_request.job_id,
            member_id=job_request.receiver_id,
            role=job_request.role
        )
        db.add(assignment)
        
        # Also update job status if needed (minimal change)
        job = db.query(models.Job).filter(models.Job.id == job_request.job_id).first()
        if job:
            job.status = "assigned"

    db.commit()
    db.refresh(job_request)

    # Create notification for sender (Studio Owner)
    job_title = job_request.job.title if job_request.job else "job"
    notification_sender = models.Notification(
        user_id=job_request.sender_id,
        title=f"Job Invite {status.capitalize()}",
        message=f"{current_user.full_name} has {status} your invite for '{job_title}'.",
        type="job_invite_response",
        reference_id=job_request.id,
        redirect_to="/job-hub"
    )
    db.add(notification_sender)

    # Create notification for receiver (Photographer) - Confirmation
    sender_name = db.query(models.User).filter(models.User.id == job_request.sender_id).first().full_name
    notification_receiver = models.Notification(
        user_id=current_user.id,
        title=f"Job Invite {status.capitalize()}",
        message=f"You have {status} {sender_name}'s invite for '{job_title}'.",
        type="job_invite_response",
        reference_id=job_request.id,
        redirect_to="/job-hub"
    )
    db.add(notification_receiver)
    db.commit()

    return job_request

@router.get("/eligible-jobs/{photographer_id}")
async def get_eligible_jobs(
    photographer_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Get photographer category
    photographer = db.query(models.User).filter(models.User.id == photographer_id).first()
    if not photographer:
        raise HTTPException(status_code=404, detail="Photographer not found")
    
    # Get jobs owned by current user, matching category, and not completed
    # Also exclude jobs where this photographer is already assigned or has a pending request
    assigned_job_ids = [a.job_id for a in photographer.assignments]
    requested_job_ids = [r.job_id for r in db.query(models.JobRequest).filter(
        and_(
            models.JobRequest.receiver_id == photographer_id,
            models.JobRequest.status == "pending"
        )
    ).all()]
    
    excluded_ids = set(assigned_job_ids + requested_job_ids)

    jobs = db.query(models.Job).filter(
        and_(
            models.Job.studio_owner_id == current_user.id,
            models.Job.status == "open",
            models.Job.category == photographer.category,
            ~models.Job.id.in_(excluded_ids) if excluded_ids else True
        )
    ).all()
    
    return jobs

@router.get("/")
async def get_my_requests(
    role: str = Query("receiver", pattern="^(sender|receiver)$"),
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    query = db.query(models.JobRequest)
    if role == "sender":
        query = query.filter(models.JobRequest.sender_id == current_user.id)
    else:
        query = query.filter(models.JobRequest.receiver_id == current_user.id)
    
    if status:
        query = query.filter(models.JobRequest.status == status)
    
    requests = query.order_by(models.JobRequest.created_at.desc()).all()
    
    # Enrich with job and sender/receiver details
    result = []
    for req in requests:
        job = db.query(models.Job).filter(models.Job.id == req.job_id).first()
        sender = db.query(models.User).filter(models.User.id == req.sender_id).first()
        receiver = db.query(models.User).filter(models.User.id == req.receiver_id).first()
        
        result.append({
            "id": req.id,
            "job_id": req.job_id,
            "job_title": job.title if job else "Unknown Job",
            "job_date": job.date if job else None,
            "sender_id": req.sender_id,
            "sender_name": sender.full_name if sender else "Unknown",
            "receiver_id": req.receiver_id,
            "receiver_name": receiver.full_name if receiver else "Unknown",
            "role": req.role,
            "budget": req.budget,
            "status": req.status,
            "created_at": req.created_at
        })
    return result

@router.get("/accepted-jobs")
async def get_accepted_jobs(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # This specifically returns jobs where the user is an ASSIGNEE
    assignments = db.query(models.Assignment).filter(models.Assignment.member_id == current_user.id).all()
    
    result = []
    for assign in assignments:
        job = db.query(models.Job).filter(models.Job.id == assign.job_id).first()
        owner = db.query(models.User).filter(models.User.id == job.studio_owner_id).first() if job else None
        
        result.append({
            "id": assign.id,
            "job_id": assign.job_id,
            "title": job.title if job else "Unknown Job",
            "owner_name": owner.full_name if owner else "Unknown",
            "date": job.date if job else None,
            "role": assign.role,
            "status": job.status if job else "unknown"
        })
    return result
