
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from '@testing-library/react'
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi
} from 'vitest'

import QuizAttemptPage, {
  type QuizQuestion
} from './QuizAttemptPage'

import {
  submitQuizAttempt,
  type AttemptResult
} from '../services/attemptService'

vi.mock('../services/authService', () => ({
  getSessionUser: () => ({
    id: 'test-student',
    role: 'student'
  })
}))

vi.mock('../services/attemptService', () => ({
  submitQuizAttempt: vi.fn()
}))

const submitMock = vi.mocked(submitQuizAttempt)

const quizId = '507f1f77bcf86cd799439011'
const questionId = '507f191e810c19729de860ea'

const questions: QuizQuestion[] = [
  {
    id: questionId,
    questionText: 'Which protocol is connection-oriented?',
    difficulty: 'Easy',
    marks: 1,
    options: [
      { id: 'A', text: 'UDP' },
      { id: 'B', text: 'TCP' }
    ]
  }
]

const result: AttemptResult = {
  attemptId: '507f1f77bcf86cd799439099',
  quizId,
  score: 1,
  total: 1,
  percentage: 100,
  correct: 1,
  incorrect: 0,
  unanswered: 0
}

function confirmQuizSubmission() {
  fireEvent.click(
    screen.getByRole('button', { name: 'Submit quiz' })
  )

  const dialog = screen.getByRole('dialog')

  fireEvent.click(
    within(dialog).getByRole('button', {
      name: 'Submit quiz'
    })
  )
}

beforeEach(() => {
  window.sessionStorage.clear()
  vi.clearAllMocks()
})

afterEach(() => {
  cleanup()
})

describe('CSMQ-41: Quiz Attempt frontend integration', () => {
  it('describes SRS scoring as one point per correct response regardless of marks metadata', () => {
    render(<QuizAttemptPage quizId={quizId} title="Networks" questions={questions.map(q => ({ ...q, marks: 5 }))} />)
    expect(screen.getByText('1 point if correct')).toBeInTheDocument()
    expect(screen.queryByText(/5 mark/)).toBeNull()
  })

  it('does not invent a time limit or expire an unsubmitted real quiz', () => {
    vi.useFakeTimers()
    try {
      render(<QuizAttemptPage quizId={quizId} title="Networks" questions={questions} />)
      expect(screen.getByText('No time limit')).toBeTruthy()
      expect(screen.getByText('Draft · not submitted')).toBeTruthy()
      expect(screen.queryByText(/practice prototype/)).toBeNull()
      expect(screen.queryByLabelText(/seconds remaining/)).toBeNull()
      act(() => vi.advanceTimersByTime(21 * 60 * 1000))
      fireEvent.click(screen.getByRole('radio', { name: /TCP/ }))
      expect(screen.getByRole('radio', { name: /TCP/ })).toHaveAttribute('aria-checked', 'true')
      expect(submitMock).not.toHaveBeenCalled()
    } finally {
      vi.useRealTimers()
    }
  })

  it('sends selected answers to the real API', async () => {
    submitMock.mockResolvedValueOnce(result)

    render(
      <QuizAttemptPage
        quizId={quizId}
        questions={questions}
      />
    )

    fireEvent.click(
      screen.getByRole('radio', { name: /TCP/i })
    )

    confirmQuizSubmission()

    await waitFor(() => {
      expect(submitMock).toHaveBeenCalledWith({
        quizId,
        responses: [
          {
            questionId,
            selectedOptionId: 'B'
          }
        ]
      }, expect.any(String))
    })

    expect(
      await screen.findByText('Your verified result')
    ).toBeTruthy()

    expect(screen.getByText('1/1')).toBeTruthy()
  })

  it('preserves answers when submission fails', async () => {
    submitMock.mockRejectedValueOnce(
      new Error('Server temporarily unavailable')
    )

    render(
      <QuizAttemptPage
        quizId={quizId}
        questions={questions}
      />
    )

    fireEvent.click(
      screen.getByRole('radio', { name: /TCP/i })
    )

    confirmQuizSubmission()

    const alert = await screen.findByRole('alert')

    expect(alert.textContent).toContain(
      'Server temporarily unavailable'
    )

    expect(
      screen.getByRole('radio', { name: /TCP/i })
        .getAttribute('aria-checked')
    ).toBe('true')

    expect(submitMock).toHaveBeenCalledTimes(1)
  })

  it('prevents duplicate clicks while submitting', async () => {
    let finish!: (value: AttemptResult) => void

    submitMock.mockReturnValueOnce(
      new Promise<AttemptResult>(resolve => {
        finish = resolve
      })
    )

    render(
      <QuizAttemptPage
        quizId={quizId}
        questions={questions}
      />
    )

    confirmQuizSubmission()

    await waitFor(() => {
      expect(submitMock).toHaveBeenCalledTimes(1)
    })

    const dialog = screen.getByRole('dialog')

    const button = within(dialog).getByRole('button', {
      name: /Submitting/i
    })

    expect(button.hasAttribute('disabled')).toBe(true)

    await act(async () => {
      finish(result)
    })

    expect(submitMock).toHaveBeenCalledTimes(1)
  })

  it('keeps the sample quiz in local demo mode', () => {
    render(<QuizAttemptPage />)

    confirmQuizSubmission()

    expect(submitMock).not.toHaveBeenCalled()

    expect(
      screen.getByRole('button', { name: 'Quiz submitted' })
    ).toBeTruthy()
  })

})

