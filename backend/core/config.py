import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

load_dotenv()

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./lumiere.db"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-for-jwt") # Change this in .env
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    PORT: int = int(os.getenv("PORT", 8000))

settings = Settings()
