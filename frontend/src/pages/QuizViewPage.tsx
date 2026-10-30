
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import {
  getQuizById,
  type QuizDetail
} from '../services/quizService'

import styles from './QuizViewPage.module.css'

type QuizLoadState =
  | {
      id: string
      status: 'loading'
    }
  | {
      id: string
      status: 'ready'
      quiz: QuizDetail
    }
  | {
      id: string
      status: 'error'
      message: string
    }

export default function QuizViewPage() {
  const { id } = useParams<{ id: string }>()

  const [state, setState] = useState<QuizLoadState>({
    id: id ?? '',
    status: 'loading'
  })

  useEffect(() => {
    if (!id) return

    let active = true

    void getQuizById(id)
      .then(data => {
        if (!active) return

        setState({
          id,
          status: 'ready',
          quiz: data
        })
      })
      .catch(error => {
        if (!active) return

        setState({
          id,
          status: 'error',
          message:
            error instanceof Error
              ? error.message
              : 'Unable to load quiz details.'
        })
      })

    return () => {
      active = false
    }
  }, [id])

  /*
   * If the URL changes, old quiz information
   * is not displayed while the new quiz loads.
   */
  const currentState: QuizLoadState =
    id && state.id === id
      ? state
      : {
          id: id ?? '',
          status: 'loading'
        }

  if (!id || currentState.status === 'error') {
    const errorMessage = !id
      ? 'Invalid quiz identifier.'
      : currentState.status === 'error'
        ? currentState.message
        : 'Quiz could not be found.'

    return (
      <div className={styles.page}>
        <Link
          to="/quizzes"
          className={styles.backLink}
        >
          ← Back to Quizzes
        </Link>

        <div
          className={styles.alertError}
          role="alert"
        >
          <h2>Quiz Unavailable</h2>
          <p>{errorMessage}</p>
        </div>
      </div>
    )
  }

  if (currentState.status === 'loading') {
    return (
      <div className={styles.page}>
        <p
          className={styles.status}
          role="status"
        >
          Loading quiz details…
        </p>
      </div>
    )
  }

  const quiz = currentState.quiz

  return (
    <div className={styles.page}>
      <Link
        to="/quizzes"
        className={styles.backLink}
      >
        ← Back to Quizzes
      </Link>

      <article className={styles.headerCard}>
        <span className={styles.badge}>
          {quiz.subject}
        </span>

        <h1 className={styles.title}>
          {quiz.title}
        </h1>

        <div className={styles.metaRow}>
          <div className={styles.metaItem}>
            <strong>Questions:</strong>{' '}
            {quiz.questionCount}
          </div>

          {quiz.createdAt && (
            <div className={styles.metaItem}>
              <strong>Created:</strong>{' '}
              {new Date(
                quiz.createdAt
              ).toLocaleDateString()}
            </div>
          )}
        </div>
      </article>

      {/* CSMQ-41: Real quiz attempt navigation */}
      <div className={styles.startQuizActions}>
        {quiz.questionCount > 0 ? (
          <Link
            to={`/quizzes/${quiz.id}/attempt`}
            className={styles.startQuizButton}
          >
            Start Quiz

            <span aria-hidden="true">
              →
            </span>
          </Link>
        ) : (
          <p role="status">
            This quiz has no questions available yet.
          </p>
        )}
      </div>

      <section aria-labelledby="quiz-questions-heading">
        <div className={styles.questionsHeader}>
          <h2
            id="quiz-questions-heading"
            className={styles.sectionTitle}
          >
            Questions Overview ({quiz.questionCount})
          </h2>

          <span className={styles.securityNote}>
            Discovery view · Answer keys are hidden
          </span>
        </div>

        <div className={styles.questionList}>
          {quiz.questions.map((question, index) => (
            <article
              key={question.id}
              className={styles.questionCard}
            >
              <div className={styles.cardTop}>
                <span className={styles.questionNumber}>
                  Question {index + 1}
                </span>

                <div className={styles.tagGroup}>
                  {question.difficulty && (
                    <span
                      className={`${styles.difficultyBadge} ${
                        question.difficulty === 'Easy'
                          ? styles.badgeEasy
                          : question.difficulty === 'Medium'
                            ? styles.badgeMedium
                            : styles.badgeHard
                      }`}
                    >
                      {question.difficulty}
                    </span>
                  )}

                  <span className={styles.marksBadge}>1 point if correct</span>
                </div>
              </div>

              <p className={styles.questionText}>
                {question.questionText}
              </p>

              <div className={styles.optionsList}>
                {question.options.map(option => (
                  <div
                    key={option.id}
                    className={styles.optionItem}
                  >
                    <span className={styles.optionId}>
                      {option.id}.
                    </span>

                    <span>{option.text}</span>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
