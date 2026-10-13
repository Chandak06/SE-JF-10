import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it
} from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import type { Connection } from 'mongoose';
import mongoose from 'mongoose';

import { connectDatabase } from '../../src/db.js';
import { getQuizAttemptModel } from '../../src/models/quiz-attempt.js';

describe('QuizAttempt model', () => {
  let mongo: MongoMemoryServer;
  let connection: Connection;
  let QuizAttempt: ReturnType<typeof getQuizAttemptModel>;

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create({
      instance: {
        dbName: 'csmq_quiz_attempt_test',
        launchTimeout: 60_000
      }
    });

    connection = await connectDatabase(mongo.getUri());
    QuizAttempt = getQuizAttemptModel(connection);
  }, 90_000);

  beforeEach(async () => {
    await QuizAttempt.deleteMany({});
  });

  afterAll(async () => {
    await connection?.close();
    await mongo?.stop();
  });

  it('creates a valid quiz attempt', async () => {
    const userId = new mongoose.Types.ObjectId();
    const quizId = new mongoose.Types.ObjectId();
    const questionId = new mongoose.Types.ObjectId();

    const attempt = await QuizAttempt.create({
      user: userId,
      quiz: quizId,
      responses: [
        {
          questionId,
          selectedOption: 'B'
        }
      ],
      score: 1,
      percentage: 100
    });

    expect(attempt.user).toEqual(userId);
    expect(attempt.quiz).toEqual(quizId);
    expect(attempt.responses).toHaveLength(1);
    expect(attempt.responses[0]?.selectedOption).toBe('B');
    expect(attempt.score).toBe(1);
    expect(attempt.percentage).toBe(100);
    expect(attempt.get('createdAt')).toBeDefined();
    expect(attempt.get('updatedAt')).toBeDefined();
  });

  it('rejects missing required fields', async () => {
    const attempt = new QuizAttempt({});

    await expect(attempt.validate()).rejects.toBeDefined();
  });

  it('rejects percentage below 0', async () => {
    const attempt = new QuizAttempt({
      user: new mongoose.Types.ObjectId(),
      quiz: new mongoose.Types.ObjectId(),
      responses: [],
      score: 0,
      percentage: -1
    });

    await expect(attempt.validate()).rejects.toBeDefined();
  });

  it('rejects percentage above 100', async () => {
    const attempt = new QuizAttempt({
      user: new mongoose.Types.ObjectId(),
      quiz: new mongoose.Types.ObjectId(),
      responses: [],
      score: 1,
      percentage: 101
    });

    await expect(attempt.validate()).rejects.toBeDefined();
  });

  it('stores and reads an attempt from MongoDB', async () => {
    const userId = new mongoose.Types.ObjectId();

    const created = await QuizAttempt.create({
      user: userId,
      quiz: new mongoose.Types.ObjectId(),
      responses: [
        {
          questionId: new mongoose.Types.ObjectId(),
          selectedOption: 'A'
        }
      ],
      score: 1,
      percentage: 50
    });

    const stored = await QuizAttempt.findById(created.id).exec();

    expect(stored).not.toBeNull();
    expect(stored?.user.toString()).toBe(userId.toString());
    expect(stored?.score).toBe(1);
    expect(stored?.percentage).toBe(50);
  });

  it('reuses the model registered on the same connection', () => {
    expect(getQuizAttemptModel(connection)).toBe(QuizAttempt);
  });
});