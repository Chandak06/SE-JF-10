import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, expect, it, vi } from 'vitest'
import StudentDashboardPage from './StudentDashboardPage'
import * as auth from '../services/authService'
import { recordRecentMaterial } from '../services/recentMaterials'

vi.mock('../services/authService', () => ({
  getSessionUser: () => ({ id: 'student-1', name: 'Student', role: 'student' }),
  getMaterialDetails: vi.fn()
}))

beforeEach(() => { localStorage.clear(); vi.resetAllMocks() })

it('shows recently opened active materials and links back to their details', async () => {
  recordRecentMaterial('material-1', 'student-1')
  recordRecentMaterial('material-removed', 'student-1')
  vi.mocked(auth.getMaterialDetails).mockImplementation(async id => {
    if (id === 'material-removed') throw new Error('Material is unavailable.')
    return { id, title: 'Lecture Notes', subject: 'Software Engineering', description: 'Week 4', uploadedBy: 'student-2', createdAt: '2026-10-01T00:00:00.000Z' }
  })
  render(<MemoryRouter><StudentDashboardPage /></MemoryRouter>)
  expect(await screen.findByRole('link', { name: 'View PDF Lecture Notes' })).toHaveAttribute('href', '/materials?pdf=material-1')
  expect(screen.queryByText('material-removed')).not.toBeInTheDocument()
})

it('keeps each student recent list separate and shows a first-open empty state', () => {
  recordRecentMaterial('material-1', 'another-student')
  render(<MemoryRouter><StudentDashboardPage /></MemoryRouter>)
  expect(screen.getByText('Materials you open will appear here for quick access.')).toBeInTheDocument()
})
