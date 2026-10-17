import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { listMaterials, uploadMaterial, searchMaterials, materialFile, getSessionUser, type StudyMaterial } from '../services/authService'
import styles from './MaterialsPage.module.css'

function formatSize(bytes: number) {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<StudyMaterial[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [query, setQuery] = useState('')
  const [uploadOpen, setUploadOpen] = useState(false)
  const [title, setTitle] = useState(''); const [subject, setSubject] = useState(''); const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null); const [message, setMessage] = useState(''); const [busy, setBusy] = useState(false)

  const refreshMaterials = useCallback(async () => {
    try {
      const result = await listMaterials()
      setMaterials(result); setLoadError('')
    }
    catch (error) { setLoadError(error instanceof Error ? error.message : 'Unable to load materials.') }
    finally { setLoading(false) }
  }, [])
  useEffect(() => {
    let mounted = true
    void listMaterials().then((result) => {
      if (mounted) { setMaterials(result); setLoadError('') }
    }).catch((error: unknown) => {
      if (mounted) setLoadError(error instanceof Error ? error.message : 'Unable to load materials.')
    }).finally(() => {
      if (mounted) setLoading(false)
    })
    return () => { mounted = false }
  }, [])

  async function search(event: FormEvent) {
    event.preventDefault(); setLoading(true)
    try { setMaterials(await searchMaterials(query)); setLoadError('') }
    catch (error) { setLoadError(error instanceof Error ? error.message : 'Unable to search materials.') }
    finally { setLoading(false) }
  }
  async function download(material: StudyMaterial) {
    setBusy(true)
    try {
      const url = URL.createObjectURL(await materialFile(material.id))
      const anchor = document.createElement('a'); anchor.href = url; anchor.download = material.id + '.pdf'; anchor.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (error) { setLoadError(error instanceof Error ? error.message : 'Download failed.') }
    finally { setBusy(false) }
  }
  async function submit(event: FormEvent) {
    event.preventDefault(); if (!file) { setMessage('Choose a PDF file to continue.'); return }
    setBusy(true); setMessage('')
    try {
      await uploadMaterial({ title, subject, description, file })
      setTitle(''); setSubject(''); setDescription(''); setFile(null); setMessage('Your material has been uploaded.')
      await refreshMaterials()
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Upload failed. Please try again.') }
    finally { setBusy(false) }
  }
  return <div className={styles.page}>
    <section className={styles.library} aria-label="Study materials"><form onSubmit={search}><label>Search material titles<input maxLength={100} value={query} onChange={event => setQuery(event.target.value)} /></label><button disabled={loading || busy}>Search</button></form>
      {loading ? <p className={styles.status}>Loading materials…</p> : loadError ? <div className={styles.empty}><p className={styles.emptyTitle}>Materials aren’t available right now</p><p>{loadError}</p><button onClick={() => void refreshMaterials()}>Try again</button></div> : materials.length === 0 ? <div className={styles.empty}><span className={styles.emptyIcon} aria-hidden="true">▤</span><p className={styles.emptyTitle}>Nothing exists yet</p><p>Shared notes and study resources will appear here.</p></div> : <div className={styles.grid}>{materials.map((material) => <article className={styles.material} key={material.id}><div className={styles.materialIcon} aria-hidden="true">PDF</div><div className={styles.materialCopy}><p className={styles.subject}>{material.subject}</p><h2>{material.title}</h2><p className={styles.description}>{material.description}</p><p className={styles.meta}>{new Date(material.createdAt).toLocaleDateString()} <span>·</span> {formatSize(material.size)}</p><button disabled={busy} onClick={() => void download(material)}>Download {material.title}</button></div></article>)}</div>}
    </section>
    {getSessionUser()?.role === 'student' && <button className={styles.uploadFab} type="button" aria-label="Upload a material" onClick={() => { setMessage(''); setUploadOpen(true) }}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg></button>}
    {uploadOpen && <div className={styles.overlay} onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) setUploadOpen(false) }}><section className={styles.drawer} role="dialog" aria-modal="true" aria-labelledby="upload-title"><div className={styles.drawerHeader}><div><p className={styles.kicker}>CONTRIBUTE TO YOUR LIBRARY</p><h2 id="upload-title">Upload a material</h2><p>Give your classmates a useful resource to study from.</p></div><button className={styles.close} type="button" aria-label="Close upload form" disabled={busy} onClick={() => setUploadOpen(false)}>×</button></div><form className={styles.form} onSubmit={submit}>
      <div className={styles.fields}><label className={styles.field}>Material title<input name="title" required maxLength={150} placeholder="e.g. Week 4 lecture notes" value={title} onChange={event => setTitle(event.target.value)} /></label><label className={styles.field}>Subject<input name="subject" required maxLength={100} placeholder="e.g. Software Engineering" value={subject} onChange={event => setSubject(event.target.value)} /></label><label className={`${styles.field} ${styles.full}`}>Description<textarea name="description" required maxLength={1000} rows={4} placeholder="What should classmates know about this resource?" value={description} onChange={event => setDescription(event.target.value)} /></label></div>
      <label className={styles.filePicker}><span className={styles.fileIcon} aria-hidden="true">↑</span><span><strong>{file ? file.name : 'Choose a PDF to share'}</strong><small>{file ? formatSize(file.size) : 'PDF format · maximum 10 MB'}</small></span><input aria-label="PDF file" type="file" accept="application/pdf,.pdf" onChange={event => setFile(event.target.files?.[0] ?? null)} /></label>
      {message && <p className={styles.formMessage} role="status">{message}</p>}<div className={styles.formActions}><button type="button" className={styles.cancel} disabled={busy} onClick={() => setUploadOpen(false)}>Cancel</button><button className={styles.submit} disabled={busy} type="submit">{busy ? 'Uploading…' : 'Upload material'}</button></div>
    </form></section></div>}
  </div>
}
