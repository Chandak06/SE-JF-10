
import { describe, expect, it, vi } from 'vitest';

import {
  submitQuizAttempt,
  type AttemptQuiz,
  type AttemptRepository,
  type AttemptToSave
} from '../../src/attempts/submission-service.js';

import type { AttemptSubmissionInput } from '../../src/attempts/validation.js';
import type { TrustedQuizQuestion } from '../../src/attempts/trusted-evaluation.js';

const USER_ID = '507f1f77bcf86cd799439010';
const QUIZ_ID = '507f1f77bcf86cd799439011';
const QUESTION_1 = '507f1f77bcf86cd7994390aa';
const QUESTION_2 = '507f1f77bcf86cd7994390bb';
const ATTEMPT_ID = '507f1f77bcf86cd799439099';

const quiz: AttemptQuiz = {
  id: QUIZ_ID,
  questionIds: [QUESTION_1, QUESTION_2],
  removedAt: null
};

const question1: TrustedQuizQuestion = {
  id: QUESTION_1,
  correctAnswer: 'B',
  options: [{ id: 'A' }, { id: 'B' }]
};

const question2: TrustedQuizQuestion = {
  id: QUESTION_2,
  correctAnswer: 'A',
  options: [{ id: 'A' }, { id: 'B' }]
};

const questions = [question1, question2];

const validInput: AttemptSubmissionInput = {
  quizId: QUIZ_ID,
  responses: [
    { questionId: QUESTION_1, selectedOptionId: 'B' },
    { questionId: QUESTION_2, selectedOptionId: 'B' }
  ]
};

// Simulates database operations without requiring MongoDB.
function makeRepository(
  overrides: Partial<AttemptRepository> = {}
) {
  return {
    findQuiz: vi.fn(async (_quizId: string) => quiz),

    findQuestions: vi.fn(
      async (_ids: readonly string[]) => questions
    ),

    saveAttempt: vi.fn(
      async (_attempt: AttemptToSave) => ({
        id: ATTEMPT_ID
      })
    ),

    ...overrides
  };
}

describe('CSMQ-40: Quiz submission service', () => {

  it('evaluates and saves a valid quiz attempt', async () => {
    const repository = makeRepository();

    const result = await submitQuizAttempt(
      validInput,
      USER_ID,
      repository
    );

    expect(result).toEqual({
      attemptId: ATTEMPT_ID,
      resultId: ATTEMPT_ID,
      correctAnswers: [{ questionId: QUESTION_1, correctOptionId: 'B' }, { questionId: QUESTION_2, correctOptionId: 'A' }],
      quizId: QUIZ_ID,
      score: 1,
      total: 2,
      percentage: 50,
      correct: 1,
      incorrect: 1,
      unanswered: 0
    });

    expect(repository.findQuiz).toHaveBeenCalledWith(QUIZ_ID);

    expect(repository.findQuestions).toHaveBeenCalledWith([
      QUESTION_1,
      QUESTION_2
    ]);

    expect(repository.saveAttempt).toHaveBeenCalledWith({
      userId: USER_ID,
      quizId: QUIZ_ID,
      responses: validInput.responses,
      score: 1,
      percentage: 50
    });
  });

  it('handles partially answered quizzes', async () => {
    const repository = makeRepository();

    const result = await submitQuizAttempt(
      {
        quizId: QUIZ_ID,
        responses: [
          {
            questionId: QUESTION_1,
            selectedOptionId: 'B'
          }
        ]
      },
      USER_ID,
      repository
    );

    expect(result.score).toBe(1);
    expect(result.percentage).toBe(50);
    expect(result.unanswered).toBe(1);
    expect(repository.saveAttempt).toHaveBeenCalledOnce();
  });

  it('rejects a quiz that does not exist', async () => {
    const repository = makeRepository({
      findQuiz: vi.fn(async () => null)
    });

    await expect(
      submitQuizAttempt(validInput, USER_ID, repository)
    ).rejects.toMatchObject({
      status: 404,
      code: 'QUIZ_NOT_FOUND'
    });

    expect(repository.saveAttempt).not.toHaveBeenCalled();
  });

  it('rejects a removed quiz', async () => {
    const repository = makeRepository({
      findQuiz: vi.fn(async () => ({
        ...quiz,
        removedAt: new Date()
      }))
    });

    await expect(
      submitQuizAttempt(validInput, USER_ID, repository)
    ).rejects.toMatchObject({
      code: 'QUIZ_NOT_FOUND'
    });

    expect(repository.saveAttempt).not.toHaveBeenCalled();
  });

  it('rejects an empty quiz', async () => {
    const repository = makeRepository({
      findQuiz: vi.fn(async () => ({
        ...quiz,
        questionIds: []
      }))
    });

    await expect(
      submitQuizAttempt(validInput, USER_ID, repository)
    ).rejects.toMatchObject({
      code: 'QUIZ_EMPTY'
    });

    expect(repository.saveAttempt).not.toHaveBeenCalled();
  });

  it('rejects missing database questions', async () => {
    const repository = makeRepository({
      findQuestions: vi.fn(async () => [question1])
    });

    await expect(
      submitQuizAttempt(validInput, USER_ID, repository)
    ).rejects.toMatchObject({
      code: 'QUIZ_QUESTION_MISSING'
    });

    expect(repository.saveAttempt).not.toHaveBeenCalled();
  });

  it('rejects an invalid selected option', async () => {
    const repository = makeRepository();

    const invalidInput = {
      ...validInput,
      responses: [
        {
          questionId: QUESTION_1,
          selectedOptionId: 'Z'
        }
      ]
    };

    await expect(
      submitQuizAttempt(invalidInput, USER_ID, repository)
    ).rejects.toMatchObject({
      code: 'INVALID_OPTION'
    });

    expect(repository.saveAttempt).not.toHaveBeenCalled();
  });

  it('rejects questions outside the quiz', async () => {
    const repository = makeRepository();

    const invalidInput = {
      ...validInput,
      responses: [
        {
          questionId: '507f1f77bcf86cd7994390cc',
          selectedOptionId: 'A'
        }
      ]
    };

    await expect(
      submitQuizAttempt(invalidInput, USER_ID, repository)
    ).rejects.toMatchObject({
      code: 'QUESTION_NOT_IN_QUIZ'
    });

    expect(repository.saveAttempt).not.toHaveBeenCalled();
  });

  it('rejects duplicate quiz question references', async () => {
    const repository = makeRepository({
      findQuiz: vi.fn(async () => ({
        ...quiz,
        questionIds: [QUESTION_1, QUESTION_1]
      }))
    });

    await expect(
      submitQuizAttempt(validInput, USER_ID, repository)
    ).rejects.toMatchObject({
      code: 'INVALID_QUIZ'
    });

    expect(repository.saveAttempt).not.toHaveBeenCalled();
  });

  it('normalizes case-insensitive question IDs', async () => {
    const repository = makeRepository();

    const result = await submitQuizAttempt(
      {
        quizId: QUIZ_ID,
        responses: [
          {
            questionId: QUESTION_1.toUpperCase(),
            selectedOptionId: 'B'
          }
        ]
      },
      USER_ID,
      repository
    );

    expect(result.correct).toBe(1);

    expect(repository.saveAttempt).toHaveBeenCalledWith(
      expect.objectContaining({
        responses: [
          {
            questionId: QUESTION_1,
            selectedOptionId: 'B'
          }
        ]
      })
    );
  });

});
