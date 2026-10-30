import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMaterialDetails, getSessionUser, type MaterialDetails } from '../services/authService'
import { getRecentMaterials, type RecentMaterial } from '../services/recentMaterials'
import styles from './StudentDashboardPage.module.css'

type DashboardDestination = { title: string; description: string; icon: string; href: string }
const destinations: DashboardDestination[] = [
  { title: 'Quiz Attempt History', description: 'Review your completed quiz attempts.', href: '/attempt-history', icon: '↺' },
  { title: 'Performance Dashboard', description: 'Track results and performance across subjects.', href: '/attempt-insights', icon: '▥' }
]

export default function StudentDashboardPage() {
  const student = getSessionUser()
  const [recentMaterials, setRecentMaterials] = useState<Array<MaterialDetails & RecentMaterial>>([])
  useEffect(() => {
    let active = true
    const recent = getRecentMaterials(student?.id ?? '')
    void Promise.all(recent.map(async item => {
      try { return { ...await getMaterialDetails(item.id), openedAt: item.openedAt } }
      catch { return null }
    })).then(results => {
      if (active) setRecentMaterials(results.filter((item): item is MaterialDetails & RecentMaterial => item !== null).slice(0, 2))
    })
    return () => { active = false }
  }, [student?.id])
  return <section className={styles.page} aria-labelledby="student-dashboard-title">
    <h1 id="student-dashboard-title">{student?.name ? `Welcome, ${student.name}` : 'Student Dashboard'}</h1>
    <p className={styles.intro}>Your starting point for study materials and quizzes.</p>
    <div className={styles.dashboardGrid}>
      <section className={styles.toolsSection} aria-label="Quiz activity shortcuts">
        <div className={styles.grid}>{destinations.map(destination => <Link className={styles.card} to={destination.href} key={destination.title}>
          <span className={styles.icon} aria-hidden="true">{destination.icon}</span>
          <span className={styles.cardCopy}><strong>{destination.title}</strong><small>{destination.description}</small></span>
        </Link>)}</div>
      </section>
      <section className={styles.recentSection} aria-labelledby="recent-materials-title">
        <div className={styles.recentHeading}><h2 id="recent-materials-title">Recently opened</h2></div>
        {recentMaterials.length ? <ul className={styles.recentList}>{recentMaterials.map(material => <li key={material.id}><Link to={`/materials?pdf=${encodeURIComponent(material.id)}`} aria-label={`View PDF ${material.title}`}><span className={styles.recentFile} aria-hidden="true">PDF</span><span className={styles.recentCopy}><strong>{material.title}</strong><small>{material.subject}</small></span><time dateTime={new Date(material.openedAt).toISOString()}>{new Date(material.openedAt).toLocaleDateString()}</time></Link></li>)}</ul>
          : <p className={styles.recentEmpty}>Materials you open will appear here for quick access.</p>}
      </section>
    </div>
  </section>
}
