import type { QuestionDifficulty } from '../models/question.js';

export interface QuestionFilterParams {
  subject?: unknown;
  topic?: unknown;
  difficulty?: unknown;
}

export interface QuestionMongoFilter {
  subject?: string;
  topic?: string;
  difficulty?: QuestionDifficulty;
}

const VALID_DIFFICULTIES: readonly QuestionDifficulty[] = [
  'Easy',
  'Medium',
  'Hard'
];

export function buildQuestionFilter(
  params: QuestionFilterParams = {}
): QuestionMongoFilter {
  const filter: QuestionMongoFilter = {};

  if (typeof params.subject === 'string' && params.subject.trim()) {
    filter.subject = params.subject.trim();
  }

  if (typeof params.topic === 'string' && params.topic.trim()) {
    filter.topic = params.topic.trim();
  }

  if (
    typeof params.difficulty === 'string' &&
    VALID_DIFFICULTIES.includes(params.difficulty.trim() as QuestionDifficulty)
  ) {
    filter.difficulty = params.difficulty.trim() as QuestionDifficulty;
  }

  return filter;
}
