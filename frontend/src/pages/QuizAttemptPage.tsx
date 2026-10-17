import { useEffect, useMemo, useState } from 'react'
import styles from './QuizAttemptPage.module.css'
import { getSessionUser } from '../services/authService'
import { readQuizDraft } from '../services/quizDraft'

interface QuizOption {
  id: string
  text: string
}

interface QuizQuestion {
  id: string
  questionText: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  marks: number
  options: QuizOption[]
}

const QUIZ_DURATION = 20 * 60

const questions: QuizQuestion[] = [
  {
    id: 'q1',
    questionText:
      'Which protocol provides reliable, connection-oriented communication?',
    difficulty: 'Easy',
    marks: 1,
    options: [
      { id: 'A', text: 'UDP' },
      { id: 'B', text: 'TCP' },
      { id: 'C', text: 'ARP' },
      { id: 'D', text: 'ICMP' }
    ]
  },
  {
    id: 'q2',
    questionText: 'Which data structure follows the FIFO principle?',
    difficulty: 'Easy',
    marks: 1,
    options: [
      { id: 'A', text: 'Stack' },
      { id: 'B', text: 'Queue' },
      { id: 'C', text: 'Tree' },
      { id: 'D', text: 'Graph' }
    ]
  },
  {
    id: 'q3',
    questionText:
      'Which normal form removes partial dependency on a composite key?',
    difficulty: 'Medium',
    marks: 1,
    options: [
      { id: 'A', text: '1NF' },
      { id: 'B', text: '2NF' },
      { id: 'C', text: '3NF' },
      { id: 'D', text: 'BCNF' }
    ]
  },
  {
    id: 'q4',
    questionText:
      'Which CPU scheduling algorithm can cause starvation when priorities are not adjusted?',
    difficulty: 'Medium',
    marks: 1,
    options: [
      { id: 'A', text: 'FCFS' },
      { id: 'B', text: 'Round Robin' },
      { id: 'C', text: 'Priority Scheduling' },
      { id: 'D', text: 'FIFO Scheduling' }
    ]
  },
  {
    id: 'q5',
    questionText:
      'Which traversal visits the root node before visiting its subtrees?',
    difficulty: 'Easy',
    marks: 1,
    options: [
      { id: 'A', text: 'Inorder' },
      { id: 'B', text: 'Preorder' },
      { id: 'C', text: 'Postorder' },
      { id: 'D', text: 'Level-order only' }
    ]
  },
  {
    id: 'q6',
    questionText:
      'Which database property ensures that a transaction is completed entirely or not at all?',
    difficulty: 'Medium',
    marks: 1,
    options: [
      { id: 'A', text: 'Consistency' },
      { id: 'B', text: 'Isolation' },
      { id: 'C', text: 'Atomicity' },
      { id: 'D', text: 'Durability' }
    ]
  },
  {
    id: 'q7',
    questionText:
      'Which layer of the OSI model is primarily responsible for routing packets between networks?',
    difficulty: 'Easy',
    marks: 1,
    options: [
      { id: 'A', text: 'Transport layer' },
      { id: 'B', text: 'Network layer' },
      { id: 'C', text: 'Session layer' },
      { id: 'D', text: 'Data-link layer' }
    ]
  },
  {
    id: 'q8',
    questionText:
      'What is the worst-case time complexity of binary search on a sorted array?',
    difficulty: 'Medium',
    marks: 1,
    options: [
      { id: 'A', text: 'O(1)' },
      { id: 'B', text: 'O(log n)' },
      { id: 'C', text: 'O(n)' },
      { id: 'D', text: 'O(n log n)' }
    ]
  },
  {
    id: 'q9',
    questionText:
      'Which technique allows multiple processes to appear to execute simultaneously on a single CPU?',
    difficulty: 'Medium',
    marks: 1,
    options: [
      { id: 'A', text: 'Context switching' },
      { id: 'B', text: 'Fragmentation' },
      { id: 'C', text: 'Segmentation only' },
      { id: 'D', text: 'Spooling only' }
    ]
  },
  {
    id: 'q10',
    questionText:
      'Which HTTP method is conventionally used to retrieve a resource without modifying it?',
    difficulty: 'Easy',
    marks: 1,
    options: [
      { id: 'A', text: 'POST' },
      { id: 'B', text: 'PATCH' },
      { id: 'C', text: 'GET' },
      { id: 'D', text: 'DELETE' }
    ]
  }
]

