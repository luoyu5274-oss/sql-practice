import { createContext, useContext, useReducer, useEffect } from 'react'

const AppContext = createContext(null)

const STORAGE_KEY = 'sql-practice-progress'

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveProgress(progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
}

function reducer(state, action) {
  switch (action.type) {
    case 'COMPLETE_EXERCISE': {
      const { lessonId, difficulty, exerciseId } = action.payload
      const newState = { ...state }
      if (!newState[lessonId]) newState[lessonId] = {}
      if (!newState[lessonId][difficulty]) newState[lessonId][difficulty] = {}
      newState[lessonId][difficulty][exerciseId] = true
      saveProgress(newState)
      return newState
    }
    case 'RESET_PROGRESS': {
      saveProgress({})
      return {}
    }
    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [progress, dispatch] = useReducer(reducer, null, loadProgress)

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
    let total = 0
    for (const diff of ['basic', 'intermediate', 'challenge']) {
      const d = lessonData[diff] || {}
      completed += Object.values(d).filter(Boolean).length
      // We don't know total without exercises data, caller computes
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
