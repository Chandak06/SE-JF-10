import type { InputHTMLAttributes } from 'react'
import styles from './FormField.module.css'
type Props = InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }
export default function FormField({ label, error, id, ...inputProps }: Props) {
  const inputId = id ?? inputProps.name
  const errorId = `${inputId}-error`
  return <div className={styles.field}><label htmlFor={inputId}>{label}</label><input id={inputId} className={error ? styles.invalid : ''} aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} {...inputProps} />{error && <span className={styles.error} id={errorId}>{error}</span>}</div>
}
