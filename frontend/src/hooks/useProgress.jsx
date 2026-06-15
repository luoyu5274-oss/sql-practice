import { createContext, useContext, useReducer, useEffect } from 'react'
import { fetchProgress, saveProgressToServer, resetProgressOnServer } from '../api/client'

const AppContext = createContext(null)

const STORAGE_KEY = 'sql-practice-progress'

function loadLocalProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveLocalProgress(progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
}

function mergeProgress(localProgress, serverProgress) {
  // 服务端进度优先，合并本地进度
  const merged = { ...localProgress }
  for (const lessonId of Object.keys(serverProgress || {})) {
    if (!merged[lessonId]) merged[lessonId] = {}
    for (const diff of Object.keys(serverProgress[lessonId] || {})) {
      if (!merged[lessonId][diff]) merged[lessonId][diff] = {}
      Object.assign(merged[lessonId][diff], serverProgress[lessonId][diff])
    }
  }
  return merged
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_PROGRESS': {
      saveLocalProgress(action.payload)
      return action.payload
    }
    case 'COMPLETE_EXERCISE': {
      const { lessonId, difficulty, exerciseId } = action.payload
      const newState = { ...state }
      if (!newState[lessonId]) newState[lessonId] = {}
      if (!newState[lessonId][difficulty]) newState[lessonId][difficulty] = {}
      newState[lessonId][difficulty][exerciseId] = true
      saveLocalProgress(newState)
      // 异步保存到服务端（不阻塞 UI）
      saveProgressToServer(lessonId, difficulty, exerciseId).catch(() => {})
      return newState
    }
    case 'RESET_PROGRESS': {
      saveLocalProgress({})
      resetProgressOnServer().catch(() => {})
      return {}
    }
    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [progress, dispatch] = useReducer(reducer, null, () => {
    // 初始加载时先用本地数据
    return loadLocalProgress()
  })

  // 挂载时从服务端同步进度
  useEffect(() => {
    let cancelled = false
    fetchProgress()
      .then((data) => {
        if (cancelled) return
        const serverProgress = data.progress || {}
        const localProgress = loadLocalProgress()
        const merged = mergeProgress(localProgress, serverProgress)
        // 如果合并后与当前 state 不同，更新
        if (JSON.stringify(merged) !== JSON.stringify(localProgress)) {
          dispatch({ type: 'SET_PROGRESS', payload: merged })
        }
        // 如果服务端有本地没有的数据，回写到本地
        if (JSON.stringify(merged) !== JSON.stringify(localProgress)) {
          saveLocalProgress(merged)
        }
      })
      .catch(() => {
        // 网络错误时静默失败，使用本地进度
      })
    return () => { cancelled = true }
  }, [])

  const completeExercise = (lessonId, difficulty, exerciseId) => {
    dispatch({
      type: 'COMPLETE_EXERCISE',
      payload: { lessonId, difficulty, exerciseId },
    })
  }

  const resetProgress = () => {
    dispatch({ type: 'RESET_PROGRESS' })
  }

  const isExerciseCompleted = (lessonId, difficulty, exerciseId) => {
    return !!progress[lessonId]?.[difficulty]?.[exerciseId]
  }

  const getLessonProgress = (lessonId) => {
    const lessonData = progress[lessonId] || {}
    let completed = 0
    for (const diff of ['basic', 'intermediate', 'challenge']) {
      const d = lessonData[diff] || {}
      completed += Object.values(d).filter(Boolean).length
    }
    return { completed, lessonData }
  }

  return (
    <AppContext.Provider
      value={{
        progress,
        completeExercise,
        resetProgress,
        isExerciseCompleted,
        getLessonProgress,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useProgress() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useProgress must be used within AppProvider')
  return ctx
}
