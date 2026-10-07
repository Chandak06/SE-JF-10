import { beforeAll, afterAll, beforeEach, describe, it, expect } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import type { Connection } from 'mongoose';
import request from 'supertest';
import { connectDatabase } from '../../src/db.js';
import { createFixture } from '../helpers/fixtures.js';
import { createAuthService } from '../../src/security/auth-service.js';
import { createMongoSessionStore, hashToken, newToken } from '../../src/security/sessions.js';
import { createApp } from '../../src/app.js';

let mongo: MongoMemoryServer;
let connection: Connection;
let fixture: Awaited<ReturnType<typeof createFixture>>;
const student = { name: 'Harshit Chandak', email: 'harshit@example.com', password: 'Sprint 1 secure password!' };
const bearer = (token: string) => ({ Authorization: 'Bearer ' + token });

beforeAll(async () => {
  // The test server is private, temporary, and never reads MONGODB_URI or drops a user's database.
  mongo = await MongoMemoryServer.create({ instance: { dbName: 'csmq_security_test', launchTimeout: 60_000 } });
  connection = await connectDatabase(mongo.getUri());
  fixture = await createFixture(connection);
});
beforeEach(async () => {
  await fixture.User.deleteMany({});
  await connection.collection('authsessions').deleteMany({});
});
afterAll(async () => {
  await connection?.close();
  await mongo?.stop();
});
async function login() {
  await request(fixture.app).post('/api/auth/register').send(student).expect(201);
  const response = await request(fixture.app).post('/api/auth/login').send({ email: student.email, password: student.password }).expect(200);
  return response.body.token as string;
}

