import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  createQuestion,
  listQuestions,
  type Question,
  type QuestionOption
} from '../services/questionService';
import styles from './QuestionBankPage.module.css';

const DEFAULT_OPTIONS: QuestionOption[] = [
  { id: 'A', text: '' },
  { id: 'B', text: '' },
  { id: 'C', text: '' },
  { id: 'D', text: '' }
];

export default function QuestionBankPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [listingError, setListingError] = useState('');
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form states
  const [questionText, setQuestionText] = useState('');
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Easy');
  const [marks, setMarks] = useState(1);
  const [options, setOptions] = useState<QuestionOption[]>(DEFAULT_OPTIONS);
  const [correctAnswer, setCorrectAnswer] = useState('A');

  // Filter states
  const [filterSubject, setFilterSubject] = useState('');
  const [filterTopic, setFilterTopic] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');

  // Reference for active filters and request sequence tracking to prevent race conditions
  const filtersRef = useRef({
    subject: filterSubject,
    topic: filterTopic,
    difficulty: filterDifficulty
  });
  const activeRequestId = useRef(0);

  useEffect(() => {
    filtersRef.current = {
      subject: filterSubject,
      topic: filterTopic,
      difficulty: filterDifficulty
    };
  }, [filterSubject, filterTopic, filterDifficulty]);

  useEffect(() => {
    if (!successMessage) return;
    const timeout = window.setTimeout(() => setSuccessMessage(''), 5000);
    return () => window.clearTimeout(timeout);
  }, [successMessage]);

  useEffect(() => {
    filtersRef.current = {
      subject: filterSubject,
      topic: filterTopic,
      difficulty: filterDifficulty
    };
    const reqId = ++activeRequestId.current;
    void listQuestions({
      subject: filterSubject || undefined,
      topic: filterTopic || undefined,
      difficulty: filterDifficulty || undefined
    })
      .then((items) => {
        if (reqId === activeRequestId.current) {
          const current = filtersRef.current;
          if (
            (current.subject || '') === (filterSubject || '') &&
            (current.topic || '') === (filterTopic || '') &&
            (current.difficulty || '') === (filterDifficulty || '')
          ) {
            setQuestions(items);
            setListingError(''); // Clear listing error on success
          }
        }
      })
      .catch((err: unknown) => {
        if (reqId === activeRequestId.current) {
          setListingError(
            err instanceof Error ? err.message : 'Failed to load questions.'
          );
        }
      })
      .finally(() => {
        if (reqId === activeRequestId.current) {
          setLoading(false);
        }
      });
  }, [filterSubject, filterTopic, filterDifficulty]);

  function handleOptionTextChange(id: string, text: string) {
    setOptions((current) =>
      current.map((opt) => (opt.id === id ? { ...opt, text } : opt))
    );
  }

  function resetForm() {
    setQuestionText('');
    setSubject('');
    setTopic('');
    setDifficulty('Easy');
    setMarks(1);
    setOptions(DEFAULT_OPTIONS);
    setCorrectAnswer('A');
    setFormError('');
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError('');
    setSuccessMessage('');

    // Client-side validations
    if (!questionText.trim()) {
      setFormError('Question text is required.');
      return;
    }
    if (!subject.trim()) {
      setFormError('Subject is required.');
      return;
    }
    if (!topic.trim()) {
      setFormError('Topic is required.');
      return;
    }
    const emptyOption = options.find((opt) => !opt.text.trim());
    if (emptyOption) {
      setFormError(`Option ${emptyOption.id} text is required.`);
      return;
    }
    if (!options.some((opt) => opt.id === correctAnswer)) {
      setFormError('Selected correct answer must match one of the options.');
      return;
    }

    setBusy(true);
    try {
      await createQuestion({
        questionText: questionText.trim(),
        subject: subject.trim(),
        topic: topic.trim(),
        difficulty,
        marks,
        options: options.map((opt) => ({ id: opt.id, text: opt.text.trim() })),
        correctAnswer
      });

      setSuccessMessage('MCQ question created successfully.');
      resetForm();
      setFormOpen(false);
      // Query with the latest current filters after saving
      const reqId = ++activeRequestId.current;
      const current = filtersRef.current;
      void listQuestions({
        subject: current.subject || undefined,
        topic: current.topic || undefined,
        difficulty: current.difficulty || undefined
      })
        .then((items) => {
          if (reqId === activeRequestId.current) {
            setQuestions(items);
            setListingError('');
          }
        })
        .catch((err: unknown) => {
          if (reqId === activeRequestId.current) {
            setListingError(
              err instanceof Error ? err.message : 'Failed to load questions.'
            );
          }
        })
        .finally(() => {
          if (reqId === activeRequestId.current) {
            setLoading(false);
          }
        });
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'Failed to create question.'
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.kicker}>ADMINISTRATION</p>
          <h1 className={styles.title}>Question Bank</h1>
          <p className={styles.subtitle}>
            Create, manage, and filter multiple-choice questions for quiz assessments.
          </p>
        </div>
        {!formOpen && (
          <button
            type="button"
            className={styles.addBtn}
            onClick={() => {
              setSuccessMessage('');
              setFormError('');
              setFormOpen(true);
            }}
          >
            + Add New MCQ
          </button>
        )}
      </header>

      {successMessage && (
        <div className={styles.successBanner} role="status">
          <span>{successMessage}</span>
          <button type="button" aria-label="Dismiss success message" onClick={() => setSuccessMessage('')}>×</button>
        </div>
      )}

      {listingError && !formOpen && (
        <div className={styles.errorBanner} role="alert">
          {listingError}
        </div>
      )}

      {formOpen && (
        <section className={styles.card} aria-label="Add MCQ Form">
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Add New Multiple Choice Question</h2>
            <button
              type="button"
              className={styles.cancelBtn}
              disabled={busy}
              onClick={() => {
                resetForm();
                setFormOpen(false);
              }}
            >
              Cancel
            </button>
          </div>

          {formError && (
            <div className={styles.errorBanner} role="alert" style={{ marginBottom: '1rem' }}>
              {formError}
            </div>
          )}

          <form className={styles.form} onSubmit={handleSubmit}>
            <label className={styles.field}>
              Question Text *
              <textarea
                name="questionText"
                className={styles.textarea}
                placeholder="Enter the question statement here..."
                required
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
              />
            </label>

            <div className={styles.row}>
              <label className={styles.field}>
                Subject *
                <input
                  name="subject"
                  type="text"
                  className={styles.input}
                  placeholder="e.g. Computer Networks"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </label>

              <label className={styles.field}>
                Topic *
                <input
                  name="topic"
                  type="text"
                  className={styles.input}
                  placeholder="e.g. Transport Layer"
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </label>

              <label className={styles.field}>
                Difficulty *
                <select
                  name="difficulty"
                  className={styles.select}
                  value={difficulty}
                  onChange={(e) =>
                    setDifficulty(e.target.value as 'Easy' | 'Medium' | 'Hard')
                  }
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </label>

              <label className={styles.field}>
                Marks *
                <input
                  name="marks"
                  type="number"
                  min={1}
                  className={styles.input}
                  value={marks}
                  onChange={(e) => setMarks(Number(e.target.value))}
                />
              </label>
            </div>

            <div className={styles.optionsSection}>
              <p className={styles.optionsTitle}>
                Options & Correct Answer Selection *
              </p>
              {options.map((opt) => (
                <div key={opt.id} className={styles.optionRow}>
                  <input
                    type="radio"
                    name="correctAnswer"
                    id={`radio-${opt.id}`}
                    className={styles.optionRadio}
                    checked={correctAnswer === opt.id}
                    onChange={() => setCorrectAnswer(opt.id)}
                    aria-label={`Mark Option ${opt.id} as correct`}
                  />
                  <label htmlFor={`radio-${opt.id}`} className={styles.optionBadge}>
                    {opt.id}
                  </label>
                  <input
                    type="text"
                    name={`option-${opt.id}`}
                    className={`${styles.input} ${styles.optionInput}`}
                    placeholder={`Enter text for Option ${opt.id}...`}
                    value={opt.text}
                    required
                    onChange={(e) => handleOptionTextChange(opt.id, e.target.value)}
                  />
                </div>
              ))}
            </div>

            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.cancelBtn}
                disabled={busy}
                onClick={() => {
                  resetForm();
                  setFormOpen(false);
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={busy}
              >
                {busy ? 'Saving...' : 'Add Question'}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Filter Bar */}
      <div className={styles.filtersBar}>
        <div className={styles.filterItem}>
          <label className={styles.filterLabel} htmlFor="filter-subject">
            Filter by Subject
          </label>
          <input
            id="filter-subject"
            type="text"
            className={styles.input}
            maxLength={100}
            placeholder="All subjects"
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
          />
        </div>

        <div className={styles.filterItem}>
          <label className={styles.filterLabel} htmlFor="filter-topic">
            Filter by Topic
          </label>
          <input
            id="filter-topic"
            type="text"
            className={styles.input}
            maxLength={100}
            placeholder="All topics"
            value={filterTopic}
            onChange={(e) => setFilterTopic(e.target.value)}
          />
        </div>

        <div className={styles.filterItem}>
          <label className={styles.filterLabel} htmlFor="filter-difficulty">
            Filter by Difficulty
          </label>
          <select
            id="filter-difficulty"
            className={styles.select}
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
          >
            <option value="">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Questions list */}
      <section className={styles.questionsList} aria-label="Question Bank Items">
        {loading ? (
          <p className={styles.emptyState}>Loading Question Bank...</p>
        ) : questions.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No questions found matching your filter criteria.</p>
          </div>
        ) : (
          questions.map((q, idx) => (
            <article key={q.id} className={styles.questionItem}>
              <div className={styles.questionHeader}>
                <h3 className={styles.questionHeading}>
                  {idx + 1}. {q.questionText}
                </h3>
                <div className={styles.tagRow}>
                  <span className={styles.tag}>{q.subject}</span>
                  <span className={styles.tag}>{q.topic}</span>
                  <span
                    className={`${styles.tag} ${
                      styles[`tagDifficulty${q.difficulty}`]
                    }`}
                  >
                    {q.difficulty} ({q.marks} {q.marks === 1 ? 'mark' : 'marks'})
                  </span>
                </div>
              </div>

              <div className={styles.optionsGrid}>
                {q.options.map((opt) => (
                  <div
                    key={opt.id}
                    className={`${styles.optionCard} ${
                      opt.id === q.correctAnswer ? styles.correctOption : ''
                    }`}
                  >
                    <span className={styles.optionBadge}>{opt.id}</span>
                    <span>{opt.text}</span>
                    {opt.id === q.correctAnswer && (
                      <span title="Correct Answer"> ✓</span>
                    )}
                  </div>
                ))}
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
