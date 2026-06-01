"""SQL 验证 API"""

import os
import json
import time

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from config import EXERCISES_DIR
from services.sql_executor import execute_user_sql, execute_reference_sql
from services.result_comparator import compare_results

router = APIRouter(tags=["validate"])


class ValidateRequest(BaseModel):
    exercise_id: str
    user_sql: str
    difficulty: str = "basic"
    lesson_id: str = ""


class ValidateResponse(BaseModel):
    status: str  # "correct" | "incorrect" | "error"
    error_type: str | None = None
    message: str
    user_result: dict | None = None
    expected_preview: dict | None = None
    diff_summary: str | None = None


def _find_exercise(exercise_id: str) -> dict | None:
    """在所有习题文件中查找指定 ID 的习题"""
    for filename in os.listdir(EXERCISES_DIR):
        if not filename.endswith(".json"):
            continue
        file_path = os.path.join(EXERCISES_DIR, filename)
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        for difficulty in ("basic", "intermediate", "challenge"):
            for ex in data.get("exercises", {}).get(difficulty, []):
                if ex.get("id") == exercise_id:
                    ex["_difficulty"] = difficulty
                    ex["_lesson_id"] = data.get("lesson_id", "")
                    return ex
    return None


@router.post("/validate")
async def validate_sql(req: ValidateRequest):
    """验证用户 SQL 回答"""
    # 1. 找到对应习题
    exercise = _find_exercise(req.exercise_id)
    if not exercise:
        raise HTTPException(status_code=404, detail=f"习题 '{req.exercise_id}' 不存在")

    user_sql = req.user_sql.strip()
    if not user_sql:
        return {
            "status": "error",
            "error_type": "empty_sql",
            "message": "请输入 SQL 语句",
            "user_result": None,
            "expected_preview": None,
            "diff_summary": None,
        }

    # 2. 执行用户 SQL
    start_time = time.time()
    user_result = execute_user_sql(user_sql, exercise)
    execution_time_ms = round((time.time() - start_time) * 1000, 2)

    if user_result.get("error"):
        return {
            "status": "error",
            "error_type": "syntax_error",
            "message": f"SQL 执行错误：{user_result['error']}",
            "user_result": None,
            "expected_preview": None,
            "diff_summary": user_result["error"],
        }

    user_result["execution_time_ms"] = execution_time_ms

    # 3. 执行参考 SQL 获取预期结果
    reference_sqls = [exercise.get("reference_sql", "")]
    reference_sqls.extend(exercise.get("accept_alternatives", []))

    verification_sql = exercise.get("verification_sql", "")
    expected_result = execute_reference_sql(reference_sqls, verification_sql)
    if expected_result.get("error"):
        return {
            "status": "error",
            "error_type": "reference_error",
            "message": f"参考答案执行出错，请联系管理员：{expected_result['error']}",
            "user_result": user_result,
            "expected_preview": None,
            "diff_summary": None,
        }

    # 4. 比对结果
    comparison = compare_results(user_result, expected_result, exercise)

    return comparison
