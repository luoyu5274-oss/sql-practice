"""用户认证 API + 认证中间件"""

from fastapi import APIRouter, HTTPException, Header, Depends
from pydantic import BaseModel

from database import create_user, login_user, get_user_by_token

router = APIRouter(tags=["auth"])


class AuthRequest(BaseModel):
    username: str
    password: str


class AuthResponse(BaseModel):
    status: str
    username: str | None = None
    token: str | None = None
    message: str | None = None


# ── 认证依赖：从 Authorization header 提取当前用户 ──


def get_current_user(authorization: str = Header(None)) -> dict:
    """从 Bearer token 中获取当前登录用户，未登录则返回 401"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="请先登录")
    token = authorization[7:]
    user = get_user_by_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="登录已过期，请重新登录")
    return user


# ── 路由 ──


@router.post("/auth/register")
async def register(req: AuthRequest):
    """注册新用户"""
    if len(req.username) < 2 or len(req.username) > 20:
        return {"status": "error", "message": "用户名需 2-20 个字符"}
    if len(req.password) < 4:
        return {"status": "error", "message": "密码至少 4 位"}

    result = create_user(req.username, req.password)
    return result


@router.post("/auth/login")
async def login(req: AuthRequest):
    """用户登录"""
    result = login_user(req.username, req.password)
    return result


@router.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    """验证 token 有效性，返回当前用户信息"""
    return {"status": "ok", "username": user["username"]}
