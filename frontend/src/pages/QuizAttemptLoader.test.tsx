
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor
} from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import QuizAttemptLoader from './QuizAttemptLoader'
import { loadQuizForAttempt } from '../services/quizAttemptDataService'

vi.mock('../services/quizAttemptDataService', () => ({
  loadQuizForAttempt: vi.fn()
}))

vi.mock('./QuizAttemptPage', () => ({
  default: ({
    quizId,
    questions
  }: {
    quizId: string
    questions: Array<{ id: string }>
  }) => (
    <div data-testid="real-attempt">
      {quizId} - {questions.length} questions
    </div>
  )
}))

const quizId = '507f1f77bcf86cd799439011'

const quiz = {
  quizId,
  title: 'Computer Science Quiz',
  subject: 'Computer Science',
  questions: [
    {
      id: '507f191e810c19729de860ea',
      questionText: 'Which protocol is reliable?',
      options: [
        { id: 'A', text: 'UDP' },
        { id: 'B', text: 'TCP' }
      ]
    }
  ]
}

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  cleanup()
})

describe('CSMQ-41: Real quiz attempt loader', () => {
  it('loads and renders real quiz questions', async () => {
    vi.mocked(loadQuizForAttempt).mockResolvedValueOnce(quiz)

    render(<QuizAttemptLoader quizId={quizId} />)

    expect(
      screen.getByRole('status').textContent
    ).toContain('Loading questions')

    const page = await screen.findByTestId('real-attempt')

    expect(page.textContent).toContain(quizId)
    expect(page.textContent).toContain('1 questions')
  })

  it('shows errors when quiz loading fails', async () => {
    vi.mocked(loadQuizForAttempt).mockRejectedValueOnce(
      new Error('Quiz unavailable')
    )

    render(<QuizAttemptLoader quizId={quizId} />)

    expect(
      (await screen.findByRole('alert')).textContent
    ).toContain('Quiz unavailable')
  })

  it('retries after a failed request', async () => {
    vi.mocked(loadQuizForAttempt)
      .mockRejectedValueOnce(new Error('Network failed'))
      .mockResolvedValueOnce(quiz)

    render(<QuizAttemptLoader quizId={quizId} />)

    await screen.findByRole('alert')

    fireEvent.click(
      screen.getByRole('button', { name: 'Try again' })
    )

    await screen.findByTestId('real-attempt')

    expect(loadQuizForAttempt).toHaveBeenCalledTimes(2)
  })

  it('loads new questions when quiz ID changes', async () => {
    vi.mocked(loadQuizForAttempt).mockResolvedValue(quiz)

    const { rerender } = render(
      <QuizAttemptLoader quizId={quizId} />
    )

    await screen.findByTestId('real-attempt')

    rerender(
      <QuizAttemptLoader
        quizId="507f1f77bcf86cd799439099"
      />
    )

    await waitFor(() => {
      expect(loadQuizForAttempt).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439099'
      )
    })
  })
})
