import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import FormField from '../components/FormField'
import { login } from '../services/authService'
import { validateLogin } from '../services/authValidation'
import styles from './AuthPage.module.css'
export default function LoginPage() {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [errors, setErrors] = useState<{ email?: string; password?: string }>({}); const [message, setMessage] = useState(''); const [loading, setLoading] = useState(false)
  async function submit(event: FormEvent) { event.preventDefault(); const found = validateLogin(email, password); setErrors(found); setMessage(''); if (Object.keys(found).length) return
    setLoading(true); try { await login({ email, password }); setMessage('You’re signed in. This study space is ready for you.') } catch (error) { setMessage(error instanceof Error ? error.message : 'Login failed. Please try again.') } finally { setLoading(false) }
  }
  return <div className={styles.wrap}><section className={styles.card}><p className={styles.eyebrow}>WELCOME BACK</p><h1>Log in</h1><p className={styles.intro}>Pick up where your study group left off.</p><form className={styles.form} onSubmit={submit} noValidate>{message && <div role="status" aria-live="polite" className={`${styles.message} ${message.startsWith('You’re signed') ? styles.success : styles.error}`}>{message}</div>}<FormField label="Email" name="email" type="email" autoComplete="email" placeholder="you@college.edu" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} /><FormField label="Password" name="password" type="password" autoComplete="current-password" placeholder="Your password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} /><button className={styles.submit} type="submit" disabled={loading}>{loading ? 'Logging in…' : 'Log in'}</button></form><p className={styles.switch}><Link to="/materials">Share a PDF or log out</Link><br />New to Study Commons? <Link to="/register">Create an account</Link></p></section></div>
}
