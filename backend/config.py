"""应用配置"""

import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")

# SQLite 数据库文件路径
# Render 上使用持久化磁盘 /var/data/，本地开发用 data/
if os.environ.get("RENDER"):
    DB_DIR = "/var/data"
    os.makedirs(DB_DIR, exist_ok=True)
    DATABASE_PATH = os.path.join(DB_DIR, "practice.db")
else:
    DATABASE_PATH = os.path.join(DATA_DIR, "practice.db")

# 种子数据 SQL 文件
SEED_SQL_PATH = os.path.join(DATA_DIR, "seed.sql")

# 习题数据目录
EXERCISES_DIR = os.path.join(DATA_DIR, "exercises")

# CORS 设置
# 本地开发 + Render 默认域名 + Netlify 默认域名 + 自定义域名
CORS_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://*.netlify.app",
    "https://*.onrender.com",
]
# 通过环境变量追加额外域名
extra_origins = os.environ.get("CORS_ORIGINS", "")
if extra_origins:
    CORS_ORIGINS.extend(extra_origins.split(","))
