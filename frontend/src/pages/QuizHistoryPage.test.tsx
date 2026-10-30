
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor
} from '@testing-library/react'

import { MemoryRouter } from 'react-router-dom'

import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi
} from 'vitest'

import QuizHistoryPage from './QuizHistoryPage'
import { getAttemptHistory } from '../services/attemptHistoryService'

vi.mock('../services/attemptHistoryService', () => ({
  getAttemptHistory: vi.fn()
}))

const mockHistory = vi.mocked(getAttemptHistory)

const sampleAttempt = {
  attemptId: '507f1f77bcf86cd799439021',
  quizId: '507f1f77bcf86cd799439011',
  quizTitle: 'Computer Science Quiz',
  subject: 'Computer Science',
  score: 8,
  percentage: 80,
  answersSubmitted: 10,
  submittedAt: '2026-10-30T10:00:00.000Z'
}

function renderPage() {
  return render(
    <MemoryRouter>
      <QuizHistoryPage />
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  cleanup()
})

describe('CSMQ-43: Quiz History page', () => {
  it('renders saved quiz attempts', async () => {
    mockHistory.mockResolvedValueOnce({
      attempts: [sampleAttempt],
      total: 1,
      page: 1,
      pageSize: 10,
      totalPages: 1
    })

    renderPage()

    expect(screen.getByRole('status').textContent).toContain(
      'Loading'
    )

    expect(
      await screen.findByText('Computer Science Quiz')
    ).toBeTruthy()

    expect(screen.getByText('80%')).toBeTruthy()
    expect(screen.getByText('8')).toBeTruthy()
  })

  it('shows an empty state', async () => {
    mockHistory.mockResolvedValueOnce({
      attempts: [],
      total: 0,
      page: 1,
      pageSize: 10,
      totalPages: 0
    })

    renderPage()

    expect(
      await screen.findByText('No completed quizzes yet')
    ).toBeTruthy()

    expect(
      screen.getByRole('link', { name: /Browse quizzes/i })
    ).toBeTruthy()
  })

  it('supports retrying failed requests', async () => {
    mockHistory
      .mockRejectedValueOnce(new Error('Network unavailable'))
      .mockResolvedValueOnce({
        attempts: [sampleAttempt],
        total: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1
      })

    renderPage()

    expect(
      (await screen.findByRole('alert')).textContent
    ).toContain('Network unavailable')

    fireEvent.click(
      screen.getByRole('button', { name: 'Try again' })
    )

    await screen.findByText('Computer Science Quiz')

    expect(mockHistory).toHaveBeenCalledTimes(2)
  })

  it('loads the next history page', async () => {
    mockHistory
      .mockResolvedValueOnce({
        attempts: [sampleAttempt],
        total: 12,
        page: 1,
        pageSize: 10,
        totalPages: 2
      })
      .mockResolvedValueOnce({
        attempts: [{
          ...sampleAttempt,
          attemptId: '507f1f77bcf86cd799439022',
          quizTitle: 'Database Systems Quiz'
        }],
        total: 12,
        page: 2,
        pageSize: 10,
        totalPages: 2
      })

    renderPage()

    await screen.findByText('Computer Science Quiz')

    fireEvent.click(
      screen.getByRole('button', { name: 'Next →' })
    )

    await waitFor(() => {
      expect(mockHistory).toHaveBeenCalledWith(2)
    })

    expect(
      await screen.findByText('Database Systems Quiz')
    ).toBeTruthy()
  })
})
