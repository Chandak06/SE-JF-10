import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import type { Connection } from 'mongoose';
import request from 'supertest';

import { loadConfig } from '../../src/config.js';
import { connectDatabase } from '../../src/db.js';
import { createRuntime } from '../../src/runtime.js';
import { evaluateQuiz } from '../../src/attempts/evaluate.js';

describe('Question API integration (CSMQ-23 / IT-M2-01..02)', () => {
  let mongo: MongoMemoryServer;
  let connection: Connection;
  let runtime: Awaited<ReturnType<typeof createRuntime>>;

  const adminCredentials = {
    name: 'Admin Instructor',
    email: 'admin.instructor@example.com',
    password: 'SecureAdminPassword123!'
  };

  const studentCredentials = {
    name: 'Normal Student',
    email: 'normal.student@example.com',
    password: 'SecureStudentPassword123!'
  };

  const sampleQuestion = {
    questionText: 'What is the primary function of the transport layer in OSI model?',
    options: [
      { id: 'A', text: 'Bit transmission across physical medium' },
      { id: 'B', text: 'End-to-end communication and reliability' },
      { id: 'C', text: 'Routing packets across networks' },
      { id: 'D', text: 'Data format presentation' }
    ],
    correctAnswer: 'B',
    subject: 'Computer Networks',
    topic: 'OSI Model',
    difficulty: 'Medium',
    marks: 1
  };

  const bearer = (token: string) => ({
    Authorization: `Bearer ${token}`
  });

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create({
      instance: {
        dbName: 'csmq_questions_integration_test',
        launchTimeout: 60_000
      }
    });

    connection = await connectDatabase(mongo.getUri());
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
    await connection.collection('authsessions').deleteMany({});
  });

  afterAll(async () => {
    await connection?.close();
    await mongo?.stop();
  });

  async function registerAndLogin(creds: typeof adminCredentials, role: 'admin' | 'student') {
    await request(runtime.app)
      .post('/api/auth/register')
      .send(creds)
      .expect(201);

    if (role === 'admin') {
      await runtime.accounts.User.updateOne(
        { email: creds.email },
        { role: 'admin' }
      );
    }

    const res = await request(runtime.app)
      .post('/api/auth/login')
      .send({ email: creds.email, password: creds.password })
      .expect(200);

    return res.body.token as string;
  }

  it('IT-M2-01: admin can create a question and it persists to MongoDB with creator attached', async () => {
    const adminToken = await registerAndLogin(adminCredentials, 'admin');

    const res = await request(runtime.app)
      .post('/api/questions')
      .set(bearer(adminToken))
      .send(sampleQuestion)
      .expect(201);

    expect(res.body.question).toBeDefined();
    expect(res.body.question.id).toBeDefined();
    expect(res.body.question.questionText).toBe(sampleQuestion.questionText);
    expect(res.body.question.options).toHaveLength(4);
    expect(res.body.question.correctAnswer).toBe('B');
    expect(res.body.question.subject).toBe('Computer Networks');
    expect(res.body.question.topic).toBe('OSI Model');
    expect(res.body.question.difficulty).toBe('Medium');
    expect(res.body.question.marks).toBe(1);

    const adminAccount = await runtime.accounts.accounts.findByEmail(adminCredentials.email);
    expect(res.body.question.creator).toBe(adminAccount!.id);

    const saved = await runtime.questions.Question.findById(res.body.question.id).lean();
    expect(saved).not.toBeNull();
    expect(saved?.questionText).toBe(sampleQuestion.questionText);
    expect(saved?.correctAnswer).toBe('B');
  });

  it('IT-M2-02: student role is rejected from creating questions with 403 Forbidden', async () => {
    const studentToken = await registerAndLogin(studentCredentials, 'student');

    const res = await request(runtime.app)
      .post('/api/questions')
      .set(bearer(studentToken))
      .send(sampleQuestion)
      .expect(403);

    expect(res.body.error.code).toBe('FORBIDDEN');
    expect(await runtime.questions.Question.countDocuments()).toBe(0);
  });

  it('rejects unauthenticated requests to create questions with 401 Unauthenticated', async () => {
    const res = await request(runtime.app)
      .post('/api/questions')
      .send(sampleQuestion)
      .expect(401);

    expect(res.body.error.code).toBe('UNAUTHENTICATED');
    expect(await runtime.questions.Question.countDocuments()).toBe(0);
  });

  it('CSMQ-24: rejects invalid payload with 400 and clear error message', async () => {
    const adminToken = await registerAndLogin(adminCredentials, 'admin');

    const invalidAnswer = {
      ...sampleQuestion,
      correctAnswer: 'X'
    };

    const res = await request(runtime.app)
      .post('/api/questions')
      .set(bearer(adminToken))
      .send(invalidAnswer)
      .expect(400);

    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.message).toMatch(
      /correctAnswer must match one of the provided options/
    );
    expect(await runtime.questions.Question.countDocuments()).toBe(0);
  });

  it('IT-M2-03: admin can list questions and apply subject/topic/difficulty filters', async () => {
    const adminToken = await registerAndLogin(adminCredentials, 'admin');

    await request(runtime.app)
      .post('/api/questions')
      .set(bearer(adminToken))
      .send(sampleQuestion)
      .expect(201);

    await request(runtime.app)
      .post('/api/questions')
      .set(bearer(adminToken))
      .send({
        ...sampleQuestion,
        questionText: 'Which data structure follows LIFO?',
        subject: 'Data Structures',
        topic: 'Stacks',
        difficulty: 'Easy',
        correctAnswer: 'A',
        options: [
          { id: 'A', text: 'Stack' },
          { id: 'B', text: 'Queue' }
        ]
      })
      .expect(201);

    const allRes = await request(runtime.app)
      .get('/api/questions')
      .set(bearer(adminToken))
      .expect(200);
    expect(allRes.body.questions).toHaveLength(2);

    const subjectRes = await request(runtime.app)
      .get('/api/questions')
      .query({ subject: 'Data Structures' })
      .set(bearer(adminToken))
      .expect(200);
    expect(subjectRes.body.questions).toHaveLength(1);
    expect(subjectRes.body.questions[0].subject).toBe('Data Structures');

    const partialSubjectRes = await request(runtime.app)
      .get('/api/questions')
      .query({ subject: 'data struct' })
      .set(bearer(adminToken))
      .expect(200);
    expect(partialSubjectRes.body.questions).toHaveLength(1);
    expect(partialSubjectRes.body.questions[0].subject).toBe('Data Structures');

    const topicRes = await request(runtime.app)
      .get('/api/questions')
      .query({ topic: 'OSI Model' })
      .set(bearer(adminToken))
      .expect(200);
    expect(topicRes.body.questions).toHaveLength(1);
    expect(topicRes.body.questions[0].topic).toBe('OSI Model');

    const partialTopicRes = await request(runtime.app)
      .get('/api/questions')
      .query({ topic: 'osi' })
      .set(bearer(adminToken))
      .expect(200);
    expect(partialTopicRes.body.questions).toHaveLength(1);
    expect(partialTopicRes.body.questions[0].topic).toBe('OSI Model');

    const diffRes = await request(runtime.app)
      .get('/api/questions')
      .query({ difficulty: 'Easy' })
      .set(bearer(adminToken))
      .expect(200);
    expect(diffRes.body.questions).toHaveLength(1);
    expect(diffRes.body.questions[0].difficulty).toBe('Easy');

    // Combined filter: subject + topic + difficulty
    const combinedRes = await request(runtime.app)
      .get('/api/questions')
      .query({
        subject: 'computer',
        topic: 'osi',
        difficulty: 'Medium'
      })
      .set(bearer(adminToken))
      .expect(200);
    expect(combinedRes.body.questions).toHaveLength(1);
    expect(combinedRes.body.questions[0].questionText).toBe(sampleQuestion.questionText);

    // Non-matching filter returns empty list
    const emptyRes = await request(runtime.app)
      .get('/api/questions')
      .query({ subject: 'Nonexistent Subject' })
      .set(bearer(adminToken))
      .expect(200);
    expect(emptyRes.body.questions).toEqual([]);
  });

  it('IT-M2-04: student can access /api/quiz-questions and receives student-safe payload without correctAnswer', async () => {
    const adminToken = await registerAndLogin(adminCredentials, 'admin');
    const studentToken = await registerAndLogin(studentCredentials, 'student');

    await request(runtime.app)
      .post('/api/questions')
      .set(bearer(adminToken))
      .send(sampleQuestion)
      .expect(201);

    const res = await request(runtime.app)
      .get('/api/quiz-questions')
      .set(bearer(studentToken))
      .expect(200);

    expect(res.body.questions).toHaveLength(1);
    const q = res.body.questions[0];

    expect(q.id).toBeDefined();
    expect(q.questionText).toBe(sampleQuestion.questionText);
    expect(q.options).toHaveLength(4);
    expect(q.difficulty).toBe('Medium');
    expect(q.marks).toBe(1);

    expect(q.correctAnswer).toBeUndefined();
    expect('correctAnswer' in q).toBe(false);
    expect(JSON.stringify(res.body)).not.toMatch(/"correctAnswer"/);
  });

  it('IT-M2-05: student responses and stored question answers map to Member 3 evaluateQuiz contract for accurate scoring', async () => {
    const adminToken = await registerAndLogin(adminCredentials, 'admin');
    const studentToken = await registerAndLogin(studentCredentials, 'student');

    await request(runtime.app)
      .post('/api/questions')
      .set(bearer(adminToken))
      .send(sampleQuestion)
      .expect(201);

    const questionsRes = await request(runtime.app)
      .get('/api/quiz-questions')
      .set(bearer(studentToken))
      .expect(200);

    const studentSafeQuestions = questionsRes.body.questions;
    expect(studentSafeQuestions).toHaveLength(1);

    const receivedQ = studentSafeQuestions[0];
    const studentResponses = [
      {
        questionId: receivedQ.id,
        selectedOptionId: 'B'
      }
    ];

    const stored = await runtime.questions.Question.findById(receivedQ.id).lean();
    const evaluationQuestions = [
      {
        id: stored!._id.toString(),
        correctOptionId: stored!.correctAnswer
      }
    ];

    const evalResult = evaluateQuiz(evaluationQuestions, studentResponses);
    expect(evalResult).toEqual({
      score: 1,
      total: 1,
      percentage: 100,
      correct: 1,
      incorrect: 0,
      unanswered: 0
    });
  });

  it('supports quizId, title, and subject filters on /api/quiz-questions', async () => {
    const adminToken = await registerAndLogin(adminCredentials, 'admin');
    const studentToken = await registerAndLogin(studentCredentials, 'student');

    await request(runtime.app)
      .post('/api/questions')
      .set(bearer(adminToken))
      .send(sampleQuestion)
      .expect(201);

    const res = await request(runtime.app)
      .get('/api/quiz-questions')
      .query({
        quizId: 'custom-quiz-101',
        title: 'Networks Practice Test',
        subject: 'Computer Networks'
      })
      .set(bearer(studentToken))
      .expect(200);

    expect(res.body.quizId).toBe('custom-quiz-101');
    expect(res.body.title).toBe('Networks Practice Test');
    expect(res.body.questions).toHaveLength(1);
    expect(res.body.questions[0].correctAnswer).toBeUndefined();
  });
});
