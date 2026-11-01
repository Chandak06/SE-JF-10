import { afterAll, beforeAll, beforeEach, expect, it } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { PDFDocument } from 'pdf-lib';
import { connectDatabase } from '../../src/db.js';
import { loadConfig } from '../../src/config.js';
import { createRuntime } from '../../src/runtime.js';
import { provisionAdmin } from '../../src/security/provision-admin.js';

let mongo: MongoMemoryServer;
let db: Awaited<ReturnType<typeof connectDatabase>>;
let runtime: Awaited<ReturnType<typeof createRuntime>>;
let admin: string; let student: string; let adminId: string; let pdf: Buffer;
const bearer = (token: string) => ({ Authorization: 'Bearer ' + token });
beforeAll(async () => {
  mongo = await MongoMemoryServer.create({ instance: { launchTimeout: 60000 } });
  db = await connectDatabase(mongo.getUri('bulk_review'));
  runtime = await createRuntime(db, loadConfig({ NODE_ENV: 'test', MONGODB_URI: mongo.getUri('bulk_review'), BCRYPT_ROUNDS: '10' }), { authLimit: 1000 });
  const password = 'Disposable bulk review password!';
  await provisionAdmin(db, { name: 'Bulk Admin', email: 'bulk-admin@example.test', password }, 10);
  await runtime.auth.register({ name: 'Bulk Student', email: 'bulk-student@example.test', password });
  const login = await runtime.auth.login('bulk-admin@example.test', password);
  admin = login.token; adminId = login.authenticatedUser.id;
  student = (await runtime.auth.login('bulk-student@example.test', password)).token;
  const document = await PDFDocument.create(); document.addPage(); pdf = Buffer.from(await document.save());
});
beforeEach(async () => {
  for (const name of ['materials', 'materialFiles.files', 'materialFiles.chunks', 'questions', 'quizzes', 'quizattempts']) await db.collection(name).deleteMany({});
});
afterAll(async () => { await db?.close(); await mongo?.stop(); });

async function fixtures() {
  const ids: Record<string, string[]> = { materials: [], questions: [], quizzes: [] };
  for (const [index, subject] of ['Network.*', 'Other'].entries()) {
    const material = await request(runtime.app).post('/api/materials').set(bearer(student))
      .field('title', 'Bulk PDF ' + index).field('subject', subject).field('description', 'Review fixture')
      .attach('file', pdf, { filename: 'review.pdf', contentType: 'application/pdf' }).expect(201);
    ids.materials!.push(material.body.material.id);
    const question = await request(runtime.app).post('/api/questions').set(bearer(admin)).send({
      questionText: 'Bulk question ' + index, subject, topic: 'Review', difficulty: index ? 'Hard' : 'Easy', marks: 1,
      options: [{ id: 'A', text: 'Correct' }, { id: 'B', text: 'Incorrect' }], correctAnswer: 'A'
    }).expect(201);
    ids.questions!.push(question.body.question.id);
    const quiz = await request(runtime.app).post('/api/quizzes').set(bearer(student)).send({
      title: 'Bulk Quiz ' + index, subject, questionIds: [question.body.question.id]
    }).expect(201);
    ids.quizzes!.push(quiz.body.quiz.id);
  }
  return ids;
}

it.each(['materials', 'questions', 'quizzes'])('bulk %s removal enforces roles/confirmation, retains audit/history and covers hidden items', async kind => {
  const ids = await fixtures();
  const saved = await request(runtime.app).post('/api/attempts').set(bearer(student)).send({
    quizId: ids.quizzes![0], responses: [{ questionId: ids.questions![0], selectedOptionId: 'A' }]
  }).expect(201);
  const path = '/api/admin/' + kind;
  const query = { subject: 'Network.*', ...(kind === 'questions' ? { difficulty: 'Easy' } : {}) };
  const listing = await request(runtime.app).get(path).set(bearer(admin)).query(query).expect(200);
  expect(listing.body.items.map((item: { id: string }) => item.id)).toEqual([ids[kind]![0]]);
  expect(listing.body.filters.subjects).toEqual(['Network.*', 'Other']);
  await request(runtime.app).delete(path).send({ confirmed: true }).expect(401);
  await request(runtime.app).delete(path).set(bearer(student)).send({ confirmed: true }).expect(403);
  for (const body of [{}, { confirmed: false }, { confirmed: true, userId: 'forged' }]) {
    await request(runtime.app).delete(path).set(bearer(admin)).send(body).expect(400);
  }
  expect(await db.collection(kind).countDocuments({ removedAt: null })).toBe(2);
  const removed = await request(runtime.app).delete(path).set(bearer(admin)).send({ confirmed: true }).expect(200);
  expect(removed.body.removedCount).toBe(2);
  const retained = await db.collection(kind).find().toArray();
  expect(retained).toHaveLength(2);
  for (const item of retained) { expect(item.removedAt).toBeInstanceOf(Date); expect(item.removedBy.toString()).toBe(adminId); }
  expect((await request(runtime.app).get(path).set(bearer(admin)).expect(200)).body.items).toEqual([]);
  expect((await request(runtime.app).delete(path).set(bearer(admin)).send({ confirmed: true }).expect(200)).body.removedCount).toBe(0);
  const history = await request(runtime.app).get('/api/attempts/history').set(bearer(student)).expect(200);
  expect(history.body.attempts[0].attemptId).toBe(saved.body.attemptId);
  if (kind === 'materials') {
    await request(runtime.app).get('/api/materials/' + ids.materials![0] + '/download').set(bearer(student)).expect(404);
    expect(await db.collection('materialFiles.files').countDocuments()).toBe(2);
  } else {
    await request(runtime.app).post('/api/attempts').set(bearer(student)).send({ quizId: ids.quizzes![0], responses: [] }).expect(kind === 'questions' ? 409 : 404);
  }
});
