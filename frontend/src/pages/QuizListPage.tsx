import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { searchQuizzes, type QuizSummary } from '../services/quizService';
import styles from './QuizListPage.module.css';

export default function QuizListPage() {
  const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');

  const activeRequestId = useRef(0);

  useEffect(() => {
    const reqId = ++activeRequestId.current;
    let isCancelled = false;

    void searchQuizzes({
      search: searchTerm.trim() || undefined,
      subject: subjectFilter.trim() || undefined
    })
      .then((data) => {
        if (!isCancelled && reqId === activeRequestId.current) {
          setQuizzes(data);
          setError(null);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!isCancelled && reqId === activeRequestId.current) {
          setError(
            err instanceof Error ? err.message : 'Unable to load quizzes.'
          );
          setLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [searchTerm, subjectFilter]);

  function handleClearFilters() {
    setSearchTerm('');
    setSubjectFilter('');
  }

  function handleRetry() {
    setLoading(true);
    setError(null);
    const reqId = ++activeRequestId.current;
    void searchQuizzes({
      search: searchTerm.trim() || undefined,
      subject: subjectFilter.trim() || undefined
    })
      .then((data) => {
        if (reqId === activeRequestId.current) {
          setQuizzes(data);
          setError(null);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (reqId === activeRequestId.current) {
          setError(
            err instanceof Error ? err.message : 'Unable to load quizzes.'
          );
          setLoading(false);
        }
      });
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <div className={styles.kicker}>Quiz Discovery</div>
          <h1 className={styles.title}>Available Quizzes</h1>
          <p className={styles.subtitle}>
            Explore peer-authored quizzes across subjects to practice and test your knowledge.
          </p>
        </div>
        <Link to="/create-quiz" className={styles.createBtn}>
          + Create Quiz
        </Link>
      </header>

      <section className={styles.searchBar} aria-label="Search and filter quizzes">
        <div className={styles.inputGroup}>
          <label htmlFor="search-title" className={styles.label}>
            Keyword Search
          </label>
          <input
            id="search-title"
            type="text"
            className={styles.input}
            placeholder="Search by quiz title…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="filter-subject" className={styles.label}>
            Subject Filter
          </label>
          <input
            id="filter-subject"
            type="text"
            className={styles.input}
            placeholder="Filter by subject…"
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
          />
        </div>

        {(searchTerm || subjectFilter) && (
          <button
            type="button"
            className={styles.clearBtn}
            onClick={handleClearFilters}
          >
            Clear Filters
          </button>
        )}
      </section>

      {error && (
        <div className={styles.alertError} role="alert">
          <span>{error}</span>
          <button type="button" className={styles.retryBtn} onClick={handleRetry}>
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <p className={styles.status} role="status">
          Loading quizzes…
        </p>
      ) : quizzes.length === 0 ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon} aria-hidden="true">
            📋
          </span>
          <h2 className={styles.emptyTitle}>No quizzes found</h2>
          <p className={styles.emptyDesc}>
            {searchTerm || subjectFilter
              ? 'No quizzes match your filter criteria. Try adjusting your search keywords.'
              : 'No quizzes have been published yet. Be the first to create one!'}
          </p>
        </div>
      ) : (
        <div className={styles.grid} aria-label="Quizzes list">
          {quizzes.map((quiz) => (
            <article key={quiz.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.cardSubjectBadge}>{quiz.subject}</span>
                <h2 className={styles.cardTitle}>{quiz.title}</h2>
                <div className={styles.cardMeta}>
                  {quiz.createdAt && (
                    <span>
                      Created on{' '}
                      {new Date(quiz.createdAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              <div className={styles.cardFooter}>
                <span className={styles.questionCount}>
                  {quiz.questionCount} question{quiz.questionCount === 1 ? '' : 's'}
                </span>
                <Link to={`/quizzes/${quiz.id}`} className={styles.viewBtn}>
                  View Details
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
