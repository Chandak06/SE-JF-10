import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, join, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { startLocalDemo } from './local-demo.js';
import { randomUUID } from 'node:crypto';
import { PDFDocument } from 'pdf-lib';

// This check always allocates its own disposable database, never the saved demo.
const root = fileURLToPath(new URL('../../', import.meta.url));
const fixture = await mkdtemp(join(tmpdir(), 'study-commons-release-'));
let demo: Awaited<ReturnType<typeof startLocalDemo>> | undefined;
const localOptions = {
  dataDirectory: resolve(fixture, 'database'), frontendDirectory: resolve(root, 'frontend/dist-local-demo'),
  binaryDirectory: resolve(root, 'node_modules/.cache/mongodb-memory-server'), port: 0
};
try {
  // Explicit fixture Admin only in this newly allocated disposable database.
  const credentials = { name: 'Release Fixture Admin', email: 'release-admin@example.test', password: randomUUID() + '!' };
  demo = await startLocalDemo({ ...localOptions, administrator: credentials });
  const page = await fetch(demo.url);
  const html = await page.text();
  const assets = [...html.matchAll(/(?:src|href)="(\/assets\/[^"<>]+)"/g)].map(match => match[1]!);
  if (assets.length < 2) throw new Error('Frontend build does not reference compiled assets.');
  for (const path of assets) {
    const asset = await fetch(demo.url + path);
    if (!asset.ok || !Number(asset.headers.get('content-length'))) throw new Error('Compiled asset unavailable.');
  }
  const child = spawn(process.execPath, [resolve(root, 'scripts/check-local-release.mjs')], {
    cwd: root, stdio: 'inherit',
    env: { ...process.env, RELEASE_SMOKE_CONFIRM: 'disposable-local', RELEASE_SMOKE_URL: demo.url }
  });
  await new Promise<void>((res, reject) => {
    child.once('error', reject);
    child.once('exit', code => code === 0 ? res() : reject(new Error('Built local release smoke failed.')));
  });
  const call = (path: string, options: RequestInit = {}) => fetch(demo!.url + path, { ...options, signal: AbortSignal.timeout(10_000) });
  const post = (body: unknown, token?: string, key?: string): RequestInit => ({ method: 'POST', headers: {
    'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}), ...(key ? { 'Idempotency-Key': key } : {})
  }, body: JSON.stringify(body) });
  const bearer = (token: string) => ({ Authorization: 'Bearer ' + token });
  const login = async (email: string) => {
    const response = await call('/api/auth/login', post({ email, password: credentials.password }));
    if (!response.ok) throw new Error('Fixture login failed.');
    return (await response.json()).token as string;
  };
  const studentEmail = randomUUID() + '@example.test';
  if ((await call('/api/auth/register', post({ name: 'Release Fixture Student', email: studentEmail, password: credentials.password }))).status !== 201) throw new Error('Student setup failed.');
  const administrator = await login(credentials.email); const student = await login(studentEmail);
  const questionResponse = await call('/api/questions', post({ questionText: 'Which option is correct?', options: [{ id: 'A', text: 'First' }, { id: 'B', text: 'Second' }, { id: 'C', text: 'Third' }, { id: 'D', text: 'Fourth' }], correctAnswer: 'B', subject: 'Release', topic: 'Smoke', difficulty: 'Easy', marks: 1 }, administrator));
  if (questionResponse.status !== 201) throw new Error('Question creation failed.');
  const questionId = (await questionResponse.json()).question.id as string;
  const quizResponse = await call('/api/quizzes', post({ title: 'Release fixture quiz', subject: 'Release', questionIds: [questionId] }, student));
  if (quizResponse.status !== 201) throw new Error('Quiz creation failed.');
  const quizId = (await quizResponse.json()).quiz.id as string;
  const quizView = await call('/api/quizzes/' + quizId, { headers: bearer(student) });
  if (!quizView.ok || (await quizView.text()).includes('correctAnswer')) throw new Error('Student-safe Quiz contract failed.');
  const key = randomUUID(); let attemptId: string | undefined;
  for (let retry = 0; retry < 2; retry++) {
    const response = await call('/api/attempts', post({ quizId, responses: [{ questionId, selectedOptionId: 'B' }] }, student, key));
    const result = await response.json();
    if (response.status !== 201 || result.score !== 1 || result.percentage !== 100 || result.resultId !== result.attemptId || result.correctAnswers?.[0]?.correctOptionId !== 'B') throw new Error('Submission/SAD result contract failed.');
    if (attemptId && result.attemptId !== attemptId) throw new Error('Submission retry duplicated an attempt.');
    attemptId = result.attemptId;
  }
  const document = await PDFDocument.create(); document.addPage(); const bytes = await document.save();
  const form = new FormData(); form.set('title', 'Release PDF'); form.set('subject', 'Release'); form.set('description', 'Disposable release fixture');
  form.set('file', new Blob([Buffer.from(bytes)], { type: 'application/pdf' }), 'release.pdf');
  const upload = await call('/api/materials', { method: 'POST', headers: bearer(student), body: form });
  if (upload.status !== 201) throw new Error('PDF upload failed.');
  const materialId = (await upload.json()).material.id as string;
  const download = await call('/api/materials/' + materialId + '/download', { headers: bearer(student) });
  if (!download.ok || !Buffer.from(await download.arrayBuffer()).equals(Buffer.from(bytes))) throw new Error('SAD PDF download contract failed.');
  const remove = (kind: string, id: string) => call('/api/admin/' + kind + '/' + id, { ...post({ confirmed: true }, administrator), method: 'DELETE' });
  if ((await remove('quizzes', quizId)).status !== 204 || (await remove('materials', materialId)).status !== 204) throw new Error('Real moderation failed.');
  await demo.stop(); demo = await startLocalDemo(localOptions);
  const history = await call('/api/attempts/history', { headers: bearer(student) }); const saved = await history.json();
  if (!history.ok || saved.total !== 1 || saved.attempts[0]?.attemptId !== attemptId || saved.attempts[0]?.subject !== 'Release') throw new Error('History restart/moderation persistence failed.');
  if ((await call('/api/materials/' + materialId + '/download', { headers: bearer(student) })).status !== 404) throw new Error('Removed PDF is available after restart.');
  console.info('Full built release passed: Question/Quiz, trusted idempotent submission, SAD result/download, PDF bytes, real moderation and history across actual MongoDB restart.');
  console.info('Built local Node demo verified with isolated MongoDB and real frontend assets.');
} catch {
  console.error('Built local demo verification failed. No Atlas or persistent user demo was selected.');
  process.exitCode = 1;
} finally {
  try { await demo?.stop(); }
  finally {
    const child = relative(tmpdir(), fixture);
    if (!child.startsWith('study-commons-release-') || isAbsolute(child) || child.includes('..')) throw new Error('Invalid temporary release cleanup path.');
    await rm(fixture, { recursive: true, force: true });
  }
}
