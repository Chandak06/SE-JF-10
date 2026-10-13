import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, expect, it, vi } from 'vitest'
import MaterialsPage from './MaterialsPage'
import * as auth from '../services/authService'

vi.mock('../services/authService', () => ({ getSessionToken: vi.fn(), listMaterials: vi.fn(), logout: vi.fn(), uploadMaterial: vi.fn() }))
beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(auth.getSessionToken).mockReturnValue('test-token')
  vi.mocked(auth.listMaterials).mockResolvedValue([])
})
const show = () => render(<MemoryRouter><MaterialsPage /></MemoryRouter>)

it('shows the empty library state and opens a separate upload form', async () => {
  const user = userEvent.setup(); show()
  expect(await screen.findByText('Nothing exists yet')).toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'Materials' })).not.toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Upload a material' }))
  expect(screen.getByRole('dialog', { name: 'Upload a material' })).toBeInTheDocument()
  expect(screen.getByLabelText('Material title')).toBeInTheDocument()
})

it('submits PDF metadata through the shared authenticated service', async () => {
  const user = userEvent.setup(); show()
  await screen.findByText('Nothing exists yet')
  await user.click(screen.getByRole('button', { name: 'Upload a material' }))
  await user.type(screen.getByLabelText('Material title'), 'Notes')
  await user.type(screen.getByLabelText('Subject'), 'SE')
  await user.type(screen.getByLabelText('Description'), 'Sprint notes')
  const file = new File(['PDF'], 'notes.pdf', { type: 'application/pdf' })
  await user.upload(screen.getByLabelText('PDF file'), file)
  vi.mocked(auth.uploadMaterial).mockResolvedValueOnce({ id: 'material-1' })
  await user.click(screen.getByRole('button', { name: 'Upload material' }))
  expect(await screen.findByRole('status')).toHaveTextContent('Your material has been uploaded.')
  expect(auth.uploadMaterial).toHaveBeenCalledWith({ title: 'Notes', subject: 'SE', description: 'Sprint notes', file })
})
