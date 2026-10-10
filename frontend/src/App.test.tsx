import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { ThemeProvider } from './components/ThemeToggle'
import { BrowserRouter } from 'react-router-dom'
import * as auth from './services/authService'

vi.mock('./services/authService', () => ({ register: vi.fn(), login: vi.fn() }))
function renderApp() { return render(<ThemeProvider><BrowserRouter><App /></BrowserRouter></ThemeProvider>) }
beforeEach(() => { localStorage.clear(); vi.clearAllMocks() })

describe('Study Commons routes and forms', () => {
  it('shows landing navigation and opens registration', async () => {
    const user = userEvent.setup(); renderApp()
    expect(screen.getByRole('heading', { name: /good learning/i })).toBeInTheDocument()
    await user.click(screen.getByRole('link', { name: /create your account/i }))
    expect(screen.getByRole('heading', { name: /create your account/i })).toBeInTheDocument()
    expect(screen.getByLabelText('Name')).toBeInTheDocument()
  })
  it('switches theme and remembers the choice', async () => {
    const user = userEvent.setup(); renderApp()
    await user.click(screen.getByRole('switch', { name: 'Dark theme' }))
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
    expect(localStorage.getItem('study-theme')).toBe('dark')
  })
  it('validates registration fields before calling the API', async () => {
    const user = userEvent.setup(); renderApp(); await user.click(screen.getByRole('link', { name: /create account/i }))
    await user.click(screen.getByRole('button', { name: /create account/i }))
    expect(screen.getByText('Enter your name.')).toBeInTheDocument()
    expect(screen.getByText('Enter your email address.')).toBeInTheDocument()
    expect(screen.getByText('Enter a password.')).toBeInTheDocument()
    expect(auth.register).not.toHaveBeenCalled()
  })
  it('shows login validation and API errors', async () => {
    const user = userEvent.setup(); vi.mocked(auth.login).mockRejectedValueOnce(new Error('Invalid email or password.'))
    renderApp(); await user.click(within(screen.getByRole('navigation')).getByRole('link', { name: 'Log in' }))
    await user.type(screen.getByLabelText('Email'), 'student@example.com')
    await user.type(screen.getByLabelText('Password'), 'ExamplePassword123!')
    await user.click(screen.getByRole('button', { name: 'Log in' }))
    expect(await screen.findByText('Invalid email or password.')).toBeInTheDocument()
    expect(auth.login).toHaveBeenCalledWith({ email: 'student@example.com', password: 'ExamplePassword123!' })
  })
  it('does not accept invalid email or short password on login', async () => {
    renderApp(); fireEvent.click(within(screen.getByRole('navigation')).getByRole('link', { name: 'Log in' }))
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'bad-email' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'short' } })
    fireEvent.click(screen.getByRole('button', { name: 'Log in' }))
    await waitFor(() => expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument())
    expect(auth.login).not.toHaveBeenCalled()
  })
})
