@echo off
title SQL练习平台 - 前端
cd /d "%~dp0frontend"
echo ================================
echo   SQL 练习平台 - 前端服务
echo   端口: 5173
echo ================================
echo.
call npm install --silent 2>nul
npx vite --host 127.0.0.1 --port 5173
pause
