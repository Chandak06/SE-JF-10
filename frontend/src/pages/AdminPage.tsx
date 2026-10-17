import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { currentUser, moderationKinds, moderationItems, removeItem, type ModerationKind, type ModerationItem } from '../services/authService'
import styles from './AuthPage.module.css'

export default function AdminPage() {
  const [kinds, setKinds] = useState<ModerationKind[]>([])
  const [kind, setKind] = useState<ModerationKind>('materials')
  const [items, setItems] = useState<ModerationItem[]>([])
  const [pending, setPending] = useState<ModerationItem | null>(null)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(true)
  const [permitted, setPermitted] = useState(false)
  useEffect(() => {
    let active = true
    async function load() {
      try {
        const user = await currentUser()
        if (user.role !== 'admin') throw new Error('Administrator access is required.')
        const available = await moderationKinds()
        const first = available[0]
        const rows = first ? await moderationItems(first) : []
        if (active) { setKinds(available); if (first) setKind(first); setItems(rows); setPermitted(true) }
      } catch (error) { if (active) setMessage(error instanceof Error ? error.message : 'Unable to load moderation.') }
      finally { if (active) setBusy(false) }
    }
    void load(); return () => { active = false }
  }, [])
  async function select(next: ModerationKind) {
    setBusy(true); setPending(null)
    try { setItems(await moderationItems(next)); setKind(next); setMessage('') }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to load resources.') }
    finally { setBusy(false) }
  }
  async function confirm() {
    if (!pending) return
    setBusy(true)
    try { await removeItem(kind, pending.id); setItems(items.filter(item => item.id !== pending.id)); setPending(null); setMessage('Resource removed.') }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Removal failed. Try again.') }
    finally { setBusy(false) }
  }
  return <div className={styles.wrap}><section className={styles.card}><h1>Content moderation</h1>
    <Link to="/login">Log in</Link> · <Link to="/materials">Study materials</Link>
    {message && <p role="status">{message}</p>}
    {busy && <p role="status">Loading…</p>}
    {permitted && <>
      <label>Content type<select value={kind} disabled={busy} onChange={event => void select(event.target.value as ModerationKind)}>{kinds.map(value => <option key={value}>{value}</option>)}</select></label>
      {!items.length && !busy && <p>No content available for moderation.</p>}
      <ul>{items.map(item => <li key={item.id}>{item.title} <button disabled={busy} onClick={() => setPending(item)}>Remove {item.title}</button></li>)}</ul>
    </>}
    {pending && <section role="dialog" aria-modal="true" aria-labelledby="remove-heading"><h2 id="remove-heading">Remove {pending.title}?</h2>
      <p>It will no longer be available to students.</p>
      <button disabled={busy} onClick={() => setPending(null)}>Cancel</button>
      <button disabled={busy} onClick={() => void confirm()}>Confirm removal</button>
    </section>}
  </section></div>
}
