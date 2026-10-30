import { attachHistoryRoute } from './history-route.js';

import { Router } from 'express';

import { unauthorized } from '../errors.js';
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

      const result = await submitQuizAttempt(
        input,
        req.user.id,
        repository
      );

      // The API returns the server-calculated result.
      res.status(201).json(result);
    }
  );

  attachHistoryRoute(router, repository);

  return router;
}
