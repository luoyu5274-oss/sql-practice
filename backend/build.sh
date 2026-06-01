#!/usr/bin/env bash
set -e  # 任何步骤失败就停止

echo "[BUILD] Installing Python dependencies..."
pip install -r requirements.txt

echo "[BUILD] Installing Node dependencies..."
cd ../frontend
npm install

echo "[BUILD] Building frontend..."
VITE_API_URL=/api npx vite build

echo "[BUILD] Copying frontend to backend/static..."
rm -rf ../backend/static
cp -r dist ../backend/static/

echo "[BUILD] Verifying..."
ls -la ../backend/static/
echo "[BUILD] Done!"
