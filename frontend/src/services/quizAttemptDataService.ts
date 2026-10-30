
import { getSessionToken } from './authService'

const baseUrl = (
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  'http://localhost:5000'
).replace(/\/$/, '')

const mongoIdPattern = /^[0-9a-fA-F]{24}$/

export interface StudentQuizOption {
  id: string
  text: string
}

export interface StudentQuizQuestion {
  id: string
  questionText: string
  options: StudentQuizOption[]
  difficulty?: 'Easy' | 'Medium' | 'Hard'
  marks?: number
}

export interface LoadedQuiz {
  quizId: string
  title: string
  subject: string
  questions: StudentQuizQuestion[]
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

function invalidQuizData(): never {
  throw new Error('Invalid quiz data received from server.')
}

function parseQuestion(value: unknown): StudentQuizQuestion {
  if (!isRecord(value)) {
    return invalidQuizData()
  }

  const { id, questionText, options } = value

  if (
    typeof id !== 'string' ||
    !mongoIdPattern.test(id) ||
    typeof questionText !== 'string' ||
    !questionText.trim() ||
    !Array.isArray(options) ||
    options.length < 2
  ) {
    return invalidQuizData()
  }

  const parsedOptions: StudentQuizOption[] = options.map(
    (option: unknown) => {
      if (
        !isRecord(option) ||
        typeof option.id !== 'string' ||
        !option.id.trim() ||
        typeof option.text !== 'string' ||
        !option.text.trim()
      ) {
        return invalidQuizData()
      }

      return {
        id: option.id,
        text: option.text
      }
    }
  )

  if (
    new Set(parsedOptions.map(option => option.id)).size !==
    parsedOptions.length
  ) {
    return invalidQuizData()
  }

  const difficulty =
    value.difficulty === 'Easy' ||
    value.difficulty === 'Medium' ||
    value.difficulty === 'Hard'
      ? value.difficulty
      : undefined

  const marks =
    typeof value.marks === 'number' &&
    Number.isFinite(value.marks) &&
    value.marks > 0
      ? value.marks
      : undefined

  return {
    id,
    questionText,
    options: parsedOptions,
    ...(difficulty ? { difficulty } : {}),
    ...(marks !== undefined ? { marks } : {})
  }
}

export async function loadQuizForAttempt(
  quizId: string
): Promise<LoadedQuiz> {
  if (!mongoIdPattern.test(quizId)) {
    throw new Error('Invalid quiz identifier.')
  }

  const token = getSessionToken()

  if (!token) {
    throw new Error(
      'Please log in before opening this quiz.'
    )
  }

  let response: Response

  try {
    response = await fetch(
      `${baseUrl}/api/quizzes/${encodeURIComponent(quizId)}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )
  } catch {
    throw new Error(
      'Unable to load the quiz. Check your connection.'
    )
  }

  const raw: unknown = await response
    .json()
    .catch(() => null)

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error(
        'Your session has expired. Please log in again.'
      )
    }

    if (response.status === 404) {
      throw new Error(
        'This quiz is no longer available.'
      )
    }

    if (
      isRecord(raw) &&
      isRecord(raw.error) &&
      typeof raw.error.message === 'string'
    ) {
      throw new Error(raw.error.message)
    }

    throw new Error(
      'Unable to retrieve this quiz.'
    )
  }

  if (
    !isRecord(raw) ||
    typeof raw.quizId !== 'string' ||
    raw.quizId.toLowerCase() !== quizId.toLowerCase() ||
    typeof raw.title !== 'string' ||
    !raw.title.trim() ||
    typeof raw.subject !== 'string' ||
    !Array.isArray(raw.questions)
  ) {
    return invalidQuizData()
  }

  if (raw.questions.length === 0) {
    throw new Error(
      'This quiz has no questions available.'
    )
  }

  const questions = raw.questions.map(parseQuestion)

  const ids = questions.map(question =>
    question.id.toLowerCase()
  )

  if (new Set(ids).size !== ids.length) {
    return invalidQuizData()
  }

  if (
    typeof raw.questionCount === 'number' &&
    raw.questionCount !== questions.length
  ) {
    return invalidQuizData()
  }

  return {
    quizId: raw.quizId,
    title: raw.title,
    subject: raw.subject,
    questions
  }
}
