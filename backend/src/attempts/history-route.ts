
import type { Router } from 'express'
import { z } from 'zod'

import {
  AppError,
  unauthorized
} from '../errors.js'

import type {
  AttemptRepository
} from './submission-service.js'

import type {
  AttemptHistoryRepository
} from './history.js'

const querySchema = z.strictObject({
  page: z.coerce.number().int().min(1).max(10000).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10)
})

export function attachHistoryRoute(
  router: Router,
  repository: AttemptRepository
) {
  const historyRepository = repository as
    AttemptRepository & Partial<AttemptHistoryRepository>

  router.get('/history', async (req, res) => {
    if (!req.user?.id) {
      throw unauthorized()
    }

    const parsed = querySchema.safeParse(req.query)

    if (!parsed.success) {
      throw new AppError(
        400,
        'INVALID_QUERY',
        'Use a valid page and pageSize.'
      )
    }

    if (!historyRepository.listUserAttempts) {
      throw new AppError(
        503,
        'HISTORY_UNAVAILABLE',
        'Attempt history is currently unavailable.'
      )
    }

    const result = await historyRepository.listUserAttempts(
      req.user.id,
      parsed.data.page,
      parsed.data.pageSize
    )

    res.json(result)
  })
}
