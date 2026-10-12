import { useEffect, useState, type FormEvent } from 'react'
import { materialFile, searchMaterials, type MaterialSummary } from '../services/authService'

export default function MaterialLibrary() {
  const [query, setQuery] = useState(''); const [items, setItems] = useState<MaterialSummary[]>([])
  const [message, setMessage] = useState(''); const [busy, setBusy] = useState(false)
  useEffect(() => {
    let active = true
    void searchMaterials('').then(rows => { if (active) setItems(rows) }, () => { if (active) setMessage('Unable to load materials. Please log in again if your session expired.') })
    return () => { active = false }
  }, [])
  async function search(event: FormEvent) {
    event.preventDefault(); setBusy(true)
    try { setItems(await searchMaterials(query)); setMessage('') }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Search failed.') }
    finally { setBusy(false) }
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
  return <section><h2>Study library</h2><form onSubmit={search}><label>Search material titles<input value={query} maxLength={100} onChange={event => setQuery(event.target.value)} /></label><button disabled={busy}>Search</button></form>
    {message && <p role="status">{message}</p>}
    <ul>{items.map(item => <li key={item.id}><strong>{item.title}</strong> · {item.subject}<p>{item.description}</p><button disabled={busy} onClick={() => void download(item)}>Download {item.title}</button></li>)}</ul>
    {!items.length && <p>No study materials found.</p>}
  </section>
}
