import { getSessionToken } from './authService';

const baseUrl = (
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  'http://localhost:5000'
).replace(/\/$/, '');

export interface QuestionOption {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  questionText: string;
  options: QuestionOption[];
  correctAnswer: string;
  subject: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  marks: number;
  creator?: string;
  createdAt?: string;
}

export interface CreateQuestionInput {
  questionText: string;
  options: QuestionOption[];
  correctAnswer: string;
  subject: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  marks?: number;
}

export interface QuestionFilters {
  subject?: string;
  topic?: string;
  difficulty?: string;
}

export async function createQuestion(
  input: CreateQuestionInput
): Promise<Question> {
  const token = getSessionToken();
  if (!token) throw new Error('Please log in with administrator privileges.');

  let response: Response;
  try {
    response = await fetch(`${baseUrl}/api/questions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(input)
    });
  } catch {
    throw new Error(
      'Unable to reach the server. Check your connection and try again.'
    );
  }

  const result = (await response.json().catch(() => ({}))) as {
    question?: Question;
    error?: { code?: string; message?: string };
    message?: string;
  };

  if (!response.ok) {
    throw new Error(
      result.error?.message ?? result.message ?? 'Failed to create question.'
    );
  }

  if (!result.question?.id) {
    throw new Error('The server returned an unexpected response.');
  }

  return result.question;
}

export async function listQuestions(
  filters?: QuestionFilters
): Promise<Question[]> {
  const token = getSessionToken();
  if (!token) throw new Error('Please log in to view the question bank.');

  const params = new URLSearchParams();
  if (filters?.subject) params.set('subject', filters.subject);
  if (filters?.topic) params.set('topic', filters.topic);
  if (filters?.difficulty) params.set('difficulty', filters.difficulty);

  const queryString = params.toString() ? `?${params.toString()}` : '';

  let response: Response;
  try {
    response = await fetch(`${baseUrl}/api/questions${queryString}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  } catch {
    throw new Error(
      'Unable to reach the server. Check your connection and try again.'
    );
  }

  const result = (await response.json().catch(() => ({}))) as {
    questions?: Question[];
    error?: { message?: string };
  };

  if (!response.ok) {
    throw new Error(result.error?.message ?? 'Unable to load questions.');
  }

  if (!Array.isArray(result.questions)) {
    throw new Error('The server returned an unexpected response.');
  }

  return result.questions;
}
