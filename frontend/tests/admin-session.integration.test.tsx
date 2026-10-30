import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../src/App'
import { ThemeProvider } from '../src/components/ThemeToggle'
import * as auth from '../src/services/authService'

const fetchMock = vi.fn()
const user = { id: 'account-1', name: 'Demo User', email: 'account@example.test', role: 'admin' }
const reply = (body: unknown, status = 200) => ({ ok: status >= 200 && status < 300, status, json: async () => body })
beforeEach(async () => {
  vi.stubGlobal('fetch', fetchMock); fetchMock.mockReset(); fetchMock.mockResolvedValue(reply(null, 204))
  await auth.logout(); sessionStorage.clear(); localStorage.clear(); fetchMock.mockReset()
})
afterEach(() => vi.unstubAllGlobals())
function show() { return render(<ThemeProvider><MemoryRouter initialEntries={['/questions']}><App /></MemoryRouter></ThemeProvider>) }

it('waits for server validation before restoring Admin navigation and Question Bank after refresh', async () => {
  sessionStorage.setItem('study-commons-session-token', 'valid-server-session')
  let resolve!: (value: ReturnType<typeof reply>) => void
  fetchMock.mockReturnValueOnce(new Promise(done => { resolve = done })).mockResolvedValue(reply({ questions: [] }))
  show()
  expect(screen.getByRole('status')).toHaveTextContent('Restoring session')
  expect(screen.queryByRole('link', { name: 'Question Bank' })).not.toBeInTheDocument()
  resolve(reply({ authenticatedUser: user }))
  expect(await screen.findByRole('heading', { name: 'Question Bank', exact: true })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Question Bank' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: '+ Add New MCQ' })).toBeInTheDocument()
})
it('ignores a forged browser role and redirects a server-identified Student to their dashboard', async () => {
  sessionStorage.setItem('study-commons-session-token', 'student-session')
  sessionStorage.setItem('role', 'admin'); localStorage.setItem('user', JSON.stringify(user))
  fetchMock.mockResolvedValueOnce(reply({ authenticatedUser: { ...user, role: 'student' } })).mockResolvedValue(reply({ materials: [] }))
  show()
  expect(await screen.findByRole('heading', { name: 'Welcome, Demo User' })).toBeInTheDocument()
  expect(screen.queryByRole('link', { name: 'Question Bank' })).not.toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Quiz History' })).toHaveAttribute('href', '/attempt-history')
  expect(screen.queryByRole('link', { name: 'Practice Quiz' })).not.toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Materials', exact: true })).toHaveAttribute('href', '/materials')
})
it('redirects an expired stored session to the common login page after refresh', async () => {
  sessionStorage.setItem('study-commons-session-token', 'expired-session')
  fetchMock.mockResolvedValue(reply({}, 401)); show()
  expect(await screen.findByRole('heading', { name: 'Log in', exact: true })).toBeInTheDocument()
  expect(auth.hasStoredSession()).toBe(false)
  expect(screen.queryByRole('link', { name: 'Question Bank' })).not.toBeInTheDocument()
})
