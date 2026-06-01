@echo off
title SQL练习平台 - 后端
cd /d "%~dp0backend"
echo ================================
echo   SQL 练习平台 - 后端服务
echo   端口: 8000
echo ================================
echo.
pip install -r requirements.txt -q 2>nul
start "" "http://localhost:5173"
uvicorn main:app --host 127.0.0.1 --port 8000
pause