export default function QuizAttemptPage() {
  const draftKey = 'study-commons-quiz-responses:' + getSessionUser()!.id
  const [currentIndex, setCurrentIndex] = useState(0)

  const [responses, setResponses] = useState<Record<string, string>>(() => {
    try { return readQuizDraft(window.sessionStorage, draftKey, questions) } catch { return {} }
  })

  const [reviewQuestions, setReviewQuestions] = useState<Set<string>>(
    new Set()
  )

  const [timeLeft, setTimeLeft] = useState(QUIZ_DURATION)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const currentQuestion = questions[currentIndex]

  useEffect(() => {
    if (!submitted) {
      try { window.sessionStorage.setItem(draftKey, JSON.stringify(responses)) } catch { /* In-memory answers still work when storage is blocked. */ }
    }
  }, [responses, submitted, draftKey])

  useEffect(() => {
    if (submitted) {
      return
    }

    const timer = window.setInterval(() => {
      setTimeLeft(current => {
        if (current <= 1) {
          window.clearInterval(timer)
          return 0
        }

        return current - 1
      })
    }, 1000)

    return () => window.clearInterval(timer)
  }, [submitted])

  const answeredCount = Object.keys(responses).length
  const unansweredCount = questions.length - answeredCount
  const reviewCount = reviewQuestions.size

  const progress = useMemo(
    () => Math.round((answeredCount / questions.length) * 100),
    [answeredCount]
  )

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  function selectAnswer(questionId: string, optionId: string) {
    if (submitted) {
      return
    }

    setResponses(current => ({
      ...current,
      [questionId]: optionId
    }))
  }

  function clearResponse() {
    if (submitted) {
      return
    }

    setResponses(current => {
      const updated = { ...current }
      delete updated[currentQuestion.id]
      return updated
    })
  }

  function toggleReview() {
    if (submitted) {
      return
    }

    setReviewQuestions(current => {
      const updated = new Set(current)

      if (updated.has(currentQuestion.id)) {
        updated.delete(currentQuestion.id)
      } else {
        updated.add(currentQuestion.id)
      }

      return updated
    })
  }

  function goToQuestion(index: number) {
    setCurrentIndex(index)
  }

  function previousQuestion() {
    setCurrentIndex(current => Math.max(0, current - 1))
  }

  function nextQuestion() {
    setCurrentIndex(current =>
      Math.min(questions.length - 1, current + 1)
    )
  }

  function confirmSubmission() {
    setSubmitted(true)
    setShowSubmitModal(false)
    try { window.sessionStorage.removeItem(draftKey) } catch { /* Storage may be disabled. */ }
  }

  function paletteClass(question: QuizQuestion, index: number) {
    const classes = [styles.paletteButton]

    if (responses[question.id]) {
      classes.push(styles.paletteAnswered)
    }

    if (reviewQuestions.has(question.id)) {
      classes.push(styles.paletteReview)
    }

    if (index === currentIndex) {
      classes.push(styles.paletteCurrent)
    }

    return classes.join(' ')
  }

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.examHeader}>
          <div className={styles.headerTop}>
            <div>
              <p className={styles.eyebrow}>LIVE QUIZ SESSION</p>

              <h1 className={styles.title}>
                Computer Science Practice Quiz
              </h1>

              <p className={styles.subtitle}>
                10 sample questions · practice prototype · not sent for scoring
              </p>
            </div>

            <div className={styles.headerTools}>
              <div className={styles.autosave}>
                <span className={styles.autosaveDot} />
                Saved locally
              </div>

              <div
                className={styles.timer}
                aria-label={`${minutes} minutes ${seconds} seconds remaining`}
              >
                ⏱ {String(minutes).padStart(2, '0')}:
                {String(seconds).padStart(2, '0')}
              </div>
            </div>
          </div>

          <div className={styles.progressRow}>
            <div
              className={styles.progressTrack}
              aria-label={`${progress}% completed`}
            >
              <div
                className={styles.progressFill}
                style={{ width: `${progress}%` }}
              />
            </div>

            <span className={styles.progressText}>
              {progress}% complete
            </span>
          </div>
        </header>

        <div className={styles.workspace}>
          <main className={styles.questionPanel}>
            <div className={styles.questionTop}>
              <span className={styles.questionCount}>
                Question {currentIndex + 1} of {questions.length}
              </span>

              <div className={styles.questionBadges}>
                <span
                  className={`${styles.badge} ${styles.difficulty}`}
                >
                  {currentQuestion.difficulty}
                </span>

                <span className={styles.badge}>
                  +{currentQuestion.marks} mark
                </span>
              </div>
            </div>

            <h2 className={styles.questionText}>
              {currentQuestion.questionText}
            </h2>

            <div
              className={styles.options}
              role="radiogroup"
              aria-label={`Answers for question ${currentIndex + 1}`}
            >
              {currentQuestion.options.map(option => {
                const selected =
                  responses[currentQuestion.id] === option.id

                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    disabled={submitted}
                    className={`${styles.option} ${
                      selected ? styles.optionSelected : ''
                    }`}
                    onClick={() =>
                      selectAnswer(currentQuestion.id, option.id)
                    }
                  >
                    <span className={styles.optionKey}>
                      {option.id}
                    </span>

                    <span className={styles.optionText}>
                      {option.text}
                    </span>

                    <span className={styles.optionCheck}>
                      {selected ? '✓' : ''}
                    </span>
                  </button>
                )
              })}
            </div>

            <div className={styles.questionFooter}>
              <div className={styles.utilityRow}>
                <button
                  type="button"
                  className={styles.textButton}
                  disabled={
                    !responses[currentQuestion.id] || submitted
                  }
                  onClick={clearResponse}
                >
                  ↺ Clear response
                </button>

                <button
                  type="button"
                  disabled={submitted}
                  className={`${styles.reviewButton} ${
                    reviewQuestions.has(currentQuestion.id)
                      ? styles.reviewActive
                      : ''
                  }`}
                  onClick={toggleReview}
                >
                  {reviewQuestions.has(currentQuestion.id)
                    ? '◆ Marked for review'
                    : '◇ Mark for review'}
                </button>
              </div>

              <div className={styles.navigation}>
                <button
                  type="button"
                  className={styles.navButton}
                  disabled={currentIndex === 0}
                  onClick={previousQuestion}
                >
                  ← Previous
                </button>

                <button
                  type="button"
                  className={`${styles.navButton} ${styles.nextButton}`}
                  disabled={currentIndex === questions.length - 1}
                  onClick={nextQuestion}
                >
                  Next →
                </button>
              </div>
            </div>
          </main>

          <aside className={styles.sidebar}>
            <section className={styles.sidebarSection}>
              <h2 className={styles.sidebarTitle}>
                Question palette
              </h2>

              <p className={styles.sidebarHint}>
                Jump directly to any question
              </p>

              <div className={styles.palette}>
                {questions.map((question, index) => (
                  <button
                    key={question.id}
                    type="button"
                    className={paletteClass(question, index)}
                    onClick={() => goToQuestion(index)}
                    aria-label={`Go to question ${index + 1}`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              <div className={styles.legend}>
                <div className={styles.legendItem}>
                  <span
                    className={`${styles.legendDot} ${styles.legendAnswered}`}
                  />
                  Answered
                </div>

                <div className={styles.legendItem}>
                  <span className={styles.legendDot} />
                  Not answered
                </div>

                <div className={styles.legendItem}>
                  <span
                    className={`${styles.legendDot} ${styles.legendReview}`}
                  />
                  Marked for review
                </div>
              </div>
            </section>

            <section className={styles.sidebarSection}>
              <h2 className={styles.sidebarTitle}>
                Attempt overview
              </h2>

              <p className={styles.sidebarHint}>
                Your progress updates automatically
              </p>

              <div className={styles.stats}>
                <div className={styles.stat}>
                  <span className={styles.statValue}>
                    {answeredCount}
                  </span>
                  <span className={styles.statLabel}>
                    ANSWERED
                  </span>
                </div>

                <div className={styles.stat}>
                  <span className={styles.statValue}>
                    {unansweredCount}
                  </span>
                  <span className={styles.statLabel}>
                    UNANSWERED
                  </span>
                </div>

                <div className={styles.stat}>
                  <span className={styles.statValue}>
                    {reviewCount}
                  </span>
                  <span className={styles.statLabel}>
                    FOR REVIEW
                  </span>
                </div>

                <div className={styles.stat}>
                  <span className={styles.statValue}>
                    {questions.length}
                  </span>
                  <span className={styles.statLabel}>
                    TOTAL
                  </span>
                </div>
              </div>
            </section>

            <section className={styles.sidebarSection}>
              <button
                type="button"
                className={styles.submitButton}
                disabled={submitted}
                onClick={() => setShowSubmitModal(true)}
              >
                {submitted ? 'Quiz submitted' : 'Submit quiz'}
              </button>

              <p className={styles.submitNote}>
                Review unanswered and marked questions before
                submitting.
              </p>
            </section>
          </aside>
        </div>
      </div>

      {showSubmitModal && (
        <div
          className={styles.modalBackdrop}
          role="presentation"
          onMouseDown={() => setShowSubmitModal(false)}
        >
          <section
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="submit-dialog-title"
            onMouseDown={event => event.stopPropagation()}
          >
            <div className={styles.modalIcon}>✓</div>

            <h2 id="submit-dialog-title">
              Submit your quiz?
            </h2>

            <p>
              Once submitted, your responses will be locked for
              this prototype session. Check your attempt summary
              before continuing.
            </p>

            <div className={styles.modalSummary}>
              <div className={styles.modalStat}>
                <strong>{answeredCount}</strong>
                <span>Answered</span>
              </div>

              <div className={styles.modalStat}>
                <strong>{unansweredCount}</strong>
                <span>Unanswered</span>
              </div>

              <div className={styles.modalStat}>
                <strong>{reviewCount}</strong>
                <span>Review</span>
              </div>
            </div>

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={() => setShowSubmitModal(false)}
              >
                Continue reviewing
              </button>

              <button
                type="button"
                className={styles.confirmButton}
                onClick={confirmSubmission}
              >
                Submit quiz
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
