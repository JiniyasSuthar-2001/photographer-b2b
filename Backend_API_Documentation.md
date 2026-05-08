This document serves as a living registry of all API endpoints implemented in the Lumière project. It details the paths, implementation layers, and the technical rationale behind each design choice.

---

## 1. Authentication Layer (`/api/auth`)

The authentication layer handles user registration and identity verification using a custom implementation with JWT and bcrypt.

### POST `/signup`
- **Full Path**: `http://localhost:8000/api/auth/signup`
- **Files Involved**:
  - **Router**: `backend/routers/auth.py`
  - **Service**: `backend/services/auth_service.py`
  - **Database**: `backend/db/database.py` (SQLite)
  - **Model**: `backend/models/models.py` (SQLAlchemy User)
  - **Schema**: `UserSignUp` in `backend/models/schemas.py`
- **Implementation Details**:
  - Receives `username`, `password`, `phone`, `full_name`, etc.
  - Hashes the password using `bcrypt` via `passlib`.
  - Saves a new record in the `users` table in the local `lumiere.db` SQLite database.
- **Why this way?**:
  - **Local Development**: SQLite requires zero setup and stores data in a local file, making it perfect for rapid prototyping.
  - **Control**: Implementing our own hashing and JWT logic gives us full control over the authentication lifecycle without external dependencies.

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
  - If `accepted`, creates a permanent entry in the `team` table using the display info provided in the initial request.
  - Generates notifications for both parties with `redirect_to: "/team"`.
- **Rationale**: Completes the handshake loop for team membership.

### PATCH `/{member_id}`
- **Full Path**: `http://localhost:8000/api/team/{member_id}`
- **Implementation Details**:
  - Updates a team member's `display_name`, `display_category`, or `display_city`.
- **Rationale**: Allows studio owners to personalize their team directory labels independent of the photographer's own profile.

### DELETE `/{member_id}`
- **Full Path**: `http://localhost:8000/api/team/{member_id}`
- **Implementation Details**: Removes the relationship entry from the `team` table.
- **Rationale**: Standard management for offboarding or removing photographers from the local roster.

### GET `/`
- **Full Path**: `http://localhost:8000/api/team/`
- **Implementation Details**:
  - Returns a list of all photographers associated with the studio owner.
  - Includes calculated fields like `jobsCompleted` (shared work history).
- **Rationale**: Core dashboard view for team management.

### GET `/requests/pending`
- **Full Path**: `http://localhost:8000/api/team/requests/pending`
- **Implementation Details**: Fetches team invitations sent **to** the current user by other studios.
- **Rationale**: Essential for cross-studio collaboration.

### GET `/joined`
- **Full Path**: `http://localhost:8000/api/team/joined`
- **Implementation Details**: Lists all studios where the current user is a team member.
- **Rationale**: Provides visibility into the user's external professional network.

---

## 3. Analytics Layer (`/api/analytics`)

Provides business intelligence and performance metrics for both Photographers and Studio Owners.

### GET `/stats`
- **Full Path**: `http://localhost:8000/api/analytics/stats`
- **Implementation Details**: Returns high-level metrics like Total Jobs, Total Revenue, and Growth Percentage.
- **Rationale**: Power the summary cards at the top of the Analytics dashboard.

### GET `/trends`
- **Full Path**: `http://localhost:8000/api/analytics/trends`
- **Implementation Details**: Returns monthly revenue and booking volume for charting.
- **Rationale**: Visualizes financial growth over time.

### GET `/categories`
- **Full Path**: `http://localhost:8000/api/analytics/categories`
- **Implementation Details**: Returns a distribution of jobs across different categories.
- **Rationale**: Helps users identify their most profitable niche.

---

## 4. Notification Layer (`/api/notifications`)

Handles user alerts for team and job-related activities.

### GET `/notifications/`
- **Full Path**: `http://localhost:8000/api/notifications/`
- **Implementation Details**: Paginated list of notifications for the current user.
- **Real-Time Integration**: Although polled every 30s as a fallback, new notifications are now pushed instantly via the `/ws` endpoint.
- **Rationale**: Keeps users informed of platform activities.

### PATCH `/notifications/{id}/read`
- **Full Path**: `http://localhost:8000/api/notifications/{id}/read`
- **Implementation Details**: Marks a specific notification as read.

### PATCH `/notifications/read-all`
- **Full Path**: `http://localhost:8000/api/notifications/read-all`
- **Implementation Details**: Marks all unread notifications for the current user as read in a single batch.

---

## 5. Job Request Layer (`/api/requests`)

Handles professional job invites (distinct from team membership).

