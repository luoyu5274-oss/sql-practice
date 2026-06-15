---
name: project-overview
description: SQL 练习平台项目总览——定位、技术栈、功能列表
metadata: 
  node_type: memory
  type: project
  originSessionId: 2b39f68c-51ee-42c3-a7f8-d12aaaf93e34
---

# SQL 练习平台 — 项目总览

## 定位
基于 SQLBolt 课程框架的本地 SQL 交互式练习平台。面向 SQL 初学者（数据分析方向）。

## 技术栈
- **前端**: React 18 + Vite + React Router + react-markdown + remark-gfm
- **后端**: Python FastAPI + SQLite（内置 sqlite3 模块）
- **部署**: Render（前后端合一，单地址）

## 核心功能
- 18 节课程 + 复习课，4 个阶段：基础查询 → 多表操作 → 聚合分组 → 数据操作
- 每课 3 级难度（基础/进阶/挑战），共 ~180 题
- 即时 SQL 验证：用户提交 → MySQL/SQLite 执行 → 结果比对 → 正确/错误/语法错误
- 3 级递进提示系统
- localStorage 进度追踪（无用户系统）
- 双模式：教程模式（分栏） + 自由刷题（随机）
- 暖白色调 UI，侧边栏可折叠
- 分层表结构展示：折叠时显示列名，展开后显示类型、约束、样例数据

**Why:** 用户学习 SQLBolt 时发现每章习题太少（2-5 题），需要丰富习题库 + 自动验证。
**How to apply:** 所有功能改动需保持习题 JSON 数据结构兼容，进度存储仅在 localStorage。
