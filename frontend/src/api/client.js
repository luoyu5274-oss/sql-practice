import axios from 'axios'

// 开发环境用 Vite proxy，生产环境用环境变量指定的后端地址
const BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 90000, // 90s — Render 免费版冷启动需要 30-60s
})

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
