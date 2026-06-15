---
name: bugs-and-fixes
description: 开发过程中遇到的 bug 及修复方案
metadata: 
  node_type: memory
  type: project
  originSessionId: 2b39f68c-51ee-42c3-a7f8-d12aaaf93e34
---

# Bug 记录与修复

## Bug 1: DML 练习数据被真实修改
**现象**: INSERT/UPDATE/DELETE 题执行后数据被持久化，movies 从 14 行变 15 行
**原因**: `sql_executor.py` 中 `state_change` 类型题的代码执行了 `conn.commit()`
**修复**: 移除 commit，DML 始终在事务中执行，最终 `conn.execute("ROLLBACK")` 回滚

## Bug 2: DML 验证无效
**现象**: DML 题 commit 撤销后，任意 DML 只要不报错就被判正确（返回空结果匹配空结果）
**原因**: INSERT/UPDATE/DELETE 返回空结果集，无法验证值的正确性
**修复**: 在习题 JSON 中添加 `verification_sql` 字段，DML 执行后自动跑验证查询（如 SELECT title WHERE ...），比对验证结果。写了 `add_verification.py` 脚本批量为 6 个 DML 习题文件添加验证 SQL

## Bug 3: lesson_08.json JSON 语法错误
**现象**: 聚合查询返回 500 Internal Server Error
**原因**: `lesson_08.json` 第 20 行 `question_context` 中包含中文引号 `"无经验"`，被 JSON 解析器误认为字符串分隔符
**修复**: 替换为单引号 `'无经验'`

## Bug 4: 数据库重启时重复插入
**现象**: 每次重启后端，数据表行数翻倍
**原因**: `init_database()` 每次启动都执行 `INSERT OR IGNORE`，但自增 ID 导致重复行
**修复**: `init_database()` 先检查 `SELECT COUNT(*) FROM movies`，已有数据则跳过

## Bug 5: 数据库重置失败
**现象**: `reset_database()` 报外键约束错误
**原因**: `DROP TABLE IF EXISTS` 在外键约束下删除失败，且 SQLite 的 `sqlite_sequence` 不允许 drop
**修复**: 改用 `os.remove(DATABASE_PATH)` 删库文件后重新 `init_database()`

## Bug 6: Markdown 表格不显示
**现象**: 左侧教程内容中表格不渲染
**原因**: `react-markdown` 默认不支持 GFM 表格语法
**修复**: 安装 `remark-gfm`，在 `ReactMarkdown` 中添加 `remarkPlugins={[remarkGfm]}`

## Bug 7: Render 部署 404 / assets 目录不存在
**现象**: 部署后报 `{"detail":"Not Found"}`，然后报 `Directory 'static/assets' does not exist`
**原因**: (1) Render Python 环境无 Node.js，构建命令中 `npm install` 失败；(2) PowerShell `Copy-Item -Recurse "dist\*"` 未保留 assets 子目录
**修复**: 本地预构建前端，用 `Copy-Item -Recurse "dist\*" "backend\static\"` 确保含 `assets/` 子目录，提交产物到仓库

## Bug 8: Git push 频繁被墙
**现象**: `fatal: unable to access github.com: Recv failure`
**原因**: 国内网络直连 GitHub 不稳定
**解决方案**: 用户开 VPN 后推送
