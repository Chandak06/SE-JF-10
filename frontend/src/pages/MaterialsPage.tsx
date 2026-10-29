import { useEffect, useRef, useState, type FormEvent } from 'react'
import { uploadMaterial, materialFile, getMaterialDetails, getSessionUser, type MaterialDetails, type StudyMaterial } from '../services/authService'
import { useMaterialLibrary } from '../hooks/useMaterialLibrary'
import styles from './MaterialsPage.module.css'

function formatSize(bytes: number) {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
function pdfFilename(title: string) {
  const safe = title.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Za-z0-9._-]+/g, '-').replace(/^[.-]+|[.-]+$/g, '')
  return `${safe || 'study-material'}.pdf`
}
function ActionIcon({ kind }: { kind: 'details' | 'view' | 'download' | 'expand' | 'shrink' | 'close' }) {
  const paths = {
    details: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5m0-8h.01" /></>,
    view: <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" /><circle cx="12" cy="12" r="2.5" /></>,
    download: <><path d="M12 3v12m-5-5 5 5 5-5" /><path d="M5 17v4h14v-4" /></>,
    expand: <><path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5" /><path d="m3 8 6-6m12 6-6-6M3 16l6 6m12-6-6 6" /></>,
    shrink: <><path d="M8 3v5H3m13-5v5h5M3 16h5v5m13-5h-5v5" /><path d="m3 8 5-5m13 5-5-5M3 16l5 5m13-5-5 5" /></>,
    close: <path d="m6 6 12 12M18 6 6 18" />
  }
  return <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[kind]}</svg>
}

