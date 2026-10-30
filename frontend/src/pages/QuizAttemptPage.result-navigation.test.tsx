import { cleanup, fireEvent, render, screen, within, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import QuizAttemptPage, { type QuizQuestion } from './QuizAttemptPage'
import { submitQuizAttempt, type AttemptResult } from '../services/attemptService'

vi.mock('../services/authService', () => ({
  getSessionUser: () => ({ id: 'cs42-student', role: 'student' })
}))
vi.mock('../services/attemptService', () => ({ submitQuizAttempt: vi.fn() }))

const quizId = '507f1f77bcf86cd799439011'
const questionId = '507f191e810c19729de860ea'
const questions: QuizQuestion[] = [{
  id: questionId,
  questionText: 'Which protocol uses connections?',
  options: [{ id: 'A', text: 'UDP' }, { id: 'B', text: 'TCP' }]
}]
const result: AttemptResult = {
  attemptId: '507f1f77bcf86cd799439099', quizId,
  score: 1, total: 1, percentage: 100,
  correct: 1, incorrect: 0, unanswered: 0
}
const submitMock = vi.mocked(submitQuizAttempt)

function submitPage() {
  fireEvent.click(screen.getByRole('button', { name: 'Submit quiz' }))
  fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Submit quiz' }))
}

beforeEach(() => {
  window.sessionStorage.clear()
  vi.clearAllMocks()
})
afterEach(() => cleanup())

describe('CSMQ-42: result navigation triggered only by saved attempts', () => {
  it('calls the success handler with the server result', async () => {
    submitMock.mockResolvedValueOnce(result)
    const onSubmissionSuccess = vi.fn()
    render(<QuizAttemptPage quizId={quizId} questions={questions} onSubmissionSuccess={onSubmissionSuccess} />)
    submitPage()
    await waitFor(() => expect(onSubmissionSuccess).toHaveBeenCalledWith(result))
    expect(onSubmissionSuccess).toHaveBeenCalledTimes(1)
  })

  it('does not navigate after a failed submission', async () => {
    submitMock.mockRejectedValueOnce(new Error('Unable to save attempt'))
    const onSubmissionSuccess = vi.fn()
    render(<QuizAttemptPage quizId={quizId} questions={questions} onSubmissionSuccess={onSubmissionSuccess} />)
    submitPage()
    expect((await screen.findByRole('alert')).textContent).toContain('Unable to save attempt')
    expect(onSubmissionSuccess).not.toHaveBeenCalled()
  })
})
