import { beforeEach, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '../src/App'
import { ThemeProvider } from '../src/components/ThemeToggle'
import * as auth from '../src/services/authService'
const state = vi.hoisted(() => ({ token: null as string | null, user: null as { id: string; name: string; email: string; role: string } | null }))
vi.mock('../src/services/authService', () => ({
  getSessionToken: () => state.token, getSessionUser: () => state.user,
  hasStoredSession: () => false, restoreSession: vi.fn(),
  currentUser: async () => state.user, moderationKinds: async () => ['materials', 'questions'],
  searchMaterials: async () => ({ materials: [], nextCursor: null }), login: vi.fn()
}))
const account = { id: 'admin-1', name: 'Admin', email: 'admin@example.test', role: 'admin' }
const show = (path: string) => render(<ThemeProvider><MemoryRouter initialEntries={[path]}><App /></MemoryRouter></ThemeProvider>)
beforeEach(() => { state.token = null; state.user = null; vi.clearAllMocks() })
it('redirects unauthenticated dashboard access to common login', async () => {
  show('/admin'); expect(await screen.findByRole('heading', { name: 'Log in', exact: true })).toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'Administrator Dashboard' })).not.toBeInTheDocument()
})
it.each(['/admin', '/admin/moderation'])('keeps Students away from %s and opens the student dashboard', async path => {
  state.token = 'student-token'; state.user = { ...account, role: 'student' }; show(path)
  expect(await screen.findByRole('heading', { name: 'Welcome, Admin' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Practice Quiz' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Materials', exact: true })).toHaveAttribute('href', '/materials')
  expect(screen.queryByRole('link', { name: 'Admin Dashboard' })).not.toBeInTheDocument()
})
it('routes successful Admin login to the dashboard with Question Bank and moderation links', async () => {
  const user = userEvent.setup()
  vi.mocked(auth.login).mockImplementationOnce(async () => { state.token = 'admin-token'; state.user = account; return { authenticatedUser: account, token: state.token } })
  show('/login'); await user.type(screen.getByLabelText('Email'), account.email)
  await user.type(screen.getByLabelText('Password'), 'Disposable administrator password!')
  await user.click(screen.getByRole('button', { name: 'Log in', exact: true }))
  expect(await screen.findByRole('heading', { name: 'Administrator Dashboard' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Study Commons admin dashboard' })).toHaveAttribute('href', '/admin')
  expect(await screen.findByRole('link', { name: 'Open Question Bank' })).toHaveAttribute('href', '/questions')
  expect(screen.getByRole('link', { name: 'Moderate questions' })).toBeInTheDocument()
})
