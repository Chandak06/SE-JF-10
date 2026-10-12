import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, expect, it, vi } from 'vitest'
import MaterialsPage from './MaterialsPage'
import * as auth from '../services/authService'
vi.mock('../services/authService', () => ({ getSessionToken: vi.fn(), logout: vi.fn(), uploadMaterial: vi.fn() }))
beforeEach(() => { vi.clearAllMocks(); vi.mocked(auth.getSessionToken).mockReturnValue('test-token') })
const show = () => render(<MemoryRouter><MaterialsPage /></MemoryRouter>)
it('requires login before showing the upload form', () => {
  vi.mocked(auth.getSessionToken).mockReturnValue(null); show()
  expect(screen.getByRole('link', { name: 'log in' })).toHaveAttribute('href', '/login')
  expect(screen.queryByRole('button', { name: 'Upload PDF' })).not.toBeInTheDocument()
})
it('submits PDF metadata through the shared authenticated service', async () => {
  const user = userEvent.setup(); show()
  await user.type(screen.getByLabelText('Title'), 'Notes'); await user.type(screen.getByLabelText('Subject'), 'SE')
  await user.type(screen.getByLabelText('Description'), 'Sprint notes')
  const file = new File(['PDF'], 'notes.pdf', { type: 'application/pdf' })
  await user.upload(screen.getByLabelText('PDF file'), file)
  vi.mocked(auth.uploadMaterial).mockResolvedValueOnce({ id: 'material-1' })
  await user.click(screen.getByRole('button', { name: 'Upload PDF' }))
  expect(await screen.findByRole('status')).toHaveTextContent('Your PDF has been uploaded.')
  expect(auth.uploadMaterial).toHaveBeenCalledWith({ title: 'Notes', subject: 'SE', description: 'Sprint notes', file })
})
it('reports failed logout instead of claiming the session was revoked', async () => {
  const user = userEvent.setup(); vi.mocked(auth.logout).mockRejectedValueOnce(new Error('offline')); show()
  await user.click(screen.getByRole('button', { name: 'Log out' }))
  expect(await screen.findByRole('status')).toHaveTextContent('Unable to log out. Try again.')
})
