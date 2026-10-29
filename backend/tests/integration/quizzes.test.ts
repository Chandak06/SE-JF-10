import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Types, type Connection } from 'mongoose';
import request from 'supertest';

import { loadConfig } from '../../src/config.js';
import { connectDatabase } from '../../src/db.js';
import { createRuntime } from '../../src/runtime.js';
import type { QuestionDocument, QuestionFields } from '../../src/models/question.js';

describe('Quiz API integration (CSMQ-48 / SRS CSMQ-F-030)', () => {
  let mongo: MongoMemoryServer;
  let connection: Connection;
  let runtime: Awaited<ReturnType<typeof createRuntime>>;

  const studentCredentials = {
    name: 'Quiz Creator Student',
    email: 'quiz.creator@example.com',
    password: 'SecureStudentPassword123!'
  };

  const adminCredentials = {
    name: 'Question Admin',
    email: 'question.admin@example.com',
    password: 'SecureAdminPassword123!'
  };

  const sampleQuestion1: QuestionFields = {
    questionText: 'What protocol provides reliable, connection-oriented data transfer at Layer 4?',
    options: [
      { id: 'A', text: 'UDP' },
      { id: 'B', text: 'TCP' },
      { id: 'C', text: 'IP' },
      { id: 'D', text: 'ICMP' }
    ],
    correctAnswer: 'B',
    subject: 'Computer Networks',
    topic: 'Transport Layer',
    difficulty: 'Easy',
    marks: 1
  };

  const sampleQuestion2: QuestionFields = {
    questionText: 'Which normal form eliminates transitive functional dependencies on non-prime attributes?',
    options: [
      { id: 'A', text: '1NF' },
      { id: 'B', text: '2NF' },
      { id: 'C', text: '3NF' },
      { id: 'D', text: 'BCNF' }
    ],
    correctAnswer: 'C',
    subject: 'Database Systems',
    topic: 'Normalization',
    difficulty: 'Medium',
    marks: 2
  };

  const bearer = (token: string) => ({
    Authorization: `Bearer ${token}`
  });

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create({
      instance: {
        dbName: 'csmq_quizzes_integration_test',
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
    await runtime.quizzes.Quiz.deleteMany({});
    await connection.collection('authsessions').deleteMany({});
  });

  afterAll(async () => {
    await connection?.close();
    await mongo?.stop();
  });

  async function registerAndLogin(creds: typeof studentCredentials, role: 'admin' | 'student') {
    await request(runtime.app)
      .post('/api/auth/register')
      .send(creds)
      .expect(201);

    if (role === 'admin') {
      await runtime.accounts.User.updateOne(
        { email: creds.email },
        { $set: { role: 'admin' } }
      );
    }

    const loginRes = await request(runtime.app)
      .post('/api/auth/login')
      .send({ email: creds.email, password: creds.password })
      .expect(200);

    return {
      token: loginRes.body.token as string,
      user: loginRes.body.authenticatedUser
    };
  }

  async function seedQuestions(): Promise<[QuestionDocument, QuestionDocument]> {
    const q1 = await runtime.questions.Question.create(sampleQuestion1);
    const q2 = await runtime.questions.Question.create(sampleQuestion2);
    return [q1 as QuestionDocument, q2 as QuestionDocument];
  }

  it('IT-M2-QUIZ-01: authenticated student creates a valid quiz from existing Question Bank questions', async () => {
    const { token, user } = await registerAndLogin(studentCredentials, 'student');
    const [q1, q2] = await seedQuestions();

    const payload = {
      title: 'Transport Layer & DBMS Practice Quiz',
      subject: 'Computer Science',
      questionIds: [q1._id.toString(), q2._id.toString()]
    };

    const res = await request(runtime.app)
      .post('/api/quizzes')
      .set(bearer(token))
      .send(payload)
      .expect(201);

    expect(res.body.quiz).toBeDefined();
    expect(res.body.quiz.id).toBeDefined();
    expect(res.body.quiz.title).toBe(payload.title);
    expect(res.body.quiz.subject).toBe(payload.subject);
    expect(res.body.quiz.questionCount).toBe(2);
    expect(res.body.quiz.questions).toEqual(payload.questionIds);
    expect(res.body.quiz.creator).toBe(user.id);

    // Verify database persistence
    const saved = await runtime.quizzes.Quiz.findById(res.body.quiz.id);
    expect(saved).not.toBeNull();
    expect(saved?.title).toBe(payload.title);
    expect(saved?.questions.map((q) => q.toString())).toEqual(payload.questionIds);
    expect(saved?.creator.toString()).toBe(user.id);
    expect(saved?.removedAt).toBeNull();
  });

  it('IT-M2-QUIZ-02: rejects unauthenticated requests with 401 Unauthorized', async () => {
    const [q1] = await seedQuestions();

    await request(runtime.app)
      .post('/api/quizzes')
      .send({
        title: 'Unauthorized Quiz',
        subject: 'Computer Networks',
        questionIds: [q1._id.toString()]
      })
      .expect(401);

    await request(runtime.app)
      .get(`/api/quizzes/${q1._id}`)
      .expect(401);
  });

  it('IT-M2-QUIZ-03: rejects quiz creation with empty questions array', async () => {
    const { token } = await registerAndLogin(studentCredentials, 'student');

    const res = await request(runtime.app)
      .post('/api/quizzes')
      .set(bearer(token))
      .send({
        title: 'Empty Quiz',
        subject: 'Networking',
        questionIds: []
      })
      .expect(400);

    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.message).toContain('At least one question must be selected.');
  });

  it('IT-M2-QUIZ-04: rejects quiz creation with unknown question IDs not in Question Bank', async () => {
    const { token } = await registerAndLogin(studentCredentials, 'student');
    const [q1] = await seedQuestions();
    const nonExistentId = new Types.ObjectId().toString();

    const res = await request(runtime.app)
      .post('/api/quizzes')
      .set(bearer(token))
      .send({
        title: 'Quiz with Missing Question',
        subject: 'Networking',
        questionIds: [q1._id.toString(), nonExistentId]
      })
      .expect(400);

    expect(res.body.error.code).toBe('INVALID_QUESTION_SELECTION');
    expect(res.body.error.message).toContain('One or more selected questions do not exist in the Question Bank.');
  });

  it('IT-M2-QUIZ-05: rejects quiz creation with duplicate question IDs in the selection', async () => {
    const { token } = await registerAndLogin(studentCredentials, 'student');
    const [q1] = await seedQuestions();

    const res = await request(runtime.app)
      .post('/api/quizzes')
      .set(bearer(token))
      .send({
        title: 'Duplicate Question Quiz',
        subject: 'Networking',
        questionIds: [q1._id.toString(), q1._id.toString()]
      })
      .expect(400);

    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.message).toContain('Question IDs must be unique.');
  });

  it('IT-M2-QUIZ-06: rejects quiz creation with missing required fields (title, subject)', async () => {
    const { token } = await registerAndLogin(studentCredentials, 'student');
    const [q1] = await seedQuestions();

    const missingTitle = await request(runtime.app)
      .post('/api/quizzes')
      .set(bearer(token))
      .send({
        subject: 'Networking',
        questionIds: [q1._id.toString()]
      })
      .expect(400);

    expect(missingTitle.body.error.code).toBe('VALIDATION_ERROR');

    const missingSubject = await request(runtime.app)
      .post('/api/quizzes')
      .set(bearer(token))
      .send({
        title: 'Valid Title',
        questionIds: [q1._id.toString()]
      })
      .expect(400);

    expect(missingSubject.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('IT-M2-QUIZ-07: rejects unexpected extra fields ensuring students cannot add/edit questions', async () => {
    const { token } = await registerAndLogin(studentCredentials, 'student');
    const [q1] = await seedQuestions();

    const res = await request(runtime.app)
      .post('/api/quizzes')
      .set(bearer(token))
      .send({
        title: 'Injected Quiz',
        subject: 'Networking',
        questionIds: [q1._id.toString()],
        inlineQuestion: 'Unauthorized injected question',
        correctAnswer: 'A'
      })
      .expect(400);

    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('IT-M2-QUIZ-08: authenticated student retrieves quiz by ID and receives student-safe payload with zero answer leakage', async () => {
    const { token } = await registerAndLogin(studentCredentials, 'student');
    const [q1, q2] = await seedQuestions();

    const createRes = await request(runtime.app)
      .post('/api/quizzes')
      .set(bearer(token))
      .send({
        title: 'Secure Student Quiz',
        subject: 'Computer Networks',
        questionIds: [q1._id.toString(), q2._id.toString()]
      })
      .expect(201);

    const quizId = createRes.body.quiz.id;

    const getRes = await request(runtime.app)
      .get(`/api/quizzes/${quizId}`)
      .set(bearer(token))
      .expect(200);

    expect(getRes.body.quiz).toBeDefined();
    expect(getRes.body.quiz.id).toBe(quizId);
    expect(getRes.body.quiz.title).toBe('Secure Student Quiz');
    expect(getRes.body.quiz.questionCount).toBe(2);
    expect(getRes.body.quiz.questions).toHaveLength(2);

    // Verify top-level attempt integration contract fields (CSMQ-52)
    expect(getRes.body.quizId).toBe(quizId);
    expect(getRes.body.title).toBe('Secure Student Quiz');
    expect(getRes.body.questions).toHaveLength(2);

    // Verify student-safe projection
    const firstQ = getRes.body.quiz.questions[0];
    expect(firstQ.id).toBe(q1._id.toString());
    expect(firstQ.questionText).toBe(sampleQuestion1.questionText);
    expect(firstQ.options).toHaveLength(4);
    expect(firstQ.correctAnswer).toBeUndefined();

    // Critical assertion: zero answer leakage across entire JSON response
    const jsonString = JSON.stringify(getRes.body);
    expect(jsonString).not.toContain('correctAnswer');
    expect(jsonString).not.toContain('"correctAnswer"');
  });

  it('IT-M2-QUIZ-09: returns 404 for non-existent quiz and 400 for malformed quiz ID', async () => {
    const { token } = await registerAndLogin(studentCredentials, 'student');

    const notFoundRes = await request(runtime.app)
      .get(`/api/quizzes/${new Types.ObjectId()}`)
      .set(bearer(token))
      .expect(404);

    expect(notFoundRes.body.error.code).toBe('NOT_FOUND');

    const invalidIdRes = await request(runtime.app)
      .get('/api/quizzes/invalid-hex-id')
      .set(bearer(token))
      .expect(400);

    expect(invalidIdRes.body.error.code).toBe('INVALID_ID');
  });

  it('IT-M2-QUIZ-10: moderation interface lists active quizzes and soft-deletes a quiz', async () => {
    const { token } = await registerAndLogin(studentCredentials, 'student');
    const [q1] = await seedQuestions();

    const createRes = await request(runtime.app)
      .post('/api/quizzes')
      .set(bearer(token))
      .send({
        title: 'Moderated Quiz',
        subject: 'Networking',
        questionIds: [q1._id.toString()]
      })
      .expect(201);

    const quizId = createRes.body.quiz.id;

    // Test moderation list
    const items = await runtime.quizzes.moderation.list(10);
    expect(items.some((item) => item.id === quizId && item.title === 'Moderated Quiz')).toBe(true);

    // Test moderation remove
    const adminId = new Types.ObjectId().toString();
    const removed = await runtime.quizzes.moderation.remove(quizId, adminId);
    expect(removed).toBe(true);

    // Removed quiz is no longer retrievable
    await request(runtime.app)
      .get(`/api/quizzes/${quizId}`)
      .set(bearer(token))
      .expect(404);
  });

  it('IT-M2-QUIZ-11: GET /api/quizzes returns all active quizzes with metadata and question count', async () => {
    const { token } = await registerAndLogin(studentCredentials, 'student');
    const [q1, q2] = await seedQuestions();

    await request(runtime.app)
      .post('/api/quizzes')
      .set(bearer(token))
      .send({
        title: 'Computer Networks Midterm',
        subject: 'Computer Networks',
        questionIds: [q1._id.toString()]
      })
      .expect(201);

    await request(runtime.app)
      .post('/api/quizzes')
      .set(bearer(token))
      .send({
        title: 'Database Normalization Exam',
        subject: 'Database Systems',
        questionIds: [q1._id.toString(), q2._id.toString()]
      })
      .expect(201);

    const res = await request(runtime.app)
      .get('/api/quizzes')
      .set(bearer(token))
      .expect(200);

    expect(res.body.quizzes).toHaveLength(2);
    expect(res.body.quizzes[0].title).toBe('Database Normalization Exam');
    expect(res.body.quizzes[0].subject).toBe('Database Systems');
    expect(res.body.quizzes[0].questionCount).toBe(2);
    expect(res.body.quizzes[1].title).toBe('Computer Networks Midterm');
    expect(res.body.quizzes[1].questionCount).toBe(1);
  });

  it('IT-M2-QUIZ-12: GET /api/quizzes?search=... filters quizzes by title keyword case-insensitively', async () => {
    const { token } = await registerAndLogin(studentCredentials, 'student');
    const [q1] = await seedQuestions();

    await request(runtime.app)
      .post('/api/quizzes')
      .set(bearer(token))
      .send({
        title: 'Computer Networks Final Quiz',
        subject: 'Computer Networks',
        questionIds: [q1._id.toString()]
      })
      .expect(201);

    await request(runtime.app)
      .post('/api/quizzes')
      .set(bearer(token))
      .send({
        title: 'Operating Systems Quiz',
        subject: 'Operating Systems',
        questionIds: [q1._id.toString()]
      })
      .expect(201);

    const res = await request(runtime.app)
      .get('/api/quizzes?search=networks')
      .set(bearer(token))
      .expect(200);

    expect(res.body.quizzes).toHaveLength(1);
    expect(res.body.quizzes[0].title).toBe('Computer Networks Final Quiz');
  });

  it('IT-M2-QUIZ-13: GET /api/quizzes?subject=... filters quizzes by subject case-insensitively', async () => {
    const { token } = await registerAndLogin(studentCredentials, 'student');
    const [q1] = await seedQuestions();

    await request(runtime.app)
      .post('/api/quizzes')
      .set(bearer(token))
      .send({
        title: 'Quiz 1',
        subject: 'Computer Networks',
        questionIds: [q1._id.toString()]
      })
      .expect(201);

    await request(runtime.app)
      .post('/api/quizzes')
      .set(bearer(token))
      .send({
        title: 'Quiz 2',
        subject: 'Mathematics',
        questionIds: [q1._id.toString()]
      })
      .expect(201);

    const res = await request(runtime.app)
      .get('/api/quizzes?subject=computer networks')
      .set(bearer(token))
      .expect(200);

    expect(res.body.quizzes).toHaveLength(1);
    expect(res.body.quizzes[0].title).toBe('Quiz 1');
  });

  it('IT-M2-QUIZ-14: GET /api/quizzes?search=...&subject=... applies combined filters', async () => {
    const { token } = await registerAndLogin(studentCredentials, 'student');
    const [q1] = await seedQuestions();

    await request(runtime.app)
      .post('/api/quizzes')
      .set(bearer(token))
      .send({
        title: 'Midterm Prep',
        subject: 'Computer Networks',
        questionIds: [q1._id.toString()]
      })
      .expect(201);

    await request(runtime.app)
      .post('/api/quizzes')
      .set(bearer(token))
      .send({
        title: 'Midterm Prep',
        subject: 'Database Systems',
        questionIds: [q1._id.toString()]
      })
      .expect(201);

    const res = await request(runtime.app)
      .get('/api/quizzes?search=midterm&subject=database')
      .set(bearer(token))
      .expect(200);

    expect(res.body.quizzes).toHaveLength(1);
    expect(res.body.quizzes[0].subject).toBe('Database Systems');
  });

  it('IT-M2-QUIZ-15: GET /api/quizzes returns empty list when nothing matches search or subject', async () => {
    const { token } = await registerAndLogin(studentCredentials, 'student');
    const [q1] = await seedQuestions();

    await request(runtime.app)
      .post('/api/quizzes')
      .set(bearer(token))
      .send({
        title: 'Calculus Quiz',
        subject: 'Mathematics',
        questionIds: [q1._id.toString()]
      })
      .expect(201);

    const res = await request(runtime.app)
      .get('/api/quizzes?search=quantum')
      .set(bearer(token))
      .expect(200);

    expect(res.body.quizzes).toEqual([]);

    const resSubject = await request(runtime.app)
      .get('/api/quizzes?subject=Physics')
      .set(bearer(token))
      .expect(200);

    expect(resSubject.body.quizzes).toEqual([]);
  });

  it('IT-M2-QUIZ-16: GET /api/quizzes excludes soft-deleted/moderated quizzes', async () => {
    const { token } = await registerAndLogin(studentCredentials, 'student');
    const [q1] = await seedQuestions();

    const createRes = await request(runtime.app)
      .post('/api/quizzes')
      .set(bearer(token))
      .send({
        title: 'Flagged Quiz',
        subject: 'Biology',
        questionIds: [q1._id.toString()]
      })
      .expect(201);

    const quizId = createRes.body.quiz.id;
    await runtime.quizzes.moderation.remove(quizId, new Types.ObjectId().toString());

    const res = await request(runtime.app)
      .get('/api/quizzes?subject=Biology')
      .set(bearer(token))
      .expect(200);

    expect(res.body.quizzes).toHaveLength(0);
  });

  it('IT-M2-QUIZ-17: GET /api/quizzes never leaks question options, questions array, or correctAnswer', async () => {
    const { token } = await registerAndLogin(studentCredentials, 'student');
    const [q1] = await seedQuestions();

    await request(runtime.app)
      .post('/api/quizzes')
      .set(bearer(token))
      .send({
        title: 'Safety Check Quiz',
        subject: 'Computer Networks',
        questionIds: [q1._id.toString()]
      })
      .expect(201);

    const res = await request(runtime.app)
      .get('/api/quizzes')
      .set(bearer(token))
      .expect(200);

    expect(res.body.quizzes).toHaveLength(1);
    const item = res.body.quizzes[0];
    expect(item.questions).toBeUndefined();
    expect(item.correctAnswer).toBeUndefined();

    const json = JSON.stringify(res.body);
    expect(json).not.toContain('correctAnswer');
    expect(json).not.toContain('options');
  });
});
