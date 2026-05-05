# Backend Creation & Integration Guide

This guide provides step-by-step instructions and code snippets on how to create the FastAPI backend and connect it to your React frontend.

## 1. Creating the Backend

The backend will be built using **FastAPI** and **Python**.

### Initial Setup

First, activate your virtual environment and install the required dependencies:

```bash
# Activate virtual environment
.\venv\Scripts\activate

# Install dependencies
pip install fastapi uvicorn supabase python-dotenv pydantic cors
```

### Backend Code Structure

You need to create the `backend` folder structure as outlined in the API plan. You can do this quickly by running the following commands in your terminal:

**PowerShell (Windows):**
```powershell
# Create directories one by one
mkdir backend
mkdir backend/routers
mkdir backend/services
mkdir backend/models
mkdir backend/db
mkdir backend/core
mkdir backend/api

# Create files one by one
New-Item -ItemType File -Path backend/api/api_router.py -Force
New-Item -ItemType File -Path backend/routers/jobs.py -Force
New-Item -ItemType File -Path backend/routers/team.py -Force
New-Item -ItemType File -Path backend/routers/requests.py -Force
New-Item -ItemType File -Path backend/routers/notifications.py -Force
New-Item -ItemType File -Path backend/services/job_service.py -Force
New-Item -ItemType File -Path backend/services/team_service.py -Force
New-Item -ItemType File -Path backend/services/request_service.py -Force
New-Item -ItemType File -Path backend/services/notification_service.py -Force
New-Item -ItemType File -Path backend/models/schemas.py -Force
New-Item -ItemType File -Path backend/db/supabase.py -Force
New-Item -ItemType File -Path backend/core/config.py -Force
New-Item -ItemType File -Path backend/main.py -Force
New-Item -ItemType File -Path backend/.env -Force
New-Item -ItemType File -Path backend/requirements.txt -Force
```

**Bash (Mac/Linux):**
```bash
# Create directories one by one
mkdir backend
mkdir backend/routers
mkdir backend/services
mkdir backend/models
mkdir backend/db
mkdir backend/core
mkdir backend/api

# Create files one by one
touch backend/api/api_router.py
touch backend/routers/jobs.py
touch backend/routers/team.py
touch backend/routers/requests.py
touch backend/routers/notifications.py
touch backend/services/job_service.py
touch backend/services/team_service.py
touch backend/services/request_service.py
touch backend/services/notification_service.py
touch backend/models/schemas.py
touch backend/db/supabase.py
touch backend/core/config.py
touch backend/main.py
touch backend/.env
touch backend/requirements.txt
```

This will create:

```
/Lumière-Project
├── frontend/               # React Frontend (Vite)
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
├── backend/                # FastAPI Backend (Python)
│   ├── api/
│   │   └── api_router.py
│   ├── routers/
│   │   └── jobs.py
│   ├── services/
│   │   └── job_service.py
│   ├── models/
│   │   └── schemas.py
│   ├── core/
│   │   └── config.py
│   └── main.py
└── venv/                   # Python Virtual Environment
```

### Environment Variables (`backend/.env`)

Before writing your Python code or running your backend, you must configure your environment variables. Open the `backend/.env` file and add the following keys. You will need to replace the placeholder values with your actual Supabase credentials:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key

# Other (Optional) Configurations
PORT=8000
```

*Note: Never commit your `.env` file to version control. Make sure it is added to your `.gitignore`.*

### Step 1: `backend/api/api_router.py` (The Central Router)
This file will gather all your individual routers into one place. This keeps your main entry point clean.

```python
from fastapi import APIRouter
from routers import jobs

api_router = APIRouter()

# Include the job router here
api_router.include_router(jobs.router, prefix="/jobs", tags=["Jobs"])

