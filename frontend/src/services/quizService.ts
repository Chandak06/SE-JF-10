import { authorized, getSessionToken } from './authService';
import type { QuestionFilters } from './questionService';


export interface CreateQuizInput {
  title: string;
  subject: string;
  questionIds: string[];
}

export interface QuizQuestionSummary {
  id: string;
  questionText: string;
  options: { id: string; text: string }[];
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  marks?: number;
  subject?: string;
  topic?: string;
}

export interface CreatedQuiz {
  id: string;
  title: string;
  subject: string;
  questionCount: number;
  questions: string[];
  creator: string;
  createdAt?: string;
}

export interface QuizDetail {
  id: string;
  title: string;
  subject: string;
  questionCount: number;
  questions: QuizQuestionSummary[];
  creator?: string;
  createdAt?: string;
}

export interface QuizSearchFilters {
  search?: string;
  subject?: string;
}

export interface QuizSummary {
  id: string;
  title: string;
  subject: string;
  questionCount: number;
  creator?: string;
  createdAt?: string;
}

export async function searchQuizzes(
  filters?: QuizSearchFilters
): Promise<QuizSummary[]> {
  const params = new URLSearchParams();
  if (filters?.search?.trim()) params.set('search', filters.search.trim());
  if (filters?.subject?.trim()) params.set('subject', filters.subject.trim());

  const queryString = params.toString() ? `?${params.toString()}` : '';

  const response = await authorized(`/api/quizzes${queryString}`);

  const result = (await response.json().catch(() => ({}))) as {
    quizzes?: QuizSummary[];
    error?: { message?: string };
  };

  if (!response.ok) {
    throw new Error(result.error?.message ?? 'Failed to search quizzes.');
  }

  if (!Array.isArray(result.quizzes)) {
    throw new Error('The server returned an unexpected response.');
  }

  return result.quizzes;
}

export async function createQuiz(input: CreateQuizInput): Promise<CreatedQuiz> {
  const token = getSessionToken();
  if (!token) throw new Error('Please log in to create a quiz.');

  const response = await authorized('/api/quizzes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input)
    });

  const result = (await response.json().catch(() => ({}))) as {
    quiz?: CreatedQuiz;
    error?: { code?: string; message?: string };
    message?: string;
  };

  if (!response.ok) {
    throw new Error(
      result.error?.message ?? result.message ?? 'Failed to create quiz.'
    );
  }

  if (!result.quiz?.id) {
    throw new Error('The server returned an unexpected response.');
  }

  return result.quiz;
}

export async function getQuizById(id: string): Promise<QuizDetail> {
  const token = getSessionToken();
  if (!token) throw new Error('Please log in to view the quiz.');

  const response = await authorized(`/api/quizzes/${encodeURIComponent(id)}`);

  const result = (await response.json().catch(() => ({}))) as {
    quiz?: QuizDetail;
    error?: { code?: string; message?: string };
  };

  if (!response.ok) {
    throw new Error(result.error?.message ?? 'Failed to load quiz.');
  }

  if (!result.quiz?.id) {
    throw new Error('The server returned an unexpected response.');
  }

  return result.quiz;
}

export async function fetchQuestionBankForQuiz(
  filters?: QuestionFilters
): Promise<QuizQuestionSummary[]> {
  const token = getSessionToken();
  if (!token) throw new Error('Please log in to browse questions.');

  const params = new URLSearchParams();
  if (filters?.subject) params.set('subject', filters.subject);
  if (filters?.topic) params.set('topic', filters.topic);
  if (filters?.difficulty) params.set('difficulty', filters.difficulty);

  const queryString = params.toString() ? `?${params.toString()}` : '';

  const response = await authorized(`/api/quiz-questions${queryString}`);

  const result = (await response.json().catch(() => ({}))) as {
    questions?: QuizQuestionSummary[];
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
