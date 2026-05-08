from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from models.models import User, Job, JobRequest, Team, Notification, Assignment, Task
import random

class DemoService:
    @staticmethod
    def seed_admin_data(db: Session, admin_id: int):
        """
        Seeds a rich, interconnected set of demo data for the admin account.
        This includes team members, jobs, requests, notifications, and assignments.
        """
        # 1. Create a set of demo photographers if they don't exist
        # These are 'Real' users that the admin can interact with
        photographers_data = [
            {"username": "karan_p", "full_name": "Karan Shah", "category": "Lead Photographer", "phone": "9876500001", "city": "Ahmedabad"},
            {"username": "ananya_i", "full_name": "Ananya Iyer", "category": "Drone Expert", "phone": "9876500002", "city": "Mumbai"},
            {"username": "rahul_m", "full_name": "Rahul Mehta", "category": "Reel Expert", "phone": "9876500003", "city": "Surat"},
            {"username": "priya_p", "full_name": "Priya Patel", "category": "Candid Specialist", "phone": "9876500004", "city": "Baroda"},
            {"username": "suresh_v", "full_name": "Suresh Verma", "category": "Traditional", "phone": "9876500005", "city": "Rajkot"},
        ]

        photographer_users = []
        for p_data in photographers_data:
            user = db.query(User).filter(User.username == p_data["username"]).first()
            if not user:
                user = User(
                    username=p_data["username"],
                    hashed_password="hashed_password", # Dummy
                    full_name=p_data["full_name"],
                    category=p_data["category"],
                    phone=p_data["phone"],
                    city=p_data["city"],
                    user_type="freelancer"

                )
                db.add(user)
                db.commit()
                db.refresh(user)
            photographer_users.append(user)

        # 2. Add these photographers to the Admin's 'Team' directory
        for p_user in photographer_users:
            exists = db.query(Team).filter(Team.owner_id == admin_id, Team.member_id == p_user.id).first()
            if not exists:
                new_team_member = Team(
                    owner_id=admin_id,
                    member_id=p_user.id,
                    display_name=p_user.full_name,
                    display_category=p_user.category,
                    display_city=p_user.city,
                    phone=p_user.phone
                )
                db.add(new_team_member)

        # 3. Create a variety of Jobs for the Admin
        # Mix of open, assigned, and completed jobs
        jobs_data = [
            {"title": "The Grand Udaipur Wedding", "client": "Mehta Family", "category": "Wedding", "budget": 150000, "location": "Udaipur, RJ", "venue": "Jagmandir Island Palace", "status": "assigned", "days_offset": 5},
            {"title": "Corporate Summit 2026", "client": "Reliance Ind.", "category": "Corporate", "budget": 45000, "location": "Ahmedabad, GJ", "venue": "GIFT City Club", "status": "assigned", "days_offset": 12},
            {"title": "Pre-Wedding Shoot: Desert Bliss", "client": "Smit & Jini", "category": "Portrait", "budget": 35000, "location": "Kutch, GJ", "venue": "White Desert Rann", "status": "open", "days_offset": 20},
            {"title": "Jewelry Brand Campaign", "client": "Tanishq", "category": "Commercial", "budget": 75000, "location": "Mumbai, MH", "venue": "Film City Studio", "status": "completed", "days_offset": -10},
            {"title": "Annual Fashion Gala", "client": "Vogue India", "category": "Event", "budget": 60000, "location": "Delhi, DL", "venue": "The Leela Palace", "status": "completed", "days_offset": -25},
            {"title": "Legacy Builders Conclave", "client": "Forbes", "category": "Corporate", "budget": 40000, "location": "Baroda, GJ", "venue": "Laxmi Vilas Palace", "status": "open", "days_offset": 35},
        ]

        admin_jobs = []
        for j_data in jobs_data:
            # Check if job already exists to avoid duplicates
            exists = db.query(Job).filter(Job.studio_owner_id == admin_id, Job.title == j_data["title"]).first()
            if not exists:
                job_date = datetime.utcnow() + timedelta(days=j_data["days_offset"])
                new_job = Job(
                    title=j_data["title"],
                    client=j_data["client"],
                    category=j_data["category"],
                    budget=j_data["budget"],
                    location=j_data["location"],
                    venue=j_data["venue"],
                    status=j_data["status"],
                    date=job_date,
                    studio_owner_id=admin_id,
                    roles="Lead Photographer, Drone Expert, Reel Expert"
                )
                db.add(new_job)
                db.commit()
                db.refresh(new_job)
                admin_jobs.append(new_job)
            else:
                admin_jobs.append(exists)

        # 4. Create Job Requests and Assignments (Interconnection)
        for job in admin_jobs:
            if job.status == "assigned":
                # Assign 2 photographers to each assigned job
                p1, p2 = random.sample(photographer_users, 2)
                
                # Create 'Accepted' requests
                for p in [p1, p2]:
                    req_exists = db.query(JobRequest).filter(JobRequest.job_id == job.id, JobRequest.receiver_id == p.id).first()
                    if not req_exists:
                        new_req = JobRequest(
                            job_id=job.id,
                            sender_id=admin_id,
                            receiver_id=p.id,
                            role=p.category,
                            budget=job.budget // 5,
                            status="accepted"
                        )
                        db.add(new_req)
                        
                        # Also create the assignment
                        new_assign = Assignment(
                            job_id=job.id,
                            member_id=p.id,
                            role=p.category
                        )
                        db.add(new_assign)

            elif job.status == "open":
                # Create some 'Pending' requests
                p = random.choice(photographer_users)
                req_exists = db.query(JobRequest).filter(JobRequest.job_id == job.id, JobRequest.receiver_id == p.id).first()
                if not req_exists:
                    new_req = JobRequest(
                        job_id=job.id,
                        sender_id=admin_id,
                        receiver_id=p.id,
                        role=p.category,
                        budget=job.budget // 5,
                        status="pending"
                    )
                    db.add(new_req)

        # 5. Seed some Notifications
        notif_data = [
            {"title": "Job Accepted", "message": "Karan Shah has accepted your request for 'The Grand Udaipur Wedding'.", "type": "job_invite", "redirect": "/job-hub"},
            {"title": "New Request", "message": "Focus Studios invited you for a 'Maternity Shoot' on May 20th.", "type": "job_invite", "redirect": "/job-hub"},
            {"title": "Team Update", "message": "Ananya Iyer is now available for your upcoming shoot in Mumbai.", "type": "team_request", "redirect": "/team"},
            {"title": "Milestone Reached", "message": "Congratulations! You've completed 50 jobs on Lumière.", "type": "system", "redirect": "/analytics"},
        ]

        for n in notif_data:
            notif_exists = db.query(Notification).filter(Notification.user_id == admin_id, Notification.message == n["message"]).first()
            if not notif_exists:
                new_notif = Notification(
                    user_id=admin_id,
                    title=n["title"],
                    message=n["message"],
                    type=n["type"],
                    redirect_to=n["redirect"]
                )
                db.add(new_notif)

        # 6. Seed some Tasks for the Notes page
        tasks_pool = [
            "Confirm arrival time with venue",
            "Check battery levels for all cameras",
            "Prepare lighting setup",
            "Scout location for golden hour shots",
            "Rent additional equipment if needed",
            "Coordinate with makeup artists",
            "Verify sunset times",
            "Back up raw files to cloud",
        ]

        for job in admin_jobs:
            # Create 2-3 tasks per job
            num_tasks = random.randint(2, 4)
            selected_tasks = random.sample(tasks_pool, num_tasks)
            for t_text in selected_tasks:
                task_exists = db.query(Task).filter(Task.job_id == job.id, Task.text == t_text).first()
                if not task_exists:
                    new_task = Task(
                        job_id=job.id,
                        text=t_text,
                        completed=random.choice([True, False])
                    )
                    db.add(new_task)

        db.commit()
        return True

demo_service = DemoService()
