import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import TutorialPage from './pages/TutorialPage'
import FreePracticePage from './pages/FreePracticePage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/tutorial/:lessonId?" element={<TutorialPage />} />
      <Route path="/free-practice" element={<FreePracticePage />} />
      <Route path="*" element={<HomePage />} />
    </Routes>
  )
}
