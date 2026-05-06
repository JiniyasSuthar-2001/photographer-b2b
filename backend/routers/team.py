from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_
from db.database import get_db
from models import models
from models.schemas import CollaborationResponse, UserSearchResponse, TeamRequestCreate, TeamRequestResponse, UserProfile
from routers.auth import get_current_user
import math

router = APIRouter(prefix="/team", tags=["Team"])

@router.get("/collaborations/{member_id}", response_model=CollaborationResponse)
async def get_collaborations(
    member_id: int,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Only return jobs where member_id = selected photographer AND job belongs to logged-in user
    query = db.query(models.Job, models.Assignment.role).\
        join(models.Assignment, models.Job.id == models.Assignment.job_id).\
        filter(models.Job.studio_owner_id == current_user.id).\
        filter(models.Assignment.member_id == member_id).\
        order_by(models.Job.date.desc())

    total_count = query.count()
    total_pages = math.ceil(total_count / limit)
    
    offset = (page - 1) * limit
    results = query.offset(offset).limit(limit).all()

    data = []
    for job, role in results:
        data.append({
            "job_id": job.id,
            "title": job.title,
            "date": job.date,
            "role": role,
            "status": job.status
        })

    return {
        "data": data,
        "page": page,
        "total_pages": total_pages
    }

@router.get("/users/search", response_model=UserSearchResponse)
async def search_user(phone: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.phone == phone).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "id": user.id,
        "full_name": user.full_name,
        "city": user.city,
        "phone": user.phone,
        "category": user.category
    }

@router.post("/request", response_model=TeamRequestResponse)
async def send_team_request(
    request: TeamRequestCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Check if request already exists
    existing = db.query(models.TeamRequest).filter(
        and_(
            models.TeamRequest.sender_id == current_user.id,
            models.TeamRequest.receiver_id == request.receiver_id,
            models.TeamRequest.status == "pending"
        )
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Request already pending")

    new_request = models.TeamRequest(
        sender_id=current_user.id,
        receiver_id=request.receiver_id,
        status="pending"
    )
    db.add(new_request)
    db.commit()
    db.refresh(new_request)

    # Create notification for receiver
    notification = models.Notification(
        user_id=request.receiver_id,
        title="New Team Request",
        message=f"{current_user.full_name} has invited you to join their team.",
        type="team_request",
        reference_id=new_request.id
    )
    db.add(notification)
    db.commit()

    return new_request

@router.patch("/request/{id}", response_model=TeamRequestResponse)
async def respond_to_request(
    id: int,
    status: str = Query(..., pattern="^(accepted|declined)$"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    team_request = db.query(models.TeamRequest).filter(
        and_(
            models.TeamRequest.id == id,
            models.TeamRequest.receiver_id == current_user.id
        )
    ).first()

    if not team_request:
        raise HTTPException(status_code=404, detail="Request not found")

    team_request.status = status
    
    if status == "accepted":
        # Add to team table
        new_team_member = models.Team(
            owner_id=team_request.sender_id,
            member_id=team_request.receiver_id
        )
        db.add(new_team_member)
    
    db.commit()
    db.refresh(team_request)

    # Create notification for sender (Studio Owner)
    notification_sender = models.Notification(
        user_id=team_request.sender_id,
        title=f"Team Invite {status.capitalize()}",
        message=f"{current_user.full_name} has {status} your invitation to join the team.",
        type="request_response",
        reference_id=team_request.id
    )
    db.add(notification_sender)

    # Create notification for receiver (Photographer) - Confirmation
    sender_name = db.query(models.User).filter(models.User.id == team_request.sender_id).first().full_name
    notification_receiver = models.Notification(
        user_id=current_user.id,
        title=f"Team Request {status.capitalize()}",
        message=f"You have {status} {sender_name}'s invitation to join their team.",
        type="request_response",
        reference_id=team_request.id
    )
    db.add(notification_receiver)
    
    db.commit()

    return team_request

@router.get("/")
async def get_team(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    team_members = db.query(models.User).\
        join(models.Team, models.User.id == models.Team.member_id).\
        filter(models.Team.owner_id == current_user.id).all()
    
    # Return formatted data
    data = []
    for m in team_members:
        # Count jobs done together
        jobs_together = db.query(models.Assignment).\
            join(models.Job, models.Assignment.job_id == models.Job.id).\
            filter(and_(
                models.Job.studio_owner_id == current_user.id,
                models.Assignment.member_id == m.id,
                models.Job.status == "completed"
            )).count()

        data.append({
            "id": m.id,
            "name": m.full_name,
            "city": m.city,
            "phone": m.phone,
            "category": m.category,
            "jobsCompleted": jobs_together,
            "specialties": [m.category] if m.category else [],
            "status": "available" # Mock status
        })
    return data
