from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from db.database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    phone = Column(String, unique=True, index=True)
    full_name = Column(String)
    city = Column(String)
    category = Column(String) # e.g., 'Wedding', 'Portrait'
    user_type = Column(String, default='photographer') # 'studio_owner' or 'photographer'

    # Relationships
    jobs_owned = relationship("Job", back_populates="owner")
    assignments = relationship("Assignment", back_populates="member")
    sent_requests = relationship("TeamRequest", foreign_keys="[TeamRequest.sender_id]", back_populates="sender")
    received_requests = relationship("TeamRequest", foreign_keys="[TeamRequest.receiver_id]", back_populates="receiver")
    notifications = relationship("Notification", back_populates="user")


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    date = Column(DateTime, default=datetime.utcnow)
    studio_owner_id = Column(Integer, ForeignKey("users.id"))
    category = Column(String) # Wedding, Portrait, etc.
    status = Column(String, default="open") # open, completed, assigned, cancelled

    owner = relationship("User", back_populates="jobs_owned")
    assignments = relationship("Assignment", back_populates="job")
    requests = relationship("JobRequest", back_populates="job")

class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"))
    member_id = Column(Integer, ForeignKey("users.id"))
    role = Column(String) # Lead, Assistant, etc.

    job = relationship("Job", back_populates="assignments")
    member = relationship("User", back_populates="assignments")

class TeamRequest(Base):
    __tablename__ = "team_requests"

    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"))
    receiver_id = Column(Integer, ForeignKey("users.id"))
    status = Column(String, default="pending") # pending, accepted, declined
    created_at = Column(DateTime, default=datetime.utcnow)

    # Custom info entered by studio owner
    display_name = Column(String)
    display_category = Column(String)
    display_city = Column(String)

    sender = relationship("User", foreign_keys=[sender_id], back_populates="sent_requests")
    receiver = relationship("User", foreign_keys=[receiver_id], back_populates="received_requests")

class JobRequest(Base):
    __tablename__ = "job_requests"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"))
    sender_id = Column(Integer, ForeignKey("users.id"))
    receiver_id = Column(Integer, ForeignKey("users.id"))
    role = Column(String)
    budget = Column(Integer)
    status = Column(String, default="pending") # pending, accepted, declined
    created_at = Column(DateTime, default=datetime.utcnow)

    job = relationship("Job", back_populates="requests")
    sender = relationship("User", foreign_keys=[sender_id])
    receiver = relationship("User", foreign_keys=[receiver_id])

class Team(Base):
    __tablename__ = "team"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    member_id = Column(Integer, ForeignKey("users.id"))
    
    # Identity info preserved on studio owner's side
    display_name = Column(String)
    display_category = Column(String)
    display_city = Column(String)
    phone = Column(String)

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    message = Column(String)
    redirect_to = Column(String) # e.g., '/team'
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")
