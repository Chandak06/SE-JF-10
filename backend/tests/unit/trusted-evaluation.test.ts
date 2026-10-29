
import { describe, expect, it } from 'vitest';
import { evaluateTrustedAttempt } from '../../src/attempts/trusted-evaluation.js';

const questions = [
  {
    id: '507f1f77bcf86cd799439011',
    correctAnswer: 'B',
    options: [{ id: 'A' }, { id: 'B' }]
  },
  {
    id: '507f1f77bcf86cd799439012',
    correctAnswer: 'A',
    options: [{ id: 'A' }, { id: 'B' }]
  },
  {
    id: '507f1f77bcf86cd799439013',
    correctAnswer: 'B',
    options: [{ id: 'A' }, { id: 'B' }]
  }
] as const ;

describe('CSMQ-40: Trusted server-side evaluation', () => {

  it('calculates scores using the server answer key', () => {
    const result = evaluateTrustedAttempt(questions, [
      {
        questionId: questions[0].id,
        selectedOptionId: 'B'
      },
      {
        questionId: questions[1].id,
        selectedOptionId: 'B'
      }
    ]);

    expect(result).toEqual({
      score: 1,
      total: 3,
      percentage: 33.33,
      correct: 1,
      incorrect: 1,
      unanswered: 1
    });
  });

  it('rejects questions outside the quiz', () => {
    expect(() =>
      evaluateTrustedAttempt(questions, [
        {
          questionId: '507f1f77bcf86cd799439099',
          selectedOptionId: 'A'
        }
      ])
    ).toThrow('Submitted question is not part of this quiz.');
  });

  it('rejects options not belonging to the question', () => {
    expect(() =>
      evaluateTrustedAttempt(questions, [
        {
          questionId: questions[0].id,
          selectedOptionId: 'Z'
        }
      ])
    ).toThrow('Selected option does not belong to the question.');
  });

  it('rejects duplicate responses', () => {
    const response = {
      questionId: questions[0].id,
      selectedOptionId: 'B'
    };

    expect(() =>
      evaluateTrustedAttempt(questions, [
        response,
        response
      ])
    ).toThrow('A question was answered more than once.');
  });

  it('rejects empty quizzes', () => {
    expect(() =>
      evaluateTrustedAttempt([], [])
    ).toThrow('Quiz has no questions.');
  });

  it('rejects invalid trusted answer keys', () => {
    expect(() =>
      evaluateTrustedAttempt([
        {
          ...questions[0],
          correctAnswer: 'Z'
        }
      ], [])
    ).toThrow('Quiz answer key is invalid.');
  });

  it('accepts MongoDB IDs regardless of letter case', () => {
    const result = evaluateTrustedAttempt(questions, [
      {
        questionId: questions[0].id.toUpperCase(),
        selectedOptionId: 'B'
      }
    ]);

    expect(result.correct).toBe(1);
  });

});