export default function MaterialsPage() {
  const { materials, nextCursor, loading, loadingMore, loadError, search: searchLibrary, refresh, loadMore, retry } = useMaterialLibrary()
  const [downloadError, setDownloadError] = useState('')
  const [pdfViewUrl, setPdfViewUrl] = useState<string | null>(null)
  const [pdfViewTitle, setPdfViewTitle] = useState('')
  const [pdfLoading, setPdfLoading] = useState(false)
  const [pdfFullScreen, setPdfFullScreen] = useState(false)
  const pdfRequest = useRef(0)
  const [details, setDetails] = useState<MaterialDetails | null>(null)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [detailsError, setDetailsError] = useState('')
  const detailsRequest = useRef(0)
  const fileInput = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('')
  const [hasSearched, setHasSearched] = useState(false)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [title, setTitle] = useState(''); const [subject, setSubject] = useState(''); const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null); const [message, setMessage] = useState(''); const [busy, setBusy] = useState(false)

  useEffect(() => () => { if (pdfViewUrl) URL.revokeObjectURL(pdfViewUrl) }, [pdfViewUrl])

  async function search(event: FormEvent) {
    event.preventDefault(); setDownloadError('')
    setHasSearched(Boolean(query.trim() || subjectFilter.trim()))
    await searchLibrary(query, subjectFilter)
  }
  async function download(material: StudyMaterial) {
    setBusy(true); setDownloadError('')
    try {
      const url = URL.createObjectURL(await materialFile(material.id))
      const anchor = document.createElement('a'); anchor.href = url; anchor.download = pdfFilename(material.title); anchor.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (error) { setDownloadError(error instanceof Error ? error.message : 'Download failed.') }
    finally { setBusy(false) }
  }
  async function viewPdf(material: StudyMaterial) {
    const request = ++pdfRequest.current
    setPdfViewUrl(null); setPdfViewTitle(material.title); setDownloadError(''); setPdfLoading(true)
    try {
      const url = URL.createObjectURL(await materialFile(material.id, 'inline'))
      if (request === pdfRequest.current) setPdfViewUrl(url)
      else URL.revokeObjectURL(url)
    } catch (error) {
      if (request === pdfRequest.current) setDownloadError(error instanceof Error ? error.message : 'Unable to view this PDF.')
    } finally {
      if (request === pdfRequest.current) setPdfLoading(false)
    }
  }
  function closePdf() {
    ++pdfRequest.current
    setPdfLoading(false); setPdfViewUrl(null); setPdfViewTitle(''); setPdfFullScreen(false)
  }
  async function showDetails(material: StudyMaterial) {
    const request = ++detailsRequest.current
    setDetails(null); setDetailsError(''); setDetailsLoading(true)
    try {
      const result = await getMaterialDetails(material.id)
      if (request === detailsRequest.current) setDetails(result)
    } catch (error) {
      if (request === detailsRequest.current) setDetailsError(error instanceof Error ? error.message : 'Unable to load material details.')
    } finally {
      if (request === detailsRequest.current) setDetailsLoading(false)
    }
  }
  function closeDetails() {
    ++detailsRequest.current
    setDetails(null); setDetailsError(''); setDetailsLoading(false)
  }
  async function submit(event: FormEvent) {
    event.preventDefault(); if (!file) { setMessage('Choose a PDF file to continue.'); return }
    setBusy(true); setMessage('')
    try {
      await uploadMaterial({ title, subject, description, file })
      setTitle(''); setSubject(''); setDescription(''); setFile(null); setMessage('Your material has been uploaded.')
      if (fileInput.current) fileInput.current.value = ''
      await refresh()
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Upload failed. Please try again.') }
    finally { setBusy(false) }
  }
  return <div className={styles.page}>
    <section className={styles.library} aria-label="Study materials"><form className={styles.searchForm} onSubmit={search}><label>Search study materials<input aria-label="Search study materials" placeholder="Title, subject, or description" maxLength={100} value={query} onChange={event => setQuery(event.target.value)} /></label><label>Filter by subject<input aria-label="Filter by subject" placeholder="Any subject" maxLength={100} value={subjectFilter} onChange={event => setSubjectFilter(event.target.value)} /></label><button className={styles.searchButton} disabled={loading || busy}>Search</button></form>
      {loadError && <div role="alert"><p>{loadError}</p><button disabled={loading || loadingMore || busy} onClick={() => void retry()}>Try again</button></div>}
      {downloadError && <p role="alert">{downloadError}</p>}
      {loading ? <p className={styles.status}>Loading materials…</p> : materials.length === 0 ? <div className={styles.empty}><span className={styles.emptyIcon} aria-hidden="true">▤</span><p className={styles.emptyTitle}>{hasSearched ? 'No matching materials' : 'Nothing exists yet'}</p><p>{hasSearched ? 'Try different keywords or clear the subject filter.' : 'Shared notes and study resources will appear here.'}</p></div> : <div className={styles.grid}>{materials.map((material) => <article className={styles.material} key={material.id}><div className={styles.materialIcon} aria-hidden="true">PDF</div><div className={styles.materialCopy}><p className={styles.subject}>{material.subject}</p><h2>{material.title}</h2><p className={styles.description}>{material.description}</p><p className={styles.meta}>{new Date(material.createdAt).toLocaleDateString()} <span>·</span> {formatSize(material.size)}</p><div className={styles.materialActions}><button className={styles.iconAction} type="button" disabled={busy} aria-label={`View details for ${material.title}`} title="View details" onClick={() => void showDetails(material)}><ActionIcon kind="details" /></button><button className={`${styles.iconAction} ${styles.viewAction}`} type="button" disabled={busy || pdfLoading} aria-label={`View PDF ${material.title}`} title="View PDF" onClick={() => void viewPdf(material)}><ActionIcon kind="view" /><span>View PDF</span></button><button className={styles.iconAction} type="button" disabled={busy} aria-label={`Download PDF ${material.title}`} title="Download PDF" onClick={() => void download(material)}><ActionIcon kind="download" /></button></div></div></article>)}</div>}
      {!loading && nextCursor && !loadError && <button className={styles.loadMore} disabled={loadingMore || busy} onClick={() => void loadMore()}>{loadingMore ? 'Loading more…' : 'Load more materials'}</button>}
    </section>
    {(pdfLoading || pdfViewUrl) && <div className={`${styles.overlay} ${pdfFullScreen ? styles.pdfFullScreenOverlay : ''}`} onMouseDown={event => { if (event.target === event.currentTarget) closePdf() }}><section className={`${styles.drawer} ${styles.pdfDrawer} ${pdfFullScreen ? styles.pdfFullScreen : ''}`} role="dialog" aria-modal="true" aria-labelledby="pdf-viewer-title"><div className={styles.pdfToolbar}><div><p className={styles.kicker}>STUDY MATERIAL PDF</p><h2 id="pdf-viewer-title">{pdfViewTitle}</h2></div><div className={styles.viewerActions}><button className={styles.iconAction} type="button" aria-label={pdfFullScreen ? 'Exit full screen' : 'Full screen'} title={pdfFullScreen ? 'Exit full screen' : 'Full screen'} onClick={() => setPdfFullScreen(value => !value)}><ActionIcon kind={pdfFullScreen ? 'shrink' : 'expand'} /></button><button className={styles.iconAction} type="button" aria-label="Close PDF viewer" title="Close PDF viewer" onClick={closePdf}><ActionIcon kind="close" /></button></div></div>{pdfLoading ? <p className={styles.status}>Loading PDF…</p> : pdfViewUrl && <iframe className={styles.pdfFrame} title={`${pdfViewTitle} PDF`} src={pdfViewUrl} />}</section></div>}
    {(detailsLoading || details || detailsError) && <div className={styles.overlay} onMouseDown={event => { if (event.target === event.currentTarget) closeDetails() }}><section className={styles.drawer} role="dialog" aria-modal="true" aria-labelledby="details-title"><div className={styles.drawerHeader}><div><p className={styles.kicker}>STUDY MATERIAL DETAILS</p>{details && <h2 id="details-title">{details.title}</h2>}{detailsLoading && <h2 id="details-title">Loading material…</h2>}{detailsError && <h2 id="details-title">Unable to load details</h2>}</div><button className={styles.close} type="button" aria-label="Close material details" onClick={closeDetails}>×</button></div>{detailsLoading && <p className={styles.status}>Loading material details…</p>}{detailsError && <p className={styles.formMessage} role="alert">{detailsError}</p>}{details && <dl className={styles.detailsList}><dt>Subject</dt><dd>{details.subject}</dd><dt>Description</dt><dd>{details.description}</dd><dt>Uploaded by</dt><dd>{details.uploadedBy}</dd><dt>Upload date</dt><dd><time dateTime={details.createdAt}>{new Date(details.createdAt).toLocaleString()}</time></dd></dl>}</section></div>}
    {getSessionUser()?.role === 'student' && <button className={styles.uploadFab} type="button" aria-label="Upload a material" onClick={() => { setMessage(''); setUploadOpen(true) }}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg></button>}
    {uploadOpen && <div className={styles.overlay} onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) setUploadOpen(false) }}><section className={styles.drawer} role="dialog" aria-modal="true" aria-labelledby="upload-title"><div className={styles.drawerHeader}><div><p className={styles.kicker}>CONTRIBUTE TO YOUR LIBRARY</p><h2 id="upload-title">Upload a material</h2><p>Give your classmates a useful resource to study from.</p></div><button className={styles.close} type="button" aria-label="Close upload form" disabled={busy} onClick={() => setUploadOpen(false)}>×</button></div><form className={styles.form} onSubmit={submit}>
      <div className={styles.fields}><label className={styles.field}>Material title<input name="title" required maxLength={150} placeholder="e.g. Week 4 lecture notes" value={title} onChange={event => setTitle(event.target.value)} /></label><label className={styles.field}>Subject<input name="subject" required maxLength={100} placeholder="e.g. Software Engineering" value={subject} onChange={event => setSubject(event.target.value)} /></label><label className={`${styles.field} ${styles.full}`}>Description<textarea name="description" required maxLength={1000} rows={4} placeholder="What should classmates know about this resource?" value={description} onChange={event => setDescription(event.target.value)} /></label></div>
      <label className={styles.filePicker}><span className={styles.fileIcon} aria-hidden="true">↑</span><span><strong>{file ? file.name : 'Choose a PDF to share'}</strong><small>{file ? formatSize(file.size) : 'PDF format · maximum 10 MB'}</small></span><input ref={fileInput} aria-label="PDF file" type="file" accept="application/pdf,.pdf" onChange={event => setFile(event.target.files?.[0] ?? null)} /></label>
      {message && <p className={styles.formMessage} role="status">{message}</p>}<div className={styles.formActions}><button type="button" className={styles.cancel} disabled={busy} onClick={() => setUploadOpen(false)}>Cancel</button><button className={styles.submit} disabled={busy} type="submit">{busy ? 'Uploading…' : 'Upload material'}</button></div>
    </form></section></div>}
  </div>
}
