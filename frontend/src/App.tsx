
import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'

import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import MaterialsPage from './pages/MaterialsPage'
import AdminPage from './pages/AdminPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import StudentDashboardPage from './pages/StudentDashboardPage'
import QuizAttemptPage from './pages/QuizAttemptPage'
import QuizAttemptLoader from './pages/QuizAttemptLoader'
import QuestionBankPage from './pages/QuestionBankPage'
import CreateQuizPage from './pages/CreateQuizPage'
import QuizListPage from './pages/QuizListPage'
import QuizViewPage from './pages/QuizViewPage'

import styles from './App.module.css'

import {
  getSessionToken,
  getSessionUser,
  hasStoredSession,
  restoreSession
} from './services/authService'

function MaterialsRoute() {
  return getSessionToken()
    ? <MaterialsPage />
    : <Navigate to="/login" replace />
}

function StudentRoute({ children }: { children: ReactNode }) {
  if (!getSessionToken()) {
    return <Navigate to="/login" replace />
  }

  const role = getSessionUser()?.role

  if (role === 'student') {
    return children
  }

  return role === 'admin'
    ? <Navigate to="/admin" replace />
    : <Navigate to="/login" replace />
}

function AttemptRoute() {
  return (
    <StudentRoute>
      <QuizAttemptPage />
    </StudentRoute>
  )
}

function RealQuizAttemptRoute() {
  const { id } = useParams<{ id: string }>()

  if (!id) {
    return <Navigate to="/quizzes" replace />
  }

  return (
    <StudentRoute>
      <QuizAttemptLoader key={id} quizId={id} />
    </StudentRoute>
  )
}

function QuestionsRoute() {
  if (!getSessionToken()) {
    return <Navigate to="/login" replace />
  }

  return getSessionUser()?.role === 'admin'
    ? <QuestionBankPage />
    : <Navigate to="/dashboard" replace />
}

function AdminRoute({
  dashboard = false
}: {
  dashboard?: boolean
}) {
  if (!getSessionToken()) {
    return <Navigate to="/login" replace />
  }

  if (getSessionUser()?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  return dashboard
    ? <AdminDashboardPage />
    : <AdminPage />
}

function CreateQuizRoute() {
  return (
    <StudentRoute>
      <CreateQuizPage />
    </StudentRoute>
  )
}

function QuizzesRoute() {
  return (
    <StudentRoute>
      <QuizListPage />
    </StudentRoute>
  )
}

function QuizViewRoute() {
  const { id } = useParams<{ id: string }>()

  return (
    <StudentRoute>
      <QuizViewPage key={id} />
    </StudentRoute>
  )
}

export default function App() {
  const [ready, setReady] = useState(
    () => !!getSessionToken() || !hasStoredSession()
  )

  useEffect(() => {
    if (ready) return

    let mounted = true

    void restoreSession().finally(() => {
      if (mounted) {
        setReady(true)
      }
    })

    return () => {
      mounted = false
    }
  }, [ready])

  if (!ready) {
    return (
      <main>
        <p role="status">Restoring session…</p>
      </main>
    )
  }

  return (
    <div className={styles.app}>
      <Navbar />

      <main className={styles.main}>
        <Routes>
          <Route path="/" element={<HomePage />} />

          <Route path="/register" element={<RegisterPage />} />

          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/dashboard"
            element={
              <StudentRoute>
                <StudentDashboardPage />
              </StudentRoute>
            }
          />

          <Route
            path="/materials"
            element={<MaterialsRoute />}
          />

          {/* Sprint 1 sample quiz remains available */}
          <Route
            path="/quiz-attempt"
            element={<AttemptRoute />}
          />

          {/* Quiz discovery and creation */}
          <Route
            path="/quizzes"
            element={<QuizzesRoute />}
          />

          <Route
            path="/quizzes/:id"
            element={<QuizViewRoute />}
          />

          {/* CSMQ-41: Real MongoDB-backed quiz attempt */}
          <Route
            path="/quizzes/:id/attempt"
            element={<RealQuizAttemptRoute />}
          />

          <Route
            path="/create-quiz"
            element={<CreateQuizRoute />}
          />

          {/* Administrator routes */}
          <Route
            path="/admin"
            element={<AdminRoute dashboard />}
          />

          <Route
            path="/admin/moderation"
            element={<AdminRoute />}
          />

          <Route
            path="/questions"
            element={<QuestionsRoute />}
          />

          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />
        </Routes>
      </main>
    </div>
  )
}
