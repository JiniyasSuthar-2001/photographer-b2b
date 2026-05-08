from sqlalchemy.orm import Session
from db.database import SessionLocal, engine
from models import models
from services.auth_service import auth_service
from services.demo_service import demo_service
from datetime import datetime, timedelta

def clean_and_seed():
    """
    CLEANUP & PRODUCTION SEEDER
    Requirement: 
    1. Removes all existing dummy data.
    2. Only creates the 'admin' account with demo content.
    3. All other users start with a 100% clean state.
    """
    db = SessionLocal()
    # Create tables
    models.Base.metadata.create_all(bind=engine)

    print("--- CLEANING DATABASE ---")
    # Delete everything except the admin users if they exist, 
    # but actually it's better to reset everything for a fresh start.
    db.query(models.Assignment).delete()
    db.query(models.JobRequest).delete()
    db.query(models.Task).delete()
    db.query(models.Notification).delete()
    db.query(models.Team).delete()
    db.query(models.Job).delete()
    db.query(models.User).delete()
    db.commit()

    print("--- SEEDING ADMIN ACCOUNT ---")
    # Only one hardcoded admin
    admin_data = {"admin": "admin@001"}
    
    for username, password in admin_data.items():
        new_admin = models.User(
            username=username,
            hashed_password=auth_service.get_password_hash(password),
            full_name="System Admin",
            phone="0000000000",
            city="Ahmedabad",
            user_type="photographer",
            is_pro=True,
            plan="Enterprise",
            is_on_trial=False
        )
        db.add(new_admin)
        db.commit()
        db.refresh(new_admin)
        
        # Seed rich demo data ONLY for this admin
        print(f"Injecting demo environment into '{username}' account...")
        demo_service.seed_admin_data(db, new_admin.id)

    db.commit()
    print("--- PRODUCTION READY: DATABASE SEEDED ---")
    print("Demo Environment: admin / admin@001")
    print("All other accounts will now start clean.")
    db.close()

if __name__ == "__main__":
    clean_and_seed()
