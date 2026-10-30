import { mkdir, mkdtemp, writeFile, rm, readdir } from 'node:fs/promises';
import { resolve, relative, isAbsolute } from 'node:path';
import { afterAll, beforeAll, expect, it } from 'vitest';
import request from 'supertest';
import { startLocalDemo } from '../../scripts/local-demo.js';

const fixtures = resolve('.local/local-demo-tests');
let directory: string;
let demo: Awaited<ReturnType<typeof startLocalDemo>> | undefined;
const administrator = { name: 'Local Test Admin', email: 'local-admin@example.test', password: 'Disposable local test password!' };
beforeAll(async () => {
  await mkdir(fixtures, { recursive: true });
  directory = await mkdtemp(resolve(fixtures, 'run-'));
  await mkdir(resolve(directory, 'web'));
  await writeFile(resolve(directory, 'web/index.html'), '<!doctype html><title>Local demo fixture</title>');
});
afterAll(async () => {
  await demo?.stop();
  // Delete only this test's freshly created fixture, never the persistent user demo.
  const child = relative(fixtures, directory);
  if (!child || child.startsWith('..') || isAbsolute(child)) throw new Error('Invalid fixture cleanup path.');
  await rm(directory, { recursive: true, force: true });
});
function options() {
  return { dataDirectory: resolve(directory, 'db'), frontendDirectory: resolve(directory, 'web'),
    binaryDirectory: resolve('node_modules/.cache/mongodb-memory-server'), port: 0 };
}
it('serves protected APIs and SPA routes, preserving sessions, questions and removal across actual MongoDB restarts', async () => {
  demo = await startLocalDemo({ ...options(), administrator });
  const first = request(demo.url);
  await first.get('/ready').expect(200);
  const page = await first.get('/admin').expect(200);
  expect(page.text).toContain('Local demo fixture');
  expect(page.headers['content-security-policy']).toContain("default-src 'self'");
  await first.get('/missing.js').expect(404);
  await first.get('/api/unknown').expect(404).expect('Content-Type', /json/);
  await first.get('/api/admin/resources').expect(401);
  const admin = (await first.post('/api/auth/login').send({ email: administrator.email, password: administrator.password }).expect(200)).body.token;
  await first.post('/api/auth/register').send({ name: 'Local Student', email: 'local-student@example.test', password: administrator.password }).expect(201);
  const student = (await first.post('/api/auth/login').send({ email: 'local-student@example.test', password: administrator.password }).expect(200)).body.token;
  await first.get('/api/admin/resources').auth(student, { type: 'bearer' }).expect(403);
  const question = { questionText: 'Does this question persist?', options: [{ id: 'A', text: 'Yes' }, { id: 'B', text: 'No' }], correctAnswer: 'A', subject: 'SE', topic: 'Persistence', difficulty: 'Easy', marks: 1 };
  const id = (await first.post('/api/questions').auth(admin, { type: 'bearer' }).send(question).expect(201)).body.question.id;
  const quiz = (await first.post('/api/quizzes').auth(student, { type: 'bearer' }).send({ title: 'Persistent local quiz', subject: 'SE', questionIds: [id] }).expect(201)).body.quiz.id;
  const result = (await first.post('/api/attempts').auth(student, { type: 'bearer' }).send({ quizId: quiz, responses: [{ questionId: id, selectedOptionId: 'A' }] }).expect(201)).body;
  await first.delete('/api/admin/questions/' + id).auth(admin, { type: 'bearer' }).send({ confirmed: true }).expect(204);
  await demo.stop();
  expect((await readdir(options().dataDirectory)).length).toBeGreaterThan(0);
  demo = await startLocalDemo(options());
  const second = request(demo.url);
  await second.get('/api/auth/me').auth(admin, { type: 'bearer' }).expect(200);
  expect((await second.get('/api/quiz-questions').auth(student, { type: 'bearer' }).expect(200)).body.questions).toEqual([]);
  const saved = await demo.connection.collection('questions').findOne({ questionText: question.questionText });
  expect(saved?.removedAt).toBeInstanceOf(Date);
  const history = await second.get('/api/attempts/history').auth(student, { type: 'bearer' }).expect(200);
  expect(history.body.attempts).toHaveLength(1);
  expect(history.body.attempts[0]).toMatchObject({ attemptId: result.attemptId, quizTitle: 'Persistent local quiz', subject: 'SE', percentage: 100 });
  await second.post('/api/auth/logout').auth(admin, { type: 'bearer' }).expect(204);
  await second.get('/api/auth/me').auth(admin, { type: 'bearer' }).expect(401);
}, 120_000);
it('fails before starting a database when the frontend build is missing', async () => {
  await expect(startLocalDemo({ ...options(), frontendDirectory: resolve(directory, 'missing'), dataDirectory: resolve(directory, 'untouched') })).rejects.toThrow();
  await expect(readdir(resolve(directory, 'untouched'))).rejects.toThrow();
});
