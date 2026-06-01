"""FastAPI 应用入口"""

import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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

# CORS 中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(lessons.router, prefix="/api")
app.include_router(exercise_routes.router, prefix="/api")
app.include_router(validate.router, prefix="/api")
app.include_router(db_routes.router, prefix="/api")


@app.get("/api/health")
async def health_check():
    """健康检查"""
    return {"status": "ok", "message": "SQL 练习平台运行中"}


# Render 部署入口：直接用 uvicorn 启动时会找到 app 对象
# 本地启动：uvicorn main:app --port 8000
# Render 启动：uvicorn main:app --host 0.0.0.0 --port $PORT
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
