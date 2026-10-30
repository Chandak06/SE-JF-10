import { useEffect, useState } from 'react'
import QuizAttemptPage from './QuizAttemptPage'
import { loadQuizForAttempt, type LoadedQuiz } from '../services/quizAttemptDataService'
import type { AttemptResult } from '../services/attemptService'
import styles from './QuizAttemptPage.module.css'

type LoadState =
  | { status: 'loading' }
  | { status: 'ready'; quiz: LoadedQuiz }
  | { status: 'error'; message: string }

interface QuizAttemptLoaderProps {
  quizId: string
  onSubmissionSuccess?: (result: AttemptResult, title: string) => void
}

interface QuizRequestProps extends QuizAttemptLoaderProps {
  onRetry: () => void
}

export default function QuizAttemptLoader({
  quizId,
  onSubmissionSuccess
}: QuizAttemptLoaderProps) {
  const [retryCount, setRetryCount] = useState(0)

  return (
    <QuizAttemptRequest
      key={`${quizId}:${retryCount}`}
      quizId={quizId}
      onSubmissionSuccess={onSubmissionSuccess}
      onRetry={() => setRetryCount(count => count + 1)}
    />
  )
}

function QuizAttemptRequest({
  quizId,
  onSubmissionSuccess,
  onRetry
}: QuizRequestProps) {
  const [state, setState] = useState<LoadState>({ status: 'loading' })

  useEffect(() => {
    let active = true

    void loadQuizForAttempt(quizId)
      .then(quiz => {
        if (!active) return

        if (quiz.quizId.toLowerCase() !== quizId.toLowerCase()) {
          setState({
            status: 'error',
            message: 'The requested quiz could not be verified.'
          })
          return
        }

        setState({ status: 'ready', quiz })
      })
      .catch(error => {
        if (!active) return

        setState({
          status: 'error',
          message:
            error instanceof Error ? error.message : 'Unable to load quiz.'
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
            <h1 className={styles.title}>Preparing your quiz</h1>
            <p role="status" className={styles.subtitle}>Loading questions securely...</p>
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
            <h1 className={styles.title}>Unable to open quiz</h1>
            <p role="alert" className={styles.subtitle}>{state.message}</p>
            <button type="button" className={styles.navButton} onClick={onRetry}>
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
      onSubmissionSuccess={result =>
        onSubmissionSuccess?.(result, state.quiz.title)
      }
    />
  )
}
