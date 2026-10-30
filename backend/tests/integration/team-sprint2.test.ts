import { afterAll, beforeAll, beforeEach, expect, it } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { connectDatabase } from '../../src/db.js';
import { loadConfig } from '../../src/config.js';
import { createRuntime } from '../../src/runtime.js';
import { provisionAdmin } from '../../src/security/provision-admin.js';
import { getQuizAttemptModel } from '../../src/models/quiz-attempt.js';
import { randomUUID } from 'node:crypto';
import { PDFDocument } from 'pdf-lib';

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
  expect(result.body.resultId).toBe(result.body.attemptId);
  expect(result.body.correctAnswers).toEqual([{ questionId, correctOptionId: 'A' }]);
  expect(JSON.stringify(result.body)).not.toMatch(/passwordHash|tokenHash|submissionDigest/);
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
it('deduplicates racing retries of one submission, rejects changed answers and permits a fresh repeat attempt', async () => {
  const key = randomUUID();
  const responses = await Promise.all([1, 2, 3].map(() => request(runtime.app).post('/api/attempts').set(headers(student)).set('Idempotency-Key', key).send(submission()).expect(201)));
  expect(new Set(responses.map(r => r.body.attemptId)).size).toBe(1);
  expect(await getQuizAttemptModel(db).countDocuments()).toBe(1);
  await request(runtime.app).post('/api/attempts').set(headers(student)).set('Idempotency-Key', key).send({ quizId, responses: [{ questionId, selectedOptionId: 'B' }] }).expect(409);
  await request(runtime.app).post('/api/attempts').set(headers(student)).set('Idempotency-Key', randomUUID()).send(submission()).expect(201);
  expect(await getQuizAttemptModel(db).countDocuments()).toBe(2);
  await request(runtime.app).post('/api/attempts').set(headers(student)).set('Idempotency-Key', 'bad-key').send(submission()).expect(400);
});
it('retains history and retry identity after reconnect and after moderation without exposing post-submission keys through history', async () => {
  const key = randomUUID();
  const saved = await request(runtime.app).post('/api/attempts').set(headers(student)).set('Idempotency-Key', key).send(submission()).expect(201);
  const nextDb = await connectDatabase(mongo.getUri('team_sprint2'));
  try {
    const next = await createRuntime(nextDb, loadConfig({ NODE_ENV: 'test', MONGODB_URI: mongo.getUri('team_sprint2'), BCRYPT_ROUNDS: '10' }));
    const retry = await request(next.app).post('/api/attempts').set(headers(student)).set('Idempotency-Key', key).send(submission()).expect(201);
    expect(retry.body.attemptId).toBe(saved.body.attemptId);
    await request(next.app).delete('/api/admin/quizzes/' + quizId).set(headers(admin)).send({ confirmed: true }).expect(204);
    const history = await request(next.app).get('/api/attempts/history').set(headers(student)).expect(200);
    expect(history.body.total).toBe(1); expect(history.body.attempts[0]).toMatchObject({ attemptId: saved.body.attemptId, percentage: 100, subject: 'Networks' });
    expect(JSON.stringify(history.body)).not.toMatch(/correctAnswer|submissionKey|submissionDigest/);
    await request(next.app).get('/api/attempts/history').set(headers(admin)).expect(403);
    await request(next.app).get('/api/attempts/history?userId=someone-else').set(headers(student)).expect(400);
  } finally { await nextDb.close(); }
});
it('supports the submitted SAD download path with the same authenticated PDF bytes and removal denial', async () => {
  const document = await PDFDocument.create(); document.addPage(); const bytes = Buffer.from(await document.save());
  const uploaded = await request(runtime.app).post('/api/materials').set(headers(student)).field('title', 'SAD notes').field('subject', 'SE').field('description', 'Contract verification').attach('file', bytes, { filename: 'notes.pdf', contentType: 'application/pdf' }).expect(201);
  const path = '/api/materials/' + uploaded.body.material.id;
  await request(runtime.app).get(path + '/download').expect(401);
  const downloaded = await request(runtime.app).get(path + '/download').set(headers(student)).expect(200);
  expect(downloaded.body).toEqual(bytes); expect(downloaded.headers['content-disposition']).toContain('attachment');
  await request(runtime.app).delete('/api/admin/materials/' + uploaded.body.material.id).set(headers(admin)).send({ confirmed: true }).expect(204);
  await request(runtime.app).get(path + '/download').set(headers(student)).expect(404);
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