# Later, you will include others like this:
# api_router.include_router(team.router, prefix="/team", tags=["Team"])
# api_router.include_router(requests.router, prefix="/requests", tags=["Requests"])
```

### Step 2: `backend/main.py` (The Entry Point)
This is the core of your backend, which includes your central API router and configures CORS to allow the frontend to communicate with it.

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.api_router import api_router

app = FastAPI(title="Lumière API")

# Allow the React frontend to communicate with the FastAPI backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # Vite frontend default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the central router
app.include_router(api_router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Welcome to the Lumière API"}
```

### Step 3: `backend/models/schemas.py` (Data Contracts)
Define how the data should look using Pydantic.

```python
from pydantic import BaseModel
from typing import Optional

class JobBase(BaseModel):
    title: str
    description: str
    status: str

class JobCreate(JobBase):
    pass

class JobResponse(JobBase):
    id: str
    
    class Config:
        orm_mode = True
```

### Step 4: `backend/routers/jobs.py` (The Endpoints)
Define the HTTP endpoints.

```python
from fastapi import APIRouter
from models.schemas import JobResponse, JobCreate

router = APIRouter()

# Example mock data for now, later replaced by Supabase DB call
mock_jobs = [
    {"id": "1", "title": "Wedding Shoot", "description": "Outdoor photography", "status": "pending"}
]

@router.get("/", response_model=list[JobResponse])
def get_jobs():
    return mock_jobs

@router.post("/", response_model=JobResponse)
def create_job(job: JobCreate):
    new_job = job.dict()
    new_job["id"] = "2" # In reality, DB generates this
    mock_jobs.append(new_job)
    return new_job
```

### Step 5: Running the Backend

Run the server with Uvicorn:
```bash
uvicorn backend.main:app --reload --port 8000
```
Your API will be available at `http://localhost:8000`.

---

## 2. What to put in the Frontend (Connecting Both Sides)

In the frontend, you need to create a dedicated API service to talk to the backend, and then update your Context to use this service instead of mock data.

### Step 1: Install Axios
Navigate into your `frontend` directory and install Axios:
```bash
cd frontend
npm install axios
```

### Step 2: `frontend/src/services/api.js` (The Service Layer)
Create this file to handle all communication with the FastAPI backend.

```javascript
import axios from 'axios';

// Base URL points to your FastAPI server
const API_BASE_URL = 'http://localhost:8000/api';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Job API calls
export const jobService = {
    getAllJobs: async () => {
        try {
            const response = await apiClient.get('/jobs');
            return response.data;
        } catch (error) {
            console.error("Error fetching jobs:", error);
            throw error;
        }
    },
    
    createJob: async (jobData) => {
        try {
            const response = await apiClient.post('/jobs', jobData);
            return response.data;
        } catch (error) {
            console.error("Error creating job:", error);
            throw error;
        }
    }
};
```

### Step 3: Connecting to Global State (`frontend/src/context/AppContext.jsx`)
Update your React Context to fetch data from the backend when the app loads.

```javascript
import React, { createContext, useReducer, useEffect } from 'react';
import { jobService } from '../services/api';

export const AppContext = createContext();

const initialState = {
    jobs: [],
    loading: true,
    error: null
};

function reducer(state, action) {
    switch (action.type) {
        case 'SET_JOBS':
            return { ...state, jobs: action.payload, loading: false };
        case 'ADD_JOB':
            return { ...state, jobs: [...state.jobs, action.payload] };
        case 'SET_ERROR':
            return { ...state, error: action.payload, loading: false };
        default:
            return state;
    }
}

export const AppProvider = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    // Fetch data from backend on mount
    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const jobs = await jobService.getAllJobs();
                dispatch({ type: 'SET_JOBS', payload: jobs });
            } catch (error) {
                dispatch({ type: 'SET_ERROR', payload: "Failed to load jobs" });
            }
        };

        fetchJobs();
    }, []);

    // Function to add a job, which updates DB then UI
    const addJob = async (jobData) => {
        try {
            const newJob = await jobService.createJob(jobData);
            dispatch({ type: 'ADD_JOB', payload: newJob });
        } catch (error) {
            console.error("Failed to add job");
        }
    };

    return (
        <AppContext.Provider value={{ state, dispatch, addJob }}>
            {children}
        </AppContext.Provider>
    );
};
```

