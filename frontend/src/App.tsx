import { Navigate, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import MaterialsPage from './pages/MaterialsPage'
import QuizAttemptPage from './pages/QuizAttemptPage'
import QuestionBankPage from './pages/QuestionBankPage'
import styles from './App.module.css'
import { getSessionToken, getSessionUser } from './services/authService'

function MaterialsRoute() {
  return getSessionToken() ? <MaterialsPage /> : <Navigate to="/login" replace />
}
function AttemptRoute() {
  if (!getSessionToken()) return <Navigate to="/login" replace />
  return getSessionUser()?.role === 'student' ? <QuizAttemptPage /> : <Navigate to="/materials" replace />
}
function QuestionsRoute() {
  if (!getSessionToken()) return <Navigate to="/login" replace />
  return getSessionUser()?.role === 'admin' ? <QuestionBankPage /> : <Navigate to="/materials" replace />
}
export default function App() {
  return <div className={styles.app}><Navbar /><main className={styles.main}><Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/materials" element={<MaterialsRoute />} />
    <Route path="/quiz-attempt" element={<AttemptRoute />} />
    <Route path="/questions" element={<QuestionsRoute />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></main></div>
}
