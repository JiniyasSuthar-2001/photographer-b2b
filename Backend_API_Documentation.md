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

### POST `/forgot-password`
- **Full Path**: `http://localhost:8000/api/auth/forgot-password`
- **Implementation Details**:
  - Receives a `username`.
  - Simulates sending a password reset email (logs message to console).
- **Rationale**: Essential self-service feature for user recovery.

---

## 2. Team Management Layer (`/api/team`)

The team layer manages relationships between studio owners and photographers, including shared work history and the invitation system.

### GET `/collaborations/{member_id}`
- **Full Path**: `http://localhost:8000/api/team/collaborations/{member_id}`
- **Files Involved**:
  - Router: `backend/routers/team.py`
  - Model: `Job`, `Assignment` in `backend/models/models.py`
  - Schema: `CollaborationResponse` in `backend/models/schemas.py`
- **Implementation Details**:
  - Requires JWT Authentication.
  - Joins `jobs` and `assignments` tables.
  - Filters for jobs owned by the current user where the `member_id` is assigned.
  - Supports pagination via `page` and `limit` query parameters.
- **Rationale**: Provides a focused view of professional history without exposing unrelated work data.

### GET `/users/search`
- **Full Path**: `http://localhost:8000/api/team/users/search`
- **Implementation Details**:
  - Search by `phone` number (unique identifier).
  - Returns basic user profile if found.
- **Rationale**: Efficient user discovery for the invite system using a known unique identifier.

### POST `/request`
- **Full Path**: `http://localhost:8000/api/team/request`
- **Implementation Details**:
  - Requires JWT Authentication.
  - Creates a `pending` entry in `team_requests`.
  - Prevents duplicate pending requests.
- **Rationale**: Formalizes the team building process, ensuring consent before adding members.

### PATCH `/request/{id}`
- **Full Path**: `http://localhost:8000/api/team/request/{id}`
- **Implementation Details**:
  - Updates status to `accepted` or `declined`.
  - If `accepted`, creates a permanent entry in the `team` table.
- **Rationale**: Completes the handshake loop for team membership.

### GET `/`
- **Full Path**: `http://localhost:8000/api/team/`
- **Implementation Details**:
  - Returns a list of all photographers associated with the studio owner.
  - Includes calculated fields like `jobsCompleted` (shared work history).
- **Rationale**: Core dashboard view for team management.

---

## 3. Notification Layer (`/api/notifications`)

Handles user alerts for team and job-related activities.

### GET `/notifications/`
- **Full Path**: `http://localhost:8000/api/notifications/`
- **Implementation Details**: Paginated list of notifications for the current user.
- **Rationale**: Keeps users informed of platform activities.

### PATCH `/notifications/{id}/read`
- **Full Path**: `http://localhost:8000/api/notifications/{id}/read`
- **Implementation Details**: Marks a specific notification as read.

---

## 4. Job Request Layer (`/api/requests`)

Handles professional job invites (distinct from team membership).

### POST `/requests/`
- **Full Path**: `http://localhost:8000/api/requests/`
- **Implementation Details**: Sends a job invite and triggers a notification.

### PATCH `/requests/{id}`
- **Full Path**: `http://localhost:8000/api/requests/{id}`
- **Implementation Details**: Accepts/declines a job invite, creating an assignment on acceptance.

### GET `/eligible-jobs/{photographer_id}`
- **Full Path**: `http://localhost:8000/api/requests/eligible-jobs/{photographer_id}`
- **Implementation Details**:
  - Filters `open` jobs owned by the studio owner.
  - Matches the job `category` with the photographer's specialty.
  - Excludes jobs where the photographer is already invited or assigned.
- **Rationale**: Smart filtering for the invitation workflow.

---

## 5. Job Management Layer (`/api/jobs`)

Handles the lifecycle of professional photography assignments.

### POST `/`
- **Full Path**: `http://localhost:8000/api/jobs/`
- **Implementation Details**: Creates a new job with a specific category (Wedding, Portrait, etc.).

### GET `/`
- **Full Path**: `http://localhost:8000/api/jobs/`
- **Implementation Details**: Returns all jobs owned by the authenticated studio owner.

---

## 6. Global API Configuration

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
