import { beforeEach, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import AdminDashboardPage from './AdminDashboardPage'
import * as auth from '../services/authService'
vi.mock('../services/authService', () => ({ currentUser: vi.fn(), moderationKinds: vi.fn() }))
beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(auth.currentUser).mockResolvedValue({ id: 'admin', name: 'Admin', email: 'admin@example.test', role: 'admin' })
  vi.mocked(auth.moderationKinds).mockResolvedValue(['materials', 'questions'])
})
const show = () => render(<MemoryRouter><AdminDashboardPage /></MemoryRouter>)
it('reuses Question Bank and the available moderation routes and identifies missing Quiz integration', async () => {
  show()
  expect(await screen.findByRole('link', { name: 'Open Question Bank' })).toHaveAttribute('href', '/questions')
  expect(screen.getByRole('link', { name: 'Moderate materials' })).toHaveAttribute('href', '/admin/moderation?kind=materials')
  expect(screen.getByRole('link', { name: 'Moderate questions' })).toHaveAttribute('href', '/admin/moderation?kind=questions')
  expect(screen.getByText('Quiz module integration is pending.')).toBeInTheDocument()
  expect(screen.queryByRole('link', { name: 'Moderate quizzes' })).not.toBeInTheDocument()
})
it('refuses a server-identified Student without querying administrator resources', async () => {
  vi.mocked(auth.currentUser).mockResolvedValue({ id: 'student', name: 'Student', email: 'student@example.test', role: 'student' }); show()
  expect(await screen.findByRole('alert')).toHaveTextContent('Administrator access is required.')
  expect(auth.moderationKinds).not.toHaveBeenCalled()
})
it('shows controlled loading/error states and retries a failed resource request', async () => {
  const user = userEvent.setup(); vi.mocked(auth.moderationKinds).mockRejectedValueOnce(new Error('Unable to load tools.')); show()
  expect(screen.getByRole('status')).toHaveTextContent('Loading')
  expect(await screen.findByRole('alert')).toHaveTextContent('Unable to load tools.')
  await user.click(screen.getByRole('button', { name: 'Try again' }))
  expect(await screen.findByRole('link', { name: 'Moderate questions' })).toBeInTheDocument()
})
it('offers Quiz moderation when a real owner adapter has been registered', async () => {
  vi.mocked(auth.moderationKinds).mockResolvedValue(['materials', 'questions', 'quizzes']); show()
  expect(await screen.findByRole('link', { name: 'Moderate quizzes' })).toHaveAttribute('href', '/admin/moderation?kind=quizzes')
})
