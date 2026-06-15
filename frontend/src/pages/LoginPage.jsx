import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

export default function LoginPage() {
  const { register, login } = useAuth()
  const [isRegister, setIsRegister] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    const fn = isRegister ? register : login
    const result = await fn(username.trim(), password)

    if (result.status !== 'ok') {
      setError(result.message || '操作失败')
    }
    // 成功时 AuthContext 会自动更新 user，页面自动切换
    setSubmitting(false)
  }

  return (
    <div style={styles.outer}>
      <div style={styles.card}>
        <h1 style={styles.title}>SQL 练习平台</h1>
        <p style={styles.subtitle}>
          {isRegister ? '创建新账号' : '登录以继续学习'}
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            style={styles.input}
            type="text"
            placeholder="用户名"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoFocus
            minLength={2}
            maxLength={20}
          />
          <input
            style={styles.input}
            type="password"
            placeholder="密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={4}
          />

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" style={styles.button} disabled={submitting}>
            {submitting ? '处理中...' : isRegister ? '注册' : '登录'}
          </button>
        </form>

        <p style={styles.switch}>
          {isRegister ? '已有账号？' : '没有账号？'}
          <button
            style={styles.linkButton}
            onClick={() => { setIsRegister(!isRegister); setError('') }}
          >
            {isRegister ? '去登录' : '去注册'}
          </button>
        </p>
      </div>
    </div>
  )
}

const styles = {
  outer: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px',
  },
  card: {
    background: '#fff',
    borderRadius: '12px',
    padding: '40px 32px',
    width: '100%',
    maxWidth: '380px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
    textAlign: 'center',
  },
  title: {
    fontSize: '26px',
    fontWeight: 700,
    color: '#333',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '14px',
    color: '#888',
    margin: '0 0 28px 0',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  input: {
    padding: '12px 16px',
    fontSize: '15px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  error: {
    color: '#e74c3c',
    fontSize: '13px',
    margin: 0,
    textAlign: 'left',
    paddingLeft: '4px',
  },
  button: {
    padding: '12px',
    fontSize: '16px',
    fontWeight: 600,
    color: '#fff',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
  switch: {
    marginTop: '20px',
    fontSize: '13px',
    color: '#888',
  },
  linkButton: {
    background: 'none',
    border: 'none',
    color: '#667eea',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '13px',
    padding: '0 4px',
  },
}
