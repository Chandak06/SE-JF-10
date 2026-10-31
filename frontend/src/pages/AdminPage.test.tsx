import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, expect, it, vi } from 'vitest'
import AdminPage from './AdminPage'
import * as auth from '../services/authService'
vi.mock('../services/authService', () => ({ currentUser: vi.fn(), moderationKinds: vi.fn(), moderationItems: vi.fn(), removeItem: vi.fn(), removeAllItems: vi.fn() }))
beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(auth.currentUser).mockResolvedValue({ id: 'admin', name: 'Admin', email: 'admin@example.com', role: 'admin' })
  vi.mocked(auth.moderationKinds).mockResolvedValue(['materials'])
  vi.mocked(auth.moderationItems).mockResolvedValue({ items: [{ id: 'material-1', title: 'Notes', subject: 'Math' }], filters: { subjects: ['Math'], difficulties: ['Easy'] } })
  vi.mocked(auth.removeItem).mockResolvedValue(undefined)
})
const show = () => render(<MemoryRouter><AdminPage /></MemoryRouter>)
it('opens the moderation category selected from the dashboard', async () => {
  vi.mocked(auth.moderationKinds).mockResolvedValue(['materials', 'questions'])
  render(<MemoryRouter initialEntries={['/admin/moderation?kind=questions']}><AdminPage /></MemoryRouter>)
  await screen.findByRole('button', { name: 'Delete Notes' })
  expect(auth.moderationItems).toHaveBeenCalledWith('questions', { subject: undefined, difficulty: undefined })
  expect(screen.getByLabelText('Content type')).toHaveValue('questions')
  expect(screen.getByLabelText('Subject')).toBeInTheDocument()
  expect(screen.getByLabelText('Difficulty')).toBeInTheDocument()
})
it('blocks student moderation before loading resources', async () => {
  vi.mocked(auth.currentUser).mockResolvedValue({ id: 'student', name: 'Student', email: 'student@example.com', role: 'student' }); show()
  expect(await screen.findByText('Administrator access is required.')).toBeInTheDocument()
  expect(auth.moderationKinds).not.toHaveBeenCalled()
})
it('offers per-item deletion with a separate confirmation and cancellation', async () => {
  const user = userEvent.setup(); show()
  await screen.findByRole('button', { name: 'Delete Notes' })
  expect(screen.queryByRole('button', { name: 'Select Notes' })).not.toBeInTheDocument()
  await user.click(await screen.findByRole('button', { name: 'Delete Notes' }))
  expect(screen.getByRole('dialog')).toBeInTheDocument(); expect(auth.removeItem).not.toHaveBeenCalled()
  await user.click(screen.getByRole('button', { name: 'Cancel' }))
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument(); expect(auth.removeItem).not.toHaveBeenCalled()
  await user.click(screen.getByRole('button', { name: 'Delete Notes' }))
  await user.click(screen.getByRole('button', { name: 'Confirm removal' }))
  expect(await screen.findByText('Resource removed.')).toBeInTheDocument()
  expect(auth.removeItem).toHaveBeenCalledWith('materials', 'material-1')
  expect(screen.queryByRole('button', { name: 'Delete Notes' })).not.toBeInTheDocument()
})
it('retains the resource and confirmation when removal fails', async () => {
  const user = userEvent.setup(); vi.mocked(auth.removeItem).mockRejectedValueOnce(new Error('Resource unavailable.')); show()
  await user.click(await screen.findByRole('button', { name: 'Delete Notes' })); await user.click(screen.getByRole('button', { name: 'Confirm removal' }))
  expect(await screen.findByText('Resource unavailable.')).toBeInTheDocument()
  expect(screen.getByRole('dialog')).toBeInTheDocument()
})
