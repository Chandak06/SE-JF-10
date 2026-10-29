import { useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { getSessionToken, getSessionUser, logout } from '../services/authService'
import ThemeToggle from './ThemeToggle'
import styles from './Navbar.module.css'
export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const authenticated = getSessionToken()
  const user = getSessionToken() ? getSessionUser?.() : null
  const [profileOpen, setProfileOpen] = useState(false)
  const [logoutError, setLogoutError] = useState('')
  async function signOut() {
    try { await logout(); setProfileOpen(false); navigate('/login') }
    catch { setLogoutError('Unable to log out. Please try again.') }
  }
  return <header className={styles.header} data-route={location.pathname}><div className={styles.inner}><Link className={styles.brand} to="/" aria-label="Study Commons home"><span className={styles.mark}>S</span><span>Study Commons</span></Link><nav className={styles.centerNav} aria-label="Main navigation">{authenticated && <><NavLink to="/materials">Materials</NavLink>{user?.role === 'student' && <NavLink to="/quiz-attempt">Practice quiz</NavLink>}{user?.role === 'admin' && <NavLink to="/questions">Question Bank</NavLink>}<NavLink to="/create-quiz">Create Quiz</NavLink></>}</nav><div className={styles.actions}><ThemeToggle />{authenticated && <div className={styles.profile}><button className={styles.profileButton} type="button" aria-label="Open profile menu" aria-expanded={profileOpen} onClick={() => { setProfileOpen(value => !value); setLogoutError('') }}><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M4.5 20c.5-4 3.1-6 7.5-6s7 2 7.5 6"/></svg></button>{profileOpen && <div className={styles.profileMenu}><p className={styles.userName}>{user?.name ?? 'Your account'}</p><p className={styles.userEmail}>{user?.email ?? ''}</p>{logoutError && <p className={styles.logoutError} role="status">{logoutError}</p>}<button type="button" onClick={() => void signOut()}>Log out</button></div>}</div>}</div></div></header>
}
