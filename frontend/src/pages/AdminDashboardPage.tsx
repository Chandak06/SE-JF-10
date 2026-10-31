import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { currentUser, moderationKinds, type ModerationKind } from '../services/authService'
import styles from './AdminDashboardPage.module.css'

export default function AdminDashboardPage() {
  const [resources, setResources] = useState<ModerationKind[]>([])
  const [busy, setBusy] = useState(true)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const reload = useCallback(() => { setBusy(true); setError(''); setRetry(value => value + 1) }, [])
  useEffect(() => {
    let active = true
    void (async () => {
      const user = await currentUser()
      if (user.role !== 'admin') throw new Error('Administrator access is required.')
      const kinds = await moderationKinds()
      if (active) setResources(kinds)
    })().catch((reason: unknown) => { if (active) { setResources([]); setError(reason instanceof Error ? reason.message : 'Unable to load the dashboard.') } })
      .finally(() => { if (active) setBusy(false) })
    return () => { active = false }
  }, [retry])
  return <section className={styles.page} aria-labelledby="admin-title">
    <h1 id="admin-title">Administrator Dashboard</h1>
    <p>Manage the question bank and keep shared learning resources appropriate.</p>
    {busy && <p role="status">Loading administrator tools…</p>}
    {error && <div role="alert"><p>{error}</p><button onClick={reload}>Try again</button></div>}
    {!busy && !error && <div className={styles.grid}>
      {(['materials', 'questions', 'quizzes'] as const).map(kind => <article key={kind}>
        <h2>{kind === 'materials' ? 'Study Material Moderation' : kind === 'questions' ? 'Question Moderation' : 'Quiz Moderation'}</h2>
        <p>Review content and confirm removal before it becomes unavailable to students.</p>
        {resources.includes(kind) ? <Link to={'/admin/moderation?kind=' + kind}>Moderate {kind}</Link> : <p role="status">{kind === 'quizzes' ? 'Quiz module integration is pending.' : 'This moderation module is unavailable.'}</p>}
      </article>)}
    </div>}
  </section>
}
