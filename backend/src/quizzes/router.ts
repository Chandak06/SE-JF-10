import { Router } from 'express';
import { Types, type Connection } from 'mongoose';
import { getQuizModel, softDeleteQuizById } from '../models/quiz.js';
import { getQuestionModel } from '../models/question.js';
import { createQuizSchema, validateQuizBody } from './validation.js';
import { buildQuizFilter } from './filters.js';
import { toStudentSafeQuestions } from '../questions/serializer.js';
import { AppError, unauthorized } from '../errors.js';
import type { ModerationFilters } from '../admin/moderation.js';
import { z } from 'zod';

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

  // GET /api/quizzes — Search and filter available quizzes (keyword, subject, combined)
  router.get('/', async (req, res) => {
    const text = z.string().trim().max(100).regex(/^[^<>\x00-\x1f\x7f]*$/).optional();
    const query = z.strictObject({ search: text, keyword: text, subject: text }).safeParse(req.query);
    if (!query.success) throw new AppError(400, 'INVALID_QUERY', 'Use valid quiz search and subject filters.');
    const filter = buildQuizFilter(query.data);
    const quizzes = await Quiz.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      quizzes: quizzes.map((quiz) => ({
        id: quiz._id.toString(),
        title: quiz.title,
        subject: quiz.subject,
        questionCount: Array.isArray(quiz.questions) ? quiz.questions.length : 0,
        creator: quiz.creator ? quiz.creator.toString() : undefined,
        createdAt: quiz.createdAt
          ? (quiz.createdAt as Date).toISOString()
          : undefined
      }))
    });
  });

  // GET /api/quizzes/:id — Retrieve quiz details with student-safe questions (zero answer leakage)
  router.get('/:id', async (req, res) => {
    if (!Types.ObjectId.isValid(req.params.id)) {
      throw new AppError(400, 'INVALID_ID', 'Invalid quiz identifier.');
    }

    const quiz = await Quiz.findOne({
      _id: new Types.ObjectId(req.params.id),
      removedAt: null
    })
      .populate({ path: 'questions', match: { removedAt: null } })
      .lean();

    if (!quiz) {
      throw new AppError(404, 'NOT_FOUND', 'Quiz not found.');
    }

    // Do not silently offer a shorter quiz after a referenced question is removed.
    // Discovery and submission must agree on the same active question set.
    const stored = await Quiz.findById(quiz._id).select('questions').lean();
    if (!stored || quiz.questions.length !== stored.questions.length) {
      throw new AppError(409, 'QUIZ_QUESTION_MISSING', 'A question required by this quiz is unavailable.');
    }

    const safeQuestions = toStudentSafeQuestions(
      (quiz.questions ?? []) as unknown as Array<{
        _id?: unknown;
        id?: string;
        questionText?: string;
        options?: Array<{ id: unknown; text: unknown }>;
      }>
    );

    const quizResponse = {
      id: quiz._id.toString(),
      quizId: quiz._id.toString(),
      title: quiz.title,
      subject: quiz.subject,
      questionCount: safeQuestions.length,
      questions: safeQuestions,
      creator: quiz.creator ? quiz.creator.toString() : undefined,
      createdAt: quiz.createdAt
        ? (quiz.createdAt as Date).toISOString()
        : undefined
    };

    res.json({
      quizId: quiz._id.toString(),
      title: quiz.title,
      subject: quiz.subject,
      questionCount: safeQuestions.length,
      questions: safeQuestions,
      quiz: quizResponse
    });
  });

  const moderation = {
    async list(limit: number, filters: ModerationFilters) {
      const items = await Quiz.find({ removedAt: null, ...(filters.subject ? { subject: filters.subject } : {}) })
        .sort({ _id: -1 })
        .limit(limit)
        .select('title subject')
        .lean();
      return items.map((item) => ({
        id: item._id.toString(),
        title: item.title,
        subject: item.subject
      }));
    },
    async filterOptions() {
      const subjects = await Quiz.distinct('subject', { removedAt: null });
      return { subjects: subjects.sort((a, b) => a.localeCompare(b)), difficulties: [] };
    },
    async remove(id: string, administratorId: string) {
      return softDeleteQuizById(Quiz, id, administratorId);
    },
    async removeAll(administratorId: string) {
      const result = await Quiz.updateMany({ removedAt: null }, { $set: {
        removedAt: new Date(), removedBy: new Types.ObjectId(administratorId)
      } });
      return result.modifiedCount;
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
