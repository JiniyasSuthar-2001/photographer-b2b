from fastapi import APIRouter
from routers import auth, team, notifications, requests, jobs

api_router = APIRouter()

# Register all sub-routers
api_router.include_router(auth.router)
api_router.include_router(team.router)
api_router.include_router(notifications.router)
api_router.include_router(requests.router)
api_router.include_router(jobs.router)
