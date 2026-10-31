import { Router } from 'express';
import { Types, type Connection, type Model } from 'mongoose';
import {
  getQuestionModel,
  type QuestionFields
} from '../models/question.js';
import {
  createQuestionSchema,
  validateQuestionBody
} from './validation.js';

import { buildQuestionFilter } from './filters.js';
import { toStudentSafeQuizPayload } from './serializer.js';
import type { ModerationResource } from '../admin/moderation.js';
import { AppError } from '../errors.js';
import { z } from 'zod';

const queryFields = {
  subject: z.string().trim().min(1).max(100).optional(),
  topic: z.string().trim().min(1).max(100).optional(),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).optional()
};
function questionQuery(input: unknown, student: boolean) {
  const parsed = z.strictObject(student ? { ...queryFields, quizId: z.string().max(100).optional(), title: z.string().max(150).optional() } : queryFields).safeParse(input);
  if (!parsed.success) throw new AppError(400, 'INVALID_QUERY', 'Invalid question filters.');
  return parsed.data;
}

export function createQuestionsRouter(connection: Connection) {
  const Question = getQuestionModel(connection);
  const router = Router();
  const studentRouter = Router();

  studentRouter.get('/', async (req, res) => {
    const query = questionQuery(req.query, true);
    const filter = buildQuestionFilter(query);
    const items = await Question.find({ ...filter, removedAt: null })
      .sort({ createdAt: -1 })
      .lean();

    res.json(
      toStudentSafeQuizPayload(items, {
        quizId:
          typeof req.query.quizId === 'string' ? req.query.quizId : undefined,
        title:
          typeof req.query.title === 'string' ? req.query.title : undefined
      })
    );
  });

  router.post(
    '/',
    validateQuestionBody(createQuestionSchema),
    async (req, res) => {
      const creator = req.user?.id ? new Types.ObjectId(req.user.id) : undefined;
      const question = await Question.create({
        ...req.body,
        creator
      });

      res.status(201).json({
        question: {
          id: question._id.toString(),
          questionText: question.questionText,
          options: question.options.map((opt) => ({
            id: opt.id,
            text: opt.text
          })),
          correctAnswer: question.correctAnswer,
          subject: question.subject,
          topic: question.topic,
          difficulty: question.difficulty,
          marks: question.marks,
          creator: question.creator?.toString(),
          createdAt: question.get('createdAt')
            ? (question.get('createdAt') as Date).toISOString()
            : undefined
        }
      });
    }
  );

  router.get('/', async (req, res) => {
    const filter = buildQuestionFilter(questionQuery(req.query, false));

    const items = await Question.find({ ...filter, removedAt: null })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      questions: items.map((q) => ({
        id: q._id.toString(),
        questionText: q.questionText,
        options: q.options.map((opt) => ({
          id: opt.id,
          text: opt.text
        })),
        correctAnswer: q.correctAnswer,
        subject: q.subject,
        topic: q.topic,
        difficulty: q.difficulty,
        marks: q.marks,
        creator: q.creator ? q.creator.toString() : undefined,
        createdAt: q.createdAt ? (q.createdAt as Date).toISOString() : undefined
      }))
    });
  });

  const moderation: ModerationResource = {
    async list(limit, filters) {
      const items = await Question.find({
        removedAt: null,
        ...(filters.subject ? { subject: filters.subject } : {}),
        ...(filters.difficulty ? { difficulty: filters.difficulty } : {})
      }).sort({ _id: -1 }).limit(limit).select('questionText subject difficulty').lean();
      return items.map(item => ({ id: item._id.toString(), title: item.questionText, subject: item.subject, difficulty: item.difficulty }));
    },
    async filterOptions() {
      const [subjects, difficulties] = await Promise.all([
        Question.distinct('subject', { removedAt: null }),
        Question.distinct('difficulty', { removedAt: null })
      ]);
      return {
        subjects: subjects.sort((a, b) => a.localeCompare(b)),
        difficulties: difficulties.sort((a, b) => a.localeCompare(b))
      };
    },
    async remove(id, administratorId) {
      const result = await Question.updateOne({ _id: id, removedAt: null }, { $set: { removedAt: new Date(), removedBy: new Types.ObjectId(administratorId) } });
      return result.modifiedCount === 1;
    },
    async removeAll(administratorId) {
      const result = await Question.updateMany({ removedAt: null }, { $set: { removedAt: new Date(), removedBy: new Types.ObjectId(administratorId) } });
      return result.modifiedCount;
    }
  };
  return {
    moderation,
    router,
    studentRouter,
    Question,
    async initialize() {
      await Question.init();
    }
  };
}
