import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import QuizInsightsPage from './QuizInsightsPage'
import { getAttemptHistory } from '../services/attemptHistoryService'

vi.mock('../services/attemptHistoryService', () => ({ getAttemptHistory: vi.fn() }))
const getHistoryMock = vi.mocked(getAttemptHistory)

const item = {
  attemptId: '507f1f77bcf86cd799439021',
  quizId: '507f1f77bcf86cd799439011',
  quizTitle: 'Database Fundamentals',
  subject: 'DBMS',
  score: 8,
  percentage: 80,
  answersSubmitted: 10,
  submittedAt: '2026-10-30T10:00:00.000Z'
}

const response = {
  attempts: [item], page: 1, pageSize: 50, total: 1, totalPages: 1
}

function renderPage() {
  return render(<MemoryRouter><QuizInsightsPage /></MemoryRouter>)
}

beforeEach(() => vi.clearAllMocks())
afterEach(() => cleanup())

describe('QuizInsightsPage', () => {
  it('loads a bounded recent sample and shows saved metrics', async () => {
    getHistoryMock.mockResolvedValueOnce(response)
    renderPage()
    expect(screen.getByRole('status').textContent).toContain('Loading')
    expect((await screen.findAllByText('80%')).length).toBeGreaterThan(0)
    expect(screen.getByText('DBMS')).toBeTruthy()
    expect(screen.getByRole('button', { name: /Export shown attempts/i })).toBeTruthy()
    expect(getHistoryMock).toHaveBeenCalledWith(1, 50)
  })

  it('does not pretend a limited sample represents the full history', async () => {
    getHistoryMock.mockResolvedValueOnce({ ...response, total: 99, totalPages: 2 })
    renderPage()
    expect(await screen.findByText(/1 most recent attempts out of 99/)).toBeTruthy()
  })

  it('handles an empty history', async () => {
    getHistoryMock.mockResolvedValueOnce({ attempts: [], page: 1, pageSize: 50, total: 0, totalPages: 0 })
    renderPage()
    expect(await screen.findByText('No quiz results to analyze yet')).toBeTruthy()
  })

  it('retries a failed history request', async () => {
    getHistoryMock.mockRejectedValueOnce(new Error('Network unavailable')).mockResolvedValueOnce(response)
    renderPage()
    expect((await screen.findByRole('alert')).textContent).toContain('Network unavailable')
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect((await screen.findAllByText('80%')).length).toBeGreaterThan(0)
    expect(getHistoryMock).toHaveBeenCalledTimes(2)
  })
})
