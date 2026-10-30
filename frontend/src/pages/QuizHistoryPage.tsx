
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import {
  getAttemptHistory,
  type HistoryPage,
  type HistoryAttempt
} from '../services/attemptHistoryService'

import styles from './QuizHistoryPage.module.css'

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; history: HistoryPage }

function formatDate(value: string | null) {
  if (!value) return 'Date unavailable'

  const date = new Date(value)

  return Number.isNaN(date.getTime())
    ? 'Date unavailable'
    : date.toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      })
}

function formatScore(value: number) {
  return Number.isInteger(value)
    ? String(value)
    : value.toFixed(1)
}

function AttemptCard({
  attempt
}: {
  attempt: HistoryAttempt
}) {
  return (
    <article className={styles.attemptCard}>
      <div className={styles.cardMain}>
        <span className={styles.subject}>
          {attempt.subject ?? 'General'}
        </span>

        <h3 className={styles.quizTitle}>
          {attempt.quizTitle}
        </h3>

        <p className={styles.date}>
          <span aria-hidden="true">◷</span>{' '}
          {formatDate(attempt.submittedAt)}
        </p>

        <p className={styles.reference}>
          Attempt: {attempt.attemptId}
        </p>
      </div>

      <div className={styles.cardStatistics}>
        <div className={styles.stat}>
          <strong>{formatScore(attempt.score)}</strong>
          <span>Score</span>
        </div>

        <div className={styles.stat}>
          <strong>
            {formatScore(attempt.percentage)}%
          </strong>
          <span>Percentage</span>
        </div>

        <div className={styles.stat}>
          <strong>{attempt.answersSubmitted}</strong>
          <span>Answers submitted</span>
        </div>
      </div>
    </article>
  )
}

function HistoryRequest({
  page,
  onPageChange,
  onRetry
}: {
  page: number
  onPageChange: (page: number) => void
  onRetry: () => void
}) {
  const [state, setState] = useState<LoadState>({
    status: 'loading'
  })

  useEffect(() => {
    let active = true

    void getAttemptHistory(page)
      .then(history => {
        if (active) {
          setState({ status: 'ready', history })
        }
      })
      .catch(error => {
        if (active) {
          setState({
            status: 'error',
            message: error instanceof Error
              ? error.message
              : 'Unable to load your attempts.'
          })
        }
      })

    return () => {
      active = false
    }
  }, [page])

  if (state.status === 'loading') {
    return (
      <div className={styles.messageCard}>
        <p role="status">Loading your attempt history…</p>
      </div>
    )
  }

  if (state.status === 'error') {
    return (
      <div className={styles.messageCard}>
        <h2>Unable to load history</h2>

        <p role="alert">{state.message}</p>

        <button
          type="button"
          className={styles.primaryButton}
          onClick={onRetry}
        >
          Try again
        </button>
      </div>
    )
  }

  const { history } = state

  if (history.attempts.length === 0) {
    return (
      <div className={styles.messageCard}>
        <div className={styles.emptyIcon}>◎</div>

        <h2>
          {history.total === 0
            ? 'No completed quizzes yet'
            : 'No attempts on this page'}
        </h2>

        <p>
          {history.total === 0
            ? 'Complete your first quiz to see your results here.'
            : 'Choose an earlier page to view your attempts.'}
        </p>

        <Link
          to="/quizzes"
          className={styles.primaryButton}
        >
          Browse quizzes
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className={styles.listHeading}>
        <h2>Completed attempts</h2>

        <span>
          {history.total} total{' '}
          {history.total === 1 ? 'attempt' : 'attempts'}
        </span>
      </div>

      <div className={styles.attemptList}>
        {history.attempts.map(attempt => (
          <AttemptCard
            key={attempt.attemptId}
            attempt={attempt}
          />
        ))}
      </div>

      {history.totalPages > 1 && (
        <nav
          className={styles.pagination}
          aria-label="History pages"
        >
          <button
            type="button"
            className={styles.pageButton}
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            ← Previous
          </button>

          <span className={styles.pageCount}>
            Page {history.page} of {history.totalPages}
          </span>

          <button
            type="button"
            className={styles.pageButton}
            disabled={page >= history.totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            Next →
          </button>
        </nav>
      )}
    </>
  )
}

export default function QuizHistoryPage() {
  const [page, setPage] = useState(1)
  const [retryCount, setRetryCount] = useState(0)

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <Link
          to="/dashboard"
          className={styles.backLink}
        >
          ← Back to dashboard
        </Link>

        <header className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>
              STUDENT PERFORMANCE
            </p>

            <h1>My quiz history</h1>

            <p>
              Explore your completed quizzes and track your
              previous scores, all saved securely to your account.
            </p>
          </div>

          <Link
            to="/quizzes"
            className={styles.heroButton}
          >
            Explore quizzes →
          </Link>
        </header>

        <HistoryRequest
          key={`${page}:${retryCount}`}
          page={page}
          onPageChange={setPage}
          onRetry={() => setRetryCount(value => value + 1)}
        />
      </div>
    </div>
  )
}
