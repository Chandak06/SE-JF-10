import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { getAttemptHistory, type HistoryPage } from '../services/attemptHistoryService'
import { calculateAttemptInsights } from '../services/attemptInsights'
import { downloadAttemptHistoryCsv } from '../services/attemptHistoryCsv'
import styles from './QuizInsightsPage.module.css'

type RequestState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; page: HistoryPage }

function percent(value: number): string {
  return `${Number.isInteger(value) ? value : value.toFixed(1)}%`
}

function InsightsContent({ page }: { page: HistoryPage }) {
  const insights = useMemo(() => calculateAttemptInsights(page.attempts), [page.attempts])
  const scope = page.total > page.attempts.length
    ? `Based on your ${page.attempts.length} most recent attempts out of ${page.total}`
    : `Based on all ${page.attempts.length} saved attempts`

  if (page.attempts.length === 0) {
    return (
      <section className={styles.empty}>
        <span aria-hidden="true" className={styles.emptyGlyph}>◉</span>
        <h2>No quiz results to analyze yet</h2>
        <p>Complete a quiz and return here to see how your performance develops.</p>
        <Link to="/quizzes" className={styles.primaryLink}>Find a quiz</Link>
      </section>
    )
  }

  return (
    <>
      <div className={styles.overviewHeading}>
        <div>
          <p className={styles.eyebrow}>AT A GLANCE</p>
          <h2>Your performance snapshot</h2>
          <p className={styles.scope}>{scope}</p>
        </div>
        <button
          type="button"
          className={styles.exportButton}
          onClick={() => downloadAttemptHistoryCsv(page.attempts)}
        >
          <span aria-hidden="true">↓</span> Export shown attempts (CSV)
        </button>
      </div>

      <section className={styles.metricGrid} aria-label="Performance summary">
        <article className={styles.metricCard}>
          <span>Attempts analyzed</span>
          <strong>{insights.count}</strong>
          <small>Completed submissions</small>
        </article>
        <article className={styles.metricCard}>
          <span>Average score rate</span>
          <strong>{percent(insights.averagePercentage)}</strong>
          <small>Across analyzed attempts</small>
        </article>
        <article className={styles.metricCard}>
          <span>Best result</span>
          <strong>{percent(insights.bestPercentage)}</strong>
          <small>Highest saved percentage</small>
        </article>
        <article className={styles.metricCard}>
          <span>Latest result</span>
          <strong>{insights.latestPercentage === null ? '—' : percent(insights.latestPercentage)}</strong>
          <small>Most recent completed quiz</small>
        </article>
      </section>

      <div className={styles.contentGrid}>
        <section className={styles.panel} aria-labelledby="trend-title">
          <div className={styles.panelHeader}>
            <div>
              <p className={styles.eyebrow}>PROGRESS</p>
              <h2 id="trend-title">Recent score trend</h2>
            </div>
            <span className={styles.panelNote}>Oldest → newest</span>
          </div>
          {insights.trend.length > 0 ? (
            <>
              <div className={styles.chart} role="img" aria-label={`Recent percentage scores: ${insights.trend.map(p => percent(p.percentage)).join(', ')}`}>
                {insights.trend.map(point => (
                  <div key={point.id} className={styles.chartColumn}>
                    <span className={styles.barValue}>{Math.round(point.percentage)}%</span>
                    <div className={styles.barTrack}>
                      <div className={styles.bar} style={{ height: `${point.percentage}%` }} />
                    </div>
                    <span className={styles.barLabel}>{point.label}</span>
                  </div>
                ))}
              </div>
              <p className={styles.chartFootnote}>Up to the last 12 dated attempts. Percentages come directly from saved server results.</p>
            </>
          ) : (
            <p className={styles.panelEmpty}>Dated quiz attempts are required to show a trend.</p>
          )}
        </section>

        <section className={styles.panel} aria-labelledby="subjects-title">
          <div className={styles.panelHeader}>
            <div>
              <p className={styles.eyebrow}>BREAKDOWN</p>
              <h2 id="subjects-title">Performance by subject</h2>
            </div>
          </div>
          <div className={styles.subjectList}>
            {insights.subjects.map(subject => (
              <div key={subject.subject} className={styles.subjectRow}>
                <div className={styles.subjectMeta}>
                  <strong>{subject.subject}</strong>
                  <span>{subject.attempts} {subject.attempts === 1 ? 'attempt' : 'attempts'}</span>
                </div>
                <div className={styles.subjectProgress} aria-label={`${subject.subject}: average ${percent(subject.averagePercentage)}`}>
                  <div style={{ width: `${subject.averagePercentage}%` }} />
                </div>
                <div className={styles.subjectScore}>{percent(subject.averagePercentage)} avg</div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <p className={styles.disclaimer}>
        These insights summarize the saved results returned by your account's history API. They do not predict future scores or show answer keys.
      </p>
    </>
  )
}

function InsightsRequest({ onRetry }: { onRetry: () => void }) {
  const [state, setState] = useState<RequestState>({ status: 'loading' })

  useEffect(() => {
    let active = true
    void getAttemptHistory(1, 50)
      .then(page => {
        if (active) setState({ status: 'ready', page })
      })
      .catch((error: unknown) => {
        if (active) setState({
          status: 'error',
          message: error instanceof Error ? error.message : 'Unable to load performance insights.'
        })
      })
    return () => { active = false }
  }, [])

  if (state.status === 'loading') {
    return <div className={styles.loading} role="status">Loading your performance insights…</div>
  }

  if (state.status === 'error') {
    return (
      <section className={styles.empty}>
        <h2>Could not load your insights</h2>
        <p role="alert">{state.message}</p>
        <button type="button" className={styles.retryButton} onClick={onRetry}>Try again</button>
      </section>
    )
  }

  return <InsightsContent page={state.page} />
}

export default function QuizInsightsPage() {
  const [retry, setRetry] = useState(0)

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <nav className={styles.breadcrumbs} aria-label="Section navigation">
          <Link to="/dashboard">Dashboard</Link>
          <span aria-hidden="true">/</span>
          <Link to="/attempt-history">Quiz history</Link>
          <span aria-hidden="true">/</span>
          <span>Insights</span>
        </nav>

        <header className={styles.hero}>
          <div>
            <p className={styles.heroEyebrow}>MY LEARNING OVERVIEW</p>
            <h1>Know your progress.</h1>
            <p>Understand your recent quiz performance, spot strong subjects, and see how your scores change over time.</p>
          </div>
          <div className={styles.heroMark} aria-hidden="true"><span>↗</span></div>
        </header>

        <InsightsRequest key={retry} onRetry={() => setRetry(n => n + 1)} />
      </div>
    </div>
  )
}
