import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import QuizHistoryPage from './QuizHistoryPage'

vi.mock('../services/attemptHistoryService', () => ({
  getAttemptHistory: vi.fn().mockResolvedValue({
    attempts: [], total: 0, page: 1, pageSize: 10, totalPages: 0
  })
}))

afterEach(() => cleanup())

describe('performance insights navigation', () => {
  it('provides a link from history to performance insights', () => {
    render(<MemoryRouter><QuizHistoryPage /></MemoryRouter>)
    const link = screen.getByRole('link', { name: 'Performance insights' })
    expect(link.getAttribute('href')).toBe('/attempt-insights')
  })
})
