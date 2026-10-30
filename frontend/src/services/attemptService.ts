
import { getSessionToken, invalidateExpiredSession } from './authService';

const baseUrl = (
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  'http://localhost:5000'
).replace(/\/$/, '');

export interface AttemptResponse {
  questionId: string;
  selectedOptionId: string;
}

export interface AttemptSubmission {
  quizId: string;
  responses: AttemptResponse[];
}

export interface AttemptResult {
  attemptId: string;
  quizId: string;
  score: number;
  total: number;
  percentage: number;
  correct: number;
  incorrect: number;
  unanswered: number;
  resultId?: string;
  correctAnswers?: { questionId: string; correctOptionId: string }[];
}

export async function submitQuizAttempt(
  submission: AttemptSubmission,
  submissionKey?: string
): Promise<AttemptResult> {
  const token = getSessionToken();

  if (!token) {
    throw new Error(
      'Please log in before submitting your quiz.'
    );
  }

  let response: Response;

  try {
    response = await fetch(`${baseUrl}/api/attempts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(submissionKey ? { 'Idempotency-Key': submissionKey } : {}),
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(submission)
    });
  } catch {
    throw new Error(
      'Unable to reach the server. Check your connection and try again.'
    );
  }

  const raw = await response.json().catch(() => ({}));

  const result = (
    raw && typeof raw === 'object' && !Array.isArray(raw)
      ? raw
      : {}
  ) as Partial<AttemptResult> & {
    error?: { message?: string };
  };

  if (!response.ok) {
    if (response.status === 401) {
      invalidateExpiredSession(token);
      throw new Error(
        'Your session has expired. Please log in again.'
      );
    }

    throw new Error(
      result.error?.message ??
      'Quiz submission failed. Please try again.'
    );
  }

  const numericFields = [
    result.score,
    result.total,
    result.percentage,
    result.correct,
    result.incorrect,
    result.unanswered
  ];

  if (
    typeof result.attemptId !== 'string' ||
    typeof result.quizId !== 'string' ||
    !numericFields.every(
      value =>
        typeof value === 'number' &&
        Number.isFinite(value)
    )
  ) {
    throw new Error(
      'The server returned an unexpected quiz result.'
    );
  }

  if (result.resultId !== undefined && result.resultId !== result.attemptId) throw new Error('The server returned an unexpected quiz result.');
  if (result.correctAnswers !== undefined && (!Array.isArray(result.correctAnswers) || !result.correctAnswers.every(answer =>
    answer && /^[a-fA-F0-9]{24}$/.test(answer.questionId) && typeof answer.correctOptionId === 'string' && answer.correctOptionId.length > 0 && answer.correctOptionId.length <= 50
  ))) throw new Error('The server returned an unexpected quiz result.');
  return result as AttemptResult;
}
