@echo off
echo [1/2] Starting Flask backend...
start cmd /k "cd backend && call venv\Scripts\activate && set FLASK_APP=run.py && set FLASK_ENV=development && flask run"

echo [2/2] Starting React frontend...
start cmd /k "cd frontend && npm run dev"

echo [✓] Backend and frontend have been started!
pause
