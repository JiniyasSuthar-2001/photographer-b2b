from pydantic import BaseModel
from typing import Optional

class UserLogin(BaseModel):
    username: str
    password: str

class UserSignUp(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserProfile(BaseModel):
    id: int
    username: str
