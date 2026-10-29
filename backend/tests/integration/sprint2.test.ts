import { beforeAll, afterAll, beforeEach, it, expect } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Schema, Types, type Connection } from 'mongoose';
import request from 'supertest';
import { PDFDocument } from 'pdf-lib';
import { performance } from 'node:perf_hooks';
import { connectDatabase } from '../../src/db.js';
import { loadConfig } from '../../src/config.js';
import { createRuntime } from '../../src/runtime.js';
import { hashPassword } from '../../src/security/password.js';
import type { ModerationResource } from '../../src/admin/moderation.js';

let mongo: MongoMemoryServer;
let connection: Connection;
let runtime: Awaited<ReturnType<typeof createRuntime>>;
let pdf: Buffer;
let hash: string;
let admin: string;
let student: string;
const fixtureSchema = new Schema({ title: String });
function fixtureModel(db: Connection) { return db.model('ModerationFixture', fixtureSchema); }
let fixture: ReturnType<typeof fixtureModel>;
beforeAll(async () => {
  mongo = await MongoMemoryServer.create({ instance: { dbName: 'sprint2_test', launchTimeout: 60000 } });
  connection = await connectDatabase(mongo.getUri());
  // Contract fixture only: real Question/Quiz business schemas remain with their owners.
  fixture = fixtureModel(connection);
  const resource: ModerationResource = {
    async list(limit) { return (await fixture.find().limit(limit)).map(row => ({ id: row.id, title: String(row.get('title')) })); },
    async remove(id) { return (await fixture.deleteOne({ _id: id })).deletedCount === 1; }
  };
  runtime = await createRuntime(connection, loadConfig({ NODE_ENV: 'test', MONGODB_URI: mongo.getUri(), BCRYPT_ROUNDS: '10' }), {
    authLimit: 1000, moderation: { questions: resource, quizzes: resource }
  });
  const document = await PDFDocument.create(); document.addPage(); pdf = Buffer.from(await document.save());
  hash = await hashPassword('Sprint two password!', 10);
}, 180000);
beforeEach(async () => {
  for (const name of ['users', 'materials', 'authsessions', 'materialFiles.files', 'materialFiles.chunks', 'moderationfixtures']) await connection.collection(name).deleteMany({});
  await runtime.accounts.User.create([{ name: 'Admin', email: 'admin@example.com', passwordHash: hash, role: 'admin' },
    { name: 'Student', email: 'student@example.com', passwordHash: hash }]);
  admin = (await request(runtime.app).post('/api/auth/login').send({ email: 'admin@example.com', password: 'Sprint two password!' })).body.token;
  student = (await request(runtime.app).post('/api/auth/login').send({ email: 'student@example.com', password: 'Sprint two password!' })).body.token;
});
afterAll(async () => { await connection?.close(); await mongo?.stop(); });
const bearer = (token: string) => ({ Authorization: 'Bearer ' + token });
async function upload(title = 'Sprint notes', subject = 'SE', description = 'Notes') {
  return (await request(runtime.app).post('/api/materials').set(bearer(student)).field({ title, subject, description }).attach('file', pdf, 'notes.pdf').expect(201)).body.material.id as string;
}
it('lists only enabled moderation resources and rejects student/anonymous administration', async () => {
  expect((await request(runtime.app).get('/api/admin/resources').set(bearer(admin)).expect(200)).body.resources).toEqual(['materials', 'questions', 'quizzes']);
  for (const path of ['/api/admin/resources', '/api/admin/materials', '/api/admin/questions', '/api/admin/quizzes']) {
    await request(runtime.app).get(path).expect(401);
    await request(runtime.app).get(path).set(bearer(student)).expect(403);
  }
});
it('removes material atomically and closes both search and download while retaining recoverable data', async () => {
  const id = await upload();
  const found = await request(runtime.app).get('/api/materials?q=notes&subject=SE').set(bearer(student)).expect(200);
  expect(found.body.materials[0].id).toBe(id);
  const download = await request(runtime.app).get('/api/materials/' + id + '/file').set(bearer(student)).expect(200);
  expect(Buffer.from(download.body)).toEqual(pdf);
  expect(download.headers['content-disposition']).toContain('attachment');
  const list = await request(runtime.app).get('/api/admin/materials').set(bearer(admin)).expect(200);
  expect(list.body.items).toEqual([{ id, title: 'Sprint notes' }]);
  await request(runtime.app).delete('/api/admin/materials/' + id).set(bearer(admin)).send({ confirmed: true }).expect(204);
  expect((await request(runtime.app).get('/api/materials').set(bearer(student)).expect(200)).body.materials).toEqual([]);
  expect((await request(runtime.app).get('/api/materials?q=notes&subject=SE').set(bearer(student)).expect(200)).body.materials).toEqual([]);
  await request(runtime.app).get('/api/materials/' + id + '/file').set(bearer(student)).expect(404);
  expect((await runtime.materials.Material.findById(id))?.removedAt).toBeInstanceOf(Date);
  expect(await connection.collection('materialFiles.files').countDocuments()).toBe(1);
});
it('requires explicit confirmation and validates identifiers, missing/repeated removals and query limits', async () => {
  const id = await upload();
  for (const body of [{}, { confirmed: false }, { confirmed: true, userId: 'forged' }]) await request(runtime.app).delete('/api/admin/materials/' + id).set(bearer(admin)).send(body).expect(400);
  await request(runtime.app).delete('/api/admin/materials/bad').set(bearer(admin)).send({ confirmed: true }).expect(400);
  await request(runtime.app).delete('/api/admin/materials/' + new Types.ObjectId()).set(bearer(admin)).send({ confirmed: true }).expect(404);
  await request(runtime.app).get('/api/admin/materials?limit=51').set(bearer(admin)).expect(400);
  await request(runtime.app).delete('/api/admin/materials/' + id).set(bearer(student)).send({ confirmed: true }).expect(403);
  await request(runtime.app).delete('/api/admin/materials/' + id).send({ confirmed: true }).expect(401);
  const results = await Promise.all([1, 2].map(() => request(runtime.app).delete('/api/admin/materials/' + id).set(bearer(admin)).send({ confirmed: true })));
  expect(results.map(row => row.status).sort()).toEqual([204, 404]);
});
it('searches all material metadata and combines keyword with a subject filter', async () => {
  const byTitle = await upload('Graph algorithms', 'CS', 'Lecture handout');
  const bySubject = await upload('Week 4 notes', 'Algorithms', 'Exam prep');
  const byDescription = await upload('Reference sheet', 'CS', 'Algorithms and graph theory');
  const titleResult = await request(runtime.app).get('/api/materials?q=graph').set(bearer(student)).expect(200);
  expect(titleResult.body.materials.map((item: { id: string }) => item.id)).toContain(byTitle);
  const subjectResult = await request(runtime.app).get('/api/materials?q=algorithms&subject=cs').set(bearer(student)).expect(200);
  expect(subjectResult.body.materials.map((item: { id: string }) => item.id)).toContain(byDescription);
  expect(subjectResult.body.materials.map((item: { id: string }) => item.id)).toContain(byTitle);
  expect(subjectResult.body.materials.map((item: { id: string }) => item.id)).not.toContain(bySubject);
  const descriptionResult = await request(runtime.app).get('/api/materials?q=theory&subject=CS').set(bearer(student)).expect(200);
  expect(descriptionResult.body.materials.map((item: { id: string }) => item.id)).toEqual([byDescription]);
  const exactSubject = await request(runtime.app).get('/api/materials?subject=cs').set(bearer(student)).expect(200);
  expect(exactSubject.body.materials.map((item: { id: string }) => item.id)).toContain(byTitle);
  expect(exactSubject.body.materials.map((item: { id: string }) => item.id)).toContain(byDescription);
  expect(exactSubject.body.materials.map((item: { id: string }) => item.id)).not.toContain(bySubject);
});
it('validates safe searches and download options, escapes regex and paginates', async () => {
  const first = await upload('A.*'); await upload('B notes');
  const exact = await request(runtime.app).get('/api/materials?q=A.*').set(bearer(student)).expect(200);
  expect(exact.body.materials.map((item: { id: string }) => item.id)).toEqual([first]);
  const page = (await request(runtime.app).get('/api/materials?limit=1').set(bearer(student)).expect(200)).body;
  expect(page.materials).toHaveLength(1);
  const next = (await request(runtime.app).get('/api/materials?limit=1&cursor=' + page.nextCursor).set(bearer(student)).expect(200)).body;
  expect(next.materials[0].id).toBe(first);
  for (const query of ['limit=0', 'q=<script>', 'subject[$ne]=x', 'cursor=invalid', 'unknown=x']) await request(runtime.app).get('/api/materials?' + query).set(bearer(student)).expect(400);
  await request(runtime.app).get('/api/materials/invalid/file').set(bearer(student)).expect(400);
  await request(runtime.app).get('/api/materials/' + first + '/file?disposition=evil').set(bearer(student)).expect(400);
  await request(runtime.app).get('/api/materials/' + new Types.ObjectId() + '/file').set(bearer(student)).expect(404);
  expect((await request(runtime.app).get('/api/materials/' + first + '/file?disposition=inline').set(bearer(student)).expect(200)).headers['content-disposition']).toContain('inline');
});
it('uses owner-supplied question and quiz moderation adapters behind the same admin gate', async () => {
  for (const kind of ['questions', 'quizzes']) {
    const item = await fixture.create({ title: kind });
    expect((await request(runtime.app).get('/api/admin/' + kind).set(bearer(admin)).expect(200)).body.items[0].title).toBe(kind);
    await request(runtime.app).delete('/api/admin/' + kind + '/' + item.id).set(bearer(student)).send({ confirmed: true }).expect(403);
    await request(runtime.app).delete('/api/admin/' + kind + '/' + item.id).set(bearer(admin)).send({ confirmed: true }).expect(204);
    expect(await fixture.findById(item.id)).toBeNull();
  }
});
it('handles missing PDF storage safely and makes revoked administrator access ineffective', async () => {
  const id = await upload(); const material = await runtime.materials.Material.findById(id);
  await runtime.materials.bucket.delete(material!.fileId);
  await request(runtime.app).get('/api/materials/' + id + '/file').set(bearer(student)).expect(404);
  await runtime.accounts.User.updateOne({ email: 'admin@example.com' }, { role: 'student' });
  await request(runtime.app).delete('/api/admin/materials/' + id).set(bearer(admin)).send({ confirmed: true }).expect(403);
});
it.each([10, 50])('keeps normal protected operations within three seconds for %i concurrent authenticated sessions', async count => {
  await runtime.accounts.User.create(Array.from({ length: count }, (_, index) => ({ name: 'Load Student', email: 'load' + index + '@example.com', passwordHash: hash })));
  const sessions = await Promise.all(Array.from({ length: count }, (_, index) => request(runtime.app).post('/api/auth/login').send({ email: 'load' + index + '@example.com', password: 'Sprint two password!' })));
  expect(sessions.every(row => row.status === 200)).toBe(true);
  const latencies = await Promise.all(sessions.map(async session => {
    const start = performance.now();
    await request(runtime.app).get('/api/auth/me').set(bearer(session.body.token)).expect(200);
    await request(runtime.app).get('/api/materials').set(bearer(session.body.token)).expect(200);
    return performance.now() - start;
  }));
  latencies.sort((a, b) => a - b);
  expect(latencies[Math.ceil(latencies.length * 0.9) - 1]).toBeLessThan(3000);
  console.info('NFR scoped smoke: ' + count + ' sessions, ' + (count * 2) + ' authenticated requests; p90=' + latencies[Math.ceil(count * 0.9) - 1]!.toFixed(0) + 'ms');
}, 30000);
it('persists removal and existing authentication after runtime recreation and database reconnect', async () => {
  const id = await upload();
  await request(runtime.app).delete('/api/admin/materials/' + id).set(bearer(admin)).send({ confirmed: true }).expect(204);
  const next = await connectDatabase(mongo.getUri());
  try {
    const recreated = await createRuntime(next, loadConfig({ NODE_ENV: 'test', MONGODB_URI: mongo.getUri(), BCRYPT_ROUNDS: '10' }));
    await request(recreated.app).get('/api/auth/me').set(bearer(student)).expect(200);
    await request(recreated.app).get('/api/materials/' + id + '/file').set(bearer(student)).expect(404);
    expect((await recreated.materials.Material.findById(id))?.removedAt).toBeInstanceOf(Date);
    expect((await request(recreated.app).get('/api/admin/resources').set(bearer(admin)).expect(200)).body.resources).toEqual(['materials', 'questions']);
  } finally { await next.close(); }
});
