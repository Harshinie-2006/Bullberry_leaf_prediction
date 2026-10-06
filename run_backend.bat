@echo off
echo =====================================================
echo    Starting BerryIO Backend on 0.0.0.0:8000
echo    Allows connections from:
echo    - PC:    http://127.0.0.1:8000
echo    - Phone: http://10.1.51.42:8000
echo =====================================================
cd /d "%~dp0backend"
..\\.venv\Scripts\python.exe -m uvicorn app:app --host 0.0.0.0 --port 8000 --reload
pause
