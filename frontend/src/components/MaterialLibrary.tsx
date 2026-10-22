import { useState, type FormEvent } from 'react'
import { materialFile, type MaterialSummary } from '../services/authService'
import { useMaterialLibrary } from '../hooks/useMaterialLibrary'

export default function MaterialLibrary() {
  const [query, setQuery] = useState('')
  const { materials: items, nextCursor, loading, loadingMore, loadError, search: searchLibrary, loadMore, retry } = useMaterialLibrary()
  const [message, setMessage] = useState(''); const [busy, setBusy] = useState(false)
  async function search(event: FormEvent) {
    event.preventDefault(); setMessage('')
    await searchLibrary(query)
  }
  async function download(item: MaterialSummary) {
    setBusy(true)
    try {
      const blob = await materialFile(item.id); const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a'); anchor.href = url; anchor.download = item.id + '.pdf'; anchor.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Download failed.') }
    finally { setBusy(false) }
  }
  return <section><h2>Study library</h2><form onSubmit={search}><label>Search material titles<input value={query} maxLength={100} onChange={event => setQuery(event.target.value)} /></label><button disabled={busy || loading}>Search</button></form>
    {message && <p role="status">{message}</p>}
    <ul>{items.map(item => <li key={item.id}><strong>{item.title}</strong> · {item.subject}<p>{item.description}</p><button disabled={busy} onClick={() => void download(item)}>Download {item.title}</button></li>)}</ul>
    {loadError && <div role="alert">{loadError}<button onClick={() => void retry()} disabled={loading || loadingMore || busy}>Try again</button></div>}
    {loading ? <p>Loading materials…</p> : !items.length && <p>No study materials found.</p>}
    {!loading && nextCursor && !loadError && <button onClick={() => void loadMore()} disabled={loadingMore || busy}>{loadingMore ? 'Loading more…' : 'Load more materials'}</button>}
  </section>
}
