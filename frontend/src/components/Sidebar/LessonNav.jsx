import { useNavigate } from 'react-router-dom'
import LESSONS, { PHASES } from '../../data/lessonMeta'
import { useProgress } from '../../hooks/useProgress'

export default function LessonNav({ activeLessonId, collapsed }) {
  const navigate = useNavigate()
  const { getLessonProgress } = useProgress()

  const grouped = {}
  for (const lesson of LESSONS) {
    if (!grouped[lesson.phase]) grouped[lesson.phase] = []
    grouped[lesson.phase].push(lesson)
  }

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="brand">
          <div className="brand-icon">{'</>'}</div>
          <span className="brand-label">SQL 练习</span>
        </div>
        <a href="/" className="home-link">首页</a>
      </div>
      <div className="lesson-nav">
        {PHASES.map(phase => (
          <div key={phase.key} className="phase-group">
            <div className="phase-label">
              <span className={`phase-dot ${phase.key}`} />
              {phase.label}
            </div>
            {(grouped[phase.key] || []).map(lesson => {
              const { lessonData } = getLessonProgress(lesson.id)
              const totalKeys = Object.values(lessonData).reduce((s, d) => s + Object.keys(d).length, 0)
              const doneKeys = Object.values(lessonData).reduce((s, d) => s + Object.values(d).filter(Boolean).length, 0)
              let progressClass = ''
              if (totalKeys > 0 && doneKeys >= totalKeys) progressClass = 'done'
              else if (doneKeys > 0) progressClass = 'started'

              return (
                <div
                  key={lesson.id}
                  className={`lesson-nav-item ${activeLessonId === lesson.id ? 'active' : ''}`}
                  onClick={() => navigate(`/tutorial/${lesson.id}`)}
                >
                  <span className="lesson-order">{String(lesson.order).padStart(2, '0')}</span>
                  <span className="lesson-title">{lesson.title}</span>
                  <span className={`progress-indicator ${progressClass}`} />
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
