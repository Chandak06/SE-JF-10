import { Navigate, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import MaterialsPage from './pages/MaterialsPage'
import styles from './App.module.css'
import { getSessionToken } from './services/authService'

function MaterialsRoute() {
  return getSessionToken() ? <MaterialsPage /> : <Navigate to="/login" replace />
}

export default function App() {
  return <div className={styles.app}><Navbar /><main className={styles.main}><Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/materials" element={<MaterialsRoute />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></main></div>
}
