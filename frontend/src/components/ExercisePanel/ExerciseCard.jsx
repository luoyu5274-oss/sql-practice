import { useState, useRef, useEffect, useCallback } from 'react'
import { validateSQL, fetchTablesInfo } from '../../api/client'
import { useProgress } from '../../hooks/useProgress'

export default function ExerciseCard({ exercise, lessonId, difficulty, onComplete, refresher, initialDone }) {
  const [open, setOpen] = useState(false)
  const [sql, setSql] = useState('')
  const [result, setResult] = useState(null)
  const [validating, setValidating] = useState(false)
  const [hintLevel, setHintLevel] = useState(0)
  const [schemaExpanded, setSchemaExpanded] = useState(false)
  const [schemaData, setSchemaData] = useState(null)
  const [schemaLoading, setSchemaLoading] = useState(false)
  const editorRef = useRef(null)
  const { isExerciseCompleted } = useProgress()

  const done = initialDone || isExerciseCompleted(lessonId, difficulty, exercise.id)

  // Lazy load table schema + sample data on first expand
  const loadSchema = useCallback(async () => {
    if (schemaData) { setSchemaExpanded(!schemaExpanded); return }
    const tables = Object.keys(exercise.schema_hint || {})
    if (tables.length === 0) return
    setSchemaExpanded(true)
    setSchemaLoading(true)
    try {
      const data = await fetchTablesInfo(tables)
      setSchemaData(data)
    } catch { /* silently fail, show basic view */ }
    setSchemaLoading(false)
  }, [schemaExpanded, schemaData, exercise.schema_hint])

  // Reset when exercise changes
  useEffect(() => {
    setSql('')
    setResult(null)
    setOpen(false)
    setHintLevel(0)
  }, [exercise.id, refresher])

  const handleValidate = async () => {
    if (!sql.trim()) return
    setValidating(true)
    setResult(null)
    try {
      const res = await validateSQL({
        exercise_id: exercise.id,
        user_sql: sql,
        difficulty,
        lesson_id: lessonId,
      })
      setResult(res)
      if (res.status === 'correct') onComplete()
    } catch (e) {
      setResult({
        status: 'error',
        error_type: 'network_error',
        message: `请求失败：${e.message}`,
      })
    }
    setValidating(false)
  }

  const handleKeyDown = (e) => {
    if (e.ctrlKey && e.key === 'Enter') handleValidate()
    if (e.key === 'Tab') {
      e.preventDefault()
      const start = e.target.selectionStart
      const end = e.target.selectionEnd
      const val = e.target.value
      setSql(val.substring(0, start) + '  ' + val.substring(end))
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 2
      }, 0)
    }
  }

  const showHint = () => {
    if (hintLevel < (exercise.hints?.length || 0)) {
      setHintLevel(h => h + 1)
    }
  }

  const statusClass = result
    ? result.status === 'correct' ? 'correct' : result.status === 'error' ? 'error' : 'incorrect'
    : ''

  const statusLabels = { basic: '基础', intermediate: '进阶', challenge: '挑战' }

  return (
    <div className={`exercise-card ${statusClass}`}>
      <div className="exercise-card-header" onClick={() => setOpen(!open)}>
        <span className={`exercise-number ${done ? 'done' : ''}`}>
          {done ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          ) : (
            exercise.index
          )}
        </span>
        <span className="question-preview">
          第 {exercise.index} 题 — {stripMarkdown(exercise.question_text)}
        </span>
        <span className={`chevron ${open ? 'open' : ''}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </span>
      </div>

      <div className={`exercise-card-body ${open ? 'open' : ''}`}>
        <div className="question-full">
          <div dangerouslySetInnerHTML={{
            __html: exercise.question_text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
          }} />
        </div>

        {exercise.question_context && (
          <div className="context-note">💡 {exercise.question_context}</div>
        )}

        {exercise.schema_hint && Object.keys(exercise.schema_hint).length > 0 && (
          <div className="schema-section">
            <div className="schema-toggle" onClick={loadSchema}>
              <span className="schema-toggle-icon">{schemaExpanded ? '▾' : '▸'}</span>
              <span className="schema-toggle-label">
                表结构
                {Object.entries(exercise.schema_hint).map(([t, cols]) => (
                  <span key={t} className="schema-inline">
                    <span className="schema-table-name">{t}</span>
                    <span className="schema-table-cols">({cols.join(', ')})</span>
                  </span>
                ))}
              </span>
            </div>

            {schemaExpanded && (
              <div className="schema-detail">
                {schemaLoading ? (
                  <div className="schema-loading">加载中...</div>
                ) : (
                  Object.entries(exercise.schema_hint).map(([tableName, hintCols]) => {
                    const info = schemaData?.[tableName]
                    const columns = info?.columns || hintCols.map(name => ({ name, type: '', notnull: false, pk: false }))
                    const samples = info?.sample_rows || []

                    return (
                      <div key={tableName} className="schema-table-card">
                        <div className="schema-table-title">{tableName}</div>
                        <table className="schema-table">
                          <thead>
                            <tr>
                              <th>列名</th>
                              <th>类型</th>
                              <th style={{ width: 52, textAlign: 'center' }}>必填</th>
                              <th style={{ width: 42, textAlign: 'center' }}>主键</th>
                              {samples.length > 0 && samples[0].map((_, i) => (
                                <th key={i} className="sample-col">示例{i + 1}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {columns.map((col, ci) => (
                              <tr key={col.name}>
                                <td className="col-name">{col.name}</td>
                                <td className="col-type">{col.type || '—'}</td>
                                <td className="col-flag">{col.notnull ? '✓' : ''}</td>
                                <td className="col-flag">{col.pk ? '🔑' : ''}</td>
                                {samples.length > 0 && samples.map((row, ri) => (
                                  <td key={ri} className="sample-cell" title={String(row[ci] ?? 'NULL')}>
                                    {row[ci] === null ? <em>NULL</em> : String(row[ci]).slice(0, 30)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )
                  })
                )}
              </div>
            )}
          </div>
        )}

        <div className="sql-editor-wrapper">
          <textarea
            ref={editorRef}
            className="sql-editor"
            value={sql}
            onChange={e => setSql(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="在这里输入你的 SQL 语句..."
            spellCheck={false}
            rows={3}
          />
          <div className="sql-editor-actions">
            <button
              className="btn btn-primary"
              onClick={handleValidate}
              disabled={validating || !sql.trim()}
            >
              {validating ? (
                <>⚡ 执行中...</>
              ) : (
                <>▶ 运行验证 <span style={{ opacity: 0.5, fontSize: '0.75rem' }}>Ctrl+Enter</span></>
              )}
            </button>

            {exercise.hints && exercise.hints.length > 0 && (
              <button className="btn btn-small" onClick={showHint}>
                💡 提示 <span style={{ opacity: 0.5 }}>{hintLevel}/{exercise.hints.length}</span>
              </button>
            )}

            {result?.status === 'correct' && (
              <span style={{ color: 'var(--success)', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                完成
              </span>
            )}
          </div>
        </div>

        {/* Hints */}
        {hintLevel > 0 && exercise.hints && (
          <div className="hint-box">
            {exercise.hints.slice(0, hintLevel).map((hint, i) => (
              <div key={i} className="hint-content">
                <div className="hint-level-indicator">
                  提示 {i + 1} / {exercise.hints.length}
                </div>
                {hint}
              </div>
            ))}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className={`result-panel ${result.status}`}>
            <div className="result-header">
              <span className="result-icon">
                {result.status === 'correct' ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                ) : result.status === 'error' ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                )}
              </span>
              {result.message}
            </div>
            <div className="result-body">
              {result.diff_summary && (
                <div className="diff-summary">{result.diff_summary}</div>
              )}

              {result.user_result && result.expected_preview && result.status !== 'correct' && (
                <div className="comparison">
                  <div className="comparison-col">
                    <h4 className="yours">❌ 你的结果 ({result.user_result.row_count} 行)</h4>
                    <ResultTable columns={result.user_result.columns} rows={result.user_result.rows} maxRows={5} />
                    {result.user_result.execution_time_ms && (
                      <div className="row-count-badge">执行耗时: {result.user_result.execution_time_ms}ms</div>
                    )}
                  </div>
                  <div className="comparison-col">
                    <h4 className="expected">✅ 预期结果 ({result.expected_preview.row_count} 行)</h4>
                    <ResultTable columns={result.expected_preview.columns} rows={result.expected_preview.rows} maxRows={5} />
                  </div>
                </div>
              )}

              {result.user_result && result.status === 'correct' && (
                <>
                  <ResultTable columns={result.user_result.columns} rows={result.user_result.rows} maxRows={10} />
                  <div className="row-count-badge">
                    共 {result.user_result.row_count} 行 · 执行耗时: {result.user_result.execution_time_ms}ms
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ResultTable({ columns, rows, maxRows = 100 }) {
  if (!columns || columns.length === 0) {
    return <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>（无列数据）</div>
  }

  const displayRows = rows.slice(0, maxRows)

  return (
    <>
      <table className="result-table">
        <thead>
          <tr>{columns.map(col => <th key={col}>{col}</th>)}</tr>
        </thead>
        <tbody>
          {displayRows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} title={String(cell ?? 'NULL')}>
                  {cell === null ? <em>NULL</em> : String(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length > maxRows && (
        <div className="row-count-badge">仅显示前 {maxRows} 行，共 {rows.length} 行</div>
      )}
    </>
  )
}

function stripMarkdown(text) {
  return text.replace(/[*_#`>[\]]/g, '').replace(/\*\*(.+?)\*\*/g, '$1').slice(0, 60)
}
