@echo off
echo ============================
echo 🔧 Initializing frontend and backend environments...
echo ============================

REM ========== Backend ==========
echo [1/4] Creating Python virtual environment (Flask backend)...
cd backend
python -m venv venv

echo [2/4] Installing backend Python dependencies (Flask, SQLAlchemy, etc)...
call venv\Scripts\activate && pip install -r requirements.txt
cd ..

REM ========== Frontend ==========
echo [3/4] Installing frontend npm packages (React frontend)...
cd frontend
call npm install
cd ..

echo ============================
echo ✅ Initialization complete! You can now run start_all.bat to launch both frontend and backend.
echo ============================
pause
