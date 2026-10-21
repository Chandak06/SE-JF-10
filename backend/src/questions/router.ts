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

export function createQuestionsRouter(connection: Connection) {
  const Question = getQuestionModel(connection);
  const router = Router();

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
    const filter = buildQuestionFilter(req.query);

    const items = await Question.find(filter)
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

  return {
    router,
    Question,
    async initialize() {
      await Question.init();
    }
  };
}
