from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from models.models import User
from models.schemas import UserLogin, UserSignUp
from core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

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
            hashed_password=hashed_password
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user

auth_service = AuthService()
