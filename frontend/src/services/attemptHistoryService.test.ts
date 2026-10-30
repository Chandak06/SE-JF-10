
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi
} from 'vitest'

import { getSessionToken } from './authService'
import { getAttemptHistory } from './attemptHistoryService'

vi.mock('./authService', () => ({
  getSessionToken: vi.fn(), invalidateExpiredSession: vi.fn()
}))

const fetchMock = vi.fn()

const attempt = {
  attemptId: '507f1f77bcf86cd799439021',
  quizId: '507f1f77bcf86cd799439011',
  quizTitle: 'Computer Science Quiz',
  subject: 'Computer Science',
  score: 8,
  percentage: 80,
  answersSubmitted: 10,
  submittedAt: '2026-10-30T10:00:00.000Z'
}

const history = {
  attempts: [attempt],
  page: 1,
  pageSize: 10,
  total: 1,
  totalPages: 1
}

function response(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body
  }
}

beforeEach(() => {
  vi.resetAllMocks()
  vi.stubGlobal('fetch', fetchMock)
  vi.mocked(getSessionToken).mockReturnValue('test-token')
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('CSMQ-43: Attempt history service', () => {
  it('fetches authenticated student history', async () => {
    fetchMock.mockResolvedValueOnce(response(history))

    const result = await getAttemptHistory(1)

    expect(result.attempts).toHaveLength(1)
    expect(result.attempts[0]?.score).toBe(8)

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining(
        '/api/attempts/history?page=1&pageSize=10'
      ),
      expect.objectContaining({
        headers: {
          Authorization: 'Bearer test-token'
        }
      })
    )
  })

  it('requires authentication', async () => {
    vi.mocked(getSessionToken).mockReturnValue('')

    await expect(getAttemptHistory()).rejects.toThrow(
      'Please sign in'
    )

    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('handles expired sessions', async () => {
    fetchMock.mockResolvedValueOnce(response({}, 401))

    await expect(getAttemptHistory()).rejects.toThrow(
      'session has expired'
    )
  })

  it('rejects malformed history responses', async () => {
    fetchMock.mockResolvedValueOnce(
      response({
        ...history,
        attempts: [{ ...attempt, percentage: '80' }]
      })
    )

    await expect(getAttemptHistory()).rejects.toThrow(
      'Invalid attempt history response.'
    )
  })

  it('rejects invalid pagination', async () => {
    await expect(getAttemptHistory(0)).rejects.toThrow(
      'Invalid history page.'
    )

    expect(fetchMock).not.toHaveBeenCalled()
  })
})
