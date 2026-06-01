"""课程/章节相关 API"""

import os
import json

from fastapi import APIRouter, HTTPException

from config import EXERCISES_DIR

router = APIRouter(tags=["lessons"])

# 课程元数据（前端也用这份数据构建导航）
LESSONS = [
    {"id": "lesson_01", "title": "SELECT 查询入门", "phase": "basic", "order": 1, "tables": ["movies"], "concepts": ["SELECT", "FROM"]},
    {"id": "lesson_02", "title": "条件查询 (Pt.1)", "phase": "basic", "order": 2, "tables": ["movies"], "concepts": ["WHERE", "BETWEEN", "IN", "LIMIT"]},
    {"id": "lesson_03", "title": "条件查询 (Pt.2)", "phase": "basic", "order": 3, "tables": ["movies"], "concepts": ["LIKE", "%", "_"]},
    {"id": "lesson_04", "title": "过滤与排序", "phase": "basic", "order": 4, "tables": ["movies"], "concepts": ["DISTINCT", "ORDER BY", "LIMIT", "OFFSET"]},
    {"id": "review_select", "title": "复习：SELECT 查询", "phase": "basic", "order": 5, "tables": ["north_american_cities"], "concepts": ["综合应用"]},
    {"id": "lesson_06", "title": "多表查询 (JOIN)", "phase": "multi_table", "order": 6, "tables": ["movies", "boxoffice"], "concepts": ["INNER JOIN", "ON"]},
    {"id": "lesson_07", "title": "外连接 (OUTER JOIN)", "phase": "multi_table", "order": 7, "tables": ["buildings", "employees"], "concepts": ["LEFT JOIN", "RIGHT JOIN"]},
    {"id": "lesson_08", "title": "NULL 值处理", "phase": "multi_table", "order": 8, "tables": ["buildings", "employees"], "concepts": ["IS NULL", "IS NOT NULL"]},
    {"id": "lesson_09", "title": "表达式计算", "phase": "multi_table", "order": 9, "tables": ["movies", "boxoffice"], "concepts": ["算术运算", "AS 别名"]},
    {"id": "lesson_10", "title": "聚合函数 (Pt.1)", "phase": "aggregation", "order": 10, "tables": ["employees"], "concepts": ["MIN", "MAX", "AVG", "SUM", "COUNT", "GROUP BY"]},
    {"id": "lesson_11", "title": "聚合函数 (Pt.2)", "phase": "aggregation", "order": 11, "tables": ["employees"], "concepts": ["HAVING", "GROUP BY 过滤"]},
    {"id": "lesson_12", "title": "查询执行顺序", "phase": "aggregation", "order": 12, "tables": ["movies", "boxoffice"], "concepts": ["查询子句执行顺序"]},
    {"id": "lesson_13", "title": "插入数据 (INSERT)", "phase": "dml", "order": 13, "tables": ["movies", "boxoffice"], "concepts": ["INSERT INTO", "VALUES"]},
    {"id": "lesson_14", "title": "更新数据 (UPDATE)", "phase": "dml", "order": 14, "tables": ["movies"], "concepts": ["UPDATE", "SET", "WHERE"]},
    {"id": "lesson_15", "title": "删除数据 (DELETE)", "phase": "dml", "order": 15, "tables": ["movies"], "concepts": ["DELETE FROM", "WHERE"]},
    {"id": "lesson_16", "title": "创建表 (CREATE TABLE)", "phase": "dml", "order": 16, "tables": [], "concepts": ["CREATE TABLE", "数据类型"]},
    {"id": "lesson_17", "title": "修改表 (ALTER TABLE)", "phase": "dml", "order": 17, "tables": ["movies"], "concepts": ["ALTER TABLE", "ADD COLUMN", "DEFAULT"]},
    {"id": "lesson_18", "title": "删除表 (DROP TABLE)", "phase": "dml", "order": 18, "tables": [], "concepts": ["DROP TABLE"]},
]


