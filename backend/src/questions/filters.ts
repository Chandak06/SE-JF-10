import type { QuestionDifficulty } from '../models/question.js';

export interface QuestionFilterParams {
  subject?: unknown;
  topic?: unknown;
  difficulty?: unknown;
}

export interface QuestionMongoFilter {
  subject?: RegExp;
  topic?: RegExp;
  difficulty?: QuestionDifficulty;
}

function partialText(value: string): RegExp {
  const escaped = value.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(escaped, 'i');
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
    filter.subject = partialText(params.subject);
  }

  if (typeof params.topic === 'string' && params.topic.trim()) {
    filter.topic = partialText(params.topic);
  }

  if (
    typeof params.difficulty === 'string' &&
    VALID_DIFFICULTIES.includes(params.difficulty.trim() as QuestionDifficulty)
  ) {
    filter.difficulty = params.difficulty.trim() as QuestionDifficulty;
  }

  return filter;
}
