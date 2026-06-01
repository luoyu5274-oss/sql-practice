"""为 DML 习题批量添加 verification_sql"""
import json, os, re

exercises_dir = os.path.join(os.path.dirname(__file__), "..", "data", "exercises")
dml_lessons = ["lesson_13", "lesson_14", "lesson_15", "lesson_16", "lesson_17", "lesson_18"]

for lesson_file in dml_lessons:
    filepath = os.path.join(exercises_dir, f"{lesson_file}.json")
    if not os.path.exists(filepath):
        continue

    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)

    modified = False
    for difficulty, exercises in data.get("exercises", {}).items():
        for ex in exercises:
            vt = ex.get("validation_type", "")
            if vt in ("state_change", "schema_change") and not ex.get("verification_sql"):
                ref = ex.get("reference_sql", "")
                ref_upper = ref.upper().strip()

                if ref_upper.startswith("INSERT"):
                    m = re.search(r'INTO\s+(\w+)', ref_upper)
                    if m:
                        table = m.group(1).lower()
                        vals_match = re.search(r"VALUES\s*\(([^)]+)\)", ref, re.IGNORECASE)
                        if vals_match:
                            first_val = vals_match.group(1).split(",")[0].strip().strip("'")
                            if table in ("movies", "employees", "buildings", "north_american_cities"):
                                col = {"movies": "title", "employees": "name", "buildings": "building_name", "north_american_cities": "city"}.get(table, "id")
                                ex["verification_sql"] = f"SELECT {col} FROM {table} WHERE {col} = '{first_val}';"
                            elif table == "boxoffice":
                                ex["verification_sql"] = f"SELECT movie_id FROM boxoffice WHERE movie_id = {first_val};"
                            modified = True

                elif ref_upper.startswith("UPDATE"):
                    m_table = re.search(r'UPDATE\s+(\w+)', ref_upper)
                    if m_table:
                        table = m_table.group(1).lower()
                        where_match = re.search(r"WHERE\s+(.+)$", ref, re.IGNORECASE)
                        if where_match:
                            where_clause = where_match.group(1).strip().rstrip(";")
                            ex["verification_sql"] = f"SELECT * FROM {table} WHERE {where_clause};"
                            modified = True

                elif ref_upper.startswith("DELETE"):
                    m_table = re.search(r'FROM\s+(\w+)', ref_upper)
                    if m_table:
                        table = m_table.group(1).lower()
                        where_match = re.search(r"WHERE\s+(.+)$", ref, re.IGNORECASE)
                        if where_match:
                            where_clause = where_match.group(1).strip().rstrip(";")
                            ex["verification_sql"] = f"SELECT COUNT(*) FROM {table} WHERE {where_clause};"
                        else:
                            ex["verification_sql"] = f"SELECT COUNT(*) FROM {table};"
                        modified = True

                elif ref_upper.startswith("CREATE TABLE"):
                    m = re.search(r'CREATE\s+TABLE\s+(\w+)', ref_upper)
                    if m:
                        table = m.group(1).lower()
                        ex["verification_sql"] = f"SELECT name FROM sqlite_master WHERE type='table' AND name='{table}';"
                        modified = True

                elif ref_upper.startswith("ALTER TABLE"):
                    m = re.search(r'ALTER\s+TABLE\s+(\w+)\s+ADD\s+(COLUMN\s+)?(\w+)', ref_upper)
                    if m:
                        table = m.group(1).lower()
                        col = m.group(3).lower()
                        ex["verification_sql"] = f"SELECT name FROM pragma_table_info('{table}') WHERE name='{col}';"
                        modified = True

                elif ref_upper.startswith("DROP TABLE"):
                    m = re.search(r'DROP\s+TABLE\s+IF\s+EXISTS\s+(\w+)', ref_upper)
                    if m:
                        table = m.group(1).lower()
                        ex["verification_sql"] = f"SELECT name FROM sqlite_master WHERE type='table' AND name='{table}';"
                        modified = True

    if modified:
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False)
        print(f"Updated: {lesson_file}")

print("Done!")
