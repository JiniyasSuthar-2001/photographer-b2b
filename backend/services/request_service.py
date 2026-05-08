from sqlalchemy.orm import Session
from sqlalchemy import and_
from models import models
from core.websocket import manager
from .notification_service import NotificationService

class RequestService:
    @staticmethod
    async def create_job_request(db: Session, request_data: dict, sender: models.User):
        """
        Logic for sending a job invitation.
        
        INVITE ARCHITECTURE:
        - Validates that the job is NOT past or completed.
        - Allows multi-person assignment (same teammate can receive multiple requests for different roles).
        - Explicitly uses the role requested, not tied to the photographer's profile category.
        """
        # Fetch job to check status and date
        job = db.query(models.Job).filter(models.Job.id == request_data['job_id']).first()
        if not job:
            raise ValueError("Job not found")

        # Lifecycle Protection: Block requests for completed or past jobs
        from datetime import datetime
        if job.status == "completed" or (job.date and job.date < datetime.utcnow()):
            raise ValueError("Cannot send requests for completed or past jobs")

        new_request = models.JobRequest(
            job_id=request_data['job_id'],
            sender_id=sender.id,
            receiver_id=request_data['receiver_id'],
            role=request_data['role'],
            budget=request_data['budget'],
            status="pending"
        )
        db.add(new_request)
        db.commit()
        db.refresh(new_request)

        # Create notification
        job_title = job.title if job else "a job"
        await NotificationService.create_notification(
            db=db,
            user_id=request_data['receiver_id'],
            title="New Job Invite",
            message=f"{sender.full_name} has invited you to work on '{job_title}' as {request_data['role']}.",
            notif_type="job_invite",
            reference_id=new_request.id,
            redirect_to="/job-hub"
        )

        # Notify via WebSocket
        await manager.send_personal_message({
            "type": "REFRESH_PAGE",
            "page": "invites"
        }, request_data['receiver_id'])

        return new_request


request_service = RequestService()
