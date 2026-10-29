import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, expect, it, vi } from 'vitest'
import MaterialsPage from './MaterialsPage'
import * as auth from '../services/authService'

vi.mock('../services/authService', () => ({ getSessionToken: vi.fn(), getSessionUser: () => ({ role: 'student' }), searchMaterials: vi.fn(), getMaterialDetails: vi.fn(), materialFile: vi.fn(), logout: vi.fn(), uploadMaterial: vi.fn() }))
beforeEach(() => {
  vi.resetAllMocks()
  vi.mocked(auth.getSessionToken).mockReturnValue('test-token')
  vi.mocked(auth.searchMaterials).mockResolvedValue({ materials: [], nextCursor: null })
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

const item = (id: string, title = 'Notes ' + id): auth.StudyMaterial => ({ id, title, subject: 'SE', description: 'Notes', size: 100, createdAt: '2026-10-22T00:00:00Z' })
const cursor = '000000000000000000000019'
function fillUpload() {
  fireEvent.change(screen.getByLabelText('Material title'), { target: { value: 'New notes' } })
  fireEvent.change(screen.getByLabelText('Subject'), { target: { value: 'SE' } })
  fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Notes' } })
}
function submitSearch(query: string) {
  fireEvent.change(screen.getByLabelText('Search study materials'), { target: { value: query } })
  fireEvent.submit(screen.getByRole('button', { name: 'Search' }).closest('form')!)
}

it('loads the 26th material and resets pagination when a new search is submitted', async () => {
  vi.mocked(auth.searchMaterials)
    .mockResolvedValueOnce({ materials: Array.from({ length: 25 }, (_, index) => item(String(index + 1))), nextCursor: cursor })
    .mockResolvedValueOnce({ materials: [item('26')], nextCursor: null })
    .mockResolvedValueOnce({ materials: [item('beta', 'Beta notes')], nextCursor: null })
  show()
  fireEvent.click(await screen.findByRole('button', { name: 'Load more materials' }))
  await screen.findByRole('heading', { name: 'Notes 26' })
  expect(screen.getAllByRole('article')).toHaveLength(26)
  expect(auth.searchMaterials).toHaveBeenLastCalledWith('', cursor, expect.any(AbortSignal), '')
  expect(screen.queryByRole('button', { name: 'Load more materials' })).not.toBeInTheDocument()
  submitSearch('Beta')
  await screen.findByRole('heading', { name: 'Beta notes' })
  expect(screen.getAllByRole('article')).toHaveLength(1)
  expect(auth.searchMaterials).toHaveBeenLastCalledWith('Beta', undefined, expect.any(AbortSignal), '')
})

it('retries a failed next page with the same search and cursor, keeping existing results', async () => {
  vi.mocked(auth.searchMaterials)
    .mockResolvedValueOnce({ materials: [], nextCursor: null })
    .mockResolvedValueOnce({ materials: [item('1', 'Alpha one')], nextCursor: cursor })
    .mockRejectedValueOnce(new Error('Temporary page failure'))
    .mockResolvedValueOnce({ materials: [item('2', 'Alpha two')], nextCursor: null })
  show(); await screen.findByText('Nothing exists yet')
  submitSearch('Alpha')
  fireEvent.click(await screen.findByRole('button', { name: 'Load more materials' }))
  expect(await screen.findByRole('alert')).toHaveTextContent('Temporary page failure')
  expect(screen.getByRole('heading', { name: 'Alpha one' })).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
  await screen.findByRole('heading', { name: 'Alpha two' })
  expect(screen.getByRole('heading', { name: 'Alpha one' })).toBeInTheDocument()
  expect(auth.searchMaterials).toHaveBeenLastCalledWith('Alpha', cursor, expect.any(AbortSignal), '')
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
})

it('preserves the submitted search after upload and resets the native PDF picker', async () => {
  const user = userEvent.setup()
  vi.mocked(auth.searchMaterials).mockImplementation(async query => ({ materials: query === 'Alpha' ? [item('a', 'Alpha notes')] : [item('b', 'Beta notes')], nextCursor: null }))
  vi.mocked(auth.uploadMaterial).mockResolvedValue({ id: 'new' })
  show(); await screen.findByRole('heading', { name: 'Beta notes' })
  submitSearch('Alpha'); await screen.findByRole('heading', { name: 'Alpha notes' })
  fireEvent.click(screen.getByRole('button', { name: 'Upload a material' })); fillUpload()
  const file = new File(['PDF'], 'notes.pdf', { type: 'application/pdf' })
  await user.upload(screen.getByLabelText('PDF file'), file)
  fireEvent.submit(screen.getByRole('button', { name: 'Upload material' }).closest('form')!)
  await screen.findByText('Your material has been uploaded.')
  await waitFor(() => expect(screen.getByRole('button', { name: 'Upload material' })).not.toBeDisabled())
  expect(auth.searchMaterials).toHaveBeenLastCalledWith('Alpha', undefined, expect.any(AbortSignal), '')
  expect(screen.queryByRole('heading', { name: 'Beta notes' })).not.toBeInTheDocument()
  expect((screen.getByLabelText('PDF file') as HTMLInputElement).files).toHaveLength(0)
  fillUpload(); await user.upload(screen.getByLabelText('PDF file'), file)
  fireEvent.submit(screen.getByRole('button', { name: 'Upload material' }).closest('form')!)
  await waitFor(() => expect(auth.uploadMaterial).toHaveBeenCalledTimes(2))
})

it('ignores an older initial response after an upload refresh and finishes loading', async () => {
  let finishInitial!: (page: auth.MaterialPage) => void
  vi.mocked(auth.searchMaterials).mockImplementationOnce(() => new Promise(resolve => { finishInitial = resolve }))
    .mockResolvedValue({ materials: [item('new', 'New notes')], nextCursor: null })
  vi.mocked(auth.uploadMaterial).mockResolvedValue({ id: 'new' })
  show(); fireEvent.click(screen.getByRole('button', { name: 'Upload a material' })); fillUpload()
  fireEvent.change(screen.getByLabelText('PDF file'), { target: { files: [new File(['PDF'], 'notes.pdf', { type: 'application/pdf' })] } })
  fireEvent.submit(screen.getByRole('button', { name: 'Upload material' }).closest('form')!)
  await screen.findByRole('heading', { name: 'New notes' })
  await act(async () => { finishInitial({ materials: [], nextCursor: null }) })
  expect(screen.getByRole('heading', { name: 'New notes' })).toBeInTheDocument()
  expect(screen.queryByText('Loading materials…')).not.toBeInTheDocument()
})

it('does not append an older page after a different search completes', async () => {
  let finishPage!: (page: auth.MaterialPage) => void
  vi.mocked(auth.searchMaterials)
    .mockResolvedValueOnce({ materials: [item('a', 'Alpha notes')], nextCursor: cursor })
    .mockImplementationOnce(() => new Promise(resolve => { finishPage = resolve }))
    .mockResolvedValueOnce({ materials: [item('b', 'Beta notes')], nextCursor: null })
  show(); fireEvent.click(await screen.findByRole('button', { name: 'Load more materials' }))
  submitSearch('Beta'); await screen.findByRole('heading', { name: 'Beta notes' })
  await act(async () => { finishPage({ materials: [item('old', 'Old Alpha page')], nextCursor: null }) })
  expect(screen.getAllByRole('article')).toHaveLength(1)
  expect(screen.queryByRole('heading', { name: 'Old Alpha page' })).not.toBeInTheDocument()
})

it('retries a failed first-page search with the same query', async () => {
  vi.mocked(auth.searchMaterials)
    .mockResolvedValueOnce({ materials: [], nextCursor: null })
    .mockRejectedValueOnce(new Error('Temporary search failure'))
    .mockResolvedValueOnce({ materials: [item('a', 'Alpha notes')], nextCursor: null })
  show(); await screen.findByText('Nothing exists yet')
  submitSearch('Alpha')
  expect(await screen.findByRole('alert')).toHaveTextContent('Temporary search failure')
  fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
  await screen.findByRole('heading', { name: 'Alpha notes' })
  expect(auth.searchMaterials).toHaveBeenLastCalledWith('Alpha', undefined, expect.any(AbortSignal), '')
})

it('combines keyword and subject filters and explains unmatched results', async () => {
  show(); await screen.findByText('Nothing exists yet')
  fireEvent.change(screen.getByLabelText('Search study materials'), { target: { value: 'algorithms' } })
  fireEvent.change(screen.getByLabelText('Filter by subject'), { target: { value: 'CS' } })
  fireEvent.submit(screen.getByRole('button', { name: 'Search' }).closest('form')!)
  expect(await screen.findByText('No matching materials')).toBeInTheDocument()
  expect(auth.searchMaterials).toHaveBeenLastCalledWith('algorithms', undefined, expect.any(AbortSignal), 'CS')
})

it('loads and displays metadata for a selected material', async () => {
  const selected = { id: 'material-id', title: 'Selected Notes', subject: 'Software Engineering', description: 'Sprint review notes', uploadedBy: 'student-id', createdAt: '2026-10-21T10:30:00.000Z' }
  vi.mocked(auth.searchMaterials).mockResolvedValue({ materials: [item(selected.id, selected.title)], nextCursor: null })
  vi.mocked(auth.getMaterialDetails).mockResolvedValue(selected)
  show()
  await screen.findByRole('heading', { name: 'Selected Notes' })
  fireEvent.click(screen.getByRole('button', { name: 'View details for Selected Notes' }))
  expect(await screen.findByRole('dialog', { name: 'Selected Notes' })).toBeInTheDocument()
  expect(screen.getByText('Software Engineering')).toBeInTheDocument()
  expect(screen.getByText('Sprint review notes')).toBeInTheDocument()
  expect(screen.getByText('student-id')).toBeInTheDocument()
  expect(screen.getByText(new Date(selected.createdAt).toLocaleString())).toBeInTheDocument()
  expect(auth.getMaterialDetails).toHaveBeenCalledWith(selected.id)
})

it('shows an unavailable message when selected material details cannot be loaded', async () => {
  vi.mocked(auth.searchMaterials).mockResolvedValue({ materials: [item('gone', 'Removed notes')], nextCursor: null })
  vi.mocked(auth.getMaterialDetails).mockRejectedValue(new Error('Material is unavailable.'))
  show()
  await screen.findByRole('heading', { name: 'Removed notes' })
  fireEvent.click(screen.getByRole('button', { name: 'View details for Removed notes' }))
  expect(await screen.findByRole('alert')).toHaveTextContent('Material is unavailable.')
})

it('opens the selected PDF inline and releases its object URL when closed', async () => {
  const blob = new Blob(['PDF content'], { type: 'application/pdf' })
  vi.mocked(auth.searchMaterials).mockResolvedValue({ materials: [item('pdf-1', 'Lecture Notes')], nextCursor: null })
  vi.mocked(auth.materialFile).mockResolvedValue(blob)
  const objectUrl = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:lecture-notes')
  const revokeUrl = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
  show()
  fireEvent.click(await screen.findByRole('button', { name: 'View PDF Lecture Notes' }))
  expect(await screen.findByTitle('Lecture Notes PDF')).toHaveAttribute('src', 'blob:lecture-notes')
  expect(auth.materialFile).toHaveBeenCalledWith('pdf-1', 'inline')
  fireEvent.click(screen.getByRole('button', { name: 'Full screen' }))
  expect(screen.getByRole('dialog').parentElement?.className).toContain('pdfFullScreenOverlay')
  fireEvent.click(screen.getByRole('button', { name: 'Exit full screen' }))
  fireEvent.click(screen.getByRole('button', { name: 'Close PDF viewer' }))
  await waitFor(() => expect(revokeUrl).toHaveBeenCalledWith('blob:lecture-notes'))
  expect(objectUrl).toHaveBeenCalledWith(blob)
})

it('downloads the selected PDF with a title based PDF filename', async () => {
  const blob = new Blob(['PDF content'], { type: 'application/pdf' })
  vi.mocked(auth.searchMaterials).mockResolvedValue({ materials: [item('pdf-2', 'Éxam Notes 2')], nextCursor: null })
  vi.mocked(auth.materialFile).mockResolvedValue(blob)
  vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:download')
  const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
    expect(this.download).toBe('Exam-Notes-2.pdf')
  })
  show()
  fireEvent.click(await screen.findByRole('button', { name: 'Download PDF Éxam Notes 2' }))
  await waitFor(() => expect(auth.materialFile).toHaveBeenCalledWith('pdf-2'))
  expect(click).toHaveBeenCalledOnce()
})
