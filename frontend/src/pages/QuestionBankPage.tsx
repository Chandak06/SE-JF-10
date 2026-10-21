import { useCallback, useEffect, useState, type FormEvent } from 'react';
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
  const [errorMessage, setErrorMessage] = useState('');
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

  const fetchQuestions = useCallback(async () => {
    try {
      const items = await listQuestions({
        subject: filterSubject || undefined,
        topic: filterTopic || undefined,
        difficulty: filterDifficulty || undefined
      });
      setQuestions(items);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to load questions.'
      );
    } finally {
      setLoading(false);
    }
  }, [filterSubject, filterTopic, filterDifficulty]);

  useEffect(() => {
    let mounted = true;
    void listQuestions({
      subject: filterSubject || undefined,
      topic: filterTopic || undefined,
      difficulty: filterDifficulty || undefined
    })
      .then((items) => {
        if (mounted) setQuestions(items);
      })
      .catch((err: unknown) => {
        if (mounted) {
          setErrorMessage(
            err instanceof Error ? err.message : 'Failed to load questions.'
          );
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
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
    setErrorMessage('');
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Client-side validations
    if (!questionText.trim()) {
      setErrorMessage('Question text is required.');
      return;
    }
    if (!subject.trim()) {
      setErrorMessage('Subject is required.');
      return;
    }
    if (!topic.trim()) {
      setErrorMessage('Topic is required.');
      return;
    }
    const emptyOption = options.find((opt) => !opt.text.trim());
    if (emptyOption) {
      setErrorMessage(`Option ${emptyOption.id} text is required.`);
      return;
    }
    if (!options.some((opt) => opt.id === correctAnswer)) {
      setErrorMessage('Selected correct answer must match one of the options.');
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
      await fetchQuestions();
    } catch (err) {
      setErrorMessage(
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
              setErrorMessage('');
              setFormOpen(true);
            }}
          >
            + Add New MCQ
          </button>
        )}
      </header>

      {successMessage && (
        <div className={styles.successBanner} role="status">
          {successMessage}
        </div>
      )}

      {errorMessage && !formOpen && (
        <div className={styles.errorBanner} role="alert">
          {errorMessage}
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

          {errorMessage && (
            <div className={styles.errorBanner} role="alert" style={{ marginBottom: '1rem' }}>
              {errorMessage}
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
