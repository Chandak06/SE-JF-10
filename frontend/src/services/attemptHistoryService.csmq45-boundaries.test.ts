import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getAttemptHistory } from './attemptHistoryService'
import { getSessionToken } from './authService'

vi.mock('./authService', () => ({ getSessionToken: vi.fn(), invalidateExpiredSession: vi.fn() }))
const fetchMock = vi.fn()

beforeEach(() => {
  vi.resetAllMocks()
  vi.mocked(getSessionToken).mockReturnValue('student-token')
  vi.stubGlobal('fetch', fetchMock)
})
afterEach(() => vi.unstubAllGlobals())

describe('CSMQ-45 / history API frontend authorization boundaries', () => {
  it('fetches only the current session history, never requesting a user ID', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true, status: 200,
      json: async () => ({ attempts: [], page: 1, pageSize: 10, total: 0, totalPages: 0 })
    })
    const result = await getAttemptHistory(1, 10)
    expect(result.attempts).toEqual([])

    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toContain('/api/attempts/history?page=1&pageSize=10')
    expect(url).not.toContain('userId')
    expect(options.headers).toMatchObject({ Authorization: 'Bearer student-token' })
  })

  it('rejects expired sessions and forbidden history access', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false, status: 401,
      json: async () => ({ error: 'UNAUTHORIZED' })
    })
    await expect(getAttemptHistory()).rejects.toThrow(/session has expired/i)

    fetchMock.mockResolvedValueOnce({
      ok: false, status: 403,
      json: async () => ({ error: 'FORBIDDEN' })
    })
    await expect(getAttemptHistory()).rejects.toThrow(/cannot access attempt history/i)
  })

  it('rejects malformed history payloads rather than displaying untrusted data', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true, status: 200,
      json: async () => ({
        attempts: [{
          attemptId: '<script>', quizId: 'BAD', quizTitle: 'Fake',
          subject: 'DBMS', score: 100, percentage: 100,
          answersSubmitted: 1, submittedAt: 'invalid-date'
        }],
        page: 1, pageSize: 10, total: 1, totalPages: 1
      })
    })
    await expect(getAttemptHistory()).rejects.toThrow(/Invalid attempt history response/i)
  })
})
