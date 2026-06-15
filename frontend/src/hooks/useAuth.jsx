import { createContext, useContext, useState, useEffect } from 'react'
import { register as registerApi, login as loginApi, fetchMe } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)       // { username } | null
  const [loading, setLoading] = useState(true)  // 初始加载中

  // 应用启动时，尝试用本地 token 恢复登录态
  useEffect(() => {
    const token = localStorage.getItem('sql-practice-token')
    if (!token) {
      setLoading(false)
      return
    }
    fetchMe()
      .then((data) => {
        if (data.status === 'ok') {
          setUser({ username: data.username })
        } else {
          localStorage.removeItem('sql-practice-token')
        }
      })
      .catch(() => {
        localStorage.removeItem('sql-practice-token')
      })
      .finally(() => setLoading(false))
  }, [])

  const register = async (username, password) => {
    const result = await registerApi(username, password)
    if (result.status === 'ok') {
      localStorage.setItem('sql-practice-token', result.token)
      localStorage.setItem('sql-practice-username', result.username)
      setUser({ username: result.username })
    }
    return result
  }

  const login = async (username, password) => {
    const result = await loginApi(username, password)
    if (result.status === 'ok') {
      localStorage.setItem('sql-practice-token', result.token)
      localStorage.setItem('sql-practice-username', result.username)
      setUser({ username: result.username })
    }
    return result
  }

  const logout = () => {
    localStorage.removeItem('sql-practice-token')
    localStorage.removeItem('sql-practice-username')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