### POST `/requests/`
- **Full Path**: `http://localhost:8000/api/requests/`
- **Implementation Details**:
  - Sends a job invite and triggers a notification for the receiver with `redirect_to: "/job-hub"`.
  - **Real-Time Impact**: Triggers an immediate WebSocket broadcast (`NEW_NOTIFICATION`) to the receiver.

### PATCH `/requests/{id}`
- **Full Path**: `http://localhost:8000/api/requests/{id}`
- **Implementation Details**:
  - Accepts/declines a job invite, creating an assignment on acceptance.
  - **Budget Integrity**: Photographers cannot modify the budget; acceptance is hardcoded to the original offer.
  - **Real-Time Impact**: Notifies both the sender and receiver instantly via WebSockets of the response status.

### GET `/eligible-jobs/{photographer_id}`
- **Full Path**: `http://localhost:8000/api/requests/eligible-jobs/{photographer_id}`
- **Implementation Details**:
  - Filters `open` jobs owned by the studio owner.
  - Matches the job `category` with the photographer's specialty.
  - Excludes jobs where the photographer is already invited or assigned.
- **Rationale**: Smart filtering for the invitation workflow.

### GET `/`
- **Full Path**: `http://localhost:8000/api/requests/`
- **Query Parameters**:
  - `role`: "sender" or "receiver" (default: "receiver")
  - `status`: Filter by status (optional)
- **Implementation Details**:
  - Returns a list of job requests associated with the user.
  - Enriches results with job title, date, and user names.
- **Rationale**: Primary data source for the "Invites" tab in the Job Hub.

### GET `/accepted-jobs`
- **Full Path**: `http://localhost:8000/api/requests/accepted-jobs`
- **Implementation Details**:
  - Returns assignments where the current user is the photographer.
  - Includes owner details and job status.
- **Rationale**: Powers the "Accepted Jobs" view for photographers.

---

## 6. Job Management Layer (`/api/jobs`)

Handles the lifecycle of professional photography assignments.

### POST `/`
- **Full Path**: `http://localhost:8000/api/jobs/`
- **Implementation Details**: Creates a new job with a specific category (Wedding, Portrait, etc.).

### GET `/`
- **Full Path**: `http://localhost:8000/api/jobs/`
- **Implementation Details**: Returns all jobs owned by the authenticated studio owner.

### PUT `/{id}`
- **Full Path**: `http://localhost:8000/api/jobs/{id}`
- **Implementation Details**: Updates existing job metadata (Title, Location, Budget, etc.).

### DELETE `/{id}`
- **Full Path**: `http://localhost:8000/api/jobs/{id}`
- **Implementation Details**: Permanently deletes a job and its associated requests.

---

## 7. Webhooks Layer (`/api/webhooks`)

Provides endpoints for external service integrations and internal system triggers.

### POST `/external-event`
- **Full Path**: `http://localhost:8000/api/webhooks/external-event`
- **Implementation Details**:
  - Receiver for external payloads (Meta, Stripe).
  - Processes incoming data and broadcasts updates to the corresponding user via WebSockets.
- **Rationale**: Decouples external event handling from the main API business logic.

### POST `/trigger-refresh`
- **Full Path**: `http://localhost:8000/api/webhooks/trigger-refresh`
- **Implementation Details**:
  - Backend-initiated trigger to force a specific UI page to refresh its data.
- **Rationale**: Essential for "proper connection" between state changes and user views.

---

## 8. Real-Time Layer (`/ws`)

The real-time layer maintains persistent connections to users for instant page updates.

### WebSocket `/ws`
- **Full Path**: `ws://localhost:8000/ws`
- **Parameters**: `token` (JWT query parameter)
- **Implementation Details**:
  - Manages active user sessions using a `ConnectionManager`.
  - Authenticates during the handshake phase.
  - Replaces traditional polling with low-latency event pushing.
- **Rationale**: Essential for professional-grade synchronization between users.

---

## 9. Global API Configuration

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
2. **Currency Standard**: All financial values are processed as integers and formatted using the **Indian Rupee (₹)** standard across the entire platform.
3. **Real-Time Delivery**: Actions that impact multiple users (Job Invites, Responses) MUST trigger a WebSocket broadcast via the `ConnectionManager`.
4. **Layering**:
   - **Routers**: Only handle HTTP status codes and endpoint definitions.
   - **Services**: Contain the actual logic and database calls.
   - **Core**: Contains infrastructure like `websocket.py` and `config.py`.
   - **DB**: Provides the SQLAlchemy `SessionLocal` instance via the `get_db` dependency.
5. **Error Handling**: Uses FastAPI's `HTTPException` to return consistent JSON error objects (e.g., `{"detail": "Error message"}`).
