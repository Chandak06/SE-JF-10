import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Types, type Connection } from 'mongoose';
import request from 'supertest';

import { loadConfig } from '../../src/config.js';
import { connectDatabase } from '../../src/db.js';
import { createRuntime } from '../../src/runtime.js';
import { evaluateQuiz } from '../../src/attempts/evaluate.js';
import { getQuizAttemptModel } from '../../src/models/quiz-attempt.js';
import { deleteQuizById, findQuizById, softDeleteQuizById } from '../../src/models/quiz.js';
import type { QuestionFields } from '../../src/models/question.js';

describe('Quiz Cross-Module Contract & Comprehensive Integration (CSMQ-53)', () => {
  let mongo: MongoMemoryServer;
  let connection: Connection;
  let runtime: Awaited<ReturnType<typeof createRuntime>>;
  let QuizAttempt: ReturnType<typeof getQuizAttemptModel>;

  const studentCredentials = {
    name: 'Prajwal Student',
    email: 'prajwal.student@example.com',
    password: 'SecurePassword123!'
  };

  const sampleQuestions: QuestionFields[] = [
    {
      questionText: 'Which protocol operates at the Transport Layer?',
      options: [
        { id: 'A', text: 'UDP' },
        { id: 'B', text: 'TCP' },
        { id: 'C', text: 'IP' },
        { id: 'D', text: 'ARP' }
      ],
      correctAnswer: 'B',
      subject: 'Computer Networks',
      topic: 'Transport Layer',
      difficulty: 'Easy',
      marks: 1
    },
    {
      questionText: 'What is the default port for HTTPS?',
      options: [
        { id: 'A', text: '80' },
        { id: 'B', text: '443' },
        { id: 'C', text: '22' },
        { id: 'D', text: '8080' }
      ],
      correctAnswer: 'B',
      subject: 'Computer Networks',
      topic: 'Security',
      difficulty: 'Medium',
      marks: 2
    },
    {
      questionText: 'Which layer handles logical addressing?',
      options: [
        { id: 'A', text: 'Data Link Layer' },
        { id: 'B', text: 'Network Layer' },
        { id: 'C', text: 'Session Layer' },
        { id: 'D', text: 'Physical Layer' }
      ],
      correctAnswer: 'B',
      subject: 'Computer Networks',
      topic: 'OSI Model',
      difficulty: 'Easy',
      marks: 1
    }
  ];

  const bearer = (token: string) => ({
    Authorization: `Bearer ${token}`
  });

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create({
      instance: {
        dbName: 'csmq_cross_module_contract_test',
        launchTimeout: 60_000
      }
    });

    connection = await connectDatabase(mongo.getUri());
    QuizAttempt = getQuizAttemptModel(connection);
    runtime = await createRuntime(
      connection,
      loadConfig({
        MONGODB_URI: mongo.getUri(),
        NODE_ENV: 'test',
        BCRYPT_ROUNDS: '10',
        MAX_UPLOAD_BYTES: '2048'
      }),
      { authLimit: 500 }
    );
  }, 90_000);

  beforeEach(async () => {
    await runtime.accounts.User.deleteMany({});
    await runtime.questions.Question.deleteMany({});
    await runtime.quizzes.Quiz.deleteMany({});
    await QuizAttempt.deleteMany({});
    await connection.collection('authsessions').deleteMany({});
  });

  afterAll(async () => {
    await connection?.close();
    await mongo?.stop();
  });

  async function registerAndLogin(creds = studentCredentials) {
    await request(runtime.app)
      .post('/api/auth/register')
      .send(creds)
      .expect(201);

    const loginRes = await request(runtime.app)
      .post('/api/auth/login')
      .send({ email: creds.email, password: creds.password })
      .expect(200);

    return {
      token: loginRes.body.token as string,
      user: loginRes.body.authenticatedUser as { id: string; email: string; role: string }
    };
  }

  it('verifies end-to-end quiz creation, persistence, model-level lookup, and safe retrieval', async () => {
    const { token, user } = await registerAndLogin();
    const createdQuestions = await runtime.questions.Question.insertMany(sampleQuestions);
    const questionIds = createdQuestions.map((q) => q._id.toString());

    // 1. Create Quiz via API
    const createRes = await request(runtime.app)
      .post('/api/quizzes')
      .set(bearer(token))
      .send({
        title: 'Full Stack Networks Quiz',
        subject: 'Computer Networks',
        questionIds
      })
      .expect(201);

    const quizId = createRes.body.quiz.id;
    expect(quizId).toBeDefined();

    // 2. Model-level persistence and lookup check
    const fetchedModel = await findQuizById(runtime.quizzes.Quiz, quizId);
    expect(fetchedModel).not.toBeNull();
    expect(fetchedModel?.title).toBe('Full Stack Networks Quiz');
    expect(fetchedModel?.creator.toString()).toBe(user.id);
    expect(fetchedModel?.questions).toHaveLength(3);

    // 3. Safe retrieval check
    const getRes = await request(runtime.app)
      .get(`/api/quizzes/${quizId}`)
      .set(bearer(token))
      .expect(200);

    expect(getRes.body.quizId).toBe(quizId);
    expect(getRes.body.questions).toHaveLength(3);

    // Invariant: no answer keys or correct answers exposed
    const bodyStr = JSON.stringify(getRes.body);
    expect(bodyStr).not.toContain('correctAnswer');
  });

  it('verifies cross-module contract with Karan\'s evaluateQuiz and QuizAttempt model without remapping', async () => {
    const { token, user } = await registerAndLogin();
    const createdQuestions = await runtime.questions.Question.insertMany(sampleQuestions);
    const questionIds = createdQuestions.map((q) => q._id.toString());

    // 1. Create quiz
    const createRes = await request(runtime.app)
      .post('/api/quizzes')
      .set(bearer(token))
      .send({
        title: 'Midterm Practice',
        subject: 'Computer Networks',
        questionIds
      })
      .expect(201);

    const quizId = createRes.body.quiz.id;

    // 2. Student fetches safe quiz for attempt flow
    const getRes = await request(runtime.app)
      .get(`/api/quizzes/${quizId}`)
      .set(bearer(token))
      .expect(200);

    const studentSafeQuestions = getRes.body.questions as Array<{
      id: string;
      questionText: string;
      options: Array<{ id: string; text: string }>;
    }>;

    // 3. Student submits responses using stable option IDs ('B', 'B', 'A' - 2 correct, 1 incorrect)
    const submittedResponses = [
      { questionId: studentSafeQuestions[0]!.id, selectedOptionId: 'B' }, // Correct ('B')
      { questionId: studentSafeQuestions[1]!.id, selectedOptionId: 'B' }, // Correct ('B')
      { questionId: studentSafeQuestions[2]!.id, selectedOptionId: 'A' }  // Incorrect (Correct is 'B')
    ];

    // 4. Backend evaluation pairing question documents with submitted responses
    const trustedEvaluationQuestions = createdQuestions.map((q) => ({
      id: q._id.toString(),
      correctOptionId: q.correctAnswer
    }));

    // Karan's evaluator runs directly on the contract questions and responses
    const evaluation = evaluateQuiz(trustedEvaluationQuestions, submittedResponses);

    expect(evaluation.total).toBe(3);
    expect(evaluation.correct).toBe(2);
    expect(evaluation.incorrect).toBe(1);
    expect(evaluation.unanswered).toBe(0);
    expect(evaluation.score).toBe(2);
    expect(evaluation.percentage).toBe(66.67);

    // 5. Karan's QuizAttempt model persists attempt successfully
    const attempt = await QuizAttempt.create({
      user: new Types.ObjectId(user.id),
      quiz: new Types.ObjectId(quizId),
      responses: submittedResponses.map((r) => ({
        questionId: new Types.ObjectId(r.questionId),
        selectedOption: r.selectedOptionId
      })),
      score: evaluation.score,
      percentage: evaluation.percentage
    });

    expect(attempt._id).toBeDefined();
    expect(attempt.score).toBe(2);
    expect(attempt.percentage).toBe(66.67);
  });

  it('verifies moderation removal compatibility (softDeleteQuizById and deleteQuizById)', async () => {
    const { token } = await registerAndLogin();
    const createdQuestions = await runtime.questions.Question.insertMany(sampleQuestions);

    const createRes = await request(runtime.app)
      .post('/api/quizzes')
      .set(bearer(token))
      .send({
        title: 'Removal Compatibility Test Quiz',
        subject: 'Computer Networks',
        questionIds: [createdQuestions[0]!._id.toString()]
      })
      .expect(201);

    const quizId = createRes.body.quiz.id;
    const adminId = new Types.ObjectId().toString();

    // 1. Soft-delete via model-level method
    const softDeleted = await softDeleteQuizById(runtime.quizzes.Quiz, quizId, adminId);
    expect(softDeleted).toBe(true);

    // Check that it is removed from active search
    const searchRes = await request(runtime.app)
      .get('/api/quizzes?search=Removal')
      .set(bearer(token))
      .expect(200);
    expect(searchRes.body.quizzes).toHaveLength(0);

    // Check that GET by ID returns 404
    await request(runtime.app)
      .get(`/api/quizzes/${quizId}`)
      .set(bearer(token))
      .expect(404);

    // 2. Hard-delete via model-level method
    const hardDeleted = await deleteQuizById(runtime.quizzes.Quiz, quizId);
    expect(hardDeleted).not.toBeNull();

    const findResult = await findQuizById(runtime.quizzes.Quiz, quizId);
    expect(findResult).toBeNull();
  });
});
