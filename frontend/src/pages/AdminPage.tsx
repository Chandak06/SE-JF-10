import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { currentUser, moderationKinds, moderationItems, removeItem, type ModerationKind, type ModerationItem } from '../services/authService'
import styles from './AuthPage.module.css'

export default function AdminPage() {
  const [params, setParams] = useSearchParams()
  const requested = params.get('kind')
  const latest = useRef(0)
  const live = useRef(true)
  const [loadedCategory, setLoadedCategory] = useState<string | null | undefined>(undefined)
  const [kinds, setKinds] = useState<ModerationKind[]>([])
  const [kind, setKind] = useState<ModerationKind>('materials')
  const [items, setItems] = useState<ModerationItem[]>([])
  const [pending, setPending] = useState<ModerationItem | null>(null)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(true)
  const [permitted, setPermitted] = useState(false)
  const loading = busy || loadedCategory !== requested
  useEffect(() => {
    let active = true
    live.current = true
    const id = ++latest.current
    async function load() {
      try {
        const user = await currentUser()
        if (user.role !== 'admin') throw new Error('Administrator access is required.')
        const available = await moderationKinds()
        if (requested && !available.includes(requested as ModerationKind)) throw new Error('Requested content module is unavailable.')
        const first = available.find(value => value === requested) ?? available[0]
        const rows = first ? await moderationItems(first) : []
        if (active && id === latest.current) { setKinds(available); if (first) setKind(first); setItems(rows); setPermitted(true); setMessage('') }
      } catch (error) { if (active && id === latest.current) { setPermitted(false); setMessage(error instanceof Error ? error.message : 'Unable to load moderation.') } }
      finally { if (active && id === latest.current) { setBusy(false); setLoadedCategory(requested) } }
    }
    void load(); return () => { active = false; live.current = false }
  }, [requested])
  async function select(next: ModerationKind) {
    setBusy(true); setPending(null); setItems([]); setKind(next); setParams({ kind: next })
  }
  async function confirm() {
    if (!pending || loading) return
    const id = ++latest.current
    setBusy(true)
    try { await removeItem(kind, pending.id); if (live.current && id === latest.current) { setItems(rows => rows.filter(item => item.id !== pending.id)); setPending(null); setMessage('Resource removed.') } }
    catch (error) { if (live.current && id === latest.current) setMessage(error instanceof Error ? error.message : 'Removal failed. Try again.') }
    finally { if (live.current && id === latest.current) setBusy(false) }
  }
  return <div className={styles.wrap}><section className={styles.card}><h1>Content moderation</h1>
    <Link to="/admin">Admin Dashboard</Link> · <Link to="/questions">Question Bank</Link> · <Link to="/materials">Study materials</Link>
    {message && <p role="status">{message}</p>}
    {loading && <p role="status">Loading…</p>}
    {permitted && !loading && <>
      <label>Content type<select value={kind} disabled={loading} onChange={event => void select(event.target.value as ModerationKind)}>{kinds.map(value => <option key={value}>{value}</option>)}</select></label>
      {!items.length && !loading && <p>No content available for moderation.</p>}
      <ul>{items.map(item => <li key={item.id}>{item.title} <button disabled={loading} onClick={() => setPending(item)}>Remove {item.title}</button></li>)}</ul>
    </>}
    {pending && <section role="dialog" aria-modal="true" aria-labelledby="remove-heading"><h2 id="remove-heading">Remove {pending.title}?</h2>
      <p>It will no longer be available to students.</p>
      <button disabled={loading} onClick={() => setPending(null)}>Cancel</button>
      <button disabled={loading} onClick={() => void confirm()}>Confirm removal</button>
    </section>}
  </section></div>
}
