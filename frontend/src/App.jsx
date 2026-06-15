import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import TutorialPage from './pages/TutorialPage'
import FreePracticePage from './pages/FreePracticePage'

function AppShell({ children }) {
  const { user, logout } = useAuth()

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 顶部导航条 */}
      <header style={headerStyles.bar}>
        <div style={headerStyles.left}>
          <span style={headerStyles.logo}>&lt;/&gt;</span>
          <span style={headerStyles.title}>SQL 练习平台</span>
        </div>
        <div style={headerStyles.right}>
          <span style={headerStyles.username}>{user?.username}</span>
          <button onClick={logout} style={headerStyles.logoutBtn}>退出</button>
        </div>
      </header>
      <main style={{ flex: 1 }}>
        {children}
      </main>
    </div>
  )
}

const headerStyles = {
  bar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 20px',
    background: '#1a1a2e',
    color: '#eee',
    flexShrink: 0,
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  logo: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#667eea',
  },
  title: {
    fontSize: '16px',
    fontWeight: 600,
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  username: {
    fontSize: '14px',
    color: '#aaa',
  },
  logoutBtn: {
    padding: '4px 14px',
    fontSize: '13px',
    border: '1px solid #555',
    borderRadius: '6px',
    background: 'transparent',
    color: '#ccc',
    cursor: 'pointer',
  },
}

export default function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#1a1a2e',
        color: '#888',
        fontSize: '16px',
      }}>
        加载中...
      </div>
    )
  }

  if (!user) {
    return <LoginPage />
  }

  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/tutorial/:lessonId?" element={<TutorialPage />} />
        <Route path="/free-practice" element={<FreePracticePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  )
}
