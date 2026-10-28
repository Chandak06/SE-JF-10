import { Navigate, Route, Routes } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import MaterialsPage from './pages/MaterialsPage'
import AdminPage from './pages/AdminPage'
import QuizAttemptPage from './pages/QuizAttemptPage'
import QuestionBankPage from './pages/QuestionBankPage'
import styles from './App.module.css'
import { getSessionToken, getSessionUser, hasStoredSession, restoreSession } from './services/authService'

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
  const [ready, setReady] = useState(() => !!getSessionToken() || !hasStoredSession())
  useEffect(() => {
    if (ready) return
    let mounted = true
    void restoreSession().finally(() => { if (mounted) setReady(true) })
    return () => { mounted = false }
  }, [ready])
  if (!ready) return <main><p role="status">Restoring session…</p></main>
  return <div className={styles.app}><Navbar /><main className={styles.main}><Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/materials" element={<MaterialsRoute />} />
    <Route path="/quiz-attempt" element={<AttemptRoute />} />
    <Route path="/admin" element={<AdminPage />} />
    <Route path="/questions" element={<QuestionsRoute />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></main></div>
}