describe('IT-M4-01 / TC-Auth-01..03 MongoDB-backed account integration', () => {
  it('registers, normalizes email, hashes the password, logs in and reads protected context', async () => {
    const registered = await request(fixture.app).post('/api/auth/register').send({ ...student, email: ' HARSHIT@example.com ' }).expect(201);
    expect(registered.body.authenticatedUser.role).toBe('student');
    expect(JSON.stringify(registered.body)).not.toMatch(/password|Hash|token/);
    const stored = await fixture.User.findOne({ email: student.email }).lean();
    expect(stored!.passwordHash).toMatch(/^\$2b\$10\$/);
    expect(stored).not.toHaveProperty('password');
    const response = await request(fixture.app).post('/api/auth/login').send({ email: student.email, password: student.password }).expect(200);
    expect(response.body.token).toHaveLength(43);
    expect(response.headers['cache-control']).toBe('no-store');
    const me = await request(fixture.app).get('/api/auth/me').set(bearer(response.body.token)).expect(200);
    expect(me.body.authenticatedUser.email).toBe(student.email);
    const session = await connection.collection('authsessions').findOne({});
    expect(session!.tokenHash).toBe(hashToken(response.body.token));
    expect(JSON.stringify(session)).not.toContain(response.body.token);
  });
  it('rejects duplicate emails with a controlled response, including a concurrent registration race', async () => {
    const responses = await Promise.all([1, 2].map(() => request(fixture.app).post('/api/auth/register').send(student)));
    expect(responses.map((response) => response.status).sort()).toEqual([201, 409]);
    expect(await fixture.User.countDocuments()).toBe(1);
  });
  it.each([
    { ...student, role: 'admin' }, { ...student, active: true },
    { ...student, passwordHash: 'injected' }, { ...student, email: { $ne: null } },
    { ...student, name: '<script>alert(1)</script>' }, { ...student, password: 'short' }
  ])('rejects malformed data and privilege escalation', async (payload) => {
    const response = await request(fixture.app).post('/api/auth/register').send(payload).expect(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(await fixture.User.countDocuments()).toBe(0);
  });
  it('uses the same error for wrong passwords and unknown or disabled accounts', async () => {
    await login();
    const bad = await request(fixture.app).post('/api/auth/login').send({ email: student.email, password: 'another wrong password' }).expect(401);
    const missing = await request(fixture.app).post('/api/auth/login').send({ email: 'missing@example.com', password: student.password }).expect(401);
    await fixture.User.updateOne({ email: student.email }, { active: false });
    const disabled = await request(fixture.app).post('/api/auth/login').send({ email: student.email, password: student.password }).expect(401);
    expect(bad.body.error).toEqual(missing.body.error);
    expect(disabled.body.error).toEqual(missing.body.error);
  });
  it('revokes only the active session on logout and rejects replay after recreating the app', async () => {
    const first = await login();
    const second = (await request(fixture.app).post('/api/auth/login').send({ email: student.email, password: student.password })).body.token;
    await request(fixture.app).post('/api/auth/logout').set(bearer(first)).expect(204);
    await request(fixture.app).get('/api/auth/me').set(bearer(first)).expect(401);
    const auth = await createAuthService({ accounts: fixture.accounts, sessions: createMongoSessionStore(connection), rounds: 10 });
    const recreated = createApp({ config: fixture.config, auth });
    await request(recreated).get('/api/auth/me').set(bearer(first)).expect(401);
    await request(recreated).get('/api/auth/me').set(bearer(second)).expect(200);
  });
  it('persists sessions across a database reconnect and refuses expired sessions before TTL cleanup', async () => {
    const token = await login();
    const reconnected = await connectDatabase(mongo.getUri());
    try {
      const store = createMongoSessionStore(reconnected);
      expect(await store.findActive(hashToken(token), new Date())).not.toBeNull();
    } finally { await reconnected.close(); }
    await connection.collection('authsessions').updateOne({ tokenHash: hashToken(token) }, { $set: { expiresAt: new Date(Date.now() - 1_000) } });
    await request(fixture.app).get('/api/auth/me').set(bearer(token)).expect(401);
  });
  it('rejects missing, random, malformed and revoked credentials, including query-string tokens', async () => {
    const token = await login();
    await request(fixture.app).get('/api/auth/me').expect(401);
    await request(fixture.app).get('/api/auth/me').query({ token }).expect(401);
    await request(fixture.app).get('/api/auth/me').set(bearer(newToken())).expect(401);
    await expect(fixture.auth.authenticate('bad-token')).rejects.toMatchObject({ status: 401 });
    await expect(fixture.auth.logout('bad-hash')).rejects.toMatchObject({ status: 401 });
    await request(fixture.app).get('/api/auth/me').set(bearer(token + 'x')).expect(401);
  });
  it('rejects deleted or disabled users without waiting for session expiry', async () => {
    const token = await login();
    await fixture.User.updateOne({ email: student.email }, { active: false });
    await request(fixture.app).get('/api/auth/me').set(bearer(token)).expect(401);
    await fixture.User.deleteMany({});
    await request(fixture.app).get('/api/auth/me').set(bearer(token)).expect(401);
  });
  it('rate limits authentication attempts', async () => {
    const limited = createApp({ config: fixture.config, auth: fixture.auth, authLimit: 2 });
    const payload = { email: 'missing@example.com', password: student.password };
    await request(limited).post('/api/auth/login').send(payload).expect(401);
    await request(limited).post('/api/auth/login').send(payload).expect(401);
    const response = await request(limited).post('/api/auth/login').send(payload).expect(429);
    expect(response.body.error.code).toBe('RATE_LIMITED');
  });
});

describe('IT-M4-02/03 / TC-Sec-02/03 teammate route contracts', () => {
  it('protects the upload route before its handler receives multipart bytes', async () => {
    const token = await login();
    await request(fixture.app).post('/api/materials').attach('file', Buffer.from('%PDF-1.4 fixture'), 'test.pdf').expect(401);
    await request(fixture.app).post('/api/materials').set(bearer(newToken())).attach('file', Buffer.from('%PDF-1.4'), 'test.pdf').expect(401);
    const allowed = await request(fixture.app).post('/api/materials').set(bearer(token)).attach('file', Buffer.from('%PDF-1.4 fixture'), 'test.pdf').expect(201);
    expect(allowed.body.reached).toBe('upload');
  });
  it('denies a student at Add Question and allows an administrator; role changes take effect immediately', async () => {
    const token = await login();
    await request(fixture.app).post('/api/questions').set(bearer(token)).send({ role: 'admin' }).expect(403);
    await request(fixture.app).post('/api/questions').expect(401);
    await fixture.User.updateOne({ email: student.email }, { role: 'admin' });
    await request(fixture.app).post('/api/questions').set(bearer(token)).expect(201);
    await fixture.User.updateOne({ email: student.email }, { role: 'student' });
    await request(fixture.app).post('/api/questions').set(bearer(token)).expect(403);
  });
  it('protects the attempt prototype and supplies the student context', async () => {
    const token = await login();
    await request(fixture.app).post('/api/attempts').expect(401);
    await request(fixture.app).post('/api/attempts').set(bearer(token)).expect(201);
    await fixture.User.updateOne({ email: student.email }, { role: 'admin' });
    await request(fixture.app).post('/api/attempts').set(bearer(token)).expect(403);
  });
});
