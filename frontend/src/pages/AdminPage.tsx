import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  currentUser,
  moderationKinds,
  moderationItems,
  removeItem,
  removeAllItems,
  type ModerationKind,
  type ModerationItem
} from '../services/authService'
import styles from './AdminPage.module.css'

function DeleteIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3m3 0-.8 13H6.8L6 7m4 4v5m4-5v5" /></svg>
}

export default function AdminPage() {
  const [params, setParams] = useSearchParams()
  const requested = params.get('kind')
  const latest = useRef(0)
  const live = useRef(true)
  const [loadedQuery, setLoadedQuery] = useState<string | undefined>(undefined)
  const [kinds, setKinds] = useState<ModerationKind[]>([])
  const [kind, setKind] = useState<ModerationKind>('materials')
  const [items, setItems] = useState<ModerationItem[]>([])
  const [filterOptions, setFilterOptions] = useState({ subjects: [] as string[], difficulties: [] as string[] })
  const [subjectFilter, setSubjectFilter] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState('')
  const [pending, setPending] = useState<ModerationItem | null>(null)
  const [pendingDeleteAll, setPendingDeleteAll] = useState(false)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(true)
  const [permitted, setPermitted] = useState(false)
  const queryKey = JSON.stringify([requested, subjectFilter, difficultyFilter])
  const loading = busy || loadedQuery !== queryKey

  useEffect(() => {
    let active = true
    live.current = true
    const requestId = ++latest.current

    async function load() {
      try {
        const user = await currentUser()
        if (user.role !== 'admin') throw new Error('Administrator access is required.')

        const available = await moderationKinds()
        if (requested && !available.includes(requested as ModerationKind)) {
          throw new Error('Requested content module is unavailable.')
        }

        const first = available.find(value => value === requested) ?? available[0]
        const listing = first ? await moderationItems(first, {
          subject: subjectFilter || undefined,
          difficulty: difficultyFilter || undefined
        }) : { items: [], filters: { subjects: [], difficulties: [] } }
        if (active && requestId === latest.current) {
          setKinds(available)
          if (first) setKind(first)
          setItems(listing.items)
          setFilterOptions(listing.filters)
          setPermitted(true)
          setMessage('')
        }
      } catch (error) {
        if (active && requestId === latest.current) {
          setPermitted(false)
          setItems([])
          setFilterOptions({ subjects: [], difficulties: [] })
          setMessage(error instanceof Error ? error.message : 'Unable to load moderation.')
        }
      } finally {
        if (active && requestId === latest.current) {
          setBusy(false)
          setLoadedQuery(queryKey)
        }
      }
    }

    void load()
    return () => { active = false; live.current = false }
  }, [requested, subjectFilter, difficultyFilter, queryKey])

  function selectCategory(next: ModerationKind) {
    setBusy(true)
    setPending(null)
    setPendingDeleteAll(false)
    setItems([])
    setSubjectFilter('')
    setDifficultyFilter('')
    setKind(next)
    setParams({ kind: next })
  }

  async function confirmRemoval() {
    if (!pending || loading) return
    const requestId = ++latest.current
    const removed = pending
    setBusy(true)
    try {
      await removeItem(kind, removed.id)
      if (live.current && requestId === latest.current) {
        setItems(rows => rows.filter(item => item.id !== removed.id))
        setPending(null)
        setMessage('Resource removed.')
      }
    } catch (error) {
      if (live.current && requestId === latest.current) {
        setMessage(error instanceof Error ? error.message : 'Removal failed. Try again.')
      }
    } finally {
      if (live.current && requestId === latest.current) setBusy(false)
    }
  }

  async function confirmDeleteAll() {
    if (loading) return
    const requestId = ++latest.current
    setBusy(true)
    try {
      const removedCount = await removeAllItems(kind)
      if (live.current && requestId === latest.current) {
        setItems([])
        setFilterOptions({ subjects: [], difficulties: [] })
        setSubjectFilter('')
        setDifficultyFilter('')
        setPendingDeleteAll(false)
        setMessage(`Deleted ${removedCount} ${kind === 'materials' ? 'study materials' : kind}.`)
      }
    } catch (error) {
      if (live.current && requestId === latest.current) {
        setMessage(error instanceof Error ? error.message : 'Delete all failed. Try again.')
      }
    } finally {
      if (live.current && requestId === latest.current) setBusy(false)
    }
  }

  const categoryLabel = kind === 'materials' ? 'study material' : kind === 'questions' ? 'question' : 'quiz'

  return <main className={styles.page}>
    <section className={styles.panel} aria-labelledby="moderation-title">
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>ADMINISTRATION</p>
          <h1 id="moderation-title">Content moderation</h1>
          <p className={styles.description}>Filter resources and remove individual items or clear the selected content type.</p>
        </div>
        {permitted && <label className={styles.categoryField}>
          <span>Content type</span>
          <select value={kind} disabled={loading} onChange={event => selectCategory(event.target.value as ModerationKind)}>
            {kinds.map(value => <option key={value} value={value}>{value === 'materials' ? 'Study materials' : value === 'questions' ? 'Questions' : 'Quizzes'}</option>)}
          </select>
        </label>}
      </header>

      {message && <p className={styles.notice} role="status">{message}</p>}
      {loading && <p className={styles.state} role="status">Loading moderation items…</p>}
      {!loading && permitted && <>
        {(kind === 'materials' || kind === 'questions') && <div className={styles.filters} aria-label="Moderation filters">
          <label className={styles.filterField}>
            <span>Subject</span>
            <select value={subjectFilter} onChange={event => setSubjectFilter(event.target.value)}>
              <option value="">All subjects</option>
              {filterOptions.subjects.map(subject => <option key={subject} value={subject}>{subject}</option>)}
            </select>
          </label>
          {kind === 'questions' && <label className={styles.filterField}>
            <span>Difficulty</span>
            <select value={difficultyFilter} onChange={event => setDifficultyFilter(event.target.value)}>
              <option value="">All difficulties</option>
              {filterOptions.difficulties.map(difficulty => <option key={difficulty} value={difficulty}>{difficulty}</option>)}
            </select>
          </label>}
        </div>}
        <div className={styles.listHeader}>
          <h2>{kind === 'materials' ? 'Study materials' : kind === 'questions' ? 'Questions' : 'Quizzes'}</h2>
          <div className={styles.listActions}>
            <span>{items.length} {items.length === 1 ? 'item' : 'items'} shown</span>
            <button className={styles.deleteAllButton} type="button" disabled={loading || items.length === 0} onClick={() => setPendingDeleteAll(true)}><DeleteIcon />Delete all</button>
          </div>
        </div>
        {!items.length
          ? <p className={styles.state}>{subjectFilter || difficultyFilter
            ? 'No content matches the selected filters.'
            : `No ${kind === 'materials' ? 'study materials' : kind} available for moderation.`}</p>
          : <ul className={styles.itemList} aria-label={`${kind} available for moderation`}>
            {items.map(item => <li className={styles.item} key={item.id}>
                <span className={styles.itemTitle}>{item.title}</span>
                <div className={styles.itemActions}>
                  <button
                    className={`${styles.iconButton} ${styles.deleteButton}`}
                    type="button"
                    aria-label={`Delete ${item.title}`}
                    title={`Delete ${categoryLabel}`}
                    disabled={loading}
                    onClick={() => setPending(item)}
                  ><DeleteIcon /></button>
                </div>
              </li>)}
          </ul>}
      </>}

      {(pending || pendingDeleteAll) && <div className={styles.dialogBackdrop}>
        <section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="remove-heading">
          <p className={styles.eyebrow}>CONFIRM ACTION</p>
          <h2 id="remove-heading">{pendingDeleteAll ? `Delete all ${kind === 'materials' ? 'study materials' : kind}?` : `Delete this ${categoryLabel}?`}</h2>
          <p>{pendingDeleteAll
            ? `This removes every active ${kind === 'materials' ? 'study material' : kind.slice(0, -1)} in this content type, including items hidden by the current filters. This cannot be undone from this page.`
            : <><strong>{pending?.title}</strong> will no longer be available to students.</>}</p>
          <div className={styles.dialogActions}>
            <button className={styles.cancelButton} type="button" disabled={loading} onClick={() => { setPending(null); setPendingDeleteAll(false) }}>Cancel</button>
            <button className={styles.confirmButton} type="button" disabled={loading} onClick={() => void (pendingDeleteAll ? confirmDeleteAll() : confirmRemoval())}>{loading ? 'Deleting…' : pendingDeleteAll ? 'Delete all' : 'Confirm removal'}</button>
          </div>
        </section>
      </div>}
    </section>
  </main>
}
