from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from db.database import get_db
from models import models
from models.schemas import CollaborationResponse, UserSearchResponse, TeamRequestCreate, TeamRequestResponse, TeamMemberUpdate
from routers.auth import get_current_user
import math

router = APIRouter(prefix="/team", tags=["Team"])
# Analytics heuristic for collaboration ranking:
# starts at 4.0 to reflect invited/approved collaborators with baseline trust,
# adds 0.08 per completed shared job to reward repeat delivery,
# capped at 5.0 to stay aligned with the platform's 5-star scoring scale.
BASE_RATING = 4.0
RATING_INCREMENT_PER_JOB = 0.08
MAX_RATING = 5.0

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

@router.get("/top-photographers")
async def get_top_photographers(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Analytics helper endpoint used by the Top Photographers widget.
    Keeps existing APIs stable while exposing a role-aware aggregate for
    collaboration-heavy analytics screens.
    """
    team_entries = db.query(models.Team).filter(models.Team.owner_id == current_user.id).all()
    result = []

    for entry in team_entries:
        member_id = entry.member_id

        completed_count = db.query(models.Assignment).\
            join(models.Job, models.Assignment.job_id == models.Job.id).\
            filter(and_(
                models.Job.studio_owner_id == current_user.id,
                models.Assignment.member_id == member_id,
                models.Job.status == "completed"
            )).count()

        latest_date = db.query(func.max(models.Job.date)).\
            join(models.Assignment, models.Job.id == models.Assignment.job_id).\
            filter(and_(
                models.Job.studio_owner_id == current_user.id,
                models.Assignment.member_id == member_id
            )).scalar()

        earnings_generated = db.query(func.coalesce(func.sum(models.JobRequest.budget), 0)).\
            join(models.Job, models.JobRequest.job_id == models.Job.id).\
            filter(and_(
                models.Job.studio_owner_id == current_user.id,
                models.JobRequest.receiver_id == member_id,
                models.JobRequest.status == "accepted"
            )).scalar() or 0

        # Lightweight rating heuristic for analytics ranking while keeping schema stable.
        rating = min(MAX_RATING, round(BASE_RATING + (completed_count * RATING_INCREMENT_PER_JOB), 1))

        result.append({
            "member_id": member_id,
            "photographer_name": entry.display_name,
            "jobs_done_together": completed_count,
            "earnings_generated": int(earnings_generated),
            "rating": rating,
            "latest_collaboration_date": latest_date
        })

    result.sort(key=lambda item: item["jobs_done_together"], reverse=True)
    return result

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
    # Find receiver by phone number
    receiver = db.query(models.User).filter(models.User.phone == request.phone).first()
    if not receiver:
        raise HTTPException(status_code=404, detail="Photographer with this phone number not found")

    # Check if request already exists
    existing = db.query(models.TeamRequest).filter(
        and_(
            models.TeamRequest.sender_id == current_user.id,
            models.TeamRequest.receiver_id == receiver.id,
            models.TeamRequest.status == "pending"
        )
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Request already pending")

    new_request = models.TeamRequest(
        sender_id=current_user.id,
        receiver_id=receiver.id,
        status="pending",
        display_name=request.display_name,
        display_category=request.display_category,
        display_city=request.display_city
    )
    db.add(new_request)
    db.commit()
    db.refresh(new_request)

    # Create notification for receiver
    notification = models.Notification(
        user_id=receiver.id,
        message=f"{current_user.full_name} has invited you to join their team.",
        redirect_to="/team"
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
        # Add to team table with custom display info
        new_team_member = models.Team(
            owner_id=team_request.sender_id,
            member_id=team_request.receiver_id,
            display_name=team_request.display_name,
            display_category=team_request.display_category,
            display_city=team_request.display_city,
            phone=current_user.phone
        )
        db.add(new_team_member)
    
    db.commit()
    db.refresh(team_request)

    # Create notification for sender (Studio Owner)
    notification_sender = models.Notification(
        user_id=team_request.sender_id,
        message=f"{current_user.full_name} has {status} your invitation to join the team.",
        redirect_to="/team"
    )
    db.add(notification_sender)

    # Create notification for receiver (Photographer) - Confirmation
    sender_name = db.query(models.User).filter(models.User.id == team_request.sender_id).first().full_name
    notification_receiver = models.Notification(
        user_id=current_user.id,
        message=f"You have {status} {sender_name}'s invitation to join their team.",
        redirect_to="/team"
    )
    db.add(notification_receiver)
    
    db.commit()

    return team_request

@router.get("/")
async def get_team(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    team_entries = db.query(models.Team).filter(models.Team.owner_id == current_user.id).all()
    
    # Return formatted data using display aliases
    data = []
    for entry in team_entries:
        # Count jobs done together (using member_id for logic)
        jobs_together = db.query(models.Assignment).\
            join(models.Job, models.Assignment.job_id == models.Job.id).\
            filter(and_(
                models.Job.studio_owner_id == current_user.id,
                models.Assignment.member_id == entry.member_id,
                models.Job.status == "completed"
            )).count()

        data.append({
            "id": entry.member_id,
            "name": entry.display_name,
            "city": entry.display_city,
            "phone": entry.phone,
            "category": entry.display_category,
            "jobsCompleted": jobs_together,
            "specialties": [entry.display_category] if entry.display_category else [],
            "status": "available"
        })
    return data

@router.patch("/{member_id}")
async def update_team_member(
    member_id: int,
    update: TeamMemberUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    entry = db.query(models.Team).filter(
        and_(models.Team.owner_id == current_user.id, models.Team.member_id == member_id)
    ).first()
    
    if not entry:
        raise HTTPException(status_code=404, detail="Team member not found")

    if update.display_name: entry.display_name = update.display_name
    if update.display_category: entry.display_category = update.display_category
    if update.display_city: entry.display_city = update.display_city

    db.commit()
    return {"message": "Updated successfully"}

@router.delete("/{member_id}")
async def remove_team_member(
    member_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    entry = db.query(models.Team).filter(
        and_(models.Team.owner_id == current_user.id, models.Team.member_id == member_id)
    ).first()
    
    if not entry:
        raise HTTPException(status_code=404, detail="Team member not found")

    db.delete(entry)
    db.commit()
    return {"message": "Removed successfully"}
