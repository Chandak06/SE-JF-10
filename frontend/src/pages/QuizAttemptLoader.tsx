
import { useEffect, useState } from 'react'

import QuizAttemptPage from './QuizAttemptPage'

import {
  loadQuizForAttempt,
  type LoadedQuiz
} from '../services/quizAttemptDataService'

import styles from './QuizAttemptPage.module.css'

type LoadState =
  | { status: 'loading' }
  | { status: 'ready'; quiz: LoadedQuiz }
  | { status: 'error'; message: string }

interface QuizAttemptLoaderProps {
  quizId: string
}

interface QuizRequestProps {
  quizId: string
  onRetry: () => void
}

/*
 * The outer component manages retries.
 * Changing the key creates a new request component
 * with its own initial loading state.
 */
export default function QuizAttemptLoader({
  quizId
}: QuizAttemptLoaderProps) {
  const [retryCount, setRetryCount] = useState(0)

  return (
    <QuizAttemptRequest
      key={`${quizId}:${retryCount}`}
      quizId={quizId}
      onRetry={() => {
        setRetryCount(count => count + 1)
      }}
    />
  )
}

function QuizAttemptRequest({
  quizId,
  onRetry
}: QuizRequestProps) {
  const [state, setState] = useState<LoadState>({
    status: 'loading'
  })

  useEffect(() => {
    let active = true

    void loadQuizForAttempt(quizId)
      .then(quiz => {
        if (!active) return

        if (quiz.quizId !== quizId) {
          setState({
            status: 'error',
            message: 'The requested quiz could not be verified.'
          })
          return
        }

        setState({
          status: 'ready',
          quiz
        })
      })
      .catch(error => {
        if (!active) return

        setState({
          status: 'error',
          message:
            error instanceof Error
              ? error.message
              : 'Unable to load quiz.'
        })
      })

    return () => {
      active = false
    }
  }, [quizId])

  if (state.status === 'loading') {
    return (
      <div className={styles.page}>
        <div className={styles.shell}>
          <header className={styles.examHeader}>
            <h1 className={styles.title}>
              Preparing your quiz
            </h1>

            <p
              role="status"
              className={styles.subtitle}
            >
              Loading questions securely...
            </p>
          </header>
        </div>
      </div>
    )
  }

  if (state.status === 'error') {
    return (
      <div className={styles.page}>
        <div className={styles.shell}>
          <header className={styles.examHeader}>
            <h1 className={styles.title}>
              Unable to open quiz
            </h1>

            <p
              role="alert"
              className={styles.subtitle}
            >
              {state.message}
            </p>

            <button
              type="button"
              className={styles.navButton}
              onClick={onRetry}
            >
              Try again
            </button>
          </header>
        </div>
      </div>
    )
  }

  return (
    <QuizAttemptPage
      key={state.quiz.quizId}
      quizId={state.quiz.quizId}
      title={state.quiz.title}
      questions={state.quiz.questions}
    />
  )
}
