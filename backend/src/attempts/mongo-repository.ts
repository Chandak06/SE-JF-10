
import { Types, type Connection } from 'mongoose'
import { createHash } from 'node:crypto'
import { AppError } from '../errors.js'

import { getQuestionModel } from '../models/question.js'
import { getQuizAttemptModel } from '../models/quiz-attempt.js'

import type {
  AttemptRepository,
  AttemptToSave
} from './submission-service.js'

import type {
  AttemptHistoryRepository
} from './history.js'

interface StoredQuiz {
  _id: Types.ObjectId
  questions: Types.ObjectId[]
  title?: string
  subject?: string
  removedAt?: Date | null
}

interface HistoryRecord {
  _id: Types.ObjectId
  quiz: Types.ObjectId
  score: number
  percentage: number
  responses?: unknown[]
  createdAt?: Date
}

export function createMongoAttemptRepository(
  connection: Connection
): AttemptRepository & AttemptHistoryRepository & { initialize(): Promise<void> } {
  const quizzes = connection.collection<StoredQuiz>('quizzes')
  const Question = getQuestionModel(connection)
  const QuizAttempt = getQuizAttemptModel(connection)

  return {
    async initialize() { await QuizAttempt.init() },
    async findQuiz(quizId) {
      if (!Types.ObjectId.isValid(quizId)) {
        return null
      }

      const quiz = await quizzes.findOne({
        _id: new Types.ObjectId(quizId)
      })

      if (!quiz) {
        return null
      }

      return {
        id: quiz._id.toString(),
        questionIds: Array.isArray(quiz.questions)
          ? quiz.questions.map(id => id.toString())
          : [],
        removedAt: quiz.removedAt ?? null
      }
    },

    async findQuestions(questionIds) {
      const ids = questionIds.map(
        id => new Types.ObjectId(id)
      )

      const questions = await Question.find({
        _id: { $in: ids },
        removedAt: null
      })
        .lean()
        .exec()

      return questions.map(question => ({
        id: question._id.toString(),
        correctAnswer: question.correctAnswer,
        options: question.options.map(option => ({
          id: option.id
        }))
      }))
    },

    async saveAttempt(attempt: AttemptToSave) {
      const digest = createHash('sha256').update(JSON.stringify({
        quizId: attempt.quizId.toLowerCase(),
        responses: [...attempt.responses].map(r => [r.questionId.toLowerCase(), r.selectedOptionId]).sort((a, b) => a[0]!.localeCompare(b[0]!))
      })).digest('hex')
      try {
      const saved = await QuizAttempt.create({
        user: new Types.ObjectId(attempt.userId),
        quiz: new Types.ObjectId(attempt.quizId),

        responses: attempt.responses.map(response => ({
          questionId: new Types.ObjectId(response.questionId),
          selectedOption: response.selectedOptionId
        })),

        score: attempt.score,
        percentage: attempt.percentage,
        ...(attempt.submissionKey ? { submissionKey: attempt.submissionKey, submissionDigest: digest } : {})
      })

      return {
        id: saved._id.toString()
      }
      } catch (error) {
        if (!attempt.submissionKey || typeof error !== 'object' || error === null || !('code' in error) || error.code !== 11000) throw error
        const existing = await QuizAttempt.findOne({ user: attempt.userId, submissionKey: attempt.submissionKey }).select('+submissionDigest').lean()
        if (!existing || existing.submissionDigest !== digest) {
          throw new AppError(409, 'SUBMISSION_CONFLICT', 'This submission identifier was already used with different answers.')
        }
        return { id: existing._id.toString() }
      }
    },

    async listUserAttempts(userId, page, pageSize) {
      // Never accept a user ID supplied by the browser.
      // The route passes the authenticated user's ID.
      if (!Types.ObjectId.isValid(userId)) {
        throw new Error('Invalid authenticated user identifier.')
      }

      const user = new Types.ObjectId(userId)

      const [total, rawRecords] = await Promise.all([
        QuizAttempt.countDocuments({ user }),

        QuizAttempt.find({ user })
          .select('_id quiz score percentage responses createdAt')
          .sort({ createdAt: -1, _id: -1 })
          .skip((page - 1) * pageSize)
          .limit(pageSize)
          .lean()
          .exec()
      ])

      const records = rawRecords as unknown as HistoryRecord[]

      const quizIds = records.map(record => record.quiz)

      const quizDocuments = quizIds.length
        ? await quizzes
            .find(
              { _id: { $in: quizIds } },
              { projection: { _id: 1, title: 1, subject: 1 } }
            )
            .toArray()
        : []

      const quizLookup = new Map(
        quizDocuments.map(quiz => [
          quiz._id.toString(),
          quiz
        ])
      )

      const attempts = records.map(record => {
        const quizId = record.quiz.toString()
        const quiz = quizLookup.get(quizId)

        return {
          attemptId: record._id.toString(),
          quizId,
          quizTitle:
            quiz?.title ?? 'Quiz no longer available',
          subject: quiz?.subject ?? null,
          score: record.score,
          percentage: record.percentage,
          answersSubmitted: Array.isArray(record.responses)
            ? record.responses.length
            : 0,
          submittedAt: record.createdAt instanceof Date
            ? record.createdAt.toISOString()
            : null
        }
      })

      return {
        attempts,
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    }
  }
}
