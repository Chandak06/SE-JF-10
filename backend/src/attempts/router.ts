import { attachHistoryRoute } from './history-route.js';

import { Router } from 'express';

import { AppError, unauthorized } from '../errors.js';
import { z } from 'zod';
import { validateBody } from '../middleware/validation.js';

import {
  attemptSubmissionSchema,
  type AttemptSubmissionInput
} from './validation.js';

import {
  submitQuizAttempt,
  type AttemptRepository
} from './submission-service.js';

export function createAttemptRouter(
  repository: AttemptRepository
) {
  const router = Router();

  router.post(
    '/',
    validateBody(attemptSubmissionSchema),
    async (req, res) => {
      // Authentication is normally enforced by app.ts.
      if (!req.user) {
        throw unauthorized();
      }

      // Only validated submission data reaches the service.
      const input = req.body as AttemptSubmissionInput;
      const key = req.get('Idempotency-Key');
      if (key !== undefined && !z.uuid().safeParse(key).success) {
        throw new AppError(400, 'INVALID_SUBMISSION_KEY', 'Use a valid submission identifier.');
      }

      const result = await submitQuizAttempt(
        input,
        req.user.id,
        repository,
        key
      );

      // The API returns the server-calculated result.
      res.status(201).json(result);
    }
  );

  attachHistoryRoute(router, repository);

  return router;
}
