import { afterAll, beforeAll, beforeEach, expect, it } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { connectDatabase } from '../../src/db.js';
import { loadConfig } from '../../src/config.js';
import { createRuntime } from '../../src/runtime.js';
import { provisionAdmin, readAdminProvisioningInput } from '../../src/security/provision-admin.js';
import { verifyPassword } from '../../src/security/password.js';

const run = promisify(execFile);
const admin = { name: 'Setup Admin', email: 'admin@example.test', password: 'Disposable administrator password!' };
let mongo: MongoMemoryServer;
let connection: Awaited<ReturnType<typeof connectDatabase>>;
let runtime: Awaited<ReturnType<typeof createRuntime>>;
beforeAll(async () => {
  mongo = await MongoMemoryServer.create({ instance: { dbName: 'admin_provisioning_spec', launchTimeout: 60_000 } });
  connection = await connectDatabase(mongo.getUri('admin_provisioning_spec'));
  runtime = await createRuntime(connection, loadConfig({ NODE_ENV: 'test', MONGODB_URI: mongo.getUri('admin_provisioning_spec'), BCRYPT_ROUNDS: '10' }), { authLimit: 100 });
});
beforeEach(async () => {
  await runtime.accounts.User.deleteMany({});
  await runtime.questions.Question.deleteMany({});
  await connection.collection('authsessions').deleteMany({});
});
afterAll(async () => { await connection?.close(); await mongo?.stop(); });

