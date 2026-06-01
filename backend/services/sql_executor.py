"""SQL 执行引擎 — 安全执行用户 SQL 并返回结果"""

import re
import sqlite3

from database import get_connection


# 危险操作关键字黑名单
FORBIDDEN_KEYWORDS = [
    "DROP DATABASE",
    "DROP TABLE",
    "ALTER USER",
    "GRANT",
    "REVOKE",
    "SHUTDOWN",
    "ATTACH DATABASE",
    "DETACH DATABASE",
    "VACUUM",
    "REINDEX",
    "PRAGMA",
]


def sanitize_sql(sql: str, validation_type: str) -> str:
    """
    安全检查用户 SQL

    规则：
    1. 禁止多语句（分号分隔）
    2. 禁止危险关键字
    3. 对于 SELECT 查询，禁止 DML 语句
    """
    # 去除首尾空白
    sql = sql.strip().rstrip(";").strip()

    if not sql:
        raise ValueError("SQL 语句为空")

    # 检查是否包含多条语句（分号在引号外）
    in_single_quote = False
    in_double_quote = False
    for i, ch in enumerate(sql):
        if ch == "'" and not in_double_quote:
            in_single_quote = not in_single_quote
        elif ch == '"' and not in_single_quote:
            in_double_quote = not in_double_quote
        elif ch == ";" and not in_single_quote and not in_double_quote:
            raise ValueError("不允许执行多条 SQL 语句（请移除分号）")

    # 检查危险关键字（大小写不敏感）
    sql_upper = sql.upper()
    for keyword in FORBIDDEN_KEYWORDS:
        if keyword.upper() in sql_upper:
            raise ValueError(f"不允许执行包含 '{keyword}' 的语句")

    # 只有 state_change / schema_change 类型的题目允许 DML
    is_select = sql_upper.startswith("SELECT") or sql_upper.startswith("WITH")
    is_dml = any(
        sql_upper.startswith(prefix)
        for prefix in ["INSERT", "UPDATE", "DELETE", "CREATE", "ALTER", "DROP"]
    )

    if validation_type in ("exact_match", "row_subset", "row_count", "contains_value"):
        if not is_select:
            raise ValueError("本题只允许使用 SELECT 查询语句")
    elif validation_type == "state_change":
        if not is_dml and not is_select:
            raise ValueError("本题需要使用 INSERT / UPDATE / DELETE 语句")
    elif validation_type == "schema_change":
        if not is_dml:
            raise ValueError("本题需要使用 CREATE / ALTER / DROP TABLE 语句")

    return sql


def execute_user_sql(sql: str, exercise: dict) -> dict:
    """
    执行用户 SQL（在事务中，执行后回滚保护数据）

    返回：{"columns": [...], "rows": [[...], ...], "row_count": N} 或 {"error": "..."}
    """
    validation_type = exercise.get("validation_type", "exact_match")

    try:
        sql = sanitize_sql(sql, validation_type)
    except ValueError as e:
        return {"error": str(e)}

    conn = get_connection()
    conn.execute("BEGIN TRANSACTION")

    try:
        cursor = conn.execute(sql)

        # 检查是否是查询语句（有返回结果）
        if cursor.description:
            columns = [desc[0] for desc in cursor.description]
            rows = [list(row) for row in cursor.fetchmany(1000)]
        else:
            # DML 语句（INSERT/UPDATE/DELETE/CREATE/ALTER/DROP）
            columns = []
            rows = []
            # 不 commit，执行验证查询后统一 rollback
            verification_sql = exercise.get("verification_sql", "")
            if verification_sql:
                try:
                    v_cursor = conn.execute(verification_sql)
                    if v_cursor.description:
                        columns = [desc[0] for desc in v_cursor.description]
                        rows = [list(row) for row in v_cursor.fetchmany(1000)]
                except sqlite3.Error as e:
                    conn.execute("ROLLBACK")
                    return {"error": f"验证查询执行失败: {e}"}

        conn.execute("ROLLBACK")
        return {
            "columns": columns,
            "rows": rows,
            "row_count": len(rows),
        }
    except sqlite3.Error as e:
        try:
            conn.execute("ROLLBACK")
        except Exception:
            pass
        return {"error": str(e)}
    except Exception as e:
        try:
            conn.execute("ROLLBACK")
        except Exception:
            pass
        return {"error": str(e)}
    finally:
        conn.close()


def execute_reference_sql(reference_sqls: list[str], verification_sql: str = "") -> dict:
    """
    执行参考答案（可能有多条备选，取第一条成功的）
    对于 DML 语句，执行后运行 verification_sql 来获取验证结果

    返回：{"columns": [...], "rows": [[...], ...], "row_count": N}
    """
    conn = get_connection()
    conn.execute("BEGIN TRANSACTION")

    last_error = None

    for ref_sql in reference_sqls:
        if not ref_sql or not ref_sql.strip():
            continue
        try:
            cursor = conn.execute(ref_sql.strip().rstrip(";"))
            columns = []
            rows = []

            if cursor.description:
                columns = [desc[0] for desc in cursor.description]
                rows = [list(row) for row in cursor.fetchmany(1000)]
            elif verification_sql:
                # DML 语句 + 有验证查询：执行验证查询
                v_cursor = conn.execute(verification_sql)
                if v_cursor.description:
                    columns = [desc[0] for desc in v_cursor.description]
                    rows = [list(row) for row in v_cursor.fetchmany(1000)]

            conn.execute("ROLLBACK")
            return {
                "columns": columns,
                "rows": rows,
                "row_count": len(rows),
            }
        except sqlite3.Error as e:
            last_error = str(e)
            continue
        finally:
            try:
                conn.execute("ROLLBACK")
            except Exception:
                pass

    conn.close()
    if last_error:
        return {"error": last_error}
    return {"columns": [], "rows": [], "row_count": 0, "error": "无有效的参考答案"}
