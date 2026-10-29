import { Link } from 'react-router-dom'
import { getSessionUser } from '../services/authService'
import styles from './StudentDashboardPage.module.css'

type DashboardDestination = { title: string; description: string; icon: string; href?: string; action?: string; unavailable?: boolean }
const destinations: DashboardDestination[] = [
  { title: 'Study Materials', description: 'Search, view, and download shared course materials.', href: '/materials', action: 'Open Study Materials', icon: 'PDF' },
  { title: 'Quiz Creation', description: 'Build a quiz from questions in the shared Question Bank.', href: '/create-quiz', action: 'Create a Quiz', icon: '+' },
  { title: 'Quiz Search', description: 'Find and review quizzes shared by students.', href: '/quizzes', action: 'Search Quizzes', icon: '⌕' },
  { title: 'Quiz Attempt History', description: 'Review your completed quiz attempts.', unavailable: true, icon: '↺' },
  { title: 'Performance Dashboard', description: 'Track results and performance across subjects.', unavailable: true, icon: '▥' }
]

export default function StudentDashboardPage() {
  const student = getSessionUser()
  return <section className={styles.page} aria-labelledby="student-dashboard-title">
    <p className={styles.eyebrow}>STUDY COMMONS · STUDENT</p>
    <h1 id="student-dashboard-title">{student?.name ? `Welcome, ${student.name}` : 'Student Dashboard'}</h1>
    <p className={styles.intro}>Your starting point for study materials and quizzes.</p>
    <div className={styles.grid}>
      {destinations.map(destination => <article className={styles.card} key={destination.title}>
        <span className={styles.icon} aria-hidden="true">{destination.icon}</span>
        <h2>{destination.title}</h2>
        <p>{destination.description}</p>
        {destination.unavailable
          ? <p className={styles.unavailable} role="status">This section is not available yet.</p>
          : <Link to={destination.href!}>{destination.action}</Link>}
      </article>)}
    </div>
  </section>
}
