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
        # 1. Create a set of demo photographers and Studio Owners
        # These are 'Real' users that the admin can interact with
        actors_data = [
            {"username": "karan_p", "full_name": "Karan Shah", "category": "Lead Photographer", "phone": "9876500001", "city": "Ahmedabad", "type": "freelancer"},
            {"username": "ananya_i", "full_name": "Ananya Iyer", "category": "Drone Expert", "phone": "9876500002", "city": "Mumbai", "type": "freelancer"},
            {"username": "rahul_m", "full_name": "Rahul Mehta", "category": "Reel Expert", "phone": "9876500003", "city": "Surat", "type": "freelancer"},
            {"username": "priya_p", "full_name": "Priya Patel", "category": "Candid Specialist", "phone": "9876500004", "city": "Baroda", "type": "freelancer"},
            {"username": "suresh_v", "full_name": "Suresh Verma", "category": "Traditional", "phone": "9876500005", "city": "Rajkot", "type": "freelancer"},
            {"username": "focus_studios", "full_name": "Focus Production House", "category": "Studio", "phone": "9000000001", "city": "Mumbai", "type": "photographer"},
            {"username": "vogue_events", "full_name": "Vogue Event Management", "category": "Agency", "phone": "9000000002", "city": "Delhi", "type": "photographer"},
        ]

        actor_users = {}
        for a_data in actors_data:
            user = db.query(User).filter(User.username == a_data["username"]).first()
            if not user:
                user = User(
                    username=a_data["username"],
                    hashed_password="hashed_password", 
                    full_name=a_data["full_name"],
                    category=a_data["category"],
                    phone=a_data["phone"],
                    city=a_data["city"],
                    user_type=a_data["type"]
                )
                db.add(user)
                db.commit()
                db.refresh(user)
            actor_users[a_data["username"]] = user

        # 2. Add freelancers to the Admin's 'Team' directory
        freelancers = [u for u in actor_users.values() if u.user_type == "freelancer"]
        for p_user in freelancers:
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

        # 3. Create a variety of Jobs OWNED by Admin (Studio Owner Mode)
        jobs_data = [
            {"title": "The Grand Udaipur Wedding", "client": "Mehta Family", "category": "Wedding", "budget": 150000, "location": "Udaipur, RJ", "venue": "Jagmandir Island Palace", "status": "assigned", "days_offset": 5},
            {"title": "Corporate Summit 2026", "client": "Reliance Ind.", "category": "Corporate", "budget": 45000, "location": "Ahmedabad, GJ", "venue": "GIFT City Club", "status": "assigned", "days_offset": 12},
            {"title": "Pre-Wedding Shoot: Desert Bliss", "client": "Smit & Jini", "category": "Portrait", "budget": 35000, "location": "Kutch, GJ", "venue": "White Desert Rann", "status": "open", "days_offset": 2},
            {"title": "Jewelry Brand Campaign", "client": "Tanishq", "category": "Commercial", "budget": 75000, "location": "Mumbai, MH", "venue": "Film City Studio", "status": "completed", "days_offset": -5},
            {"title": "Annual Fashion Gala", "client": "Vogue India", "category": "Event", "budget": 60000, "location": "Delhi, DL", "venue": "The Leela Palace", "status": "completed", "days_offset": -15},
            {"title": "Legacy Builders Conclave", "client": "Forbes", "category": "Corporate", "budget": 40000, "location": "Baroda, GJ", "venue": "Laxmi Vilas Palace", "status": "open", "days_offset": 25},
            {"title": "Sports Photography Workshop", "client": "Nike", "category": "Event", "budget": 25000, "location": "Pune, MH", "venue": "Balewadi Stadium", "status": "open", "days_offset": -2}, # Past open job
        ]

        admin_owned_jobs = []
        for j_data in jobs_data:
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
                admin_owned_jobs.append(new_job)
            else:
                admin_owned_jobs.append(exists)

        # 4. Create Jobs where Admin is a FREELANCER (Photographer Mode)
        external_jobs_data = [
            {"studio": "focus_studios", "title": "Luxury Real Estate Shoot", "role": "Lead", "budget": 12000, "days": 8, "status": "pending"},
            {"studio": "vogue_events", "title": "Celebrity Portfolio", "role": "Lead", "budget": 25000, "days": 15, "status": "accepted"},
            {"studio": "focus_studios", "title": "Architecture Expo", "role": "Lead", "budget": 15000, "days": -10, "status": "accepted"},
            {"studio": "vogue_events", "title": "Music Festival", "role": "Lead", "budget": 20000, "days": 20, "status": "declined"},
            {"studio": "focus_studios", "title": "Product Launch", "role": "Lead", "budget": 18000, "days": 3, "status": "pending"},
        ]

        for ej_data in external_jobs_data:
            studio = actor_users[ej_data["studio"]]
            exists = db.query(Job).filter(Job.studio_owner_id == studio.id, Job.title == ej_data["title"]).first()
            if not exists:
                job_date = datetime.utcnow() + timedelta(days=ej_data["days"])
                job = Job(
                    title=ej_data["title"],
                    client="External Client",
                    category="Freelance",
                    budget=ej_data["budget"] * 2,
                    location=studio.city,
                    venue="City Studio",
                    status="assigned" if ej_data["status"] == "accepted" else "open",
                    date=job_date,
                    studio_owner_id=studio.id,
                    roles="Lead Photographer"
                )
                db.add(job)
                db.commit()
                db.refresh(job)
            else:
                job = exists

            # Create Request
            req_exists = db.query(JobRequest).filter(JobRequest.job_id == job.id, JobRequest.receiver_id == admin_id).first()
            if not req_exists:
                new_req = JobRequest(
                    job_id=job.id,
                    sender_id=studio.id,
                    receiver_id=admin_id,
                    role=ej_data["role"],
                    budget=ej_data["budget"],
                    status=ej_data["status"]
                )
                db.add(new_req)
                
                if ej_data["status"] == "accepted":
                    assign_exists = db.query(Assignment).filter(Assignment.job_id == job.id, Assignment.member_id == admin_id).first()
                    if not assign_exists:
                        db.add(Assignment(job_id=job.id, member_id=admin_id, role=ej_data["role"]))

        # 5. Connect Admin's Owned Jobs with Team
        for job in admin_owned_jobs:
            if job.status == "assigned":
                p_pool = random.sample(freelancers, 2)
                for p in p_pool:
                    req_exists = db.query(JobRequest).filter(JobRequest.job_id == job.id, JobRequest.receiver_id == p.id).first()
                    if not req_exists:
                        db.add(JobRequest(job_id=job.id, sender_id=admin_id, receiver_id=p.id, role=p.category, budget=job.budget // 5, status="accepted"))
                        db.add(Assignment(job_id=job.id, member_id=p.id, role=p.category))

            elif job.status == "open":
                p = random.choice(freelancers)
                req_exists = db.query(JobRequest).filter(JobRequest.job_id == job.id, JobRequest.receiver_id == p.id).first()
                if not req_exists:
                    db.add(JobRequest(job_id=job.id, sender_id=admin_id, receiver_id=p.id, role=p.category, budget=job.budget // 5, status="pending"))

        # 6. Seed Notifications
        notif_data = [
            {"title": "Job Accepted", "message": "Karan Shah has accepted your request for 'The Grand Udaipur Wedding'.", "type": "job_invite", "redirect": "/job-hub"},
            {"title": "New Job Invite", "message": "Focus Production House invited you for 'Luxury Real Estate Shoot'.", "type": "job_invite", "redirect": "/job-hub"},
            {"title": "Payment Received", "message": "₹15,000 credited for Architecture Expo project.", "type": "system", "redirect": "/analytics"},
            {"title": "Team Update", "message": "Ananya Iyer is now available for your upcoming shoot in Mumbai.", "type": "team_request", "redirect": "/team"},
            {"title": "New Request", "message": "Studio Owner sent you a new job offer.", "type": "job_invite", "redirect": "/job-hub"},
        ]

        for n in notif_data:
            exists = db.query(Notification).filter(Notification.user_id == admin_id, Notification.message == n["message"]).first()
            if not exists:
                db.add(Notification(user_id=admin_id, title=n["title"], message=n["message"], type=n["type"], redirect_to=n["redirect"]))

        # 7. Seed Tasks (Notes)
        tasks_pool = ["Verify equipment", "Check venue lighting", "Backup raw files", "Coordinate with leads", "Rental gear pickup", "Battery check"]
        for job in admin_owned_jobs:
            num = random.randint(2, 4)
            for t_text in random.sample(tasks_pool, num):
                exists = db.query(Task).filter(Task.job_id == job.id, Task.text == t_text).first()
                if not exists:
                    db.add(Task(job_id=job.id, text=t_text, completed=random.choice([True, False])))

        # 8. Seed Admin's Professional Profile (Persistent Info)
        admin = db.query(User).filter(User.id == admin_id).first()
        if admin:
            admin.bio = "Capturing life's most precious moments with a blend of candid storytelling and cinematic elegance. 10+ years of experience in luxury weddings and commercial fashion."
            admin.skills_text = "Wedding,Portrait,Commercial,Fashion,Event"
            admin.specialties_text = "Lead Photographer,Candid Specialist"
            admin.years_experience = 12
            admin.instagram_handle = "@lumiere_productions"
            admin.portfolio_url = "www.lumiere-studios.in"
            admin.equipment_json = '[{"id":1,"name":"Sony A7R V","type":"Camera"},{"id":2,"name":"24-70mm f/2.8 GM II","type":"Lens"},{"id":3,"name":"DJI Mavic 3 Pro","type":"Drone"}]'

        db.commit()
        return True


demo_service = DemoService()
