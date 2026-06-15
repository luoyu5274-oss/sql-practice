"""SQLite 数据库连接管理"""

import sqlite3
import os
import secrets
from contextlib import asynccontextmanager

import bcrypt

from config import DATABASE_PATH, SEED_SQL_PATH


def get_connection() -> sqlite3.Connection:
    """获取一个新的数据库连接"""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_database():
    """初始化数据库：建表并插入种子数据（已有数据时跳过）"""
    # 确保数据目录存在
    os.makedirs(os.path.dirname(DATABASE_PATH), exist_ok=True)

    conn = get_connection()
    try:
        # ── 用户表（始终创建）──
        conn.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                token TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # ── 用户进度表（迁移至含 user_id）──
        # 检查旧表是否存在且缺少 user_id 列
        cursor = conn.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='user_progress'"
        )
        old_table_exists = cursor.fetchone() is not None

        if old_table_exists:
            cols = conn.execute("PRAGMA table_info(user_progress)").fetchall()
            col_names = [c["name"] for c in cols]
            if "user_id" not in col_names:
                # 旧表没有 user_id，删除重建（进度数据丢失，影响很小）
                conn.execute("DROP TABLE user_progress")
                old_table_exists = False

        if not old_table_exists:
            conn.execute("""
                CREATE TABLE user_progress (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    lesson_id TEXT NOT NULL,
                    difficulty TEXT NOT NULL,
                    exercise_id TEXT NOT NULL,
                    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id),
                    UNIQUE(user_id, lesson_id, difficulty, exercise_id)
                )
            """)

        conn.commit()

        # ── 种子数据（已有则跳过）──
        cursor = conn.execute("SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name='movies'")
        table_exists = cursor.fetchone()[0] > 0
        if table_exists:
            cursor = conn.execute("SELECT COUNT(*) FROM movies")
            has_data = cursor.fetchone()[0] > 0
            if has_data:
                print(f"[INFO] 数据库已存在数据，跳过初始化")
                return

        with open(SEED_SQL_PATH, "r", encoding="utf-8") as f:
            seed_sql = f.read()

        statements = [s.strip() for s in seed_sql.split(";") if s.strip()]
        for stmt in statements:
            try:
                conn.execute(stmt)
            except sqlite3.Error as e:
                print(f"[WARN] SQL 执行警告: {e}")

        conn.commit()
        print(f"[OK] 数据库初始化完成: {DATABASE_PATH}")
    except Exception as e:
        print(f"[ERROR] 数据库初始化失败: {e}")
        raise
    finally:
        conn.close()


def reset_database():
    """重置数据库（删除数据库文件，重新初始化）"""
    import time
    if os.path.exists(DATABASE_PATH):
        os.remove(DATABASE_PATH)
        print(f"[INFO] 已删除数据库文件: {DATABASE_PATH}")
    time.sleep(0.2)
    init_database()


def get_db_status() -> dict:
    """获取数据库状态信息"""
    if not os.path.exists(DATABASE_PATH):
        return {"connected": False, "message": "数据库文件不存在，请先初始化"}

    conn = get_connection()
    try:
        cursor = conn.execute(
            "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
        )
        tables = [r["name"] for r in cursor.fetchall()]

        table_info = {}
        for table in tables:
            count = conn.execute(f"SELECT COUNT(*) FROM \"{table}\"").fetchone()[0]
            table_info[table] = {"row_count": count}

        return {
            "connected": True,
            "database_path": DATABASE_PATH,
            "tables": table_info,
        }
    except Exception as e:
        return {"connected": False, "message": str(e)}
    finally:
        conn.close()


def get_tables_info(table_names: list[str]) -> dict:
    """获取指定表的列信息（类型、约束）和样例数据"""
    if not os.path.exists(DATABASE_PATH):
        return {}

    conn = get_connection()
    result = {}
    try:
        for table in table_names:
            table = table.strip()
            if not table:
                continue
            cursor = conn.execute(f"PRAGMA table_info(\"{table}\")")
            columns = []
            for row in cursor.fetchall():
                columns.append({
                    "cid": row["cid"],
                    "name": row["name"],
                    "type": row["type"] or "TEXT",
                    "notnull": bool(row["notnull"]),
                    "pk": bool(row["pk"]),
                })

            if not columns:
                continue

            try:
                sample_cursor = conn.execute(f"SELECT * FROM \"{table}\" LIMIT 3")
                sample_cols = [d[0] for d in sample_cursor.description]
                sample_rows = [list(r) for r in sample_cursor.fetchall()]
            except Exception:
                sample_cols = []
                sample_rows = []

            result[table] = {
                "columns": columns,
                "sample_columns": sample_cols,
                "sample_rows": sample_rows,
            }
        return result
    finally:
        conn.close()


