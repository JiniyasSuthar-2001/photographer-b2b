from fastapi import APIRouter, HTTPException
from models.schemas import UserLogin, UserSignUp
import secrets

router = APIRouter(prefix="/auth", tags=["Authentication"])

# Hardcoded users for testing (no database)
USERS = {
    "admin": "admin@001",
    "admin01": "admin@002",
    "admin02": "admin003",
}

@router.post("/signup")
async def signup(user_data: UserSignUp):
    if user_data.username in USERS:
        raise HTTPException(status_code=400, detail="Username already exists")
    USERS[user_data.username] = user_data.password
    return {"message": "User created successfully", "user": {"username": user_data.username}}

@router.post("/login")
async def login(user_data: UserLogin):
    stored_password = USERS.get(user_data.username)
    if not stored_password or stored_password != user_data.password:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    access_token = secrets.token_urlsafe(32)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {"username": user_data.username}
    }
