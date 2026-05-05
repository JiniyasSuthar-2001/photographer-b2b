# Project Structure & API Integration Strategy

This document outlines the current project organization and the planned strategy for connecting the frontend to a future backend.

# Current Project Structure


/Lumière-Project
├── venv/               # Virtual environment (Python 3.14)
├── backend/            # FastAPI Backend
└── frontend/           # React Frontend (Vite)
    ├── src/            # UI logic & components
    ├── public/         # Static assets
    ├── package.json    # Frontend dependencies
    └── vite.config.js  # Vite configuration


## API Connection Strategy

When the backend is implemented, it will connect to the frontend using a Layered Service-Based Architecture — where each layer has a single, clear responsibility. The frontend never talks to the database directly; instead, it communicates with the FastAPI backend through a dedicated service layer (`frontend/src/services/api.js`), which maps UI actions to HTTP endpoints. The backend then processes requests through routers → services → database, keeping logic clean, testable, and maintainable.

# 1. The Service Layer (`frontend/src/services/api.js`)
We will create a dedicated service file to handle all HTTP communication. This keeps the API logic separate from the UI.
- Tools: Standard `fetch` API or `axios`.
- Purpose: Map frontend requests to backend endpoints (e.g., `GET /api/jobs`).

# 2. Global State Sync (`AppContext.jsx`)
The `AppContext` will act as the "brain" of the application:
- Initialization: On mount, the app will trigger an initial fetch to populate the state.
- Reactivity: When data changes (e.g., a new job is created), the service will update the backend, and the response will be dispatched to the local reducer to update the UI instantly.

# 3. Data Flow Diagram

graph LR
    UI[Frontend Pages] -->|Action| Context[AppContext/Reducer]
    Context -->|Async Call| API[Service Layer]
    API -->|HTTP Request| Server[FastAPI Backend]
    Server -->|DB Query| DB[Supabase/PostgreSQL]
    DB -->|Data| Server
    Server -->|JSON Response| API
    API -->|Dispatch| Context
    Context -->|Update State| UI




# Proposed Backend Structure

The backend follows a fully layered architecture, separating routing, business logic, data access, and configuration into dedicated modules:


/backend
├── routers/            # API endpoints (HTTP layer only)
│   ├── jobs.py         # Job CRUD routes
│   ├── team.py         # Team member routes
│   ├── requests.py     # Assignment/request routes
│   └── notifications.py# Alert & notification routes
│
├── services/           # Business logic (VERY IMPORTANT)
│   ├── job_service.py        # Job creation, validation, assignment logic
│   ├── team_service.py       # Team availability, member logic
│   ├── request_service.py    # Request approval/rejection logic
│   └── notification_service.py # Notification triggering logic
│
├── models/             # Pydantic schemas (data validation)
│   └── schemas.py      # Input/output shapes for all endpoints
│
├── db/                 # Database connection layer
│   └── supabase.py     # Supabase client & query functions
│
├── core/               # Configuration & utilities
│   └── config.py       # Loads .env variables (keys, URLs)
│
├── main.py             # FastAPI entry point — registers all routers
├── .env                # Supabase URL, API keys (never committed)
└── requirements.txt    # Python dependencies (fastapi, uvicorn, etc.)

   


/API Endpoints (Planned)

Jobs (`/api/jobs`)
- `GET /`: List all jobs.
- `GET /{id}`: Get specific job details.
- `POST /`: Create a new job.
- `PUT /{id}`: Update job details/status.
- `DELETE /{id}`: Remove a job.

Team (`/api/team`)
- `GET /`: List all photographers and staff.
- `POST /`: Add a new team member.
- `PUT /{id}`: Update member profile/availability.

Requests (`/api/requests`)
- `GET /`: Fetch all job assignments.
- `POST /`: Send a new request to a member.
- `PATCH /{id}?status=accepted`: Update request status (Accepted/Declined).

Notifications (`/api/notifications`)
- `GET /`: Fetch user alerts.
- `PATCH /{id}/read`: Mark notification as read.



/ Planned Backend Requirements
To utilize the existing `venv`, the future backend will require:
-FastAPI : For high-performance async endpoints.
- Uvicorn : As the ASGI server.
- Supabase SDK : To interact with the PostgreSQL database.
-CORS Middleware : To allow communication between the Vite frontend (`port 5173`) and the Python API (`port 8000`).



 Next Steps
1. Define precise API endpoint requirements based on `mockData.js`.
2. Implement the Backend logic using the existing root-level `venv`.
3. Create the `src/services/api.js` utility in the frontend.
4. Replace mock data initializers with real API calls.



# How It Will Work When Implemented

Every request from the frontend travels through **4 layers** in sequence:


