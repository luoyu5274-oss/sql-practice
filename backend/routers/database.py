"""数据库管理 API"""

from fastapi import APIRouter
from pydantic import BaseModel

from database import reset_database, get_db_status, get_tables_info

router = APIRouter(tags=["database"])


class TablesInfoRequest(BaseModel):
    tables: list[str]


@router.post("/database/reset")
async def reset_db():
    """重置数据库到初始状态"""
    try:
        reset_database()
        return {"status": "ok", "message": "数据库已重置为初始状态"}
    except Exception as e:
        return {"status": "error", "message": str(e)}


@router.get("/database/status")
async def db_status():
    """获取数据库状态"""
    return get_db_status()


@router.post("/tables/info")
async def tables_info(req: TablesInfoRequest):
    """获取指定表的列信息（类型、约束）和样例数据"""
    return get_tables_info(req.tables)
