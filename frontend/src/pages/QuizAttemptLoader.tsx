
import { useEffect, useState } from 'react'
import QuizAttemptPage from './QuizAttemptPage'
import { loadQuizForAttempt, type LoadedQuiz } from '../services/quizAttemptDataService'
import styles from './QuizAttemptPage.module.css'

type LoadState =
  | { status: 'loading' }
  | { status: 'ready'; quiz: LoadedQuiz }
  | { status: 'error'; message: string }

interface QuizAttemptLoaderProps {
  quizId: string
}

export default function QuizAttemptLoader({
  quizId
}: QuizAttemptLoaderProps) {
  const [state, setState] = useState<LoadState>({
    status: 'loading'
  })

  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    let active = true

    setState({ status: 'loading' })

    void loadQuizForAttempt(quizId)
      .then(quiz => {
        if (active) {
          setState({ status: 'ready', quiz })
        }
      })
      .catch(error => {
        if (active) {
          setState({
            status: 'error',
            message: error instanceof Error
              ? error.message
              : 'Unable to load quiz.'
          })
        }
      })

    return () => {
      active = false
    }
  }, [quizId, retryCount])

  if (state.status === 'loading' ||
      (state.status === 'ready' && state.quiz.quizId !== quizId)) {
    return (
      <div className={styles.page}>
        <div className={styles.shell}>
          <header className={styles.examHeader}>
            <h1 className={styles.title}>Preparing your quiz</h1>
            <p role="status" className={styles.subtitle}>
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

            <p role="alert" className={styles.subtitle}>
              {state.message}
            </p>

            <button
              type="button"
              className={styles.navButton}
              onClick={() => setRetryCount(count => count + 1)}
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
