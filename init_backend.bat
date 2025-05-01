@echo off
echo ============================
echo 🔧 初始化前後端建置環境
echo ============================

REM ========== 後端 ==========
echo [1/4] 建立 Python 虛擬環境 (Flask backend)...
cd backend
python -m venv venv

echo [2/4] 安裝 Python 相依套件 (Flask, SQLAlchemy, etc)...
call venv\Scripts\activate && pip install -r requirements.txt
cd ..

REM ========== 前端 ==========
echo [3/4] 安裝前端 npm 套件 (React frontend)...
cd frontend
call npm install
cd ..

echo ============================
echo ✅ 初始化完成！你可以執行 start_all.bat 一鍵啟動前後端伺服器。
echo ============================
pause
