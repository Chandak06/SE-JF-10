
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { getSessionToken } from './authService';

import {
  submitQuizAttempt,
  type AttemptSubmission,
  type AttemptResult
} from './attemptService';

vi.mock('./authService', () => ({
  getSessionToken: vi.fn()
}));

const fetchMock = vi.fn();

const submission: AttemptSubmission = {
  quizId: '507f1f77bcf86cd799439011',
  responses: [
    {
      questionId: '507f191e810c19729de860ea',
      selectedOptionId: 'B'
    }
  ]
};

const result: AttemptResult = {
  attemptId: '507f1f77bcf86cd799439099',
  quizId: submission.quizId,
  score: 1,
  total: 1,
  percentage: 100,
  correct: 1,
  incorrect: 0,
  unanswered: 0
};

function mockResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body
  };
}

describe('CSMQ-41: Quiz Attempt API Service', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubGlobal('fetch', fetchMock);

    vi.mocked(getSessionToken).mockReturnValue(
      'student-test-token'
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('submits responses with authentication', async () => {
    fetchMock.mockResolvedValueOnce(
      mockResponse(result, 201)
    );

    const response = await submitQuizAttempt(submission);

    expect(response).toEqual(result);

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/attempts$/),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer student-test-token'
        },
        body: JSON.stringify(submission)
      }
    );
  });

  it('rejects submission without login', async () => {
    vi.mocked(getSessionToken).mockReturnValue('');

    await expect(
      submitQuizAttempt(submission)
    ).rejects.toThrow(
      'Please log in before submitting your quiz.'
    );

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('handles expired sessions', async () => {
    fetchMock.mockResolvedValueOnce(
      mockResponse(
        { error: { message: 'Authentication required.' } },
        401
      )
    );

    await expect(
      submitQuizAttempt(submission)
    ).rejects.toThrow(
      'Your session has expired.'
    );
  });

  it('displays backend validation errors', async () => {
    fetchMock.mockResolvedValueOnce(
      mockResponse(
        {
          error: {
            message: 'Selected option does not belong to the question.'
          }
        },
        400
      )
    );

    await expect(
      submitQuizAttempt(submission)
    ).rejects.toThrow(
      'Selected option does not belong to the question.'
    );
  });

  it('handles network failures', async () => {
    fetchMock.mockRejectedValueOnce(
      new Error('Network failure')
    );

    await expect(
      submitQuizAttempt(submission)
    ).rejects.toThrow(
      'Unable to reach the server.'
    );
  });

  it('rejects incomplete results', async () => {
    fetchMock.mockResolvedValueOnce(
      mockResponse({
        quizId: submission.quizId,
        score: 1
      })
    );

    await expect(
      submitQuizAttempt(submission)
    ).rejects.toThrow(
      'The server returned an unexpected quiz result.'
    );
  });

  it('rejects invalid numeric results', async () => {
    fetchMock.mockResolvedValueOnce(
      mockResponse({
        ...result,
        score: '100'
      })
    );

    await expect(
      submitQuizAttempt(submission)
    ).rejects.toThrow(
      'The server returned an unexpected quiz result.'
    );
  });

  it('handles server errors', async () => {
    fetchMock.mockResolvedValueOnce(
      mockResponse({}, 500)
    );

    await expect(
      submitQuizAttempt(submission)
    ).rejects.toThrow(
      'Quiz submission failed. Please try again.'
    );
  });
});
