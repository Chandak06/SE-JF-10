import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { ThemeProvider } from './components/ThemeToggle'
import { BrowserRouter } from 'react-router-dom'
import * as auth from './services/authService'

const authState = vi.hoisted(() => ({ sessionToken: null as string | null, user: null as { id: string; name: string; email: string; role: string } | null }))
vi.mock('./services/authService', () => ({ register: vi.fn(), login: vi.fn(), logout: vi.fn(), listMaterials: vi.fn().mockResolvedValue([]), getSessionToken: () => authState.sessionToken, getSessionUser: () => authState.user }))
function renderApp() { return render(<ThemeProvider><BrowserRouter><App /></BrowserRouter></ThemeProvider>) }
beforeEach(() => { localStorage.clear(); window.history.replaceState({}, '', '/'); authState.sessionToken = null; authState.user = null; vi.clearAllMocks() })

describe('Study Commons routes and forms', () => {
  it('redirects anonymous quiz access to login', async () => {
    window.history.replaceState({}, '', '/quiz-attempt'); renderApp()
    expect(await screen.findByRole('heading', { name: 'Log in' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Computer Science Practice Quiz' })).not.toBeInTheDocument()
  })
  it('keeps independent answers in the authenticated student prototype', async () => {
    const user = userEvent.setup()
    authState.sessionToken = 'test-token'
    authState.user = { id: 'student-1', name: 'Student', email: 'student@example.com', role: 'student' }
    sessionStorage.setItem('study-commons-quiz-responses:student-1', 'null')
    window.history.replaceState({}, '', '/quiz-attempt'); renderApp()
    await user.click(screen.getByRole('radio', { name: /TCP/ }))
    await user.click(screen.getByRole('button', { name: /Next/ }))
    await user.click(screen.getByRole('radio', { name: /Queue/ }))
    await user.click(screen.getByRole('button', { name: /Previous/ }))
    expect(screen.getByRole('radio', { name: /TCP/ })).toHaveAttribute('aria-checked', 'true')
    expect(JSON.parse(sessionStorage.getItem('study-commons-quiz-responses:student-1')!)).toEqual({ q1: 'B', q2: 'B' })
    expect(sessionStorage.getItem('study-commons-quiz-responses:student-2')).toBeNull()
  })
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
    const user = userEvent.setup(); renderApp(); await user.click(screen.getByRole('link', { name: /create your account/i }))
    await user.click(screen.getByRole('button', { name: /create account/i }))
    expect(screen.getByText('Enter your name.')).toBeInTheDocument()
    expect(screen.getByText('Enter your email address.')).toBeInTheDocument()
    expect(screen.getByText('Enter a password.')).toBeInTheDocument()
    expect(auth.register).not.toHaveBeenCalled()
  })
  it('shows a success message after successful registration', async () => {
    const user = userEvent.setup()
    vi.mocked(auth.register).mockResolvedValueOnce({
      authenticatedUser: {
        id: 'user-1',
        name: 'Test Student',
        email: 'student@example.com',
        role: 'student',
      },
    })

    renderApp()
    await user.click(screen.getByRole('link', { name: /create your account/i }))
    await user.type(screen.getByLabelText('Name'), 'Test Student')
    await user.type(screen.getByLabelText('Email'), 'student@example.com')
    await user.type(screen.getByLabelText('Password'), 'ExamplePassword123!')
    await user.click(screen.getByRole('button', { name: /create account/i }))

    expect(
      await screen.findByText(/account created for test student/i),
    ).toBeInTheDocument()
    expect(auth.register).toHaveBeenCalledWith({
      name: 'Test Student',
      email: 'student@example.com',
      password: 'ExamplePassword123!',
    })
  })

  it('shows a duplicate-email error during registration', async () => {
    const user = userEvent.setup()
    vi.mocked(auth.register).mockRejectedValueOnce(
      new Error('An account with this email already exists.'),
    )

    renderApp()
    await user.click(screen.getByRole('link', { name: /create your account/i }))
    await user.type(screen.getByLabelText('Name'), 'Test Student')
    await user.type(screen.getByLabelText('Email'), 'student@example.com')
    await user.type(screen.getByLabelText('Password'), 'ExamplePassword123!')
    await user.click(screen.getByRole('button', { name: /create account/i }))

    expect(
      await screen.findByText('An account with this email already exists.'),
    ).toBeInTheDocument()
  })

  it('shows a useful error when registration cannot reach the server', async () => {
    const user = userEvent.setup()
    vi.mocked(auth.register).mockRejectedValueOnce(
      new Error('Unable to reach the server. Check your connection and try again.'),
    )

    renderApp()
    await user.click(screen.getByRole('link', { name: /create your account/i }))
    await user.type(screen.getByLabelText('Name'), 'Test Student')
    await user.type(screen.getByLabelText('Email'), 'student@example.com')
    await user.type(screen.getByLabelText('Password'), 'ExamplePassword123!')
    await user.click(screen.getByRole('button', { name: /create account/i }))

    expect(
      await screen.findByText(/unable to reach the server/i),
    ).toBeInTheDocument()
  })
  it('shows login validation and API errors', async () => {
    const user = userEvent.setup(); vi.mocked(auth.login).mockRejectedValueOnce(new Error('Invalid email or password.'))
    renderApp(); await user.click(screen.getByRole('link', { name: 'Log in' }))
    await user.type(screen.getByLabelText('Email'), 'student@example.com')
    await user.type(screen.getByLabelText('Password'), 'ExamplePassword123!')
    await user.click(screen.getByRole('button', { name: 'Log in' }))
    expect(await screen.findByText('Invalid email or password.')).toBeInTheDocument()
    expect(auth.login).toHaveBeenCalledWith({ email: 'student@example.com', password: 'ExamplePassword123!' })
  })
  it('does not accept invalid email or short password on login', async () => {
    renderApp(); fireEvent.click(screen.getByRole('link', { name: 'Log in' }))
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'bad-email' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'short' } })
    fireEvent.click(screen.getByRole('button', { name: 'Log in' }))
    await waitFor(() => expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument())
    expect(auth.login).not.toHaveBeenCalled()
  })

  it('redirects logged-out visitors from materials to login', () => {
    window.history.pushState({}, '', '/materials')
    renderApp()
    expect(screen.getByRole('heading', { name: 'Log in' })).toBeInTheDocument()
  })

  it('navigates to materials after a successful login and updates navigation', async () => {
    const user = userEvent.setup()
    vi.mocked(auth.login).mockImplementationOnce(async () => {
      authState.sessionToken = 'test-token'
      authState.user = { id: 'user-1', name: 'Student', email: 'student@example.com', role: 'student' }
      return { authenticatedUser: { id: 'user-1', name: 'Student', email: 'student@example.com', role: 'student' }, token: 'test-token' }
    })
    renderApp()
    await user.click(screen.getByRole('link', { name: 'Log in' }))
    await user.type(screen.getByLabelText('Email'), 'student@example.com')
    await user.type(screen.getByLabelText('Password'), 'ExamplePassword123!')
    await user.click(screen.getByRole('button', { name: 'Log in' }))

    expect(await screen.findByText('Nothing exists yet')).toBeInTheDocument()
    expect(within(screen.getByRole('navigation')).getByRole('link', { name: 'Materials' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Materials' })).not.toBeInTheDocument()
  })

  it('logs out and returns to login with logged-out navigation', async () => {
    const user = userEvent.setup()
    authState.sessionToken = 'test-token'
    authState.user = { id: 'user-1', name: 'Student', email: 'student@example.com', role: 'student' }
    vi.mocked(auth.logout).mockImplementationOnce(async () => { authState.sessionToken = null; authState.user = null })
    window.history.pushState({}, '', '/materials')
    renderApp()

    await user.click(screen.getByRole('button', { name: 'Open profile menu' }))
    await user.click(screen.getByRole('button', { name: 'Log out' }))

    expect(await screen.findByRole('heading', { name: 'Log in' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Log in' })).not.toBeInTheDocument()
    expect(auth.logout).toHaveBeenCalledOnce()
  })
})
