
import { getSessionToken } from './authService'

const baseUrl = (
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  'http://localhost:5000'
).replace(/\/$/, '')

export interface HistoryAttempt {
  attemptId: string
  quizId: string
  quizTitle: string
  subject: string | null
  score: number
  percentage: number
  answersSubmitted: number
  submittedAt: string | null
}

export interface HistoryPage {
  attempts: HistoryAttempt[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

function isRecord(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value)
  )
}

function validNumber(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    value >= 0
  )
}

function parseHistory(value: unknown): HistoryPage {
  if (
    !isRecord(value) ||
    !Array.isArray(value.attempts) ||
    !validNumber(value.total) ||
    !validNumber(value.page) ||
    !validNumber(value.pageSize) ||
    !validNumber(value.totalPages)
  ) {
    throw new Error('Invalid attempt history response.')
  }

  const attempts: HistoryAttempt[] = value.attempts.map(
    (entry: unknown) => {
      if (
        !isRecord(entry) ||
        typeof entry.attemptId !== 'string' ||
        !/^[a-fA-F0-9]{24}$/.test(entry.attemptId) ||
        typeof entry.quizId !== 'string' ||
        !/^[a-fA-F0-9]{24}$/.test(entry.quizId) ||
        typeof entry.quizTitle !== 'string' ||
        !validNumber(entry.score) ||
        !validNumber(entry.percentage) ||
        entry.percentage > 100 ||
        !validNumber(entry.answersSubmitted) ||
        !Number.isInteger(entry.answersSubmitted) ||
        (
          entry.subject !== null &&
          typeof entry.subject !== 'string'
        ) ||
        (
          entry.submittedAt !== null &&
          (
            typeof entry.submittedAt !== 'string' ||
            Number.isNaN(Date.parse(entry.submittedAt))
          )
        )
      ) {
        throw new Error('Invalid attempt history response.')
      }

      return {
        attemptId: entry.attemptId,
        quizId: entry.quizId,
        quizTitle: entry.quizTitle,
        subject: entry.subject,
        score: entry.score,
        percentage: entry.percentage,
        answersSubmitted: entry.answersSubmitted,
        submittedAt: entry.submittedAt
      }
    }
  )

  return {
    attempts,
    total: value.total,
    page: value.page,
    pageSize: value.pageSize,
    totalPages: value.totalPages
  }
}

export async function getAttemptHistory(
  page = 1,
  pageSize = 10
): Promise<HistoryPage> {
  if (
    !Number.isInteger(page) ||
    page < 1 ||
    !Number.isInteger(pageSize) ||
    pageSize < 1 ||
    pageSize > 50
  ) {
    throw new Error('Invalid history page.')
  }

  const token = getSessionToken()

  if (!token) {
    throw new Error('Please sign in to view your attempts.')
  }

  let response: Response

  try {
    response = await fetch(
      `${baseUrl}/api/attempts/history?page=${page}&pageSize=${pageSize}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )
  } catch {
    throw new Error(
      'Unable to connect to the server. Check your connection.'
    )
  }

  const body: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Your session has expired. Please log in again.')
    }

    if (response.status === 403) {
      throw new Error('You cannot access attempt history.')
    }

    throw new Error('Unable to load your attempt history.')
  }

  return parseHistory(body)
}
