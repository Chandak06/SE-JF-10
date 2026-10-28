import { afterAll, beforeAll, beforeEach, expect, it } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Types } from 'mongoose';
import request from 'supertest';
import { connectDatabase } from '../../src/db.js';
import { loadConfig } from '../../src/config.js';
import { createRuntime } from '../../src/runtime.js';
import { provisionAdmin } from '../../src/security/provision-admin.js';
import { getQuizAttemptModel } from '../../src/models/quiz-attempt.js';
let mongo: MongoMemoryServer;
let db: Awaited<ReturnType<typeof connectDatabase>>;
let runtime: Awaited<ReturnType<typeof createRuntime>>;
let admin: string; let student: string;
const password = 'Disposable moderation password!';
const bearer = (token: string) => ({ Authorization: 'Bearer ' + token });
const question = { questionText: 'Which transport is reliable?', options: [{ id: 'A', text: 'UDP' }, { id: 'B', text: 'TCP' }], correctAnswer: 'B', subject: 'Networks', topic: 'Transport', difficulty: 'Easy', marks: 1 };
beforeAll(async () => {
  mongo = await MongoMemoryServer.create({ instance: { launchTimeout: 60_000 } }); db = await connectDatabase(mongo.getUri('real_question_moderation'));
  runtime = await createRuntime(db, loadConfig({ NODE_ENV: 'test', MONGODB_URI: mongo.getUri('real_question_moderation'), BCRYPT_ROUNDS: '10' }), { authLimit: 1000 });
});
beforeEach(async () => {
  await runtime.accounts.User.deleteMany({}); await runtime.questions.Question.deleteMany({});
  await db.collection('authsessions').deleteMany({}); await db.collection('quizattempts').deleteMany({});
  await provisionAdmin(db, { name: 'Admin', email: 'admin@example.test', password }, 10);
  await request(runtime.app).post('/api/auth/register').send({ name: 'Student', email: 'student@example.test', password }).expect(201);
  admin = (await request(runtime.app).post('/api/auth/login').send({ email: 'admin@example.test', password })).body.token;
  student = (await request(runtime.app).post('/api/auth/login').send({ email: 'student@example.test', password })).body.token;
});
afterAll(async () => { await db?.close(); await mongo?.stop(); });
async function create() { return (await request(runtime.app).post('/api/questions').set(bearer(admin)).send(question).expect(201)).body.question.id as string; }
it('moderates the actual Question model, excludes both read APIs and preserves persisted attempt references', async () => {
  const id = await create();
  const user = await runtime.accounts.User.findOne({ email: 'student@example.test' });
  const Attempt = getQuizAttemptModel(db);
  const attempt = await Attempt.create({ user: user!._id, quiz: new Types.ObjectId(), responses: [{ questionId: id, selectedOption: 'B' }], score: 1, percentage: 100 });
  const list = await request(runtime.app).get('/api/admin/questions').set(bearer(admin)).expect(200);
  expect(list.body.items).toEqual([{ id, title: question.questionText }]); expect(JSON.stringify(list.body)).not.toContain('correctAnswer');
  await request(runtime.app).delete('/api/admin/questions/' + id).set(bearer(admin)).send({ confirmed: true }).expect(204);
  expect((await request(runtime.app).get('/api/questions').set(bearer(admin))).body.questions).toEqual([]);
  expect((await request(runtime.app).get('/api/quiz-questions').set(bearer(student))).body.questions).toEqual([]);
  const retained = await runtime.questions.Question.findById(id).select('+removedBy');
  expect(retained!.removedAt).toBeInstanceOf(Date); expect(retained!.removedBy).toBeDefined();
  expect((await Attempt.findById(attempt.id))!.responses[0]!.questionId.toString()).toBe(id);
});
it('requires current admin role, confirmation and valid identifiers; removal is atomic', async () => {
  const id = await create(); const path = '/api/admin/questions/' + id;
  await request(runtime.app).delete(path).send({ confirmed: true }).expect(401);
  await request(runtime.app).delete(path).set(bearer(student)).send({ confirmed: true }).expect(403);
  await request(runtime.app).delete(path).set(bearer(admin)).send({ confirmed: false }).expect(400);
  await request(runtime.app).delete('/api/admin/questions/bad').set(bearer(admin)).send({ confirmed: true }).expect(400);
  const removals = await Promise.all([1, 2].map(() => request(runtime.app).delete(path).set(bearer(admin)).send({ confirmed: true })));
  expect(removals.map(x => x.status).sort()).toEqual([204, 404]);
  await runtime.accounts.User.updateOne({ email: 'admin@example.test' }, { role: 'student' });
  await request(runtime.app).get('/api/admin/resources').set(bearer(admin)).expect(403);
});
it('reports unavailable owner modules honestly and rejects malicious query/body fields', async () => {
  const resources = await request(runtime.app).get('/api/admin/resources').set(bearer(admin)).expect(200);
  expect(resources.body.resources).toEqual(['materials', 'questions']);
  await request(runtime.app).get('/api/admin/quizzes').set(bearer(admin)).expect(503);
  await request(runtime.app).delete('/api/admin/quizzes/' + new Types.ObjectId()).set(bearer(student)).send({ confirmed: true }).expect(403);
  for (const query of ['subject[$ne]=x', 'difficulty=Unknown', 'extra=x']) {
    await request(runtime.app).get('/api/questions?' + query).set(bearer(admin)).expect(400);
    await request(runtime.app).get('/api/quiz-questions?' + query).set(bearer(student)).expect(400);
  }
  await request(runtime.app).post('/api/questions').set(bearer(admin)).send({ ...question, removedAt: null }).expect(400);
  const id = await create();
  const payload = await request(runtime.app).get('/api/quiz-questions').set(bearer(student)).expect(200);
  expect(payload.body.questions[0].id).toBe(id); expect(JSON.stringify(payload.body)).not.toContain('correctAnswer');
});
it('persists question moderation and sessions after runtime recreation and database reconnect', async () => {
  const id = await create();
  await request(runtime.app).delete('/api/admin/questions/' + id).set(bearer(admin)).send({ confirmed: true }).expect(204);
  const connection = await connectDatabase(mongo.getUri('real_question_moderation'));
  try {
    const next = await createRuntime(connection, loadConfig({ NODE_ENV: 'test', MONGODB_URI: mongo.getUri('real_question_moderation'), BCRYPT_ROUNDS: '10' }));
    expect((await request(next.app).get('/api/quiz-questions').set(bearer(student)).expect(200)).body.questions).toEqual([]);
    expect((await next.questions.Question.findById(id))!.removedAt).toBeInstanceOf(Date);
  } finally { await connection.close(); }
});
