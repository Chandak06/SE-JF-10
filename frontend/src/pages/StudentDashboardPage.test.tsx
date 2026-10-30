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
  recordRecentMaterial('material-3', 'student-1')
  recordRecentMaterial('material-removed', 'student-1')
  vi.mocked(auth.getMaterialDetails).mockImplementation(async id => {
    if (id === 'material-removed') throw new Error('Material is unavailable.')
    return { id, title: 'Lecture Notes', subject: 'Software Engineering', description: 'Week 4', uploadedBy: 'student-2', createdAt: '2026-10-01T00:00:00.000Z' }
  })
  render(<MemoryRouter><StudentDashboardPage /></MemoryRouter>)
  const recentLinks = await screen.findAllByRole('link', { name: 'View PDF Lecture Notes' })
  expect(recentLinks.map(link => link.getAttribute('href'))).toEqual(['/materials?pdf=material-3', '/materials?pdf=material-1'])
  expect(screen.queryByText('material-removed')).not.toBeInTheDocument()
  expect(screen.getAllByRole('link', { name: /View PDF/ })).toHaveLength(2)
})

it('keeps each student recent list separate and shows a first-open empty state', () => {
  recordRecentMaterial('material-1', 'another-student')
  render(<MemoryRouter><StudentDashboardPage /></MemoryRouter>)
  expect(screen.getByText('Materials you open will appear here for quick access.')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /Quiz Attempt History/ })).toHaveAttribute('href', '/attempt-history')
  expect(screen.getByRole('link', { name: /Performance Dashboard/ })).toHaveAttribute('href', '/attempt-insights')
})
