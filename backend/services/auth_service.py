# ==================================================================================
# SERVICE: AUTHENTICATION
# Purpose: Core security logic for passwords, JWT tokens, and user sessions.
# Connected Routers: backend/routers/auth.py
# Impact: Every secure endpoint in the API depends on get_current_user logic here.
# ==================================================================================

from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from models.models import User
from models.schemas import UserLogin, UserSignUp
from core.config import settings
from .demo_service import demo_service


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

HARDCODED_USERS = {
    "admin": "admin@001",
    "admin01": "admin@002",
    "admin02": "admin003",
}

class AuthService:
    @staticmethod
    def get_password_hash(password):
        return pwd_context.hash(password)

    @staticmethod
    def verify_password(plain_password, hashed_password):
        return pwd_context.verify(plain_password, hashed_password)

    @staticmethod
    def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
        return encoded_jwt

    @staticmethod
    def authenticate_user(db: Session, user_data: UserLogin):
        # Check hardcoded users first
        if user_data.username in HARDCODED_USERS:
            if HARDCODED_USERS[user_data.username] == user_data.password:
                # Get or create the user in DB so relationships work
                user = db.query(User).filter(User.username == user_data.username).first()
                if not user:
                    user = User(
                        username=user_data.username,
                        hashed_password=AuthService.get_password_hash(user_data.password),
                        full_name=user_data.username.capitalize(),
                        user_type="photographer",
                        phone=f"000{list(HARDCODED_USERS.keys()).index(user_data.username)}" # Dummy phone
                    )

                    db.add(user)
                    db.commit()
                    db.refresh(user)
                
                # SEED DEMO DATA for Admin
                demo_service.seed_admin_data(db, user.id)
                
                return user
        
        user = db.query(User).filter(User.username == user_data.username).first()
        if not user:
            return False
        if not AuthService.verify_password(user_data.password, user.hashed_password):
            return False
        return user

    @staticmethod
    def create_user(db: Session, user_data: UserSignUp):
        hashed_password = AuthService.get_password_hash(user_data.password)
        db_user = User(
            username=user_data.username,
            hashed_password=hashed_password,
            phone=user_data.phone,
            full_name=user_data.full_name,
            city=user_data.city,
            category=user_data.category,
            user_type=user_data.user_type
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user

    @staticmethod
    def get_current_user(db: Session, token: str):
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            username: str = payload.get("sub")
            if username is None:
                return None
        except JWTError:
            return None
        user = db.query(User).filter(User.username == username).first()
        return user

auth_service = AuthService()
