"""用户进度 API（需登录）"""

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from routers.auth import get_current_user
from database import save_progress, get_all_progress, reset_progress as reset_progress_db

router = APIRouter(tags=["progress"])


class SaveProgressRequest(BaseModel):
    lesson_id: str
    difficulty: str
    exercise_id: str


@router.get("/progress")
async def get_progress(user: dict = Depends(get_current_user)):
    """获取当前用户的学习进度"""
    progress = get_all_progress(user["id"])
    return {"progress": progress}


@router.post("/progress")
async def save_progress_endpoint(req: SaveProgressRequest, user: dict = Depends(get_current_user)):
    """保存单道题的完成记录"""
    result = save_progress(user["id"], req.lesson_id, req.difficulty, req.exercise_id)
    return result


@router.delete("/progress")
async def reset_progress_endpoint(user: dict = Depends(get_current_user)):
    """重置当前用户的学习进度"""
    result = reset_progress_db(user["id"])
    return result
