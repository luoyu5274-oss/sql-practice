"""SQLite 数据库连接管理"""

import sqlite3
import os
from contextlib import asynccontextmanager

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
        # 检查是否已有数据（避免重启时重复插入）
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

        # 按语句分割并执行
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
            # PRAGMA table_info 获取列定义
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

            # 取前 3 行样例数据
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