it('creates an administrator in the configured named database using the existing bcrypt helper', async () => {
  expect(connection.name).toBe('admin_provisioning_spec');
  expect(await provisionAdmin(connection, { ...admin, email: ' ADMIN@example.test ' }, 10)).toEqual({ status: 'created' });
  const stored = await runtime.accounts.User.findOne({ email: admin.email }).select('+passwordHash').lean();
  expect(stored!.role).toBe('admin'); expect(stored!.active).toBe(true);
  expect(stored!.passwordHash).not.toBe(admin.password);
  expect(await verifyPassword(admin.password, stored!.passwordHash)).toBe(true);
  expect(stored).not.toHaveProperty('password');
});
it('repeats safely without overwriting an existing admin password or name', async () => {
  await provisionAdmin(connection, admin, 10);
  const before = await runtime.accounts.User.findOne({ email: admin.email }).select('+passwordHash').lean();
  expect(await provisionAdmin(connection, { ...admin, name: 'Changed', password: 'Different valid password!' }, 10)).toEqual({ status: 'already-exists' });
  const after = await runtime.accounts.User.findOne({ email: admin.email }).select('+passwordHash').lean();
  expect(after).toEqual(before); expect(await runtime.accounts.User.countDocuments()).toBe(1);
});
it('handles concurrent provisioning with one account and no password reset', async () => {
  const results = await Promise.all([provisionAdmin(connection, admin, 10), provisionAdmin(connection, admin, 10)]);
  expect(results.map(x => x.status).sort()).toEqual(['already-exists', 'created']);
  expect(await runtime.accounts.User.countDocuments()).toBe(1);
});
it('rejects an existing student rather than promoting them', async () => {
  await request(runtime.app).post('/api/auth/register').send(admin).expect(201);
  await expect(provisionAdmin(connection, admin, 10)).rejects.toThrow('belongs to a Student');
  expect((await runtime.accounts.User.findOne({ email: admin.email }))!.role).toBe('student');
});
it('does not reactivate a disabled administrator', async () => {
  await provisionAdmin(connection, admin, 10);
  await runtime.accounts.User.updateOne({ email: admin.email }, { active: false });
  await expect(provisionAdmin(connection, admin, 10)).rejects.toThrow('disabled');
  expect((await runtime.accounts.User.findOne({ email: admin.email }))!.active).toBe(false);
});
it.each([
  {}, { ...admin, email: 'invalid' }, { ...admin, password: 'short' },
  { ...admin, password: 'x'.repeat(73) }, { ...admin, password: 'valid password\0no' }, { ...admin, role: 'admin' }
])('rejects missing/invalid provisioning input without writes', async input => {
  await expect(provisionAdmin(connection, input, 10)).rejects.toThrow('Invalid administrator details');
  expect(await runtime.accounts.User.countDocuments()).toBe(0);
});
it('requires an explicit development/test confirmation and disables production', () => {
  const env = { NODE_ENV: 'development', ADMIN_EMAIL: admin.email, ADMIN_PASSWORD: admin.password };
  expect(() => readAdminProvisioningInput(env)).toThrow('requires development/test');
  expect(() => readAdminProvisioningInput({ ...env, NODE_ENV: 'production', ADMIN_PROVISION_CONFIRM: 'production' })).toThrow('Production provisioning is disabled');
  expect(() => readAdminProvisioningInput({ ...env, ADMIN_PROVISION_CONFIRM: 'development', ADMIN_EMAIL: '' })).toThrow('Set a valid');
  expect(readAdminProvisioningInput({ ...env, ADMIN_PROVISION_CONFIRM: 'development', ADMIN_NAME: '' }).name).toBe('Administrator');
});
it('runs the real CLI only against disposable MongoDB, uses its database, exits cleanly and prints no secrets', async () => {
  const env = { ...process.env, NODE_ENV: 'test', MONGODB_URI: mongo.getUri('admin_provisioning_spec'), ADMIN_PROVISION_CONFIRM: 'test', ADMIN_NAME: admin.name, ADMIN_EMAIL: admin.email, ADMIN_PASSWORD: admin.password, BCRYPT_ROUNDS: '10' };
  const args = ['--import', 'tsx', 'backend/scripts/seed-admin.ts'];
  for (const expected of ['Administrator created.', 'Administrator already exists.']) {
    const output = await run(process.execPath, args, { env, timeout: 12_000 });
    expect(output.stdout).toContain(expected);
    expect(output.stdout + output.stderr).not.toContain(admin.password);
    expect(output.stdout + output.stderr).not.toContain(mongo.getUri('admin_provisioning_spec'));
    expect(output.stdout + output.stderr).not.toMatch(/\$2[aby]\$|Bearer /);
  }
  expect(await runtime.accounts.User.countDocuments({ role: 'admin' })).toBe(1);
});
it('refuses the CLI before connecting when production or confirmation is invalid', async () => {
  await expect(run(process.execPath, ['--import', 'tsx', 'backend/scripts/seed-admin.ts'], {
    env: { ...process.env, NODE_ENV: 'production', ADMIN_PROVISION_CONFIRM: 'production', MONGODB_URI: 'not-a-database' }, timeout: 10_000
  })).rejects.toMatchObject({ code: 1 });
  expect(await runtime.accounts.User.countDocuments()).toBe(0);
});
it('exits cleanly after a database-connected CLI refusal without promoting a Student or leaking input', async () => {
  await request(runtime.app).post('/api/auth/register').send(admin).expect(201);
  const failure = await run(process.execPath, ['--import', 'tsx', 'backend/scripts/seed-admin.ts'], {
    env: { ...process.env, NODE_ENV: 'test', MONGODB_URI: mongo.getUri('admin_provisioning_spec'), ADMIN_PROVISION_CONFIRM: 'test', ADMIN_EMAIL: admin.email, ADMIN_PASSWORD: admin.password }, timeout: 12_000
  }).then(() => { throw new Error('Expected CLI refusal'); }, error => error as { code: number; stderr: string; stdout: string });
  expect(failure.code).toBe(1);
  expect(failure.stderr).toContain('belongs to a Student');
  expect(failure.stderr + failure.stdout).not.toContain(admin.password);
  expect(failure.stderr + failure.stdout).not.toContain(mongo.getUri('admin_provisioning_spec'));
  expect((await runtime.accounts.User.findOne({ email: admin.email }))!.role).toBe('student');
});
it('uses the common login and server-verified RBAC for real Question Bank creation and persistence', async () => {
  await provisionAdmin(connection, admin, 10);
  const login = await request(runtime.app).post('/api/auth/login').send({ email: admin.email, password: admin.password }).expect(200);
  expect(login.body.authenticatedUser.role).toBe('admin');
  const headers = { Authorization: 'Bearer ' + login.body.token };
  await request(runtime.app).get('/api/auth/me').set(headers).expect(200).expect(res => expect(res.body.authenticatedUser.role).toBe('admin'));
  const question = { questionText: 'Which protocol is reliable?', subject: 'Networks', topic: 'Transport', difficulty: 'Easy', marks: 2, options: [{ id: 'A', text: 'UDP' }, { id: 'B', text: 'TCP' }], correctAnswer: 'B' };
  const created = await request(runtime.app).post('/api/questions').set(headers).send(question).expect(201);
  expect(await runtime.questions.Question.countDocuments({ _id: created.body.question.id })).toBe(1);
  const listed = await request(runtime.app).get('/api/questions?subject=Networks').set(headers).expect(200);
  expect(listed.body.questions[0].questionText).toBe(question.questionText);
  await request(runtime.app).get('/api/questions').expect(401);
  await request(runtime.app).post('/api/questions').send(question).expect(401);
  await request(runtime.app).post('/api/auth/register').send({ ...admin, email: 'student@example.test' }).expect(201).expect(res => expect(res.body.authenticatedUser.role).toBe('student'));
  const student = await request(runtime.app).post('/api/auth/login').send({ email: 'student@example.test', password: admin.password }).expect(200);
  expect(student.body.authenticatedUser.role).toBe('student');
  const studentHeaders = { Authorization: 'Bearer ' + student.body.token };
  await request(runtime.app).get('/api/questions').set(studentHeaders).expect(403);
  await request(runtime.app).post('/api/questions').set(studentHeaders).send(question).expect(403);
  await request(runtime.app).post('/api/auth/register').send({ ...admin, email: 'injected@example.test', role: 'admin' }).expect(400);
  await request(runtime.app).patch('/api/auth/me').set(studentHeaders).send({ role: 'admin' }).expect(404);
  expect((await runtime.accounts.User.findOne({ email: 'student@example.test' }))!.role).toBe('student');
  await runtime.accounts.User.updateOne({ email: admin.email }, { role: 'student' });
  await request(runtime.app).get('/api/questions').set(headers).expect(403); // Current DB role beats the old login role.
});
