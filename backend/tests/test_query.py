import sqlite3
import sys
sys.path.insert(0, '..')

conn = sqlite3.connect('../data/practice.db')
conn.row_factory = sqlite3.Row

# Test the aggregation query
c = conn.execute("SELECT role, AVG(years_employed) FROM employees GROUP BY role;")
print('Columns:', [d[0] for d in c.description])
print('Rows:', [list(r) for r in c.fetchmany(10)])
conn.close()
