import { cleanup, fireEvent, render, screen, within, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import QuizAttemptPage, { type QuizQuestion } from './QuizAttemptPage'

vi.mock('../services/authService', () => ({
  getSessionToken: () => 'student-token',
  getSessionUser: () => ({ id: '507f1f77bcf86cd799439001', role: 'student' })
}))

const quizId = '507f1f77bcf86cd799439011'
const questionId = '507f191e810c19729de860e1'
const questions: QuizQuestion[] = [{
  id: questionId,
  questionText: 'What does HTTP stand for?',
  options: [{ id: 'A', text: 'Hypertext Transfer Protocol' }, { id: 'B', text: 'High Transfer Text Process' }]
}]

const scored = {
  attemptId: '507f1f77bcf86cd799439099',
  quizId,
  score: 0,
  total: 1,
  percentage: 0,
  correct: 0,
  incorrect: 0,
  unanswered: 1
}

const fetchMock = vi.fn()

function confirmSubmit() {
  fireEvent.click(screen.getByRole('button', { name: 'Submit quiz' }))
  fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Submit quiz' }))
}

beforeEach(() => {
  window.sessionStorage.clear()
  vi.clearAllMocks()
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('CSMQ-45 / real frontend submission service to result callback', () => {
  it('POSTs authenticated answers to the server and uses its result', async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, status: 201, json: async () => scored })
    const onSubmissionSuccess = vi.fn()

    render(<QuizAttemptPage quizId={quizId} questions={questions} onSubmissionSuccess={onSubmissionSuccess} />)
    confirmSubmit()

    await waitFor(() => expect(onSubmissionSuccess).toHaveBeenCalledWith(scored))
    expect(fetchMock).toHaveBeenCalledOnce()

    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toContain('/api/attempts')
    expect(options.method).toBe('POST')
    expect(options.headers).toMatchObject({ Authorization: 'Bearer student-token' })
    expect(JSON.parse(String(options.body))).toMatchObject({ quizId, responses: [] })
    expect(String(options.body)).not.toContain('score')
    expect(String(options.body)).not.toContain('userId')
  })

  it('does not advance to a result when the server rejects a submission', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false, status: 400,
      json: async () => ({ error: 'INVALID_SUBMISSION', message: 'Invalid response' })
    })
    const onSubmissionSuccess = vi.fn()

    render(<QuizAttemptPage quizId={quizId} questions={questions} onSubmissionSuccess={onSubmissionSuccess} />)
    confirmSubmit()

    expect(await screen.findByRole('alert')).toBeTruthy()
    expect(onSubmissionSuccess).not.toHaveBeenCalled()
  })
})
