import { useNavigate } from 'react-router-dom'

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="home-page">
      <div className="logo-mark">{'</>'}</div>
      <h1>SQL 练习平台</h1>
      <p className="subtitle">
        基于 SQLBolt 课程框架 · 180+ 道分级习题 · 即时验证
      </p>

      <div className="mode-cards">
        <div className="mode-card" onClick={() => navigate('/tutorial')}>
          <div className="card-icon tutorial">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
          </div>
          <h3>教程模式</h3>
          <p>
            按课程章节循序渐进，从 SELECT 入门到 DROP TABLE。
            每课含基础、进阶、挑战三级习题，左侧学知识点，右侧实战写 SQL。
          </p>
        </div>

        <div className="mode-card" onClick={() => navigate('/free-practice')}>
          <div className="card-icon practice">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <h3>自由刷题</h3>
          <p>
            按知识点或难度自定义筛选，随机抽取练习题。
            适合复习和查漏补缺，摆脱固定顺序的刷题体验。
          </p>
        </div>
      </div>
    </div>
  )
}
