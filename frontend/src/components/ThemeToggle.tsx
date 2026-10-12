import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import styles from './ThemeToggle.module.css'

type Theme = 'light' | 'dark'
const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({ theme: 'light', toggle: () => {} })
function initialTheme(): Theme {
  const saved = localStorage.getItem('study-theme')
  return saved === 'light' || saved === 'dark' ? saved : matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(initialTheme)
  useEffect(() => { document.documentElement.dataset.theme = theme; localStorage.setItem('study-theme', theme) }, [theme])
  return <ThemeContext.Provider value={{ theme, toggle: () => setTheme((value) => value === 'light' ? 'dark' : 'light') }}>{children}</ThemeContext.Provider>
}
export default function ThemeToggle() {
  const { theme, toggle } = useContext(ThemeContext)
  return <button type="button" className={styles.toggle} onClick={toggle} role="switch" aria-checked={theme === 'dark'} aria-label="Dark theme" title="Change theme"><span className={styles.track}><span className={styles.thumb}>{theme === 'light' ? '☼' : '☾'}</span></span></button>
}
