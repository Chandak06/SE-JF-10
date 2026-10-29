
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it
} from 'vitest';

import { MongoMemoryServer } from 'mongodb-memory-server';
import { Types, type Connection } from 'mongoose';
import request from 'supertest';

import { loadConfig } from '../../src/config.js';
import { connectDatabase } from '../../src/db.js';
import { createRuntime } from '../../src/runtime.js';
import { getQuizAttemptModel } from '../../src/models/quiz-attempt.js';

describe('CSMQ-40: Production Quiz Attempt API', () => {
  let mongo: MongoMemoryServer;
  let connection: Connection;
  let runtime: Awaited<ReturnType<typeof createRuntime>>;
  let QuizAttempt: ReturnType<typeof getQuizAttemptModel>;

  let quizId: Types.ObjectId;
  let firstId: string;
  let secondId: string;

  const student = {
    name: 'Quiz API Student',
    email: 'csmq40.student@example.com',
    password: 'SecureQuizPassword123!'
  };

  const bearer = (token: string) => ({
    Authorization: `Bearer ${token}`
  });

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create({
      instance: {
        dbName: 'csmq40_production_api',
        launchTimeout: 60000
      }
    });

    connection = await connectDatabase(mongo.getUri());

    // IMPORTANT:
    // No mock attempts router is injected here.
    // This uses our actual production router.
    runtime = await createRuntime(
      connection,
      loadConfig({
        MONGODB_URI: mongo.getUri(),
        NODE_ENV: 'test',
        BCRYPT_ROUNDS: '10',
        MAX_UPLOAD_BYTES: '2048'
      }),
      {
        authLimit: 500
      }
    );

    QuizAttempt = getQuizAttemptModel(connection);
  }, 90000);

  beforeEach(async () => {
    await runtime.accounts.User.deleteMany({});
    await runtime.questions.Question.deleteMany({});
    await QuizAttempt.deleteMany({});
    await connection.collection('quizzes').deleteMany({});
    await connection.collection('authsessions').deleteMany({});

    const first = await runtime.questions.Question.create({
      questionText: 'Which protocol is connection-oriented?',
      options: [
        { id: 'A', text: 'UDP' },
        { id: 'B', text: 'TCP' }
      ],
      correctAnswer: 'B',
      subject: 'Computer Networks',
      topic: 'Transport Layer',
      difficulty: 'Easy',
      marks: 1
    });

    const second = await runtime.questions.Question.create({
      questionText: 'Which data structure uses FIFO?',
      options: [
        { id: 'A', text: 'Queue' },
        { id: 'B', text: 'Stack' }
      ],
      correctAnswer: 'A',
      subject: 'Data Structures',
      topic: 'Queues',
      difficulty: 'Easy',
      marks: 1
    });

    firstId = first._id.toString();
    secondId = second._id.toString();
    quizId = new Types.ObjectId();

    await connection.collection('quizzes').insertOne({
      _id: quizId,
      title: 'CSMQ-40 Production Test Quiz',
      subject: 'Computer Science',
      questions: [first._id, second._id],
      removedAt: null
    });
  });

  afterAll(async () => {
    await connection?.close();
    await mongo?.stop();
  });

  async function loginStudent() {
    await request(runtime.app)
      .post('/api/auth/register')
      .send(student)
      .expect(201);

    const response = await request(runtime.app)
      .post('/api/auth/login')
      .send({
        email: student.email,
        password: student.password
      })
      .expect(200);

    return response.body.token as string;
  }

  const submission = () => ({
    quizId: quizId.toString(),
    responses: [
      { questionId: firstId, selectedOptionId: 'B' },
      { questionId: secondId, selectedOptionId: 'B' }
    ]
  });

  it('submits, evaluates and persists an authenticated attempt', async () => {
    const token = await loginStudent();

    const response = await request(runtime.app)
      .post('/api/attempts')
      .set(bearer(token))
      .send(submission())
      .expect(201);

    expect(response.body).toMatchObject({
      quizId: quizId.toString(),
      score: 1,
      total: 2,
      percentage: 50,
      correct: 1,
      incorrect: 1,
      unanswered: 0
    });

    expect(response.body.attemptId).toBeDefined();

    const saved = await QuizAttempt.findById(
      response.body.attemptId
    ).lean();

    const account = await runtime.accounts.accounts.findByEmail(
      student.email
    );

    expect(saved).not.toBeNull();
    expect(saved?.user.toString()).toBe(account?.id);
    expect(saved?.quiz.toString()).toBe(quizId.toString());
    expect(saved?.score).toBe(1);
    expect(saved?.percentage).toBe(50);
    expect(saved?.responses).toHaveLength(2);
  });

  it('rejects unauthenticated submissions', async () => {
    const response = await request(runtime.app)
      .post('/api/attempts')
      .send(submission())
      .expect(401);

    expect(response.body.error.code).toBe('UNAUTHENTICATED');
    expect(await QuizAttempt.countDocuments()).toBe(0);
  });

  it('rejects non-student accounts', async () => {
    const token = await loginStudent();

    await runtime.accounts.User.updateOne(
      { email: student.email },
      { role: 'admin' }
    );

    const response = await request(runtime.app)
      .post('/api/attempts')
      .set(bearer(token))
      .send(submission())
      .expect(403);

    expect(response.body.error.code).toBe('FORBIDDEN');
    expect(await QuizAttempt.countDocuments()).toBe(0);
  });

  it('rejects invalid quiz IDs', async () => {
    const token = await loginStudent();

    const response = await request(runtime.app)
      .post('/api/attempts')
      .set(bearer(token))
      .send({
        quizId: 'invalid-id',
        responses: []
      })
      .expect(400);

    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(await QuizAttempt.countDocuments()).toBe(0);
  });

  it('rejects client-supplied scores and user IDs', async () => {
    const token = await loginStudent();

    const response = await request(runtime.app)
      .post('/api/attempts')
      .set(bearer(token))
      .send({
        ...submission(),
        score: 100,
        percentage: 100,
        userId: new Types.ObjectId().toString()
      })
      .expect(400);

    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(await QuizAttempt.countDocuments()).toBe(0);
  });

  it('rejects questions outside the selected quiz', async () => {
    const token = await loginStudent();

    const response = await request(runtime.app)
      .post('/api/attempts')
      .set(bearer(token))
      .send({
        quizId: quizId.toString(),
        responses: [{
          questionId: new Types.ObjectId().toString(),
          selectedOptionId: 'A'
        }]
      })
      .expect(400);

    expect(response.body.error.code).toBe('QUESTION_NOT_IN_QUIZ');
    expect(await QuizAttempt.countDocuments()).toBe(0);
  });

  it('rejects invalid answer options', async () => {
    const token = await loginStudent();

    const response = await request(runtime.app)
      .post('/api/attempts')
      .set(bearer(token))
      .send({
        quizId: quizId.toString(),
        responses: [{
          questionId: firstId,
          selectedOptionId: 'Z'
        }]
      })
      .expect(400);

    expect(response.body.error.code).toBe('INVALID_OPTION');
    expect(await QuizAttempt.countDocuments()).toBe(0);
  });

  it('rejects removed quizzes', async () => {
    const token = await loginStudent();

    await connection.collection('quizzes').updateOne(
      { _id: quizId },
      { $set: { removedAt: new Date() } }
    );

    const response = await request(runtime.app)
      .post('/api/attempts')
      .set(bearer(token))
      .send(submission())
      .expect(404);

    expect(response.body.error.code).toBe('QUIZ_NOT_FOUND');
    expect(await QuizAttempt.countDocuments()).toBe(0);
  });
});
