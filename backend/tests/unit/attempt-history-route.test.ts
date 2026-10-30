
import express, { Router } from 'express'
import request from 'supertest'

import {
  describe,
  expect,
  it,
  vi
} from 'vitest'

import { attachHistoryRoute } from '../../src/attempts/history-route.js'

import type {
  AttemptRepository
} from '../../src/attempts/submission-service.js'

const studentId = '507f1f77bcf86cd799439001'

function createTestApp(
  listUserAttempts: ReturnType<typeof vi.fn>,
  authenticated = true
) {
  const app = express()
  const router = Router()

  const repository = {
    listUserAttempts
  } as unknown as AttemptRepository

  attachHistoryRoute(router, repository)

  if (authenticated) {
    app.use((_req, _res, next) => {
      next()
    })

    app.use((req, _res, next) => {
      Object.assign(req, {
        user: {
          id: studentId,
          role: 'student'
        }
      })

      next()
    })
  }

  app.use('/api/attempts', router)

  return app
}

describe('CSMQ-43: Attempt history API', () => {
  it('uses the authenticated user ID', async () => {
    const list = vi.fn().mockResolvedValue({
      attempts: [],
      page: 1,
      pageSize: 10,
      total: 0,
      totalPages: 0
    })

    const app = createTestApp(list)

    const result = await request(app)
      .get('/api/attempts/history')
      .expect(200)

    expect(result.body.attempts).toEqual([])

    expect(list).toHaveBeenCalledWith(
      studentId,
      1,
      10
    )
  })

  it('rejects invalid pagination', async () => {
    const list = vi.fn()
    const app = createTestApp(list)

    await request(app)
      .get('/api/attempts/history?page=0')
      .expect(400)

    expect(list).not.toHaveBeenCalled()
  })

  it('does not trust a userId query parameter', async () => {
    const list = vi.fn()
    const app = createTestApp(list)

    await request(app)
      .get('/api/attempts/history?userId=another-student')
      .expect(400)

    expect(list).not.toHaveBeenCalled()
  })
})
