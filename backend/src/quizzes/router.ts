import { Router } from 'express';
import { Types, type Connection } from 'mongoose';
import { getQuizModel, softDeleteQuizById } from '../models/quiz.js';
import { getQuestionModel } from '../models/question.js';
import { createQuizSchema, validateQuizBody } from './validation.js';
import { toStudentSafeQuestions } from '../questions/serializer.js';
import { AppError, unauthorized } from '../errors.js';

export function createQuizzesRouter(connection: Connection) {
  const Quiz = getQuizModel(connection);
  const Question = getQuestionModel(connection);
  const router = Router();

  // POST /api/quizzes — Authenticated student/admin creates a quiz from existing Question Bank questions
  router.post(
    '/',
    validateQuizBody(createQuizSchema),
    async (req, res) => {
      if (!req.user?.id) {
        throw unauthorized();
      }

      const { title, subject, questionIds } = req.body;
      const objectIds = questionIds.map((id: string) => new Types.ObjectId(id));

      // Verify that all selected question IDs exist in Question Bank and are active
      const foundQuestions = await Question.find({
        _id: { $in: objectIds },
        removedAt: null
      })
        .select('_id')
        .lean();

      if (foundQuestions.length !== objectIds.length) {
        throw new AppError(
          400,
          'INVALID_QUESTION_SELECTION',
          'One or more selected questions do not exist in the Question Bank.'
        );
      }

      const quiz = await Quiz.create({
        title,
        subject,
        questions: objectIds,
        creator: new Types.ObjectId(req.user.id)
      });

      res.status(201).json({
        quiz: {
          id: quiz._id.toString(),
          title: quiz.title,
          subject: quiz.subject,
          questionCount: quiz.questions.length,
          questions: quiz.questions.map((q) => q.toString()),
          creator: quiz.creator.toString(),
          createdAt: quiz.get('createdAt')
            ? (quiz.get('createdAt') as Date).toISOString()
            : undefined
        }
      });
    }
  );

  // GET /api/quizzes/:id — Retrieve quiz details with student-safe questions (zero answer leakage)
  router.get('/:id', async (req, res) => {
    if (!Types.ObjectId.isValid(req.params.id)) {
      throw new AppError(400, 'INVALID_ID', 'Invalid quiz identifier.');
    }

    const quiz = await Quiz.findOne({
      _id: new Types.ObjectId(req.params.id),
      removedAt: null
    })
      .populate('questions')
      .lean();

    if (!quiz) {
      throw new AppError(404, 'NOT_FOUND', 'Quiz not found.');
    }

    const safeQuestions = toStudentSafeQuestions(
      (quiz.questions ?? []) as unknown as Array<{
        _id?: unknown;
        id?: string;
        questionText?: string;
        options?: Array<{ id: unknown; text: unknown }>;
      }>
    );

    res.json({
      quiz: {
        id: quiz._id.toString(),
        title: quiz.title,
        subject: quiz.subject,
        questionCount: safeQuestions.length,
        questions: safeQuestions,
        creator: quiz.creator ? quiz.creator.toString() : undefined,
        createdAt: quiz.createdAt
          ? (quiz.createdAt as Date).toISOString()
          : undefined
      }
    });
  });

  const moderation = {
    async list(limit: number) {
      const items = await Quiz.find({ removedAt: null })
        .sort({ _id: -1 })
        .limit(limit)
        .select('title')
        .lean();
      return items.map((item) => ({
        id: item._id.toString(),
        title: item.title
      }));
    },
    async remove(id: string, administratorId: string) {
      return softDeleteQuizById(Quiz, id, administratorId);
    }
  };

  return {
    router,
    Quiz,
    moderation,
    async initialize() {
      await Promise.all([Quiz.init(), Question.init()]);
    }
  };
}
