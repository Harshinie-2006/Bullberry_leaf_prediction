@echo off
echo ===================================================
echo           Starting BerryIO Application
echo ===================================================

echo [1/2] Starting FastAPI Backend on http://0.0.0.0:8000 ...
start cmd /k "cd backend && ..\\.venv\Scripts\python.exe -m uvicorn app:app --host 0.0.0.0 --port 8000 --reload"

echo [2/2] Starting Vite Frontend on http://localhost:5173 ...
start cmd /k "cd frontend && npm run dev"

echo ===================================================
echo  BerryIO is running!
echo  Web App:     http://localhost:5173
echo  API Docs:    http://localhost:8000/docs
echo  Mobile URL:  http://10.1.51.42:8000
echo ===================================================
