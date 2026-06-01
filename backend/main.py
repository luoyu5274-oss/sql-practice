"""FastAPI 应用入口"""

import os
from pathlib import Path
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from config import CORS_ORIGINS
from database import init_database
from routers import lessons, exercises as exercise_routes, validate, database as db_routes


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期：启动时初始化数据库"""
    print("[INFO] 正在初始化数据库...")
    init_database()
    print("[INFO] 应用已启动")
    yield
    print("[INFO] 应用已关闭")


app = FastAPI(
    title="SQL 练习平台",
    description="基于 SQLBolt 课程框架的 SQL 练习平台 API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — 生产环境同域访问，本地开发允许跨域
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API 路由
app.include_router(lessons.router, prefix="/api")
app.include_router(exercise_routes.router, prefix="/api")
app.include_router(validate.router, prefix="/api")
app.include_router(db_routes.router, prefix="/api")


@app.get("/api/health")
async def health_check():
    """健康检查"""
    return {"status": "ok", "message": "SQL 练习平台运行中"}


# 静态文件（前端构建产物）
STATIC_DIR = Path(__file__).parent / "static"
STATIC_DIR.mkdir(exist_ok=True)

# 如果有前端构建产物就挂载
INDEX_FILE = STATIC_DIR / "index.html"
ASSETS_DIR = STATIC_DIR / "assets"

if INDEX_FILE.exists():
    app.mount("/assets", StaticFiles(directory=ASSETS_DIR), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        """SPA fallback：所有非 API 路径返回 index.html"""
        file_path = STATIC_DIR / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(INDEX_FILE)

    @app.get("/")
    async def serve_root():
        """根路径返回首页"""
        return FileResponse(INDEX_FILE)


# Render 启动
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
