import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import FormField from '../components/FormField'
import { register } from '../services/authService'
import { validateRegistration, type RegistrationErrors } from '../services/authValidation'
import styles from './AuthPage.module.css'
export default function RegisterPage() {
  const [values, setValues] = useState({ name: '', email: '', password: '' }); const [errors, setErrors] = useState<RegistrationErrors>({}); const [message, setMessage] = useState(''); const [success, setSuccess] = useState(false); const [loading, setLoading] = useState(false)
  const update = (key: keyof typeof values) => (value: string) => setValues((current) => ({ ...current, [key]: value }))
  async function submit(event: FormEvent) { event.preventDefault(); const found = validateRegistration(values.name, values.email, values.password); setErrors(found); setMessage(''); setSuccess(false); if (Object.keys(found).length) return
    setLoading(true); try { const result = await register(values); setSuccess(true); setMessage(`Account created for ${result.authenticatedUser.name}. You can now log in.`); setValues({ name: '', email: '', password: '' }) } catch (error) { setMessage(error instanceof Error ? error.message : 'Registration failed. Please try again.') } finally { setLoading(false) }
  }
  return <div className={styles.wrap}><section className={styles.card}><p className={styles.eyebrow}>YOUR NEXT STUDY SESSION STARTS HERE</p><h1>Create your account</h1><p className={styles.intro}>Join your classmates and make learning a shared effort.</p><form className={styles.form} onSubmit={submit} noValidate>{message && <div role="status" aria-live="polite" className={`${styles.message} ${success ? styles.success : styles.error}`}>{message}</div>}<FormField label="Name" name="name" autoComplete="name" placeholder="Your name" value={values.name} onChange={(e) => update('name')(e.target.value)} error={errors.name} /><FormField label="Email" name="email" type="email" autoComplete="email" placeholder="you@college.edu" value={values.email} onChange={(e) => update('email')(e.target.value)} error={errors.email} /><FormField label="Password" name="password" type="password" autoComplete="new-password" placeholder="At least 12 characters" value={values.password} onChange={(e) => update('password')(e.target.value)} error={errors.password} /><button className={styles.submit} type="submit" disabled={loading}>{loading ? 'Creating account…' : 'Create account'}</button></form><p className={styles.switch}>Already have an account? <Link to="/login">Log in</Link></p></section></div>
}
