import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { Types, type Connection } from 'mongoose'
import express from 'express'
import request from 'supertest'

import { loadConfig } from '../../src/config.js'
import { connectDatabase } from '../../src/db.js'
import { evaluateQuiz } from '../../src/attempts/evaluate.js'
import { getQuizAttemptModel } from '../../src/models/quiz-attempt.js'
import { createRuntime } from '../../src/runtime.js'

let mongo: MongoMemoryServer
let connection: Connection
let runtime: Awaited<ReturnType<typeof createRuntime>>
let QuizAttempt: ReturnType<typeof getQuizAttemptModel>

const student = {
  name: 'Quiz Integration Student',
  email: 'quiz.student@example.com',
  password: 'Secure quiz password!'
}

const auth = (token: string) => ({
  Authorization: `Bearer ${token}`
})

const quizId = new Types.ObjectId()
const questionOneId = new Types.ObjectId()
const questionTwoId = new Types.ObjectId()
const questionThreeId = new Types.ObjectId()

const trustedQuestions = [
  {
    id: questionOneId.toString(),
    correctOptionId: 'B'
  },
  {
    id: questionTwoId.toString(),
    correctOptionId: 'A'
  },
  {
    id: questionThreeId.toString(),
    correctOptionId: 'D'
  }
]

beforeAll(async () => {
  mongo = await MongoMemoryServer.create({
    instance: {
      dbName: 'csmq_quiz_attempt_test',
      launchTimeout: 60000
    }
  })

  connection = await connectDatabase(mongo.getUri())
  QuizAttempt = getQuizAttemptModel(connection)

  const attemptsRouter = express.Router()

  attemptsRouter.post('/', async (req, res) => {
    const responses = Array.isArray(req.body.responses)
      ? req.body.responses
      : []

    const evaluation = evaluateQuiz(trustedQuestions, responses)

    const attempt = await QuizAttempt.create({
      user: new Types.ObjectId(req.user!.id),
      quiz: new Types.ObjectId(req.body.quizId),
      responses: responses.map(
        (response: {
          questionId: string
          selectedOptionId: string
        }) => ({
          questionId: new Types.ObjectId(response.questionId),
          selectedOption: response.selectedOptionId
        })
      ),
      score: evaluation.score,
      percentage: evaluation.percentage
    })

    res.status(201).json({
      attemptId: attempt.id,
      quizId: attempt.quiz.toString(),
      ...evaluation
    })
  })

  runtime = await createRuntime(
    connection,
    loadConfig({
      MONGODB_URI: mongo.getUri(),
      NODE_ENV: 'test',
      BCRYPT_ROUNDS: '10',
      MAX_UPLOAD_BYTES: '2048'
    }),
    {
      authLimit: 500,
      features: {
        attempts: attemptsRouter
      }
    }
  )
})

beforeEach(async () => {
  await runtime.accounts.User.deleteMany({})
  await QuizAttempt.deleteMany({})
  await connection.collection('authsessions').deleteMany({})
})

afterAll(async () => {
  await connection?.close()
  await mongo?.stop()
})

async function login() {
  await request(runtime.app)
    .post('/api/auth/register')
    .send(student)
    .expect(201)

  const response = await request(runtime.app)
    .post('/api/auth/login')
    .send({
      email: student.email,
      password: student.password
    })
    .expect(200)

  return response.body.token as string
}

describe('QuizAttempt integration', () => {
  it('evaluates an authenticated student attempt and persists it in MongoDB', async () => {
    const token = await login()

    const response = await request(runtime.app)
      .post('/api/attempts')
      .set(auth(token))
      .send({
        quizId: quizId.toString(),
        responses: [
          {
            questionId: questionOneId.toString(),
            selectedOptionId: 'B'
          },
          {
            questionId: questionTwoId.toString(),
            selectedOptionId: 'C'
          }
        ]
      })
      .expect(201)

    expect(response.body).toMatchObject({
      quizId: quizId.toString(),
      score: 1,
      total: 3,
      percentage: 33.33,
      correct: 1,
      incorrect: 1,
      unanswered: 1
    })

    const savedAttempt = await QuizAttempt.findById(
      response.body.attemptId
    ).lean()

    expect(savedAttempt).not.toBeNull()

    const account = await runtime.accounts.accounts.findByEmail(
      student.email
    )

    expect(savedAttempt!.user.toString()).toBe(account!.id)
    expect(savedAttempt!.quiz.toString()).toBe(quizId.toString())
    expect(savedAttempt!.score).toBe(1)
    expect(savedAttempt!.percentage).toBe(33.33)

    expect(savedAttempt!.responses).toHaveLength(2)
    expect(savedAttempt!.responses[0]!.questionId.toString()).toBe(
      questionOneId.toString()
    )
    expect(savedAttempt!.responses[0]!.selectedOption).toBe('B')
  })

  it('rejects an unauthenticated attempt before anything is persisted', async () => {
    await request(runtime.app)
      .post('/api/attempts')
      .send({
        quizId: quizId.toString(),
        responses: [
          {
            questionId: questionOneId.toString(),
            selectedOptionId: 'B'
          }
        ]
      })
      .expect(401)

    expect(await QuizAttempt.countDocuments()).toBe(0)
  })

  it('uses the authenticated user instead of a client supplied userId', async () => {
    const token = await login()
    const forgedUserId = new Types.ObjectId()

    const response = await request(runtime.app)
      .post('/api/attempts')
      .set(auth(token))
      .send({
        userId: forgedUserId.toString(),
        quizId: quizId.toString(),
        responses: [
          {
            questionId: questionOneId.toString(),
            selectedOptionId: 'B'
          }
        ]
      })
      .expect(201)

    const savedAttempt = await QuizAttempt.findById(
      response.body.attemptId
    ).lean()

    const account = await runtime.accounts.accounts.findByEmail(
      student.email
    )

    expect(savedAttempt!.user.toString()).toBe(account!.id)
    expect(savedAttempt!.user.toString()).not.toBe(
      forgedUserId.toString()
    )
  })

  it('rejects a non-student account through the application role middleware', async () => {
    const token = await login()

    await runtime.accounts.User.updateOne(
      { email: student.email },
      { role: 'admin' }
    )

    await request(runtime.app)
      .post('/api/attempts')
      .set(auth(token))
      .send({
        quizId: quizId.toString(),
        responses: []
      })
      .expect(403)

    expect(await QuizAttempt.countDocuments()).toBe(0)
  })
})