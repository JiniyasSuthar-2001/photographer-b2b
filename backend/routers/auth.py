from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from db.database import get_db
from models.schemas import UserLogin, UserSignUp, Token
from services.auth_service import auth_service
from fastapi.security import OAuth2PasswordBearer

router = APIRouter(prefix="/auth", tags=["Authentication"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    user = auth_service.get_current_user(db, token)
    if not user:
        raise HTTPException(status_code=401, detail="Could not validate credentials")
    return user

@router.post("/signup")
async def signup(user_data: UserSignUp, db: Session = Depends(get_db)):
    db_user = auth_service.authenticate_user(db, UserLogin(username=user_data.username, password=user_data.password))
    if db_user:
        raise HTTPException(status_code=400, detail="Username already exists")
    user = auth_service.create_user(db, user_data)
    return {"message": "User created successfully", "user": {"username": user.username}}

@router.post("/login", response_model=Token)
async def login(user_data: UserLogin, db: Session = Depends(get_db)):
    user = auth_service.authenticate_user(db, user_data)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    access_token = auth_service.create_access_token(data={"sub": user.username})
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.post("/forgot-password")
async def forgot_password(data: dict):
    # In a real app, this would send an email.
    # For now, we'll just return a success message.
    username = data.get("username")
    if not username:
        raise HTTPException(status_code=400, detail="Username is required")
    return {"message": f"Password reset instructions sent to user {username}"}
