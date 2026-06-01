import { useState, useEffect } from 'react'
import { fetchExercises } from '../../api/client'
import { useProgress } from '../../hooks/useProgress'
import ExerciseCard from './ExerciseCard'

const DIFFICULTY_TABS = [
  { key: 'basic', label: '基础', icon: '🟢' },
  { key: 'intermediate', label: '进阶', icon: '🔵' },
  { key: 'challenge', label: '挑战', icon: '🟣' },
]

export default function ExerciseArea({ lessonId, difficulty, onDifficultyChange, onRefresh, refreshKey }) {
  const [exercises, setExercises] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { completeExercise } = useProgress()
  const [completedSet, setCompletedSet] = useState({})

  useEffect(() => {
    if (!lessonId) return
    setLoading(true)
    setError(null)
    fetchExercises(lessonId, difficulty)
      .then(data => setExercises(data?.exercises || []))
      .catch(err => {
        console.error('Failed to load exercises:', err)
        setError('加载习题失败，请刷新重试')
      })
      .finally(() => setLoading(false))
  }, [lessonId, difficulty, refreshKey])

  const handleComplete = (exerciseId) => {
    completeExercise(lessonId, difficulty, exerciseId)
    setCompletedSet(s => ({ ...s, [exerciseId]: true }))
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60, color: 'var(--text-muted)', fontSize: '0.9375rem' }}>
        <span className="loading-dots">加载习题中</span>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: 60, textAlign: 'center', color: 'var(--danger)' }}>
        <div style={{ fontSize: '2rem', marginBottom: 12 }}>⚠️</div>
        <div>{error}</div>
        <button className="btn btn-small" style={{ marginTop: 16 }} onClick={onRefresh}>重试</button>
      </div>
    )
  }

  return (
    <div>
      <div className="exercise-header">
        <h2>练习题</h2>
        <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          {exercises.length} 题
        </span>
      </div>

      <div className="difficulty-tabs">
        {DIFFICULTY_TABS.map(tab => (
          <button
            key={tab.key}
            className={`difficulty-tab ${difficulty === tab.key ? 'active' : ''}`}
            onClick={() => onDifficultyChange(tab.key)}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {exercises.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
          暂无习题
        </div>
      ) : (
        exercises.map((ex, idx) => (
          <ExerciseCard
            key={ex.id || idx}
            exercise={ex}
            lessonId={lessonId}
            difficulty={difficulty}
            onComplete={() => handleComplete(ex.id)}
            refresher={refreshKey}
            initialDone={completedSet[ex.id]}
          />
        ))
      )}
    </div>
  )
}