Frontend (React) → routers/ → services/ → db/supabase.py → Supabase DB
                 ←          ←           ←                ←


# Layer Responsibilities

| Layer | File(s) | Job |
|---|---|---|
| Router | `routers/*.py` | Receive HTTP request, validate input shape, call service |
| Service | `services/*.py` | Run business logic, make decisions, call DB |
| DB | `db/supabase.py` | Execute raw Supabase queries (insert, select, update) |
| Schema | `models/schemas.py` | Enforce data shape on input AND output |
| Config | `core/config.py` | Supply environment variables to all layers |

---

# Real Example — "Approve a Job Request"

```
POST /requests/{id}/approve         ← Frontend sends request
        ↓
routers/requests.py
  → Validates auth token
  → Validates request body via schemas.py
  → Calls request_service.approve(id)
        ↓
services/request_service.py
  → Checks if request exists           (→ db/supabase.py)
  → Checks if user has permission      (→ db/supabase.py)
  → Updates status to "approved"       (→ db/supabase.py)
  → Triggers notification              (→ notification_service.py)
        ↓
services/notification_service.py
  → Creates notification record        (→ db/supabase.py)
        ↓
Response travels back up → Router returns 200 OK → Frontend updates UI
```

# Key Design Rules
- Routers never touch the DB directly — they only call services
- Services never deal with HTTP — they only handle logic
- DB layer never makes decisions — it only executes queries
- Schemas enforce contracts at both the request and response boundary
- `config.py` + `.env` power everything silently — no hardcoded secrets

---

# Final Combined Project Structure

This is the complete picture of the Lumière-Project once the backend is fully implemented and connected to the frontend.


/Lumière-Project
│
├── frontend/                       # ── FRONTEND (React + Vite)
│   ├── src/                        # UI logic & components
│   │   ├── components/             # Reusable UI components
│   │   ├── context/                # Global state (AppContext, reducer)
│   │   ├── pages/                  # Route views
│   │   └── services/               # API clients
│   ├── public/                     # Static assets
│   ├── index.html                  # HTML entry point
│   ├── package.json                # Frontend dependencies
│   └── vite.config.js              # Vite config
│
├── backend/                        # ── BACKEND (FastAPI + Python)
│   │
│   ├── routers/                    # HTTP layer — routes only, no business logic
│   │   ├── jobs.py                 # GET/POST/PUT/DELETE  /api/jobs
│   │   ├── team.py                 # GET/POST/PUT         /api/team
│   │   ├── requests.py             # GET/POST/PATCH       /api/requests
│   │   └── notifications.py        # GET/PATCH            /api/notifications
│   │
│   ├── services/                   # ★ Business logic — the most important layer
│   │   ├── job_service.py          # Job creation, validation, assignment logic
│   │   ├── team_service.py         # Team availability & member management
│   │   ├── request_service.py      # Request approval/rejection + side effects
│   │   └── notification_service.py # Notification creation & dispatch logic
│   │
│   ├── models/                     # Pydantic schemas — data shape contracts
│   │   └── schemas.py              # Input/output shapes for every endpoint
│   │
│   ├── db/                         # Database access layer
│   │   └── supabase.py             # Supabase client & raw query functions
│   │
│   ├── core/                       # App configuration
│   │   └── config.py               # Loads .env variables (URL, keys, secrets)
│   │
│   ├── main.py                     # FastAPI entry — mounts all routers + CORS
│   ├── .env                        # Supabase URL & API keys (yet to be committed)
│   └── requirements.txt            # Python deps: fastapi, uvicorn, supabase, etc.
│
└── venv/                           # Python virtual environment (Python 3.14)


# How Frontend & Backend Connect

```
frontend/src/services/api.js        →   HTTP Request (port 8000)   →   backend/routers/*.py
                                                                        ↓
frontend/src/context/AppContext.jsx ←   JSON Response              ←   backend/services/*.py
                                                                        ↓
                                                                backend/db/supabase.py
                                                                        ↓
                                                               Supabase Cloud DB
```

# Key Integration Points

| Frontend File | Backend Counterpart | Purpose |
|---|---|---|
| `frontend/src/services/api.js` | `backend/routers/*.py` | HTTP bridge — all API calls go here |
| `frontend/src/context/AppContext.jsx` | `backend/services/*.py` | UI state ↔ business logic sync |
| `frontend/src/data/mockData.js` *(replaced)* | `backend/db/supabase.py` | Swap mock data for real DB queries |
| `frontend/vite.config.js` (proxy) | `backend/main.py` (CORS) | Dev proxy & production CORS policy |
| Frontend `.env` (Vite) | `backend/.env` (Python) | Separate secrets per layer |
