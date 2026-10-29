
import { AppError } from '../errors.js';
import {
  evaluateQuiz,
  type EvaluationResult,
  type SubmittedResponse
} from './evaluate.js';

export interface TrustedQuizQuestion {
  id: string;
  correctAnswer: string;
  options: readonly { id: string }[];
}

export function evaluateTrustedAttempt(
  questions: readonly TrustedQuizQuestion[],
  responses: readonly SubmittedResponse[]
): EvaluationResult {
  if (questions.length === 0) {
    throw new AppError(
      409,
      'QUIZ_EMPTY',
      'Quiz has no questions.'
    );
  }

  const questionsById = new Map(
    questions.map((question) => [
      question.id.toLowerCase(),
      question
    ])
  );

  if (questionsById.size !== questions.length) {
    throw new AppError(
      500,
      'INVALID_QUIZ',
      'Quiz contains duplicate questions.'
    );
  }

  for (const question of questions) {
    if (!question.options.some(
      (option) => option.id === question.correctAnswer
    )) {
      throw new AppError(
        500,
        'INVALID_QUIZ',
        'Quiz answer key is invalid.'
      );
    }
  }

  const seen = new Set<string>();

  const normalizedResponses = responses.map((response) => {
    const id = response.questionId.toLowerCase();
    const question = questionsById.get(id);

    if (!question) {
      throw new AppError(
        400,
        'QUESTION_NOT_IN_QUIZ',
        'Submitted question is not part of this quiz.'
      );
    }

    if (seen.has(id)) {
      throw new AppError(
        400,
        'DUPLICATE_RESPONSE',
        'A question was answered more than once.'
      );
    }

    seen.add(id);

    if (!question.options.some(
      (option) => option.id === response.selectedOptionId
    )) {
      throw new AppError(
        400,
        'INVALID_OPTION',
        'Selected option does not belong to the question.'
      );
    }

    return {
      questionId: question.id,
      selectedOptionId: response.selectedOptionId
    };
  });

  return evaluateQuiz(
    questions.map((question) => ({
      id: question.id,
      correctOptionId: question.correctAnswer
    })),
    normalizedResponses
  );
}
