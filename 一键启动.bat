@echo off
title SQL 练习平台
cd /d "%~dp0"

echo ==========================================
echo         SQL 练习平台 - 一键启动
echo ==========================================
echo.
echo 首次使用请等待 ~30 秒安装依赖，后续启动只需 ~5 秒
echo.

:: 检查并安装 Python 依赖
cd backend
echo [PIP] 检查 Python 依赖...
pip install -r requirements.txt -q 2>nul
cd ..

:: 检查并安装前端依赖（仅首次）
if not exist "frontend\node_modules" (
    echo [NPM] 首次安装前端依赖，请稍候...
    cd frontend
    call npm install --silent 2>nul
    cd ..
    echo [NPM] 完成
) else (
    echo [NPM] 依赖已就绪
)

echo.
echo [启动] 后端服务 (端口 8000)...
start "SQL后端-8000" cmd /c "cd /d %~dp0backend && uvicorn main:app --host 127.0.0.1 --port 8000"

echo [启动] 前端服务 (端口 5173)...
echo.
echo 服务启动中，浏览器将自动打开...
timeout /t 5 /nobreak >nul

start "" "http://localhost:5173"

cd frontend
npx vite --host 127.0.0.1 --port 5173

pause
