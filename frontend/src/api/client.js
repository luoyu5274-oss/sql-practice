import axios from 'axios'

// 开发环境用 Vite proxy，生产环境用环境变量指定的后端地址
const BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 90000, // 90s — Render 免费版冷启动需要 30-60s
})

// ── Token 拦截器：自动在请求头带上 Bearer token ──
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sql-practice-token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── 401 拦截器：token 过期/无效时自动登出 ──
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('sql-practice-token')
      localStorage.removeItem('sql-practice-username')
      // 不在请求中触发的 401（比如初始加载时 me 接口失败）
      // 不强制跳转，由 AuthContext 处理
    }
    return Promise.reject(err)
  }
)

// ===== 课程/习题 API =====

export async function fetchLessons() {
  const { data } = await api.get('/lessons')
  return data
}

export async function fetchLesson(lessonId) {
  const { data } = await api.get(`/lessons/${lessonId}`)
  return data
}

export async function fetchExercises(lessonId, difficulty = 'basic') {
  const { data } = await api.get(`/lessons/${lessonId}/exercises`, {
    params: { difficulty },
  })
  return data
}

export async function validateSQL({ exercise_id, user_sql, difficulty, lesson_id }) {
  const { data } = await api.post('/validate', {
    exercise_id,
    user_sql,
    difficulty: difficulty || 'basic',
    lesson_id: lesson_id || '',
  })
  return data
}

export async function resetDatabase() {
  const { data } = await api.post('/database/reset')
  return data
}

export async function fetchDatabaseStatus() {
  const { data } = await api.get('/database/status')
  return data
}

export async function fetchTablesInfo(tables) {
  const { data } = await api.post('/tables/info', { tables })
  return data
}

// ===== 进度同步 =====

export async function fetchProgress() {
  const { data } = await api.get('/progress')
  return data
}

export async function saveProgressToServer(lessonId, difficulty, exerciseId) {
  const { data } = await api.post('/progress', {
    lesson_id: lessonId,
    difficulty,
    exercise_id: exerciseId,
  })
  return data
}

export async function resetProgressOnServer() {
  const { data } = await api.delete('/progress')
  return data
}

// ===== 用户认证 =====

export async function register(username, password) {
  const { data } = await api.post('/auth/register', { username, password })
  return data
}

export async function login(username, password) {
  const { data } = await api.post('/auth/login', { username, password })
  return data
}

export async function fetchMe() {
  const { data } = await api.get('/auth/me')
  return data
}
