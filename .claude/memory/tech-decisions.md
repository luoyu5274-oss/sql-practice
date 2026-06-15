---
name: tech-decisions
description: 项目重大技术决策及原因
metadata: 
  node_type: memory
  type: project
  originSessionId: 2b39f68c-51ee-42c3-a7f8-d12aaaf93e34
---

# 重大技术决策

## 数据库：MySQL → SQLite
**决策**: 从 Docker MySQL 改为 Python 内置 SQLite
**原因**: 用户电脑无 Docker/MySQL，SQLite 零安装零配置，Python 原生支持，SQLBolt 所有语法兼容
**影响**: 无需 docker-compose.yml，`database.py` 直接用 `sqlite3` 模块

## 部署：Netlify+Render → 纯 Render
**决策**: 放弃 Netlify，单用 Render 部署前后端
**原因**: Netlify 只能托管静态文件，Render 可同时跑 Python + 挂载静态文件，消除跨域问题，单一 URL
**影响**: 前端 build 产物提交到 `backend/static/`，FastAPI 挂载 `/assets` 并提供 SPA fallback

## 前端静态文件：Render 构建 → 本地预构建
**决策**: 前端在本机构建后直接提交 `backend/static/`
**原因**: Render Python 环境无 Node.js，构建命令中 `npm install && npx vite build` 失败。改为本地构建后提交产物
**影响**: 每次改前端代码需本地 `npm run build` 后重新提交；`backend/static/` 从 .gitignore 移除

## 请求超时：15s → 90s
**决策**: axios timeout 从 15 秒增加到 90 秒
**原因**: Render 免费版 15 分钟无请求会休眠，冷启动唤醒需 30-60 秒，15 秒太短导致超时白屏
**影响**: 用户在加载中看到 "首次访问需等待服务器唤醒（约 30 秒）" 提示

## 后端接口设计
**决策**: 新增 `POST /api/tables/info` 接口，用 PRAGMA table_info 实时获取表结构 + 样例数据
**原因**: 实现分层表结构展示（折叠/展开），避免在习题 JSON 中冗余存储类型信息

## 习题验证类型
**决策**: 定义 6 种 validation_type：exact_match, row_subset, row_count, contains_value, state_change, schema_change
**原因**: 覆盖 SELECT/JOIN/聚合/INSERT/UPDATE/DELETE/CREATE TABLE 等所有场景
