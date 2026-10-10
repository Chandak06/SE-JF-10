import { Link } from 'react-router-dom'
import styles from './HomePage.module.css'

const benefits = [
  ['01', 'Keep useful notes together', 'Keep study materials organized and easy for your group to access.'],
  ['02', 'Practice what you learn', 'Create quizzes to test your understanding and prepare for exams.'],
  ['03', 'Track your learning progress', 'Review your quiz results, revisit past attempts, and monitor your performance by subject.'],
]

export default function HomePage() {
  return <div className={styles.page}><section className={styles.hero}><div className={styles.copy}><p className={styles.eyebrow}>A STUDY SPACE FOR EVERYONE</p><h1>Good learning<br />happens <em>together.</em></h1><p className={styles.lead}>Bring your study materials, quizzes, and classmates together in one place.</p><div className={styles.actions}><Link className={styles.primary} to="/register">Create your account <span aria-hidden="true">→</span></Link><Link className={styles.secondary} to="/login">Log in</Link></div></div><div className={styles.features} aria-label="Ways to study together">{benefits.map(([number, title, description]) => <article className={styles.feature} key={number}><span>{number}</span><div><h2>{title}</h2><p>{description}</p></div></article>)}</div></section><p className={styles.note}>A calmer way to study, built around sharing what you know.</p></div>
}
