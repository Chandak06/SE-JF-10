import express, {
  type ErrorRequestHandler,
  type RequestHandler
} from 'express'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { createConnection, Types, type Connection } from 'mongoose'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { createAttemptRouter } from '../../src/attempts/router.js'
import { createMongoAttemptRepository } from '../../src/attempts/mongo-repository.js'
import { getQuizAttemptModel } from '../../src/models/quiz-attempt.js'

const studentA = new Types.ObjectId()
const studentB = new Types.ObjectId()
const quizA = new Types.ObjectId()
const quizB = new Types.ObjectId()

let mongo: MongoMemoryServer
let connection: Connection
let ownAttemptId: string
let otherAttemptId: string

function historyApp(userId?: string) {
  const app = express()
  app.use(express.json())

  if (userId) {
    const authenticate: RequestHandler = (req, _res, next) => {
      Object.assign(req, { user: { id: userId, role: 'student' } })
      next()
    }
    app.use(authenticate)
  }

  app.use('/api/attempts', createAttemptRouter(createMongoAttemptRepository(connection)))

  const handleError: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
    const details = error as { status?: number; statusCode?: number }
    res.status(details.statusCode ?? details.status ?? 500).json({ error: 'REQUEST_FAILED' })
  }
  app.use(handleError)
  return app
}

beforeAll(async () => {
  mongo = await MongoMemoryServer.create()
  connection = await createConnection(mongo.getUri()).asPromise()

  await connection.collection('quizzes').insertMany([
    { _id: quizA, title: 'DBMS Fundamentals', subject: 'DBMS', questions: [] },
    { _id: quizB, title: 'Networks Basics', subject: 'Networks', questions: [] }
  ])

  const Attempt = getQuizAttemptModel(connection)
  const first = await Attempt.create({
    user: studentA, quiz: quizA, responses: [], score: 8, percentage: 80
  })
  const second = await Attempt.create({
    user: studentB, quiz: quizB, responses: [], score: 5, percentage: 50
  })
  ownAttemptId = first._id.toString()
  otherAttemptId = second._id.toString()
}, 30000)

afterAll(async () => {
  if (connection) await connection.close()
  if (mongo) await mongo.stop()
})

describe('CSMQ-45 / real MongoDB student isolation and history', () => {
  it('returns only the signed-in student history, including persisted quiz details', async () => {
    const response = await request(historyApp(studentA.toString()))
      .get('/api/attempts/history?page=1&pageSize=10')
      .expect(200)

    expect(response.body.total).toBe(1)
    expect(response.body.attempts).toHaveLength(1)
    expect(response.body.attempts[0]).toMatchObject({
      attemptId: ownAttemptId,
      quizId: quizA.toString(),
      quizTitle: 'DBMS Fundamentals',
      subject: 'DBMS',
      score: 8,
      percentage: 80,
      answersSubmitted: 0
    })
    expect(JSON.stringify(response.body)).not.toContain(otherAttemptId)
    expect(JSON.stringify(response.body)).not.toContain('correctAnswer')
  })

  it('never returns student A data to student B', async () => {
    const response = await request(historyApp(studentB.toString()))
      .get('/api/attempts/history')
      .expect(200)

    expect(response.body.attempts).toHaveLength(1)
    expect(response.body.attempts[0].attemptId).toBe(otherAttemptId)
    expect(JSON.stringify(response.body)).not.toContain(ownAttemptId)
  })

  it('does not allow query parameters to change the authenticated identity', async () => {
    const result = await request(historyApp(studentB.toString()))
      .get(`/api/attempts/history?userId=${studentA.toString()}`)
      .expect(400)
    expect(JSON.stringify(result.body)).not.toContain(ownAttemptId)
  })

  it('rejects unauthenticated access to history', async () => {
    await request(historyApp()).get('/api/attempts/history').expect(401)
  })

  it('returns the empty history state for a new student', async () => {
    const response = await request(historyApp(new Types.ObjectId().toString()))
      .get('/api/attempts/history')
      .expect(200)

    expect(response.body).toMatchObject({
      attempts: [], page: 1, pageSize: 10, total: 0, totalPages: 0
    })
  })

  it('respects page size and total counts without cross-user leakage', async () => {
    const response = await request(historyApp(studentA.toString()))
      .get('/api/attempts/history?page=1&pageSize=1')
      .expect(200)

    expect(response.body).toMatchObject({ page: 1, pageSize: 1, total: 1, totalPages: 1 })
    expect(response.body.attempts).toHaveLength(1)
  })
})