@router.get("/lessons")
async def get_lessons():
    """获取所有课程列表"""
    result = []
    for lesson in LESSONS:
        item = dict(lesson)
        # 统计习题数量
        exercise_file = os.path.join(EXERCISES_DIR, f"{lesson['id']}.json")
        if os.path.exists(exercise_file):
            with open(exercise_file, "r", encoding="utf-8") as f:
                data = json.load(f)
            counts = {}
            for diff in data.get("exercises", {}):
                counts[diff] = len(data["exercises"][diff])
            item["exercise_count"] = counts
        else:
            item["exercise_count"] = {}
        result.append(item)
    return result


@router.get("/lessons/{lesson_id}")
async def get_lesson(lesson_id: str):
    """获取单课详情"""
    lesson = next((l for l in LESSONS if l["id"] == lesson_id), None)
    if not lesson:
        raise HTTPException(status_code=404, detail=f"课程 '{lesson_id}' 不存在")

    return {
        **lesson,
        "content": get_lesson_content(lesson_id),
    }


def get_lesson_content(lesson_id: str) -> str:
    """获取课程知识点内容（Markdown 格式）"""
    contents = {
        "lesson_01": """# SQL Lesson 1: SELECT 查询入门

## 核心概念

`SELECT` 语句用于从数据库中**检索数据**。你可以把它理解为"我要从某个表中找某些列的数据"。

## 基本语法

```sql
SELECT 列名, ... FROM 表名;
```

- `SELECT` 后面跟你想查询的**列名**（多个列用逗号分隔）
- `FROM` 后面跟要查询的**表名**
- 使用 `*` 代表选择所有列

## 示例

```sql
-- 查询所有电影的所有信息
SELECT * FROM movies;

-- 只查询电影的标题
SELECT title FROM movies;

-- 查询标题和导演
SELECT title, director FROM movies;
```

## 当前可用的表：movies

| 列名 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 电影 ID（主键） |
| title | TEXT | 电影标题 |
| director | TEXT | 导演姓名 |
| year | INTEGER | 发行年份 |
| length_minutes | INTEGER | 片长（分钟） |
""",
        "lesson_02": """# SQL Lesson 2: 条件查询 (Pt.1)

## 核心概念

`WHERE` 子句用于**过滤**数据，只返回满足条件的行。

## 条件运算符

| 运算符 | 含义 | 示例 |
|--------|------|------|
| `=` | 等于 | `WHERE id = 6` |
| `!=` 或 `<>` | 不等于 | `WHERE year != 2000` |
| `>` | 大于 | `WHERE year > 2005` |
| `<` | 小于 | `WHERE year < 2000` |
| `>=` | 大于等于 | `WHERE year >= 2000` |
| `<=` | 小于等于 | `WHERE year <= 2010` |
| `BETWEEN x AND y` | 在范围内 | `WHERE year BETWEEN 2000 AND 2010` |
| `NOT BETWEEN` | 不在范围内 | `WHERE year NOT BETWEEN 2000 AND 2010` |
| `IN (...)` | 在列表中 | `WHERE year IN (1995, 1999, 2003)` |
| `NOT IN (...)` | 不在列表中 | `WHERE id NOT IN (1, 2, 3)` |

## 示例

```sql
-- ID 为 6 的电影
SELECT * FROM movies WHERE id = 6;

-- 2000 到 2010 年之间发行的电影
SELECT * FROM movies WHERE year BETWEEN 2000 AND 2010;

-- 限制返回行数
SELECT * FROM movies WHERE year > 2000 LIMIT 5;
```

## 提示
- `LIMIT` 放在 `WHERE` 后面，用于限制返回行数
- 数值条件不需要加引号：`WHERE year > 2000` ✅  `WHERE year > '2000'` ❌
""",
        "lesson_03": """# SQL Lesson 3: 条件查询 (Pt.2)

## 核心概念

使用 `LIKE` 和通配符进行**文本模糊匹配**。

## 通配符

| 符号 | 含义 | 示例 |
|------|------|------|
| `%` | 匹配任意数量字符（含0个） | `'%Toy%'` 匹配含 "Toy" 的字符串 |
| `_` | 匹配恰好1个字符 | `'Toy _tory'` 匹配 "Toy Story" |

## 示例

```sql
-- 查找所有标题包含 "Toy Story" 的电影
SELECT * FROM movies WHERE title LIKE '%Toy Story%';

-- 精确匹配（等于号）
SELECT * FROM movies WHERE director = 'John Lasseter';

-- 不等于
SELECT * FROM movies WHERE director != 'John Lasseter';

-- 以 "WALL" 开头的电影
SELECT * FROM movies WHERE title LIKE 'WALL%';
```

## 注意
- 字符串需要用**单引号**括起来
- `LIKE` 区分大小写... 但 SQLite 默认不区分（仅对 ASCII 有效）
- `=` 是精确匹配，`LIKE` 是模糊匹配
- 不要混淆 `%`（SQL 通配符）和 `_`（单字符通配符）
""",
        "lesson_04": """# SQL Lesson 4: 过滤与排序

## 核心概念

- `DISTINCT`：去除重复行
- `ORDER BY`：排序结果
- `LIMIT` / `OFFSET`：分页

## 语法

```sql
SELECT DISTINCT 列名 FROM 表名 ORDER BY 列名 ASC/DESC LIMIT N OFFSET M;
```

## 示例

```sql
-- 列出所有导演（不重复）
SELECT DISTINCT director FROM movies ORDER BY director;

-- 按年份降序（最新的在前）
SELECT * FROM movies ORDER BY year DESC;

-- 前 5 部电影
SELECT * FROM movies ORDER BY title LIMIT 5;

-- 跳过前 5 部，取接下来的 5 部
SELECT * FROM movies ORDER BY title LIMIT 5 OFFSET 5;
```

## 排序方向
- `ASC`：升序（默认）
- `DESC`：降序

## 执行顺序注意
`SELECT → FROM → WHERE → ORDER BY → LIMIT → OFFSET`
""",
        "review_select": """# 复习：SELECT 查询综合练习

本课复习前面 4 课的内容，使用 **north_american_cities** 表。

## 可用的表：north_american_cities

| 列名 | 类型 | 说明 |
|------|------|------|
| city | TEXT | 城市名称 |
| country | TEXT | 所属国家 |
| population | INTEGER | 人口数 |
| latitude | REAL | 纬度 |
| longitude | REAL | 经度 |

## 你需要综合运用：
- `SELECT` 选择列
- `WHERE` 条件过滤
- `ORDER BY` 排序
- `LIMIT` 限制行数

### 经纬度提示
- 纬度 (latitude)：北半球为正，越大越靠北
- 经度 (longitude)：西半球为负，越大（接近0）越靠东
""",
        "lesson_06": """# SQL Lesson 6: 多表查询 (JOIN)

## 核心概念

`INNER JOIN` 将两个表通过**共同字段**关联起来。

## 语法

```sql
SELECT 列名, ...
FROM 表A
INNER JOIN 表B
ON 表A.公共字段 = 表B.公共字段;
```

## 示例

```sql
-- 查询每部电影的票房数据
SELECT title, domestic_sales, international_sales
FROM movies
INNER JOIN boxoffice
ON movies.id = boxoffice.movie_id;
```

## 表结构

- **movies**: id, title, director, year, length_minutes
- **boxoffice**: movie_id, rating, domestic_sales, international_sales
- 关联：`movies.id = boxoffice.movie_id`

## 提示
- `ON` 指定连接条件
- 如果列名在两个表中不重复，可以直接写列名；否则需要用 `表名.列名`
- `JOIN` 默认就是 `INNER JOIN`
""",
        "lesson_07": """# SQL Lesson 7: 外连接 (OUTER JOIN)

## 核心概念

`LEFT JOIN` / `RIGHT JOIN` 保留某一边表的**所有行**，即使另一边没有匹配。

## 类型对比

| JOIN 类型 | 说明 |
|-----------|------|
| `INNER JOIN` | 只返回两表都有匹配的行 |
| `LEFT JOIN` | 保留左表所有行，右表无匹配填 NULL |
| `RIGHT JOIN` | 保留右表所有行，左表无匹配填 NULL |

> 注意：SQLite 不支持 `RIGHT JOIN` 和 `FULL OUTER JOIN`

## 示例

```sql
-- 所有建筑及其员工（包括没有员工的建筑）
SELECT building_name, name, role
FROM buildings
LEFT JOIN employees
ON building_name = building;
```

## 表结构

- **buildings**: building_name, capacity
- **employees**: name, role, building, years_employed
- 关联：`buildings.building_name = employees.building`
""",
        "lesson_08": """# SQL Lesson 8: NULL 值处理

## 核心概念

`NULL` 代表**未知**或**不存在**的值。

## 关键语法

```sql
-- 查找某列为空的记录
SELECT * FROM 表 WHERE 列 IS NULL;

-- 查找某列不为空的记录
SELECT * FROM 表 WHERE 列 IS NOT NULL;
```

## ⚠️ 常见错误

```sql
-- ❌ 错误写法
WHERE building = NULL

-- ✅ 正确写法
WHERE building IS NULL
```

## 示例

```sql
-- 未分配到建筑的员工
SELECT name, role FROM employees WHERE building IS NULL;

-- 没有员工的建筑
SELECT building_name FROM buildings
LEFT JOIN employees ON building_name = building
WHERE employees.name IS NULL;
```
""",
        "lesson_09": """# SQL Lesson 9: 表达式计算

## 核心概念

在 `SELECT` 中可以使用**算术表达式**进行计算。

## 支持的运算符

| 运算符 | 含义 |
|--------|------|
| `+` | 加法 |
| `-` | 减法 |
| `*` | 乘法 |
| `/` | 除法 |
| `%` | 取模（求余） |

## 使用别名 (AS)

```sql
SELECT 列名, (表达式) AS 别名 FROM 表;
```

## 示例

```sql
-- 计算总票房（百万美元）
SELECT title, (domestic_sales + international_sales) / 1000000.0 AS total_millions
FROM movies
JOIN boxoffice ON movies.id = boxoffice.movie_id;

-- 把评分转为百分制
SELECT title, rating * 10 AS rating_percent
FROM movies JOIN boxoffice ON movies.id = boxoffice.movie_id;

-- 查找偶数年发行的电影
SELECT title, year FROM movies WHERE year % 2 = 0;
```
""",
        "lesson_10": """# SQL Lesson 10: 聚合函数 (Pt.1)

## 核心概念

聚合函数对**多行数据**进行计算，返回**单个值**。

## 常用聚合函数

| 函数 | 含义 |
|------|------|
| `COUNT(*)` | 统计行数 |
| `COUNT(列)` | 统计非 NULL 值的数量 |
| `SUM(列)` | 求和 |
| `AVG(列)` | 平均值 |
| `MAX(列)` | 最大值 |
| `MIN(列)` | 最小值 |

## GROUP BY

```sql
SELECT 列, 聚合函数
FROM 表
GROUP BY 列;
```

`GROUP BY` 将数据按某列分组，然后对每组分别做聚合。

## 示例

```sql
-- 每个角色的平均工作年限
SELECT role, AVG(years_employed) FROM employees GROUP BY role;

-- 每栋楼的员工总年限
SELECT building, SUM(years_employed) FROM employees GROUP BY building;
```
""",
        "lesson_11": """# SQL Lesson 11: 聚合函数 (Pt.2)

## 核心概念

`HAVING` 用于**过滤分组后的结果**（`WHERE` 过滤分组前的行）。

## WHERE vs HAVING

| 子句 | 过滤时机 |
|------|----------|
| `WHERE` | 在 `GROUP BY` **之前**过滤行 |
| `HAVING` | 在 `GROUP BY` **之后**过滤组 |

## 示例

```sql
-- 有超过 2 名员工的角色
SELECT role, COUNT(*) AS cnt
FROM employees
GROUP BY role
HAVING cnt > 2;

-- 总工作年限超过 20 年的建筑
SELECT building, SUM(years_employed) AS total
FROM employees
GROUP BY building
HAVING total > 20;
```
""",
        "lesson_12": """# SQL Lesson 12: 查询执行顺序

## 核心概念

理解 SQL 各子句的**执行顺序**，才能写出正确的查询。

## 实际执行顺序

```
FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT/OFFSET
```

注意：`SELECT` 中的别名在 `WHERE` 中不可用（因为 SELECT 在后面执行），但可以在 `ORDER BY` 中使用。

## 示例

```sql
-- 每位导演的电影数量
SELECT director, COUNT(*) AS movie_count
FROM movies
GROUP BY director;

-- 每位导演的总票房
SELECT director, SUM(domestic_sales + international_sales) AS total
FROM movies
INNER JOIN boxoffice ON movies.id = boxoffice.movie_id
GROUP BY director;
```
""",
        "lesson_13": """# SQL Lesson 13: 插入数据 (INSERT)

## 核心概念

`INSERT INTO` 用于向表中**添加新行**。

## 语法

```sql
-- 指定列插入
INSERT INTO 表名 (列1, 列2, ...) VALUES (值1, 值2, ...);

-- 所有列插入（按顺序）
INSERT INTO 表名 VALUES (值1, 值2, ...);
```

## 示例

```sql
-- 插入新电影
INSERT INTO movies (title, director, year, length_minutes)
VALUES ('Toy Story 4', 'Josh Cooley', 2019, 100);

-- 插入对应票房
INSERT INTO boxoffice VALUES (15, 7.8, 434000000, 639000000);
```
""",
        "lesson_14": """# SQL Lesson 14: 更新数据 (UPDATE)

## 核心概念

`UPDATE` 用于**修改已存在**的数据行。

## 语法

```sql
UPDATE 表名
SET 列1 = 新值1, 列2 = 新值2
WHERE 条件;
```

## ⚠️ 重要

**一定要加 WHERE！** 否则会更新表中所有行！

## 示例

```sql
-- 修改某部电影的导演
UPDATE movies SET director = 'John Lasseter' WHERE title = 'A Bug''s Life';

-- 同时修改多个列
UPDATE movies SET director = 'Lee Unkrich', title = 'Toy Story 3'
WHERE title = 'Toy Story 8';
```
""",
        "lesson_15": """# SQL Lesson 15: 删除数据 (DELETE)

## 核心概念

`DELETE FROM` 用于**删除行**。

## 语法

```sql
DELETE FROM 表名 WHERE 条件;
```

## ⚠️ 重要

**一定要加 WHERE！** 否则会删除表中所有行！

## 示例

```sql
-- 删除 2005 年之前的电影
DELETE FROM movies WHERE year < 2005;

-- 删除特定导演的所有电影
DELETE FROM movies WHERE director = 'Andrew Stanton';
```
""",
        "lesson_16": """# SQL Lesson 16: 创建表 (CREATE TABLE)

## 核心概念

`CREATE TABLE` 用于创建新的数据库表。

## 常用数据类型（SQLite）

| 类型 | 说明 |
|------|------|
| `INTEGER` | 整数 |
| `REAL` | 浮点数 |
| `TEXT` | 文本字符串 |
| `BLOB` | 二进制数据 |

## 语法

```sql
CREATE TABLE 表名 (
    列名 数据类型,
    列名 数据类型,
    ...
);
```

## 示例

```sql
CREATE TABLE databases (
    name TEXT,
    version REAL,
    download_count INTEGER
);
```
""",
        "lesson_17": """# SQL Lesson 17: 修改表 (ALTER TABLE)

## 核心概念

`ALTER TABLE` 用于修改已有表的结构。

## 语法

```sql
-- 添加列
ALTER TABLE 表名 ADD COLUMN 列名 数据类型;

-- 添加带默认值的列
ALTER TABLE 表名 ADD COLUMN 列名 数据类型 DEFAULT 默认值;
```

> SQLite 不支持 `DROP COLUMN` 和 `RENAME COLUMN`（3.25 之前），也不支持 `MODIFY COLUMN`

## 示例

```sql
ALTER TABLE movies ADD COLUMN language TEXT DEFAULT 'English';
```
""",
        "lesson_18": """# SQL Lesson 18: 删除表 (DROP TABLE)

## 核心概念

`DROP TABLE` 用于**完全删除**一个表（包括结构+数据）。

## 语法

```sql
DROP TABLE IF EXISTS 表名;
```

- `IF EXISTS`：表存在才删除，避免报错
- ⚠️ 删除操作**不可逆**！

## 示例

```sql
DROP TABLE IF EXISTS movies;
DROP TABLE IF EXISTS boxoffice;
```
""",
    }
    return contents.get(lesson_id, "# 课程内容\n\n暂无详细内容。")
