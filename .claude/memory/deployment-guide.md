---
name: deployment-guide
description: Render 部署步骤及注意事项
metadata: 
  node_type: memory
  type: reference
  originSessionId: 2b39f68c-51ee-42c3-a7f8-d12aaaf93e34
---

# Render 部署指南

## 部署架构
前后端合一，单 Render Web Service，单 URL。

## 部署地址
- **生产**: https://sql-practice-104k.onrender.com
- **GitHub**: https://github.com/luoyu5274-oss/sql-practice

## 部署步骤

### 1. 本地构建前端（每次改前端必做）
```powershell
cd frontend
$env:VITE_API_URL="/api"
npx vite build
Remove-Item -Recurse -Force ..\backend\static -ErrorAction SilentlyContinue
Copy-Item -Recurse dist\* ..\backend\static\
```

### 2. 提交并推送
```powershell
git add -A
git commit -m "message"
git push  # 国内需 VPN
```

### 3. Render 手动部署
1. 打开 Render dashboard
2. 点 `sql-practice-104k` → **Manual Deploy** → **Deploy latest commit**
3. 等待 3-4 分钟

## 关键配置文件
- `render.yaml`: Render 部署配置（buildCommand + startCommand）
- `backend/.python-version`: 锁定 Python 3.13
- `backend/requirements.txt`: `fastapi>=0.100` + `uvicorn[standard]>=0.20`
- `backend/static/`: 前端构建产物（已提交到仓库）

## Render 冷启动
- 免费版 15 分钟无请求自动休眠
- 唤醒需 30-60 秒
- 前端 axios timeout 已设为 90 秒
- 前端显示 "首次访问需等待服务器唤醒" 提示

## 本地开发
双击 `一键启动.bat`，前后端分别在 localhost:8000 和 localhost:5173 运行。
Vite proxy 将 `/api` 请求转发到后端。本地开发不需要构建前端。
