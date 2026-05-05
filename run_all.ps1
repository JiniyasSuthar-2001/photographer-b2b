# run_all.ps1
# This script starts both the FastAPI backend and the Vite frontend in separate windows.

Write-Host "Starting Lumière Project..." -ForegroundColor Cyan

# 1. Start Backend in a new window
Write-Host "Launching Backend (Port 8000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "& {.\venv\Scripts\activate; cd backend; uvicorn main:app --reload --port 8000}"

# 2. Start Frontend in a new window
Write-Host "Launching Frontend (Port 5173)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "& {cd frontend; npm run dev}"

Write-Host "Done! Both servers are starting in separate windows." -ForegroundColor Cyan
