# Lumière Backend API Documentation

This document serves as a living registry of all API endpoints implemented in the Lumière project. It details the paths, implementation layers, and the technical rationale behind each design choice.

---

## 1. Authentication Layer (`/api/auth`)

The authentication layer handles user registration and identity verification using Supabase Auth (GoTrue).

### POST `/signup`
- Full Path: `http://localhost:8000/api/auth/signup`
- Files Involved:
  - Router: `backend/routers/auth.py`
  - Service: `backend/services/auth_service.py`
  - Database: `backend/db/database.py` (SQLite)
  - Model: `backend/models/models.py` (SQLAlchemy User)
  - Schema: `UserSignUp` in `backend/models/schemas.py`
- Implementation Details:
  - Receives `username` and `password`.
  - Hashes the password using `bcrypt` via `passlib`.
  - Saves a new record in the `users` table in the local `lumiere.db` SQLite database.
- Why this way?:
  - Local Development**: SQLite requires zero setup and stores data in a local file, making it perfect for rapid prototyping.
  - Control**: Implementing our own hashing and JWT logic gives us full control over the authentication lifecycle.

### POST `/login`
- **Full Path**: `http://localhost:8000/api/auth/login`
- **Files Involved**:
  - **Router**: `backend/routers/auth.py`
  - **Service**: `backend/services/auth_service.py`
  - **Schema**: `UserLogin` in `backend/models/schemas.py`
- **Implementation Details**:
  - Receives `username` and `password`.
  - Verifies the password against the hashed password stored in SQLite.
  - Generates a JWT (JSON Web Token) using `HS256` algorithm and a local `SECRET_KEY`.
- **Why this way?**:
  - **Statelessness**: Using JWTs allows the backend to remain stateless, scaling easily as we don't need to manage sessions in memory.
  - **Portability**: All user data and tokens are managed within our own ecosystem, making it easier to migrate or customize authentication rules later.

---

## 2. Global API Configuration

### Base URL
- **Development**: `http://localhost:8000/api`
- **Routing Logic**: Managed by `backend/api/api_router.py`, which aggregates all sub-routers (Auth, Jobs, etc.) into a single entry point for `main.py`.

### CORS Policy
- **Configured in**: `backend/main.py`
- **Permitted Origin**: `http://localhost:5173` (Vite Default)
- **Rationale**: Strict origin matching prevents Cross-Origin request forgery while allowing the local development environment to communicate seamlessly.

---

## Technical Standards

1. **Validation**: All inputs and outputs are strictly typed using **Pydantic** (`backend/models/schemas.py`).
2. **Layering**:
   - **Routers**: Only handle HTTP status codes and endpoint definitions.
   - **Services**: Contain the actual logic and database calls.
   - **DB**: Provides the Supabase client instance.
3. **Error Handling**: Uses FastAPI's `HTTPException` to return consistent JSON error objects (e.g., `{"detail": "Error message"}`).
