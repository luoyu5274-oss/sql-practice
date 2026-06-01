import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import LESSONS from '../data/lessonMeta'
import { fetchExercises } from '../api/client'
import ExerciseCard from '../components/ExercisePanel/ExerciseCard'

export default function FreePracticePage() {
  const navigate = useNavigate()
  const [selectedPhase, setSelectedPhase] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentEx, setCurrentEx] = useState(null)
  const [exerciseKey, setExerciseKey] = useState(0)

  const loadRandomExercise = useCallback(async () => {
    setLoading(true)
    setCurrentEx(null)
    try {
      let pool = [...LESSONS]
      if (selectedPhase) pool = pool.filter(l => l.phase === selectedPhase)
      if (pool.length === 0) { setLoading(false); return }

      const randomLesson = pool[Math.floor(Math.random() * pool.length)]
      const difficulties = ['basic', 'intermediate', 'challenge']
      const diff = selectedDifficulty || difficulties[Math.floor(Math.random() * 3)]
      const data = await fetchExercises(randomLesson.id, diff)
      const exList = data?.exercises || []
      if (exList.length > 0) {
        const randomEx = exList[Math.floor(Math.random() * exList.length)]
        setCurrentEx({
          ...randomEx,
          _lesson_title: data.lesson_title,
          _lesson_id: data.lesson_id,
          _difficulty: diff,
        })
        setExerciseKey(k => k + 1)
      }
    } catch (e) { console.error(e) }
    setLoading(false)
  }, [selectedPhase, selectedDifficulty])

  return (
    <div className="free-practice-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <h1 style={{ margin: 0 }}>
          <span style={{ color: 'var(--accent)', marginRight: 8 }}>🎯</span>
          自由刷题
        </h1>
        <button className="btn btn-ghost" onClick={() => navigate('/')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          返回首页
        </button>
      </div>

      <div className="filter-bar card">
        <select value={selectedPhase} onChange={e => setSelectedPhase(e.target.value)}>
          <option value="">全部阶段</option>
          <option value="basic">🟢 基础查询</option>
          <option value="multi_table">🔵 多表操作</option>
          <option value="aggregation">🟣 聚合与分组</option>
          <option value="dml">🟠 数据操作</option>
        </select>

        <select value={selectedDifficulty} onChange={e => setSelectedDifficulty(e.target.value)}>
          <option value="">随机难度</option>
          <option value="basic">基础</option>
          <option value="intermediate">进阶</option>
          <option value="challenge">挑战</option>
        </select>

        <button className="btn btn-primary" onClick={loadRandomExercise} disabled={loading}>
          {loading ? '加载中...' : '🎲 随机出题'}
        </button>
      </div>

      {currentEx && (
        <ExerciseCard
          key={exerciseKey}
          exercise={currentEx}
          lessonId={currentEx._lesson_id}
          difficulty={currentEx._difficulty}
          onComplete={() => {}}
          refresher={exerciseKey}
        />
      )}

      {!currentEx && !loading && (
        <div className="card" style={{ textAlign: 'center', padding: 56, color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 12, opacity: 0.5 }}>🎲</div>
          <div style={{ fontSize: '0.9375rem' }}>选择筛选条件后，点击「随机出题」开始练习</div>
        </div>
      )}
    </div>
  )
}
