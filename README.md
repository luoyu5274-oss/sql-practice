# SQL 练习平台

基于 [SQLBolt.com](https://sqlbolt.com) 课程框架的本地 SQL 交互式练习平台。包含 **18 节课程 + 180+ 道分级习题**，支持即时 SQL 验证和错误反馈。

## ✨ 功能

- 📚 **完整课程体系** — 18 节课，分 4 个阶段：基础查询 → 多表操作 → 聚合分组 → 数据操作
- 🎯 **三级难度** — 每课含基础/进阶/挑战三档，5-10 题/档
- ⚡ **即时验证** — 输入 SQL → 点击运行 → 毫秒级反馈正确/错误及详细差异
- 💡 **提示系统** — 每道题 3 级递进提示，帮你找到思路
- 📊 **对比视图** — 错误时左右并列展示你的结果 vs 预期结果
- 📈 **进度追踪** — localStorage 记录完成情况，支持断点续学
- 🎲 **自由刷题** — 按阶段/难度随机出题，摆脱固定顺序
- 🌙 **深色主题** — 护眼配色，适合长时间学习
- 🖥️ **纯本地运行** — 零网络依赖，数据完全在你本地

## 🛠️ 技术栈

| 层 | 技术 |
|----|------|
| 前端 | React 18 + React Router + Axios + React Markdown |
| 后端 | Python FastAPI + SQLite |
| 数据库 | SQLite（零配置，Python 内置） |
| 构建 | Vite |

## 🚀 快速开始

### 前置要求
- **Python 3.10+**
- **Node.js 18+**

### 1. 启动后端

```bash
cd backend

# 安装依赖
pip install -r requirements.txt

# 启动服务（端口 8000）
uvicorn main:app --reload --port 8000
```

后端启动后会自动初始化 SQLite 数据库并插入种子数据。

### 2. 启动前端

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器（端口 5173）
npm run dev
```

### 3. 打开浏览器

访问 **http://localhost:5173**

## 📖 课程结构

| 阶段 | 课程 | 知识点 |
|------|------|--------|
| 🟢 基础查询 | Lesson 1-4 + Review | SELECT, WHERE, LIKE, DISTINCT, ORDER BY, LIMIT, OFFSET |
| 🔵 多表操作 | Lesson 6-9 | INNER JOIN, LEFT JOIN, NULL, 表达式计算 |
| 🟣 聚合分组 | Lesson 10-12 | COUNT, SUM, AVG, MAX, MIN, GROUP BY, HAVING |
| 🟠 数据操作 | Lesson 13-18 | INSERT, UPDATE, DELETE, CREATE TABLE, ALTER, DROP |

## 🗄️ 数据库表

| 表名 | 说明 | 行数 |
|------|------|------|
| movies | 皮克斯电影（14部） | 14 |
| boxoffice | 票房数据 | 14 |
| employees | 员工信息 | 21 |
| buildings | 办公楼 | 4 |
| north_american_cities | 北美城市 | 12 |

## 🔒 安全机制

- 所有用户 SQL 在事务中执行，执行完毕后自动回滚，**绝不污染数据**
- 禁止多语句执行（分号分隔）
- 关键字黑名单：DROP DATABASE, GRANT, REVOKE 等
- 仅 SELECT 类型题目禁止 DML 语句
- 查询超时 5 秒自动中断
- 结果集最多返回 1000 行

## 📁 项目结构

```
├── backend/
│   ├── main.py              # FastAPI 入口
│   ├── config.py            # 配置
│   ├── database.py          # SQLite 管理
│   ├── routers/             # API 路由
│   │   ├── lessons.py       # 课程接口
│   │   ├── exercises.py     # 习题接口
│   │   ├── validate.py      # SQL 验证接口
│   │   └── database.py      # 数据库管理接口
│   ├── services/            # 核心服务
│   │   ├── sql_executor.py  # SQL 安全执行引擎
│   │   └── result_comparator.py # 结果比对引擎
│   └── data/
│       ├── seed.sql         # 建表 + 种子数据
│       └── exercises/       # 19 个习题 JSON 文件
│
├── frontend/
│   └── src/
│       ├── pages/           # HomePage, TutorialPage, FreePracticePage
│       ├── components/      # LessonNav, LessonContent, ExerciseCard 等
│       ├── hooks/           # useProgress (localStorage)
│       └── api/             # Axios 封装
│
└── README.md
```

## 🔧 API 端点

| Method | Endpoint | 说明 |
|--------|----------|------|
| GET | `/api/health` | 健康检查 |
| GET | `/api/lessons` | 课程列表 |
| GET | `/api/lessons/{id}` | 课程详情 |
| GET | `/api/lessons/{id}/exercises?difficulty=` | 习题列表 |
| POST | `/api/validate` | SQL 验证 |
| POST | `/api/database/reset` | 重置数据库 |
| GET | `/api/database/status` | 数据库状态 |
