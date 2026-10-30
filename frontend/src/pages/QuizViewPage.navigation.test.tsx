
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor
} from '@testing-library/react'

import {
  MemoryRouter,
  Route,
  Routes,
  useParams
} from 'react-router-dom'

import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi
} from 'vitest'

import QuizViewPage from './QuizViewPage'

import {
  getQuizById,
  type QuizDetail
} from '../services/quizService'

vi.mock('../services/quizService', () => ({
  getQuizById: vi.fn()
}))

const quizId = '507f1f77bcf86cd799439011'

const quiz = {
  id: quizId,
  title: 'Computer Science Practice Quiz',
  subject: 'Computer Science',
  questionCount: 1,
  questions: [
    {
      id: '507f191e810c19729de860ea',
      questionText: 'Which protocol is connection-oriented?',
      options: [
        { id: 'A', text: 'UDP' },
        { id: 'B', text: 'TCP' }
      ]
    }
  ]
} as QuizDetail

function AttemptDestination() {
  const { id } = useParams()

  return (
    <div data-testid="attempt-route">
      Real quiz attempt opened: {id}
    </div>
  )
}

function renderQuizRoute() {
  return render(
    <MemoryRouter initialEntries={[`/quizzes/${quizId}`]}>
      <Routes>
        <Route
          path="/quizzes/:id"
          element={<QuizViewPage />}
        />

        <Route
          path="/quizzes/:id/attempt"
          element={<AttemptDestination />}
        />
      </Routes>
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  cleanup()
})

describe('CSMQ-41: Quiz start navigation', () => {
  it('opens the real quiz attempt route', async () => {
    vi.mocked(getQuizById).mockResolvedValueOnce(quiz)

    renderQuizRoute()

    const startButton = await screen.findByRole(
      'link',
      { name: /Start Quiz/i }
    )

    expect(startButton.getAttribute('href')).toBe(
      `/quizzes/${quizId}/attempt`
    )

    fireEvent.click(startButton)

    const destination = await screen.findByTestId(
      'attempt-route'
    )

    expect(destination.textContent).toContain(quizId)
  })

  it('does not allow starting an empty quiz', async () => {
    vi.mocked(getQuizById).mockResolvedValueOnce({
      ...quiz,
      questionCount: 0,
      questions: []
    })

    renderQuizRoute()

    await waitFor(() => {
      expect(getQuizById).toHaveBeenCalledWith(quizId)
    })

    expect(
      await screen.findByText(
        'This quiz has no questions available yet.'
      )
    ).toBeTruthy()

    expect(
      screen.queryByRole('link', { name: /Start Quiz/i })
    ).toBeNull()
  })
})
