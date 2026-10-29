
import { describe, expect, it } from 'vitest';
import { attemptSubmissionSchema } from '../../src/attempts/validation.js';

describe('CSMQ-40: Quiz attempt submission validation', () => {
  const validSubmission = {
    quizId: '507f1f77bcf86cd799439011',
    responses: [
      {
        questionId: '507f191e810c19729de860ea',
        selectedOptionId: 'B'
      }
    ]
  };

  it('accepts a valid quiz submission', () => {
    const result = attemptSubmissionSchema.safeParse(validSubmission);
    expect(result.success).toBe(true);
  });

  it('rejects an invalid quiz ID', () => {
    const result = attemptSubmissionSchema.safeParse({
      ...validSubmission,
      quizId: 'invalid-id'
    });
    expect(result.success).toBe(false);
  });

  it('rejects duplicate question responses', () => {
    const result = attemptSubmissionSchema.safeParse({
      ...validSubmission,
      responses: [
        validSubmission.responses[0],
        validSubmission.responses[0]
      ]
    });
    expect(result.success).toBe(false);
  });

  it('rejects a missing selected option', () => {
    const result = attemptSubmissionSchema.safeParse({
      ...validSubmission,
      responses: [
        {
          questionId: '507f191e810c19729de860ea'
        }
      ]
    });
    expect(result.success).toBe(false);
  });

  it('rejects student-supplied scores', () => {
    const result = attemptSubmissionSchema.safeParse({
      ...validSubmission,
      score: 100,
      percentage: 100
    });
    expect(result.success).toBe(false);
  });

  it('rejects student-supplied user IDs', () => {
    const result = attemptSubmissionSchema.safeParse({
      ...validSubmission,
      userId: '507f1f77bcf86cd799439012'
    });
    expect(result.success).toBe(false);
  });

  it('rejects submissions exceeding the response limit', () => {
    const responses = Array.from({ length: 501 }, (_, i) => ({
      questionId: i.toString(16).padStart(24, '0'),
      selectedOptionId: 'A'
    }));

    const result = attemptSubmissionSchema.safeParse({
      ...validSubmission,
      responses
    });

    expect(result.success).toBe(false);
  });
});
