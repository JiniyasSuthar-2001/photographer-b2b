from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class UserLogin(BaseModel):
    username: str
    password: str

class UserSignUp(BaseModel):
    username: str
    password: str
    phone: str
    full_name: str
    city: Optional[str] = None
    category: Optional[str] = None
    user_type: Optional[str] = "photographer"

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserProfile

class UserProfile(BaseModel):
    id: int
    username: str
    phone: Optional[str] = None
    full_name: Optional[str] = None
    city: Optional[str] = None
    category: Optional[str] = None
    user_type: str

    class Config:
        from_attributes = True

class CollaborationHistory(BaseModel):
    job_id: int
    title: str
    date: datetime
    role: str
    status: Optional[str] = None

    class Config:
        from_attributes = True

class CollaborationResponse(BaseModel):
    data: List[CollaborationHistory]
    page: int
    total_pages: int

class TeamRequestCreate(BaseModel):
    phone: str
    display_name: str
    display_category: str
    display_city: str

class TeamRequestResponse(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class TeamMemberUpdate(BaseModel):
    display_name: Optional[str] = None
    display_category: Optional[str] = None
    display_city: Optional[str] = None

class UserSearchResponse(BaseModel):
    id: int
    full_name: str
    city: Optional[str] = None
    phone: str
    category: Optional[str] = None

class NotificationResponse(BaseModel):
    id: int
    user_id: int
    title: Optional[str] = None
    message: str
    type: Optional[str] = None
    reference_id: Optional[int] = None
    redirect_to: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

class NotificationUpdate(BaseModel):
    is_read: bool
