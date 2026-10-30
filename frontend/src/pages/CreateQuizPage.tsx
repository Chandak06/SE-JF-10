import { useEffect, useRef, useState } from 'react';
import {
  createQuiz,
  fetchQuestionBankForQuiz,
  type QuizQuestionSummary
} from '../services/quizService';
import styles from './CreateQuizPage.module.css';

export default function CreateQuizPage() {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);

  // Filter state for question picker
  const [filterSubject, setFilterSubject] = useState('');
  const [filterTopic, setFilterTopic] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');

  // Questions loaded for picker
  const [availableQuestions, setAvailableQuestions] = useState<
    QuizQuestionSummary[]
  >([]);
  const [initialLoadingQuestions, setLoadingQuestions] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const filterKey = JSON.stringify([filterSubject.trim(), filterTopic.trim(), filterDifficulty]);
  const [resolvedFilter, setResolvedFilter] = useState<string | null>(null);
  const loadingQuestions = initialLoadingQuestions || resolvedFilter !== filterKey;
  const currentFetchError = resolvedFilter === filterKey ? fetchError : null;

  // Form submission state
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const activeRequestId = useRef(0);

  useEffect(() => {
    const reqId = ++activeRequestId.current;
    let isCancelled = false;

    void fetchQuestionBankForQuiz({
      subject: filterSubject.trim() || undefined,
      topic: filterTopic.trim() || undefined,
      difficulty: filterDifficulty || undefined
    })
      .then((data) => {
        if (!isCancelled && reqId === activeRequestId.current) {
          setAvailableQuestions(data);
          setResolvedFilter(filterKey);
          setFetchError(null);
          setLoadingQuestions(false);
        }
      })
      .catch((err) => {
        if (!isCancelled && reqId === activeRequestId.current) {
          setFetchError(
            err instanceof Error ? err.message : 'Failed to load questions.'
          );
          setAvailableQuestions([]);
          setResolvedFilter(filterKey);
          setLoadingQuestions(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [filterSubject, filterTopic, filterDifficulty, filterKey]);

  function toggleQuestionSelection(id: string) {
    setSelectedQuestionIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  function handleSelectAll() {
    const currentFilteredIds = availableQuestions.map((q) => q.id);
    setSelectedQuestionIds((prev) => {
      const merged = new Set([...prev, ...currentFilteredIds]);
      return Array.from(merged);
    });
  }

  function handleDeselectAll() {
    const currentFilteredIds = new Set(availableQuestions.map((q) => q.id));
    setSelectedQuestionIds((prev) =>
      prev.filter((id) => !currentFilteredIds.has(id))
    );
  }

  function clearFilters() {
    setFilterSubject('');
    setFilterTopic('');
    setFilterDifficulty('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!title.trim()) {
      setFormError('Please provide a quiz title.');
      return;
    }

    if (!subject.trim()) {
      setFormError('Please specify a subject.');
      return;
    }

    if (selectedQuestionIds.length === 0) {
      setFormError('Please select at least one question from the Question Bank.');
      return;
    }

    setSubmitting(true);
    try {
      const created = await createQuiz({
        title: title.trim(),
        subject: subject.trim(),
        questionIds: selectedQuestionIds
      });

      setFormSuccess(
        `Quiz "${created.title}" created successfully with ${created.questionCount} question(s)!`
      );
      setTitle('');
      setSubject('');
      setSelectedQuestionIds([]);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'Failed to create quiz.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.kicker}>Quiz Authoring</div>
        <h1 className={styles.title}>Create New Quiz</h1>
        <p className={styles.subtitle}>
          Assemble an objective quiz for student practice by selecting questions
          from the Question Bank.
          {' '}Scoring awards one point per correct answer.
        </p>
      </header>

      <form className={styles.formCard} onSubmit={(e) => void handleSubmit(e)}>
        {formError && (
          <div className={styles.alertError} role="alert">
            {formError}
          </div>
        )}
        {formSuccess && (
          <div className={styles.alertSuccess} role="status">
            {formSuccess}
          </div>
        )}

        <div className={styles.fieldGroup}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="quiz-title">
              Quiz Title <span aria-hidden="true">*</span>
            </label>
            <input
              id="quiz-title"
              className={styles.input}
              type="text"
              placeholder="e.g. Computer Networks Midterm Practice"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={submitting}
              maxLength={150}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="quiz-subject">
              Subject <span aria-hidden="true">*</span>
            </label>
            <input
              id="quiz-subject"
              className={styles.input}
              type="text"
              placeholder="e.g. Computer Networks"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={submitting}
              maxLength={100}
            />
          </div>
        </div>

        <section className={styles.pickerSection}>
          <div className={styles.pickerHeader}>
            <h2 className={styles.pickerTitle}>
              Select Questions from Question Bank
            </h2>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span className={styles.selectedCountBadge}>
                {selectedQuestionIds.length} question(s) selected
              </span>
              {!loadingQuestions && !currentFetchError && availableQuestions.length > 0 && (
                <>
                  <button
                    type="button"
                    className={styles.clearBtn}
                    onClick={handleSelectAll}
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    className={styles.clearBtn}
                    onClick={handleDeselectAll}
                  >
                    Deselect All
                  </button>
                </>
              )}
            </div>
          </div>

          <div className={styles.filterBar}>
            <input
              className={styles.input}
              type="text"
              placeholder="Filter by subject..."
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              aria-label="Filter questions by subject"
            />
            <input
              className={styles.input}
              type="text"
              placeholder="Filter by topic..."
              value={filterTopic}
              onChange={(e) => setFilterTopic(e.target.value)}
              aria-label="Filter questions by topic"
            />
            <select
              className={styles.select}
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              aria-label="Filter questions by difficulty"
            >
              <option value="">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
            {(filterSubject || filterTopic || filterDifficulty) && (
              <button
                type="button"
                className={styles.clearBtn}
                onClick={clearFilters}
              >
                Clear Filters
              </button>
            )}
          </div>

          {currentFetchError && (
            <div className={styles.alertError} role="alert">
              {currentFetchError}
            </div>
          )}

          {loadingQuestions ? (
            <div className={styles.emptyState}>
              <p>Loading Question Bank questions...</p>
            </div>
          ) : currentFetchError ? null : availableQuestions.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No questions found matching the selected filters.</p>
            </div>
          ) : (
            <div className={styles.questionList} role="group" aria-label="Available questions picker">
              {availableQuestions.map((question) => {
                const isSelected = selectedQuestionIds.includes(question.id);
                return (
                  <div
                    key={question.id}
                    className={`${styles.questionCard} ${
                      isSelected ? styles.selected : ''
                    }`}
                    onClick={() => toggleQuestionSelection(question.id)}
                  >
                    <input
                      type="checkbox"
                      className={styles.checkbox}
                      checked={isSelected}
                      onChange={() => toggleQuestionSelection(question.id)}
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Select question: ${question.questionText}`}
                    />
                    <div className={styles.cardBody}>
                      <p className={styles.cardQuestionText}>
                        {question.questionText}
                      </p>
                      <div className={styles.tagsRow}>
                        {question.difficulty && (
                          <span
                            className={`${styles.badge} ${
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
                        {question.subject && (
                          <span className={styles.tagMeta}>
                            <strong>Subject:</strong> {question.subject}
                          </span>
                        )}
                        {question.topic && (
                          <span className={styles.tagMeta}>
                            <strong>Topic:</strong> {question.topic}
                          </span>
                        )}
                        {question.marks !== undefined && (
                          <span className={styles.tagMeta}>
                            <strong>Question Bank marks (reference):</strong> {question.marks}
                          </span>
                        )}
                        <span className={styles.tagMeta}>
                          ({question.options.length} options)
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <div className={styles.actionsBar}>
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={submitting}
          >
            {submitting ? 'Creating Quiz...' : 'Create Quiz'}
          </button>
        </div>
      </form>
    </div>
  );
}
