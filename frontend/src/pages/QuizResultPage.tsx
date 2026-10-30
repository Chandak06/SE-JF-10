
import type { CSSProperties } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import type { AttemptResult } from '../services/attemptService'
import styles from './QuizResultPage.module.css'

interface ResultNavigationState {
  title?: string
  result: AttemptResult
}

const validId = /^[0-9a-fA-F]{24}$/

function isRecord(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value)
  )
}

function isNonNegativeNumber(
  value: unknown
): value is number {
  return (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    value >= 0
  )
}

function parseResult(
  value: unknown
): ResultNavigationState | null {
  if (!isRecord(value) || !isRecord(value.result)) {
    return null
  }

  const raw = value.result

  const attemptId = raw.attemptId
  const quizId = raw.quizId
  const score = raw.score
  const total = raw.total
  const percentage = raw.percentage
  const correct = raw.correct
  const incorrect = raw.incorrect
  const unanswered = raw.unanswered

  if (
    typeof attemptId !== 'string' ||
    !validId.test(attemptId) ||
    typeof quizId !== 'string' ||
    !validId.test(quizId)
  ) {
    return null
  }

  if (
    !isNonNegativeNumber(score) ||
    !isNonNegativeNumber(total) ||
    !isNonNegativeNumber(percentage) ||
    !isNonNegativeNumber(correct) ||
    !isNonNegativeNumber(incorrect) ||
    !isNonNegativeNumber(unanswered)
  ) {
    return null
  }

  if (
    percentage > 100 ||
    score > total ||
    !Number.isInteger(correct) ||
    !Number.isInteger(incorrect) ||
    !Number.isInteger(unanswered)
  ) {
    return null
  }

  const result: AttemptResult = {
    attemptId,
    quizId,
    score,
    total,
    percentage,
    correct,
    incorrect,
    unanswered
  }

  return {
    result,
    title:
      typeof value.title === 'string' && value.title.trim()
        ? value.title
        : undefined
  }
}

function formatNumber(value: number) {
  return Number.isInteger(value)
    ? String(value)
    : value.toFixed(1)
}

export default function QuizResultPage() {
  const { id, attemptId } = useParams<{
    id: string
    attemptId: string
  }>()

  const location = useLocation()
  const navigation = parseResult(location.state)

  // Only show results received after successful submission.
  if (
    !navigation ||
    !id ||
    !attemptId ||
    navigation.result.quizId !== id ||
    navigation.result.attemptId !== attemptId
  ) {
    return (
      <div className={styles.page}>
        <main className={styles.emptyCard}>
          <span className={styles.eyebrow}>
            QUIZ RESULTS
          </span>

          <h1>Result unavailable</h1>

          <p>
            Open this screen after successfully submitting a quiz.
            Previous results will be available through attempt history
            once that feature is connected.
          </p>

          <Link
            to="/quizzes"
            className={styles.primaryButton}
          >
            Browse quizzes
          </Link>
        </main>
      </div>
    )
  }

  const { result, title } = navigation

  const percentage = Math.min(
    100,
    Math.max(0, result.percentage)
  )

  const totalQuestions =
    result.correct +
    result.incorrect +
    result.unanswered

  const barSegments = [
    {
      label: 'Correct',
      value: result.correct,
      color: styles.correctSegment
    },
    {
      label: 'Incorrect',
      value: result.incorrect,
      color: styles.incorrectSegment
    },
    {
      label: 'Unanswered',
      value: result.unanswered,
      color: styles.unansweredSegment
    }
  ]

  return (
    <div className={styles.page}>
      <main className={styles.container}>
        <Link
          to="/quizzes"
          className={styles.backLink}
        >
          ← Back to quizzes
        </Link>

        <section
          className={styles.hero}
          aria-labelledby="result-title"
        >
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>
              ATTEMPT COMPLETED
            </span>

            <h1 id="result-title">
              Quiz results
            </h1>

            <p className={styles.quizTitle}>
              {title ?? 'Your completed quiz'}
            </p>

            <p className={styles.heroDescription}>
              Your responses were submitted, evaluated and
              saved by the quiz server.
            </p>

            <span className={styles.successPill}>
              ✓ Submission successful
            </span>
          </div>

          <div
            className={styles.scoreRing}
            style={
              {
                '--score': `${percentage}%`
              } as CSSProperties
            }
          >
            <div className={styles.scoreRingInner}>
              <span className={styles.ringValue}>
                {formatNumber(result.percentage)}%
              </span>

              <span className={styles.ringLabel}>
                Final percentage
              </span>
            </div>
          </div>
        </section>

        <section
          className={styles.breakdown}
          aria-label="Score breakdown"
        >
          <div className={styles.headingRow}>
            <div>
              <span className={styles.eyebrow}>
                YOUR PERFORMANCE
              </span>

              <h2>
                Attempt overview
              </h2>
            </div>

            <span className={styles.points}>
              {formatNumber(result.score)} /{' '}
              {formatNumber(result.total)} points
            </span>
          </div>

          <div className={styles.metrics}>
            <div className={styles.metric}>
              <span
                className={`${styles.metricIcon} ${styles.correctIcon}`}
              >
                ✓
              </span>

              <strong>{result.correct}</strong>
              <span>Correct</span>
            </div>

            <div className={styles.metric}>
              <span
                className={`${styles.metricIcon} ${styles.incorrectIcon}`}
              >
                ×
              </span>

              <strong>{result.incorrect}</strong>
              <span>Incorrect</span>
            </div>

            <div className={styles.metric}>
              <span
                className={`${styles.metricIcon} ${styles.unansweredIcon}`}
              >
                –
              </span>

              <strong>{result.unanswered}</strong>
              <span>Unanswered</span>
            </div>

            <div className={styles.metric}>
              <span
                className={`${styles.metricIcon} ${styles.totalIcon}`}
              >
                #
              </span>

              <strong>{totalQuestions}</strong>
              <span>Total questions</span>
            </div>
          </div>

          <h3 className={styles.distributionTitle}>
            Answer distribution
          </h3>

          <div
            className={styles.distribution}
            role="img"
            aria-label={`${result.correct} correct, ${result.incorrect} incorrect, ${result.unanswered} unanswered`}
          >
            {barSegments
              .filter(segment => segment.value > 0)
              .map(segment => (
                <div
                  key={segment.label}
                  className={segment.color}
                  style={{
                    flexGrow: segment.value
                  }}
                  title={`${segment.label}: ${segment.value}`}
                />
              ))}
          </div>

          <div className={styles.legend}>
            <span>
              <i className={styles.legendCorrect} />
              Correct
            </span>

            <span>
              <i className={styles.legendIncorrect} />
              Incorrect
            </span>

            <span>
              <i className={styles.legendUnanswered} />
              Unanswered
            </span>
          </div>
        </section>

        <footer className={styles.footer}>
          <div>
            <span className={styles.eyebrow}>
              ATTEMPT REFERENCE
            </span>

            <p className={styles.attemptId}>
              {result.attemptId}
            </p>
          </div>

          <div className={styles.actions}>
            <Link
              to="/attempt-history"
              className={styles.secondaryButton}
            >
              My attempt history
            </Link>
            <Link
              to="/dashboard"
              className={styles.secondaryButton}
            >
              Dashboard
            </Link>

            <Link
              to="/quizzes"
              className={styles.primaryButton}
            >
              Explore more quizzes →
            </Link>
          </div>
        </footer>
      </main>
    </div>
  )
}
