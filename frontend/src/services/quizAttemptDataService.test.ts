
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi
} from 'vitest'

import { getSessionToken } from './authService'
import { loadQuizForAttempt } from './quizAttemptDataService'

vi.mock('./authService', () => ({
  getSessionToken: vi.fn()
}))

const fetchMock = vi.fn()

const quizId = '507f1f77bcf86cd799439011'
const questionId = '507f191e810c19729de860ea'

const quizPayload = {
  quizId,
  title: 'Computer Science Practice Quiz',
  subject: 'Computer Science',
  questionCount: 1,
  questions: [
    {
      id: questionId,
      questionText: 'Which protocol is connection-oriented?',
      options: [
        { id: 'A', text: 'UDP' },
        { id: 'B', text: 'TCP' }
      ]
    }
  ]
}

function mockResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body
  }
}

beforeEach(() => {
  vi.resetAllMocks()
  vi.stubGlobal('fetch', fetchMock)

  vi.mocked(getSessionToken).mockReturnValue(
    'student-test-token'
  )
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('CSMQ-41: Real quiz loading service', () => {
  it('loads student-safe quiz questions', async () => {
    fetchMock.mockResolvedValueOnce(
      mockResponse(quizPayload)
    )

    const result = await loadQuizForAttempt(quizId)

    expect(result.quizId).toBe(quizId)
    expect(result.questions).toHaveLength(1)
    expect(result.questions[0]?.questionText).toContain(
      'connection-oriented'
    )

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining(`/api/quizzes/${quizId}`),
      expect.objectContaining({
        method: 'GET',
        headers: {
          Authorization: 'Bearer student-test-token'
        }
      })
    )
  })

  it('rejects an invalid quiz ID', async () => {
    await expect(
      loadQuizForAttempt('invalid')
    ).rejects.toThrow('Invalid quiz identifier.')

    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('requires authentication', async () => {
    vi.mocked(getSessionToken).mockReturnValue('')

    await expect(
      loadQuizForAttempt(quizId)
    ).rejects.toThrow('Please log in')

    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('handles unavailable quizzes', async () => {
    fetchMock.mockResolvedValueOnce(
      mockResponse({}, 404)
    )

    await expect(
      loadQuizForAttempt(quizId)
    ).rejects.toThrow('no longer available')
  })

  it('handles network failures', async () => {
    fetchMock.mockRejectedValueOnce(
      new Error('Network failed')
    )

    await expect(
      loadQuizForAttempt(quizId)
    ).rejects.toThrow('Unable to load the quiz')
  })

  it('rejects empty quizzes', async () => {
    fetchMock.mockResolvedValueOnce(
      mockResponse({
        ...quizPayload,
        questionCount: 0,
        questions: []
      })
    )

    await expect(
      loadQuizForAttempt(quizId)
    ).rejects.toThrow('no questions available')
  })

  it('rejects malformed question data', async () => {
    fetchMock.mockResolvedValueOnce(
      mockResponse({
        ...quizPayload,
        questions: [
          {
            id: questionId,
            questionText: 'Invalid question',
            options: []
          }
        ]
      })
    )

    await expect(
      loadQuizForAttempt(quizId)
    ).rejects.toThrow('Invalid quiz data')
  })

  it('rejects mismatched quiz IDs', async () => {
    fetchMock.mockResolvedValueOnce(
      mockResponse({
        ...quizPayload,
        quizId: '507f1f77bcf86cd799439099'
      })
    )

    await expect(
      loadQuizForAttempt(quizId)
    ).rejects.toThrow('Invalid quiz data')
  })

  it('does not expose correct answers', async () => {
    fetchMock.mockResolvedValueOnce(
      mockResponse({
        ...quizPayload,
        questions: [
          {
            ...quizPayload.questions[0],
            correctAnswer: 'B'
          }
        ]
      })
    )

    const result = await loadQuizForAttempt(quizId)

    expect(result.questions[0]).not.toHaveProperty(
      'correctAnswer'
    )
  })

  it('rejects duplicate question IDs', async () => {
    fetchMock.mockResolvedValueOnce(
      mockResponse({
        ...quizPayload,
        questionCount: 2,
        questions: [
          quizPayload.questions[0],
          quizPayload.questions[0]
        ]
      })
    )

    await expect(
      loadQuizForAttempt(quizId)
    ).rejects.toThrow('Invalid quiz data')
  })
})
