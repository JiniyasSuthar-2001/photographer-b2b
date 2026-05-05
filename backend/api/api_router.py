from fastapi import APIRouter
from routers import auth # Add other routers here as they are implemented

api_router = APIRouter()

# Register all sub-routers
api_router.include_router(auth.router)

# Example placeholder for future routers
# api_router.include_router(jobs.router)
# api_router.include_router(team.router)
