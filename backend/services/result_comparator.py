"""结果集比对引擎 — 将用户输出与预期答案比对"""


def compare_results(user_result: dict, expected_result: dict, exercise: dict) -> dict:
    """比对用户结果与预期结果"""

    validation_type = exercise.get("validation_type", "exact_match")
    order_matters = exercise.get("order_matters", False)
    expected_columns = exercise.get("expected_columns", [])

    user_cols = user_result.get("columns", [])
    user_rows = user_result.get("rows", [])
    user_count = user_result.get("row_count", 0)

    exp_cols = expected_result.get("columns", [])
    exp_rows = expected_result.get("rows", [])
    exp_count = expected_result.get("row_count", 0)

    # ---- 基本检查 ----

    # 列名检查（仅对 exact_match 和 row_subset）
    if validation_type in ("exact_match", "row_subset"):
        if expected_columns:
            user_col_names = [c.lower() for c in user_cols]
            exp_col_names = [c.lower() for c in expected_columns]
            if user_col_names != exp_col_names:
                return {
                    "status": "incorrect",
                    "error_type": "column_mismatch",
                    "message": f"列名不匹配。你的查询返回了 {len(user_cols)} 列（{', '.join(user_cols)}），预期 {len(expected_columns)} 列（{', '.join(expected_columns)}）。",
                    "user_result": user_result,
                    "expected_preview": expected_result,
                    "diff_summary": f"列名差异：你的列 [{', '.join(user_cols)}] vs 预期列 [{', '.join(expected_columns)}]",
                }

    # ---- 按验证类型比对 ----

    match validation_type:
        case "exact_match":
            return _exact_match(user_rows, exp_rows, user_result, expected_result, order_matters)

        case "row_subset":
            return _row_subset(user_rows, exp_rows, user_result, expected_result)

        case "row_count":
            return _row_count(user_count, exp_count, user_result, expected_result)

        case "contains_value":
            return _contains_value(user_rows, exp_rows, user_result, expected_result, exercise)

        case "state_change":
            return _state_change(user_rows, exp_rows, user_result, expected_result, exercise)

        case "schema_change":
            return _schema_change(user_rows, exp_rows, user_result, expected_result, exercise)

    return {
        "status": "error",
        "error_type": "unknown",
        "message": f"未知的验证类型：{validation_type}",
        "user_result": user_result,
        "expected_preview": expected_result,
        "diff_summary": None,
    }


def _normalize_rows(rows: list) -> list:
    """将行数据标准化为可比较的格式（所有值转字符串）"""
    return [[str(v) for v in row] for row in rows]


def _exact_match(user_rows, exp_rows, user_result, expected_result, order_matters: bool) -> dict:
    """精确匹配"""
    user_norm = _normalize_rows(user_rows)
    exp_norm = _normalize_rows(exp_rows)

    if order_matters:
        match = user_norm == exp_norm
    else:
        match = set(tuple(r) for r in user_norm) == set(tuple(r) for r in exp_norm)

    if match:
        return {
            "status": "correct",
            "error_type": None,
            "message": "✅ 回答正确！结果与预期完全一致。",
            "user_result": user_result,
            "expected_preview": expected_result,
            "diff_summary": None,
        }

    # 生成差异描述
    user_set = set(tuple(r) for r in user_norm)
    exp_set = set(tuple(r) for r in exp_norm)

    missing = exp_set - user_set  # 用户结果缺少的行
    extra = user_set - exp_set    # 用户结果多出的行

    if len(user_rows) != len(exp_rows):
        return {
            "status": "incorrect",
            "error_type": "row_count_mismatch",
            "message": f"行数不匹配。你的查询返回了 {len(user_rows)} 行，预期 {len(exp_rows)} 行。",
            "user_result": user_result,
            "expected_preview": expected_result,
            "diff_summary": f"行数差异：{len(user_rows)} vs {len(exp_rows)}。缺少 {len(missing)} 行，多余 {len(extra)} 行。",
        }

    return {
        "status": "incorrect",
        "error_type": "result_mismatch",
        "message": f"结果不匹配。缺少 {len(missing)} 行预期数据，多了 {len(extra)} 行非预期数据。",
        "user_result": user_result,
        "expected_preview": expected_result,
        "diff_summary": f"缺少的行：{list(missing)[:5]}... 多余的行：{list(extra)[:5]}...",
    }


def _row_subset(user_rows, exp_rows, user_result, expected_result) -> dict:
    """子集匹配：用户结果应包含预期结果"""
    user_set = set(tuple(_normalize_rows([row])[0]) for row in user_rows)
    exp_set = set(tuple(_normalize_rows([row])[0]) for row in exp_rows)

    if exp_set.issubset(user_set):
        return {
            "status": "correct",
            "error_type": None,
            "message": "✅ 回答正确！你的结果包含了所有预期的数据。",
            "user_result": user_result,
            "expected_preview": expected_result,
            "diff_summary": None,
        }

    missing = exp_set - user_set
    return {
        "status": "incorrect",
        "error_type": "subset_mismatch",
        "message": f"缺少 {len(missing)} 行预期数据。",
        "user_result": user_result,
        "expected_preview": expected_result,
        "diff_summary": f"缺少的行：{list(missing)[:5]}",
    }


def _row_count(user_count, exp_count, user_result, expected_result) -> dict:
    """仅检查行数"""
    if user_count == exp_count:
        return {
            "status": "correct",
            "error_type": None,
            "message": f"✅ 回答正确！返回了预期的 {exp_count} 行数据。",
            "user_result": user_result,
            "expected_preview": expected_result,
            "diff_summary": None,
        }

    return {
        "status": "incorrect",
        "error_type": "row_count_mismatch",
        "message": f"行数不匹配。你的查询返回了 {user_count} 行，预期 {exp_count} 行。",
        "user_result": user_result,
        "expected_preview": expected_result,
        "diff_summary": f"行数差异：{user_count} vs {exp_count}",
    }


def _contains_value(user_rows, exp_rows, user_result, expected_result, exercise) -> dict:
    """检查是否包含特定值"""
    # 将预期结果中的特定值作为必须包含的目标
    exp_values = set()
    for row in exp_rows:
        for val in row:
            exp_values.add(str(val))

    user_values = set()
    for row in user_rows:
        for val in row:
            user_values.add(str(val))

    if exp_values.issubset(user_values):
        return {
            "status": "correct",
            "error_type": None,
            "message": "✅ 回答正确！结果包含了预期的关键值。",
            "user_result": user_result,
            "expected_preview": expected_result,
            "diff_summary": None,
        }

    missing = exp_values - user_values
    return {
        "status": "incorrect",
        "error_type": "value_mismatch",
        "message": f"缺少预期的值：{list(missing)}",
        "user_result": user_result,
        "expected_preview": expected_result,
        "diff_summary": f"缺少值：{list(missing)[:5]}",
    }


def _state_change(user_rows, exp_rows, user_result, expected_result, exercise: dict) -> dict:
    """检查数据修改是否正确（INSERT/UPDATE/DELETE 题）"""
    # 对于 state_change，参考 SQL 执行后会得到验证查询的结果
    # 用户执行 DML 后，再用验证 SQL 查询，比对结果
    # 目前简化处理：比较用户执行后查询的结果
    return _exact_match(user_rows, exp_rows, user_result, expected_result, order_matters=False)


def _schema_change(user_rows, exp_rows, user_result, expected_result, exercise: dict) -> dict:
    """检查表结构修改是否正确（CREATE/ALTER/DROP 题）"""
    return _exact_match(user_rows, exp_rows, user_result, expected_result, order_matters=False)