# ── 用户认证 ──


def create_user(username: str, password: str) -> dict:
    """注册新用户，返回 {status, username, token} 或 {status, message}"""
    conn = get_connection()
    try:
        # 检查用户名是否已存在
        existing = conn.execute(
            "SELECT id FROM users WHERE username = ?", (username,)
        ).fetchone()
        if existing:
            return {"status": "error", "message": "用户名已被注册"}

        password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
        token = secrets.token_urlsafe(32)

        conn.execute(
            "INSERT INTO users (username, password_hash, token) VALUES (?, ?, ?)",
            (username, password_hash, token),
        )
        conn.commit()
        return {"status": "ok", "username": username, "token": token}
    except Exception as e:
        return {"status": "error", "message": str(e)}
    finally:
        conn.close()


def login_user(username: str, password: str) -> dict:
    """登录，验证密码后返回新 token"""
    conn = get_connection()
    try:
        user = conn.execute(
            "SELECT id, password_hash FROM users WHERE username = ?", (username,)
        ).fetchone()
        if not user:
            return {"status": "error", "message": "用户名或密码错误"}

        if not bcrypt.checkpw(password.encode(), user["password_hash"].encode()):
            return {"status": "error", "message": "用户名或密码错误"}

        # 生成新 token
        token = secrets.token_urlsafe(32)
        conn.execute("UPDATE users SET token = ? WHERE id = ?", (token, user["id"]))
        conn.commit()
        return {"status": "ok", "username": username, "token": token}
    except Exception as e:
        return {"status": "error", "message": str(e)}
    finally:
        conn.close()


def get_user_by_token(token: str) -> dict | None:
    """通过 token 查找用户，返回 {id, username} 或 None"""
    conn = get_connection()
    try:
        user = conn.execute(
            "SELECT id, username FROM users WHERE token = ?", (token,)
        ).fetchone()
        if not user:
            return None
        return {"id": user["id"], "username": user["username"]}
    finally:
        conn.close()


# ── 用户进度管理（按 user_id 隔离）──


def save_progress(user_id: int, lesson_id: str, difficulty: str, exercise_id: str) -> dict:
    """保存用户完成某道题的记录"""
    conn = get_connection()
    try:
        conn.execute(
            "INSERT OR REPLACE INTO user_progress (user_id, lesson_id, difficulty, exercise_id, completed_at) "
            "VALUES (?, ?, ?, ?, datetime('now'))",
            (user_id, lesson_id, difficulty, exercise_id),
        )
        conn.commit()
        return {"status": "ok"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
    finally:
        conn.close()


def get_all_progress(user_id: int) -> dict:
    """获取指定用户的所有进度"""
    if not os.path.exists(DATABASE_PATH):
        return {}

    conn = get_connection()
    try:
        cursor = conn.execute(
            "SELECT lesson_id, difficulty, exercise_id FROM user_progress "
            "WHERE user_id = ? ORDER BY completed_at",
            (user_id,),
        )
        progress = {}
        for row in cursor.fetchall():
            lid = row["lesson_id"]
            diff = row["difficulty"]
            eid = row["exercise_id"]
            if lid not in progress:
                progress[lid] = {}
            if diff not in progress[lid]:
                progress[lid][diff] = {}
            progress[lid][diff][eid] = True
        return progress
    finally:
        conn.close()


def reset_progress(user_id: int) -> dict:
    """清空指定用户的所有进度"""
    conn = get_connection()
    try:
        conn.execute("DELETE FROM user_progress WHERE user_id = ?", (user_id,))
        conn.commit()
        return {"status": "ok", "message": "学习进度已重置"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
    finally:
        conn.close()
