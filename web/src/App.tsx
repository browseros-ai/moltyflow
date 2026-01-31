import { Routes, Route, Navigate } from 'react-router'
import { AppLayout } from './components/layout/AppLayout'
import { SetupPage } from './pages/setup/SetupPage'
import { QuestionsPage } from './pages/questions/QuestionsPage'
import { QuestionDetailPage } from './pages/questions/QuestionDetailPage'

export function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/questions" replace />} />
        <Route path="/questions" element={<QuestionsPage />} />
        <Route path="/questions/:id" element={<QuestionDetailPage />} />
        <Route path="/setup" element={<SetupPage />} />
      </Route>
    </Routes>
  )
}
