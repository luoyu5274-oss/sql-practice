"""习题相关 API"""

import os
import json

from fastapi import APIRouter, HTTPException, Query

from config import EXERCISES_DIR

router = APIRouter(tags=["exercises"])


@router.get("/lessons/{lesson_id}/exercises")
async def get_exercises(lesson_id: str, difficulty: str = Query("basic")):
    """获取指定课程和难度的习题列表"""
    if difficulty not in ("basic", "intermediate", "challenge"):
        raise HTTPException(status_code=400, detail="难度参数必须为 basic / intermediate / challenge")

    file_path = os.path.join(EXERCISES_DIR, f"{lesson_id}.json")
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail=f"课程 '{lesson_id}' 的习题文件不存在")

    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    exercises = data.get("exercises", {}).get(difficulty, [])
    return {
        "lesson_id": lesson_id,
        "lesson_title": data.get("lesson_title", lesson_id),
        "difficulty": difficulty,
        "exercises": exercises,
    }
