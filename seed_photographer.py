import asyncio
import sys
import os
root = os.path.dirname(os.path.abspath(__file__))
sys.path.append(root)
sys.path.append(os.path.join(root, 'backend'))
from sqlalchemy.orm import Session
from db.database import SessionLocal
from models.models import User, Job, JobRequest, Assignment
from datetime import datetime, timedelta

async def seed_freelancer_requests():
    db = SessionLocal()
    try:
        # 1. Identify participants
        owner = db.query(User).filter(User.username == 'jiniyassuthar').first()
        
        # Create a test photographer if they don't exist
        photographer = db.query(User).filter(User.user_type == 'photographer').first()
        if not photographer:
            photographer = User(
                username="test_photographer",
                full_name="Alex Snapshot",
                user_type="photographer",
                is_active=True
            )
            db.add(photographer)
            db.commit()
            db.refresh(photographer)

        if not owner:
            print("Owner 'jiniyassuthar' not found. Please login first.")
            return

        # 2. Create Jobs for the Owner
        job1 = Job(
            title="Royal Palace Wedding",
            client="The Oberois",
            venue="Umaid Bhawan Palace",
            budget=45000,
            category="Lead",
            date=datetime.now() + timedelta(days=15),
            status="open",
            studio_owner_id=owner.id
        )
        job2 = Job(
            title="Corporate Launch",
            client="TechCorp",
            venue="Grand Hyatt",
            budget=15000,
            category="Candid",
            date=datetime.now() + timedelta(days=5),
            status="open",
            studio_owner_id=owner.id
        )
        db.add_all([job1, job2])
        db.commit()

        # 3. Create Requests for the Photographer
        req1 = JobRequest(
            job_id=job1.id,
            sender_id=owner.id,
            receiver_id=photographer.id,
            role="Lead",
            budget=45000,
            status="pending"
        )
        db.add(req1)
        
        # Create an accepted assignment for job2
        req2 = JobRequest(
            job_id=job2.id,
            sender_id=owner.id,
            receiver_id=photographer.id,
            role="Candid",
            budget=15000,
            status="accepted"
        )
        db.add(req2)
        
        assign = Assignment(
            job_id=job2.id,
            member_id=photographer.id,
            role="Candid"
        )
        db.add(assign)
        
        db.commit()

        print(f"✅ Seeded 1 Invite and 1 Accepted job for Photographer: {photographer.username}")

    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(seed_freelancer_requests())
