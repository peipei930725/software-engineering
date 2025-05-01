@echo off
echo [1/2] 啟動後端 Flask...
start cmd /k "cd backend && call venv\Scripts\activate && set FLASK_APP=run.py && set FLASK_ENV=development && flask run"

echo [2/2] 啟動前端 React...
start cmd /k "cd frontend && npm run dev"

echo [✓] 前後端皆已啟動！
pause
