import { Link, NavLink, useLocation } from 'react-router-dom'
import { getSessionToken } from '../services/authService'
import ThemeToggle from './ThemeToggle'
import styles from './Navbar.module.css'
export default function Navbar() {
  const location = useLocation()
  const authenticated = getSessionToken()
  return <header className={styles.header}><div className={styles.inner}><Link className={styles.brand} to="/" aria-label="Study Commons home"><span className={styles.mark}>S</span><span>Study Commons</span></Link><nav className={styles.nav} aria-label="Main navigation">{authenticated ? <NavLink to="/materials" key={location.key}>Materials</NavLink> : <><NavLink to="/login">Log in</NavLink><NavLink className={styles.register} to="/register">Create account</NavLink></>}<ThemeToggle /></nav></div></header>
}
