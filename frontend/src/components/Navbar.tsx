import { Link, NavLink } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'
import styles from './Navbar.module.css'
export default function Navbar() {
  return <header className={styles.header}><div className={styles.inner}><Link className={styles.brand} to="/" aria-label="Study Commons home"><span className={styles.mark}>S</span><span>Study Commons</span></Link><nav className={styles.nav} aria-label="Main navigation"><NavLink to="/login">Log in</NavLink><NavLink className={styles.register} to="/register">Create account</NavLink><ThemeToggle /></nav></div></header>
}
