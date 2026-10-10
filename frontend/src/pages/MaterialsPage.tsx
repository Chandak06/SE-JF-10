import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getSessionToken, logout, uploadMaterial } from '../services/authService'
import FormField from '../components/FormField'
import styles from './AuthPage.module.css'

export default function MaterialsPage() {
  const navigate = useNavigate()
  const [title, setTitle] = useState(''); const [subject, setSubject] = useState(''); const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null); const [message, setMessage] = useState(''); const [busy, setBusy] = useState(false)
  async function submit(event: FormEvent) {
    event.preventDefault(); if (!file) { setMessage('Choose a PDF file.'); return }
    setBusy(true); setMessage('')
    try { await uploadMaterial({ title, subject, description, file }); setMessage('Your PDF has been uploaded.') }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Upload failed. Please try again.') }
    finally { setBusy(false) }
  }
  async function signOut() {
    setBusy(true)
    try { await logout(); navigate('/login') }
    catch { setMessage('Unable to log out. Try again.'); setBusy(false) }
  }
  return <div className={styles.wrap}><section className={styles.card}><h1>Share study materials</h1>
    {!getSessionToken() ? <p>Please <Link to="/login">log in</Link> to upload a PDF.</p> : <>
      <p className={styles.intro}>Add a valid, unencrypted PDF and help your group study.</p>
      <form className={styles.form} onSubmit={submit}>
        <FormField label="Title" name="title" value={title} onChange={e => setTitle(e.target.value)} />
        <FormField label="Subject" name="subject" value={subject} onChange={e => setSubject(e.target.value)} />
        <FormField label="Description" name="description" value={description} onChange={e => setDescription(e.target.value)} />
        <label>PDF file<input type="file" accept="application/pdf,.pdf" onChange={e => setFile(e.target.files?.[0] ?? null)} /></label>
        <button className={styles.submit} disabled={busy} type="submit">{busy ? 'Please wait…' : 'Upload PDF'}</button>
      </form><button className={styles.submit} disabled={busy} onClick={signOut}>Log out</button>
    </>}{message && <p role="status">{message}</p>}</section></div>
}
