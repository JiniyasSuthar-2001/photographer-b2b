from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware
from api.api_router import api_router
from core.config import settings
from db.database import engine, SessionLocal
from models import models
from core.websocket import manager
from services.auth_service import auth_service
from utils.postman_generator import generate_postman_collection
import os

# Create database tables
models.Base.metadata.create_all(bind=engine)

from contextlib import asynccontextmanager


# --- LIFESPAN HANDLER ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    postman_path = os.path.join(root_dir, "postman.json")
    generate_postman_collection(app, postman_path)
    print(f"✅ Postman collection generated at {postman_path}")
    yield
    # Shutdown logic (if any)

app = FastAPI(title="Lumière API", lifespan=lifespan)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount the central API router
app.include_router(api_router, prefix="/api")

# --- WEBSOCKET HANDLER ---
@app.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str = Query(...)
):
    """
    Real-time connection point for frontend pages.
    Connects a 'User' session to the server for instant updates.
    """
    print(f"🔌 WebSocket connection attempt with token: {token[:10]}...")
    # manager.connect handles websocket.accept() internally
    
    db = SessionLocal()
    try:
        user = auth_service.get_current_user(db, token)
        if not user:
            print("❌ WebSocket Auth Failed: User not found")
            await websocket.close(code=4001)
            return

        print(f"✅ WebSocket Connected: User {user.username} (ID: {user.id})")
        await manager.connect(websocket, user.id)
        try:
            while True:
                data = await websocket.receive_text()
                # Handle client-side pings or commands here
        except WebSocketDisconnect:
            print(f"🔌 WebSocket Disconnected: User {user.id}")
            manager.disconnect(websocket, user.id)
    except Exception as e:
        print(f"💥 WebSocket Error: {str(e)}")
    finally:
        db.close()

@app.get("/")
async def root():
    return {"message": "Welcome to Lumière API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=settings.PORT, reload=True)
