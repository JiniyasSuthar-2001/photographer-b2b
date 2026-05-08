from sqlalchemy.orm import Session
from db.database import SessionLocal, engine
from models import models
from services.auth_service import auth_service
from datetime import datetime, timedelta

def seed_data():
    db = SessionLocal()
    # Create tables
    models.Base.metadata.create_all(bind=engine)

    # Create users
    owner = db.query(models.User).filter(models.User.username == "studio_owner").first()
    if not owner:
        owner = models.User(
            username="studio_owner",
            hashed_password=auth_service.get_password_hash("password123"),
            phone="1112223334",
            full_name="Studio Owner",
            city="Mumbai",
            user_type="studio_owner"
        )
        db.add(owner)
    
    photographer = db.query(models.User).filter(models.User.username == "photographer_user").first()
    if not photographer:
        photographer = models.User(
            username="photographer_user",
            hashed_password=auth_service.get_password_hash("password123"),
            phone="9876543210",
            full_name="Jiniyas Suthar",
            city="Ahmedabad",
            category="Wedding",
            user_type="photographer"
        )
        db.add(photographer)
    
    # Add new hardcoded admin users
    admin_users = {
        "admin": "admin@001",
        "admin01": "admin@002",
        "admin02": "admin003",
    }
    for username, password in admin_users.items():
        existing = db.query(models.User).filter(models.User.username == username).first()
        if not existing:
            new_admin = models.User(
                username=username,
                hashed_password=auth_service.get_password_hash(password),
                full_name=username.capitalize(),
                phone=f"00000000{list(admin_users.keys()).index(username)}",
                user_type="studio_owner"
            )
            db.add(new_admin)

    db.commit()
    db.refresh(owner)
    db.refresh(photographer)

    # Add to team
    team_member = db.query(models.Team).filter(
        models.Team.owner_id == owner.id,
        models.Team.member_id == photographer.id
    ).first()
    if not team_member:
        team_member = models.Team(
            owner_id=owner.id, 
            member_id=photographer.id,
            display_name=photographer.full_name,
            display_category=photographer.category,
            display_city=photographer.city,
            phone=photographer.phone
        )
        db.add(team_member)

    # Create shared jobs
    for i in range(1, 15):
        job = models.Job(
            title=f"Shared Wedding Job {i}",
            date=datetime.utcnow() - timedelta(days=i*10),
            studio_owner_id=owner.id,
            category="Wedding" if i % 2 == 0 else "Portrait",
            status="completed" if i > 5 else "open",
            roles="Lead,Candid,Drone" if i % 2 == 0 else "Portrait,Assistant"
        )
        db.add(job)
        db.commit()
        db.refresh(job)

        assignment = models.Assignment(
            job_id=job.id,
            member_id=photographer.id,
            role="Lead" if i % 2 == 0 else "Assistant"
        )
        db.add(assignment)

    db.commit()
    print("Database seeded successfully!")
    db.close()

if __name__ == "__main__":
    seed_data()
