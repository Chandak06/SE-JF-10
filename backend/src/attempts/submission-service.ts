
import { AppError } from '../errors.js';
import type { SubmittedResponse } from './evaluate.js';
import type { AttemptSubmissionInput } from './validation.js';
import {
  evaluateTrustedAttempt,
  type TrustedQuizQuestion
} from './trusted-evaluation.js';

// Quiz information retrieved from the database.
export interface AttemptQuiz {
  id: string;
  questionIds: readonly string[];
  removedAt?: Date | null;
}

// Data that will be stored in MongoDB.
export interface AttemptToSave {
  userId: string;
  quizId: string;
  responses: readonly SubmittedResponse[];
  score: number;
  percentage: number;
  submissionKey?: string;
}

// Database operations needed by the service.
export interface AttemptRepository {
  findQuiz(
    quizId: string
  ): Promise<AttemptQuiz | null>;

  findQuestions(
    questionIds: readonly string[]
  ): Promise<readonly TrustedQuizQuestion[]>;

  saveAttempt(
    attempt: AttemptToSave
  ): Promise<{ id: string }>;
}

export async function submitQuizAttempt(
  input: AttemptSubmissionInput,
  authenticatedUserId: string,
  repository: AttemptRepository,
  submissionKey?: string
) {
  // Step 1: Fetch the quiz from the database.
  const quiz = await repository.findQuiz(input.quizId);

  if (!quiz || quiz.removedAt != null) {
    throw new AppError(
      404,
      'QUIZ_NOT_FOUND',
      'Quiz was not found or is unavailable.'
    );
  }

  // Step 2: Verify the quiz contains questions.
  if (quiz.questionIds.length === 0) {
    throw new AppError(
      409,
      'QUIZ_EMPTY',
      'This quiz contains no questions.'
    );
  }

  const uniqueIds = new Set(
    quiz.questionIds.map((id) => id.toLowerCase())
  );

  if (uniqueIds.size !== quiz.questionIds.length) {
    throw new AppError(
      409,
      'INVALID_QUIZ',
      'Quiz contains duplicate question references.'
    );
  }

  // Step 3: Fetch trusted questions and answer keys.
  const questions = await repository.findQuestions(
    quiz.questionIds
  );

  const questionMap = new Map(
    questions.map((question) => [
      question.id.toLowerCase(),
      question
    ])
  );

  if (questionMap.size !== questions.length) {
    throw new AppError(
      409,
      'INVALID_QUIZ',
      'Duplicate question records were returned.'
    );
  }

  // Step 4: Preserve the actual quiz question order.
  const orderedQuestions = quiz.questionIds.map((id) => {
    const question = questionMap.get(id.toLowerCase());

    if (!question) {
      throw new AppError(
        409,
        'QUIZ_QUESTION_MISSING',
        'A question required by this quiz is unavailable.'
      );
    }

    return question;
  });

  // Normalize case-insensitive MongoDB question IDs.
  const normalizedResponses = input.responses.map((response) => {
    const question = questionMap.get(
      response.questionId.toLowerCase()
    );

    return {
      questionId: question?.id ?? response.questionId,
      selectedOptionId: response.selectedOptionId
    };
  });

  // Step 5: Calculate results on the server.
  const evaluation = evaluateTrustedAttempt(
    orderedQuestions,
    normalizedResponses
  );

  // Step 6: Save only verified answers and server-calculated scores.
  const savedAttempt = await repository.saveAttempt({
    userId: authenticatedUserId,
    quizId: quiz.id,
    responses: normalizedResponses,
    score: evaluation.score,
    percentage: evaluation.percentage,
    ...(submissionKey ? { submissionKey } : {})
  });

  // Step 7: Return the result to the frontend.
  return {
    attemptId: savedAttempt.id,
    resultId: savedAttempt.id,
    quizId: quiz.id,
    // Submitted SAD §4.3: answer feedback is emitted only after a saved result.
    correctAnswers: orderedQuestions.map(question => ({ questionId: question.id, correctOptionId: question.correctAnswer })),
    ...evaluation
  };
}
