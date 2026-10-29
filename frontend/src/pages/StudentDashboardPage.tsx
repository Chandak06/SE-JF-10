import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMaterialDetails, getSessionUser, type MaterialDetails } from '../services/authService'
import { getRecentMaterials, type RecentMaterial } from '../services/recentMaterials'
import styles from './StudentDashboardPage.module.css'

type DashboardDestination = { title: string; description: string; icon: string; href?: string; action?: string; unavailable?: boolean }
const destinations: DashboardDestination[] = [
  { title: 'Quiz Attempt History', description: 'Review your completed quiz attempts.', unavailable: true, icon: '↺' },
  { title: 'Performance Dashboard', description: 'Track results and performance across subjects.', unavailable: true, icon: '▥' }
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
      if (active) setRecentMaterials(results.filter((item): item is MaterialDetails & RecentMaterial => item !== null))
    })
    return () => { active = false }
  }, [student?.id])
  return <section className={styles.page} aria-labelledby="student-dashboard-title">
    <h1 id="student-dashboard-title">{student?.name ? `Welcome, ${student.name}` : 'Student Dashboard'}</h1>
    <p className={styles.intro}>Your starting point for study materials and quizzes.</p>
    <div className={styles.grid}>
      {destinations.map(destination => <article className={styles.card} key={destination.title}>
        <span className={styles.icon} aria-hidden="true">{destination.icon}</span>
        <div className={styles.cardCopy}><h2>{destination.title}</h2><p>{destination.description}</p></div>
        {destination.unavailable
          ? <span className={styles.unavailable} role="status">Coming soon</span>
          : <Link to={destination.href!}>{destination.action}</Link>}
      </article>)}
    </div>
    <section className={styles.recentSection} aria-labelledby="recent-materials-title">
      <div className={styles.recentHeading}><h2 id="recent-materials-title">Recently opened</h2><Link to="/materials">Browse materials</Link></div>
      {recentMaterials.length ? <ul className={styles.recentList}>{recentMaterials.map(material => <li key={material.id}><Link to={`/materials?material=${encodeURIComponent(material.id)}`}><span className={styles.recentFile} aria-hidden="true">PDF</span><span className={styles.recentCopy}><strong>{material.title}</strong><small>{material.subject}</small></span><time dateTime={new Date(material.openedAt).toISOString()}>{new Date(material.openedAt).toLocaleDateString()}</time></Link></li>)}</ul>
        : <p className={styles.recentEmpty}>Materials you open will appear here for quick access.</p>}
    </section>
  </section>
}
