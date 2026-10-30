import express, {
  type ErrorRequestHandler,
  type RequestHandler
} from 'express'
import request from 'supertest'
import { describe, expect, it, vi } from 'vitest'

import { createAttemptRouter } from '../../src/attempts/router.js'
import type { AttemptRepository } from '../../src/attempts/submission-service.js'

const studentId = '507f1f77bcf86cd799439001'
const quizId = '507f1f77bcf86cd799439011'
const firstId = '507f191e810c19729de860e1'
const secondId = '507f191e810c19729de860e2'
const savedId = '507f1f77bcf86cd799439099'

/** This invokes the real production router, input schema and evaluation service.
 * The Mongo-backed persistence boundary is tested separately in the history suite.
 */
function fixture(authenticated = true) {
  const repository = {
    findQuiz: vi.fn(async () => ({
      id: quizId,
      questionIds: [firstId, secondId],
      removedAt: null
    })),
    findQuestions: vi.fn(async () => [
      { id: firstId, correctAnswer: 'A', options: [{ id: 'A' }, { id: 'B' }] },
      { id: secondId, correctAnswer: 'B', options: [{ id: 'A' }, { id: 'B' }] }
    ]),
    saveAttempt: vi.fn(async (_attempt: unknown) => ({ id: savedId }))
  }

  const app = express()
  app.use(express.json())

  if (authenticated) {
    const authenticatedStudent: RequestHandler = (req, _res, next) => {
      Object.assign(req, { user: { id: studentId, role: 'student' } })
      next()
    }
    app.use(authenticatedStudent)
  }

  app.use('/api/attempts', createAttemptRouter(repository as unknown as AttemptRepository))

  const errorHandler: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
    const details = error as { status?: number; statusCode?: number; code?: string }
    const status = details.statusCode ?? details.status ?? 500
    res.status(status).json({ error: details.code ?? 'REQUEST_FAILED' })
  }
  app.use(errorHandler)

  return { app, repository }
}

const response = (questionId: string, selectedOptionId: string) => ({
  questionId,
  selectedOptionId
})

describe('CSMQ-45 / production POST /api/attempts acceptance', () => {
  it('saves a server-evaluated correct/incorrect result under the authenticated student', async () => {
    const { app, repository } = fixture()
    const submission = await request(app).post('/api/attempts').send({
      quizId,
      responses: [response(firstId, 'A'), response(secondId, 'A')]
    })

    expect(submission.status).toBe(201)
    expect(submission.body).toMatchObject({
      quizId,
      attemptId: savedId,
      score: 1,
      total: 2,
      percentage: 50,
      correct: 1,
      incorrect: 1,
      unanswered: 0
    })
    expect(repository.saveAttempt).toHaveBeenCalledOnce()
    expect(repository.saveAttempt.mock.calls[0]?.[0]).toMatchObject({
      userId: studentId,
      quizId,
      score: 1,
      percentage: 50
    })
    expect(JSON.stringify(submission.body)).not.toContain('correctAnswer')
  })

  it('counts an omitted question as unanswered rather than incorrect', async () => {
    const { app, repository } = fixture()
    const submission = await request(app).post('/api/attempts').send({
      quizId,
      responses: [response(firstId, 'A')]
    })

    expect(submission.status).toBe(201)
    expect(submission.body).toMatchObject({
      correct: 1, incorrect: 0, unanswered: 1,
      score: 1, total: 2, percentage: 50
    })
    expect(repository.saveAttempt).toHaveBeenCalledOnce()
  })

  it('rejects an unauthenticated submission without saving', async () => {
    const { app, repository } = fixture(false)
    const submission = await request(app).post('/api/attempts').send({
      quizId, responses: [response(firstId, 'A')]
    })
    expect(submission.status).toBe(401)
    expect(repository.saveAttempt).not.toHaveBeenCalled()
  })

  it.each([
    ['invalid quiz ID', 'not-a-quiz', [response(firstId, 'A')]],
    ['invalid question ID', quizId, [response('not-a-question', 'A')]],
    ['invalid option', quizId, [response(firstId, 'NOT_AN_OPTION')]],
    ['duplicate question response', quizId, [response(firstId, 'A'), response(firstId, 'B')]]
  ])('rejects %s without persisting', async (_name, id, responses) => {
    const { app, repository } = fixture()
    const result = await request(app).post('/api/attempts').send({ quizId: id, responses })
    expect(result.status).toBeGreaterThanOrEqual(400)
    expect(result.status).toBeLessThan(500)
    expect(repository.saveAttempt).not.toHaveBeenCalled()
  })

  it('does not let client-supplied userId override the session identity', async () => {
    const { app, repository } = fixture()
    const result = await request(app).post('/api/attempts').send({
      quizId,
      userId: '507f1f77bcf86cd799439002',
      responses: [response(firstId, 'A')]
    })

    // Strict schema rejects the extra property. If a future schema ignores it,
    // the service must still persist only the authenticated user's identity.
    if (result.status === 201) {
      expect(repository.saveAttempt).toHaveBeenCalledOnce()
      expect(repository.saveAttempt.mock.calls[0]?.[0]).toMatchObject({ userId: studentId })
    } else {
      expect(result.status).toBeGreaterThanOrEqual(400)
      expect(result.status).toBeLessThan(500)
      expect(repository.saveAttempt).not.toHaveBeenCalled()
    }
  })

  it('rejects forged score/percentage values supplied by the client', async () => {
    const { app, repository } = fixture()
    const result = await request(app).post('/api/attempts').send({
      quizId,
      responses: [response(firstId, 'B')],
      score: 999,
      percentage: 100
    })
    if (result.status === 201) {
      expect(result.body.score).toBe(0)
      expect(result.body.percentage).toBe(0)
      expect(repository.saveAttempt.mock.calls[0]?.[0]).toMatchObject({ score: 0, percentage: 0 })
    } else {
      expect(result.status).toBeGreaterThanOrEqual(400)
      expect(result.status).toBeLessThan(500)
      expect(repository.saveAttempt).not.toHaveBeenCalled()
    }
  })
})
