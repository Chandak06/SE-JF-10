import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getQuizById, type QuizDetail } from '../services/quizService';
import styles from './QuizViewPage.module.css';

export default function QuizViewPage() {
  const { id } = useParams<{ id: string }>();
  const [quiz, setQuiz] = useState<QuizDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    if (!id) {
      void Promise.resolve().then(() => {
        if (!isCancelled) {
          setError('Invalid quiz identifier.');
          setLoading(false);
        }
      });
      return () => {
        isCancelled = true;
      };
    }

    void getQuizById(id)
      .then((data) => {
        if (!isCancelled) {
          setQuiz(data);
          setError(null);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          setError(
            err instanceof Error ? err.message : 'Unable to load quiz details.'
          );
          setLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className={styles.page}>
        <p className={styles.status} role="status">
          Loading quiz details…
        </p>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className={styles.page}>
        <Link to="/quizzes" className={styles.backLink}>
          ← Back to Quizzes
        </Link>
        <div className={styles.alertError} role="alert">
          <h2>Quiz Unavailable</h2>
          <p>{error ?? 'Quiz could not be found.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Link to="/quizzes" className={styles.backLink}>
        ← Back to Quizzes
      </Link>

      <article className={styles.headerCard}>
        <span className={styles.badge}>{quiz.subject}</span>
        <h1 className={styles.title}>{quiz.title}</h1>

        <div className={styles.metaRow}>
          <div className={styles.metaItem}>
            <strong>Questions:</strong> {quiz.questionCount}
          </div>
          {quiz.createdAt && (
            <div className={styles.metaItem}>
              <strong>Created:</strong>{' '}
              {new Date(quiz.createdAt).toLocaleDateString()}
            </div>
          )}
        </div>
      </article>

      <section aria-labelledby="quiz-questions-heading">
        <div className={styles.questionsHeader}>
          <h2 id="quiz-questions-heading" className={styles.sectionTitle}>
            Questions Overview ({quiz.questionCount})
          </h2>
          <span className={styles.securityNote}>
            Discovery view · Answer keys are hidden
          </span>
        </div>

        <div className={styles.questionList}>
          {quiz.questions.map((question, index) => (
            <article key={question.id} className={styles.questionCard}>
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
                  {typeof question.marks === 'number' && (
                    <span className={styles.marksBadge}>
                      {question.marks} mark{question.marks === 1 ? '' : 's'}
                    </span>
                  )}
                </div>
              </div>

              <p className={styles.questionText}>{question.questionText}</p>

              <div className={styles.optionsList}>
                {question.options.map((option) => (
                  <div key={option.id} className={styles.optionItem}>
                    <span className={styles.optionId}>{option.id}.</span>
                    <span>{option.text}</span>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
