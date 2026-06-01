/* 课程目录元数据 */
const LESSONS = [
  { id: 'lesson_01', title: 'SELECT 查询入门', phase: 'basic', order: 1, concepts: ['SELECT', 'FROM'] },
  { id: 'lesson_02', title: '条件查询 (Pt.1)', phase: 'basic', order: 2, concepts: ['WHERE', 'BETWEEN', 'IN', 'LIMIT'] },
  { id: 'lesson_03', title: '条件查询 (Pt.2)', phase: 'basic', order: 3, concepts: ['LIKE', '%', '_'] },
  { id: 'lesson_04', title: '过滤与排序', phase: 'basic', order: 4, concepts: ['DISTINCT', 'ORDER BY', 'LIMIT', 'OFFSET'] },
  { id: 'review_select', title: '复习：SELECT 查询', phase: 'basic', order: 5, concepts: ['综合应用'] },
  { id: 'lesson_06', title: '多表查询 (JOIN)', phase: 'multi_table', order: 6, concepts: ['INNER JOIN', 'ON'] },
  { id: 'lesson_07', title: '外连接 (OUTER JOIN)', phase: 'multi_table', order: 7, concepts: ['LEFT JOIN', 'RIGHT JOIN'] },
  { id: 'lesson_08', title: 'NULL 值处理', phase: 'multi_table', order: 8, concepts: ['IS NULL', 'IS NOT NULL'] },
  { id: 'lesson_09', title: '表达式计算', phase: 'multi_table', order: 9, concepts: ['算术运算', 'AS 别名'] },
  { id: 'lesson_10', title: '聚合函数 (Pt.1)', phase: 'aggregation', order: 10, concepts: ['COUNT', 'SUM', 'AVG', 'MAX', 'MIN', 'GROUP BY'] },
  { id: 'lesson_11', title: '聚合函数 (Pt.2)', phase: 'aggregation', order: 11, concepts: ['HAVING'] },
  { id: 'lesson_12', title: '查询执行顺序', phase: 'aggregation', order: 12, concepts: ['执行顺序'] },
  { id: 'lesson_13', title: '插入数据 (INSERT)', phase: 'dml', order: 13, concepts: ['INSERT INTO'] },
  { id: 'lesson_14', title: '更新数据 (UPDATE)', phase: 'dml', order: 14, concepts: ['UPDATE', 'SET'] },
  { id: 'lesson_15', title: '删除数据 (DELETE)', phase: 'dml', order: 15, concepts: ['DELETE FROM'] },
  { id: 'lesson_16', title: '创建表 (CREATE TABLE)', phase: 'dml', order: 16, concepts: ['CREATE TABLE'] },
  { id: 'lesson_17', title: '修改表 (ALTER TABLE)', phase: 'dml', order: 17, concepts: ['ALTER TABLE'] },
  { id: 'lesson_18', title: '删除表 (DROP TABLE)', phase: 'dml', order: 18, concepts: ['DROP TABLE'] },
]

export default LESSONS

export const PHASES = [
  { key: 'basic', label: '基础查询', color: '#4caf50' },
  { key: 'multi_table', label: '多表操作', color: '#2196f3' },
  { key: 'aggregation', label: '聚合与分组', color: '#9c27b0' },
  { key: 'dml', label: '数据操作', color: '#ff9800' },
]

export function getLessonById(id) {
  return LESSONS.find(l => l.id === id)
}

export function getPhaseLabel(phaseKey) {
  return PHASES.find(p => p.key === phaseKey)?.label || phaseKey
}
