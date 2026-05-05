from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.api_router import api_router
from core.config import settings
from db.database import engine
from models import models
from utils.postman_generator import generate_postman_collection
import os

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Lumière API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount the central API router
app.include_router(api_router, prefix="/api")

@app.on_event("startup")
async def startup_event():
    # Generate postman.json in the project root
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    postman_path = os.path.join(root_dir, "postman.json")
    generate_postman_collection(app, postman_path)

@app.get("/")
async def root():
    return {"message": "Welcome to Lumière API"}

@app.get("/api/test-auto-update")
async def test_auto_update():
    return {"message": "Postman should update automatically!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=settings.PORT, reload=True)
