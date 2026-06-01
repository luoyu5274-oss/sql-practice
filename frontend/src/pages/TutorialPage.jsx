import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import LessonNav from '../components/Sidebar/LessonNav'
import LessonContent from '../components/TutorialPanel/LessonContent'
import ExerciseArea from '../components/ExercisePanel/ExerciseArea'
import { fetchLesson } from '../api/client'

export default function TutorialPage() {
  const { lessonId } = useParams()
  const navigate = useNavigate()
  const [lesson, setLesson] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeDifficulty, setActiveDifficulty] = useState('basic')
  const [refreshKey, setRefreshKey] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    if (!lessonId) {
      navigate('/tutorial/lesson_01', { replace: true })
      return
    }
    setLoading(true)
    fetchLesson(lessonId)
      .then(data => setLesson(data))
      .catch(() => navigate('/tutorial/lesson_01', { replace: true }))
      .finally(() => setLoading(false))
  }, [lessonId, navigate])

  useEffect(() => { setActiveDifficulty('basic') }, [lessonId])

  const handleRefresh = () => setRefreshKey(k => k + 1)

  if (!lessonId) return null

  return (
    <div className="split-layout">
      <LessonNav activeLessonId={lessonId} collapsed={!sidebarOpen} />

      {/* Toggle button: shown when sidebar is collapsed */}
      <div
        className={`sidebar-collapsed-indicator ${!sidebarOpen ? 'visible' : ''}`}
        onClick={() => setSidebarOpen(true)}
        title="展开课程目录"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </div>

      <div className="main-content">
        <div className="tutorial-panel">
          {/* Collapse button at top of tutorial panel */}
          <button
            className="btn-icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title={sidebarOpen ? '隐藏目录' : '显示目录'}
            style={{ marginBottom: 16 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {sidebarOpen
                ? <><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/></>
                : <><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/></>
              }
            </svg>
            {sidebarOpen ? '隐藏目录' : '显示目录'}
          </button>

          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60%' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>加载中...</div>
            </div>
          ) : lesson ? (
            <LessonContent lesson={lesson} />
          ) : (
            <div style={{ color: 'var(--text-muted)', padding: 40 }}>课程未找到</div>
          )}
        </div>
        <div className="exercise-panel">
          <ExerciseArea
            lessonId={lessonId}
            difficulty={activeDifficulty}
            onDifficultyChange={setActiveDifficulty}
            onRefresh={handleRefresh}
            refreshKey={refreshKey}
          />
        </div>
      </div>
    </div>
  )
}
