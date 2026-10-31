import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  currentUser,
  moderationKinds,
  moderationItems,
  removeItem,
  type ModerationKind,
  type ModerationItem
} from '../services/authService'
import styles from './AdminPage.module.css'

function SelectIcon({ selected }: { selected: boolean }) {
  return selected
    ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6" /></svg>
    : <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" /></svg>
}

function DeleteIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3m3 0-.8 13H6.8L6 7m4 4v5m4-5v5" /></svg>
}

export default function AdminPage() {
  const [params, setParams] = useSearchParams()
  const requested = params.get('kind')
  const latest = useRef(0)
  const live = useRef(true)
  const [loadedCategory, setLoadedCategory] = useState<string | null | undefined>(undefined)
  const [kinds, setKinds] = useState<ModerationKind[]>([])
  const [kind, setKind] = useState<ModerationKind>('materials')
  const [items, setItems] = useState<ModerationItem[]>([])
  const [selected, setSelected] = useState<ModerationItem | null>(null)
  const [pending, setPending] = useState<ModerationItem | null>(null)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(true)
  const [permitted, setPermitted] = useState(false)
  const loading = busy || loadedCategory !== requested

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
        const rows = first ? await moderationItems(first) : []
        if (active && requestId === latest.current) {
          setKinds(available)
          if (first) setKind(first)
          setItems(rows)
          setSelected(null)
          setPermitted(true)
          setMessage('')
        }
      } catch (error) {
        if (active && requestId === latest.current) {
          setPermitted(false)
          setMessage(error instanceof Error ? error.message : 'Unable to load moderation.')
        }
      } finally {
        if (active && requestId === latest.current) {
          setBusy(false)
          setLoadedCategory(requested)
        }
      }
    }

    void load()
    return () => { active = false; live.current = false }
  }, [requested])

  function selectCategory(next: ModerationKind) {
    setBusy(true)
    setPending(null)
    setSelected(null)
    setItems([])
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
        setSelected(current => current?.id === removed.id ? null : current)
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

  const categoryLabel = kind === 'materials' ? 'study material' : kind === 'questions' ? 'question' : 'quiz'

  return <main className={styles.page}>
    <section className={styles.panel} aria-labelledby="moderation-title">
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>ADMINISTRATION</p>
          <h1 id="moderation-title">Content moderation</h1>
          <p className={styles.description}>Select a resource to review it, or delete it after confirmation.</p>
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
        <div className={styles.listHeader}>
          <h2>{kind === 'materials' ? 'Study materials' : kind === 'questions' ? 'Questions' : 'Quizzes'}</h2>
          <span>{items.length} {items.length === 1 ? 'item' : 'items'}</span>
        </div>
        {!items.length
          ? <p className={styles.state}>No {kind === 'materials' ? 'study materials' : kind} available for moderation.</p>
          : <ul className={styles.itemList} aria-label={`${kind} available for moderation`}>
            {items.map(item => {
              const isSelected = selected?.id === item.id
              return <li className={`${styles.item} ${isSelected ? styles.itemSelected : ''}`} key={item.id}>
                <span className={styles.itemTitle}>{item.title}</span>
                <div className={styles.itemActions}>
                  <button
                    className={`${styles.iconButton} ${isSelected ? styles.selectActive : ''}`}
                    type="button"
                    aria-label={isSelected ? `Deselect ${item.title}` : `Select ${item.title}`}
                    aria-pressed={isSelected}
                    title={isSelected ? 'Deselect item' : 'Select item'}
                    disabled={loading}
                    onClick={() => setSelected(isSelected ? null : item)}
                  ><SelectIcon selected={isSelected} /></button>
                  <button
                    className={`${styles.iconButton} ${styles.deleteButton}`}
                    type="button"
                    aria-label={`Delete ${item.title}`}
                    title={`Delete ${categoryLabel}`}
                    disabled={loading}
                    onClick={() => { setSelected(item); setPending(item) }}
                  ><DeleteIcon /></button>
                </div>
              </li>
            })}
          </ul>}
        {selected && !pending && <p className={styles.selectionNote} role="status">Selected: {selected.title}</p>}
      </>}

      {pending && <div className={styles.dialogBackdrop}>
        <section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="remove-heading">
          <p className={styles.eyebrow}>CONFIRM ACTION</p>
          <h2 id="remove-heading">Delete this {categoryLabel}?</h2>
          <p><strong>{pending.title}</strong> will no longer be available to students.</p>
          <div className={styles.dialogActions}>
            <button className={styles.cancelButton} type="button" disabled={loading} onClick={() => setPending(null)}>Cancel</button>
            <button className={styles.confirmButton} type="button" disabled={loading} onClick={() => void confirmRemoval()}>{loading ? 'Deleting…' : 'Delete'}</button>
          </div>
        </section>
      </div>}
    </section>
  </main>
}