### Step 4: Using the Data in a Component (e.g., `frontend/src/pages/JobHub.jsx`)

```javascript
import React, { useContext, useEffect } from 'react';
import { AppContext } from '../context/AppContext';

function JobHub() {
    const { state, addJob } = useContext(AppContext);

    if (state.loading) return <div>Loading...</div>;
    if (state.error) return <div>Error: {state.error}</div>;

    const handleCreateJob = () => {
        addJob({
            title: "New Portrait Shoot",
            description: "Studio session",
            status: "pending"
        });
    };

    return (
        <div>
            <h1>Job Hub</h1>
            <button onClick={handleCreateJob}>Create Job</button>
            
            <ul>
                {state.jobs.map(job => (
                    <li key={job.id}>{job.title} - {job.status}</li>
                ))}
            </ul>
        </div>
    );
}

export default JobHub;
```

## Summary of Data Flow

1. **User clicks "Create Job"** in `JobHub.jsx`.
2. Calls `addJob` from `AppContext.jsx`.
3. `addJob` calls `jobService.createJob` in `api.js`.
4. `api.js` makes a `POST /api/jobs` request to `http://localhost:8000`.
5. `backend/main.py` routes the request to `backend/routers/jobs.py`.
6. `routers/jobs.py` validates the data via `models/schemas.py`.
7. Backend returns the created job as JSON.
8. `AppContext.jsx` receives the JSON and dispatches `ADD_JOB` to the reducer.
9. State updates, and React re-renders `JobHub.jsx` to show the new job!

---

## 3. Postman API Testing Guide

Once your backend is running (`uvicorn backend.main:app --reload --port 8000`), you can use Postman to test the connection to your API and database before finalizing the frontend code. Here are the APIs you should configure in Postman.

**Base URL**: `http://localhost:8000`

### 1. Jobs API
Test the creation and retrieval of jobs (this matches the `jobs.py` example provided earlier).

- **GET All Jobs**
  - **Method**: `GET`
  - **URL**: `http://localhost:8000/api/jobs/`
  - **Description**: Retrieves the list of all jobs.

- **Create a Job**
  - **Method**: `POST`
  - **URL**: `http://localhost:8000/api/jobs/`
  - **Headers**: `Content-Type: application/json`
  - **Body (raw JSON)**:
    ```json
    {
      "title": "New Wedding Shoot",
      "description": "Full day coverage at Central Park",
      "status": "pending"
    }
    ```

### 2. Team API (Planned)
- **GET All Team Members**
  - **Method**: `GET`
  - **URL**: `http://localhost:8000/api/team/`

- **Add a Team Member**
  - **Method**: `POST`
  - **URL**: `http://localhost:8000/api/team/`
  - **Headers**: `Content-Type: application/json`
  - **Body (raw JSON)**:
    ```json
    {
      "name": "Jane Doe",
      "role": "Photographer",
      "availability": "available"
    }
    ```

### 3. Requests API (Planned)
- **GET All Requests**
  - **Method**: `GET`
  - **URL**: `http://localhost:8000/api/requests/`

- **Create a Request**
  - **Method**: `POST`
  - **URL**: `http://localhost:8000/api/requests/`
  - **Headers**: `Content-Type: application/json`
  - **Body (raw JSON)**:
    ```json
    {
      "job_id": "1",
      "team_member_id": "101",
      "details": "Please review the wedding shoot assignment."
    }
    ```

### 4. Notifications API (Planned)
- **GET All Notifications**
  - **Method**: `GET`
  - **URL**: `http://localhost:8000/api/notifications/`

*Note: For the routes that are marked "Planned", you'll need to write the FastAPI router logic (similar to the `jobs.py` example) before they will work in Postman!*
