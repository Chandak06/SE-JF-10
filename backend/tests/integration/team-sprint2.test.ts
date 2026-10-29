import { afterAll, beforeAll, beforeEach, expect, it } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { connectDatabase } from '../../src/db.js';
import { loadConfig } from '../../src/config.js';
import { createRuntime } from '../../src/runtime.js';
import { provisionAdmin } from '../../src/security/provision-admin.js';
import { getQuizAttemptModel } from '../../src/models/quiz-attempt.js';

let mongo: MongoMemoryServer;
let db: Awaited<ReturnType<typeof connectDatabase>>;
let runtime: Awaited<ReturnType<typeof createRuntime>>;
let admin: string; let student: string; let quizId: string; let questionId: string;
const password = 'Disposable integration password!';
const headers = (token: string) => ({ Authorization: 'Bearer ' + token });
const question = { questionText: 'Which transport is reliable?', options: [{ id: 'A', text: 'TCP' }, { id: 'B', text: 'UDP' }], correctAnswer: 'A', subject: 'Networks', topic: 'Transport', difficulty: 'Easy', marks: 1 };
beforeAll(async () => {
  mongo = await MongoMemoryServer.create({ instance: { launchTimeout: 60_000 } });
  db = await connectDatabase(mongo.getUri('team_sprint2'));
  runtime = await createRuntime(db, loadConfig({ NODE_ENV: 'test', MONGODB_URI: mongo.getUri('team_sprint2'), BCRYPT_ROUNDS: '10' }), { authLimit: 1000 });
});
beforeEach(async () => {
  for (const name of ['users', 'authsessions', 'questions', 'quizzes', 'quizattempts']) await db.collection(name).deleteMany({});
  await provisionAdmin(db, { name: 'Integration Admin', email: 'integration-admin@example.test', password }, 10);
  await request(runtime.app).post('/api/auth/register').send({ name: 'Integration Student', email: 'integration-student@example.test', password }).expect(201);
  admin = (await request(runtime.app).post('/api/auth/login').send({ email: 'integration-admin@example.test', password })).body.token;
  student = (await request(runtime.app).post('/api/auth/login').send({ email: 'integration-student@example.test', password })).body.token;
  questionId = (await request(runtime.app).post('/api/questions').set(headers(admin)).send(question).expect(201)).body.question.id;
  quizId = (await request(runtime.app).post('/api/quizzes').set(headers(student)).send({ title: 'Team integration quiz', subject: 'Networks', questionIds: [questionId] }).expect(201)).body.quiz.id;
});
afterAll(async () => { await db?.close(); await mongo?.stop(); });
const submission = () => ({ quizId, responses: [{ questionId, selectedOptionId: 'A' }] });
it('connects real Question creation, Quiz discovery, trusted submission and persisted attempt without answer leakage', async () => {
  const retrieved = await request(runtime.app).get('/api/quizzes/' + quizId).set(headers(student)).expect(200);
  expect(retrieved.body.questions.map((q: { id: string }) => q.id)).toEqual([questionId]);
  expect(JSON.stringify(retrieved.body)).not.toMatch(/correctAnswer|passwordHash|tokenHash/);
  const result = await request(runtime.app).post('/api/attempts').set(headers(student)).send(submission()).expect(201);
  expect(result.body).toMatchObject({ quizId, score: 1, total: 1, percentage: 100 });
  expect(JSON.stringify(result.body)).not.toContain('correctAnswer');
  const stored = await getQuizAttemptModel(db).findById(result.body.attemptId);
  expect(stored?.score).toBe(1); expect(stored?.responses[0]?.questionId.toString()).toBe(questionId);
});
it('enforces actual Quiz moderation, excludes discovery/submission and preserves existing attempt history', async () => {
  const result = await request(runtime.app).post('/api/attempts').set(headers(student)).send(submission()).expect(201);
  const path = '/api/admin/quizzes/' + quizId;
  await request(runtime.app).delete(path).send({ confirmed: true }).expect(401);
  await request(runtime.app).delete(path).set(headers(student)).send({ confirmed: true }).expect(403);
  await request(runtime.app).delete(path).set(headers(admin)).send({ confirmed: false }).expect(400);
  await request(runtime.app).delete(path).set(headers(admin)).send({ confirmed: true }).expect(204);
  expect((await request(runtime.app).get('/api/quizzes').set(headers(student))).body.quizzes).toEqual([]);
  await request(runtime.app).get('/api/quizzes/' + quizId).set(headers(student)).expect(404);
  await request(runtime.app).post('/api/attempts').set(headers(student)).send(submission()).expect(404);
  expect(await getQuizAttemptModel(db).findById(result.body.attemptId)).not.toBeNull();
  expect((await runtime.quizzes.Quiz.findById(quizId).select('+removedBy'))?.removedBy?.toString()).toBe((await runtime.accounts.User.findOne({ email: 'integration-admin@example.test' }))!.id);
});
it('makes moderated Questions unavailable through real Quiz reads and trusted scoring', async () => {
  await request(runtime.app).delete('/api/admin/questions/' + questionId).set(headers(admin)).send({ confirmed: true }).expect(204);
  const view = await request(runtime.app).get('/api/quizzes/' + quizId).set(headers(student)).expect(409);
  expect(view.body.error.code).toBe('QUIZ_QUESTION_MISSING');
  expect(JSON.stringify(view.body)).not.toContain(question.questionText);
  await request(runtime.app).post('/api/attempts').set(headers(student)).send(submission()).expect(409);
  expect(await getQuizAttemptModel(db).countDocuments()).toBe(0);
});
it('rejects malformed Quiz filters, forged scores and Admin submissions', async () => {
  for (const query of ['subject[$ne]=x', 'search=x&search=y', 'extra=x', 'search=' + 'x'.repeat(101)]) {
    await request(runtime.app).get('/api/quizzes?' + query).set(headers(student)).expect(400);
  }
  await request(runtime.app).post('/api/attempts').set(headers(student)).send({ ...submission(), score: 500 }).expect(400);
  await request(runtime.app).post('/api/attempts').set(headers(admin)).send(submission()).expect(403);
});
it.each([10, 50])('serves real Quiz retrieval and trusted submissions for %i concurrent Student sessions', async count => {
  const sessions = await Promise.all(Array.from({ length: count }, async (_, index) => {
    const email = `load-${count}-${index}@example.test`;
    await runtime.auth.register({ name: 'Load Student', email, password });
    return runtime.auth.login(email, password);
  }));
  const times = await Promise.all(sessions.map(async session => {
    const started = performance.now();
    await request(runtime.app).get('/api/quizzes/' + quizId).set(headers(session.token)).expect(200);
    await request(runtime.app).post('/api/attempts').set(headers(session.token)).send(submission()).expect(201);
    return performance.now() - started;
  }));
  expect(await getQuizAttemptModel(db).countDocuments()).toBe(count);
  times.sort((a, b) => a - b);
  console.info(`Real Quiz load: ${count} sessions, ${count * 2} requests, p90 ${Math.round(times[Math.ceil(count * 0.9) - 1]!)}ms (paired retrieval + submission).`);
}, 120_000);
