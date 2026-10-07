import express from 'express';
import request from 'supertest';
import { describe, it, expect, vi } from 'vitest';
import { z } from 'zod';
import { AppError, errorHandler } from '../../src/errors.js';
import { requireAuth, requireRole } from '../../src/middleware/auth.js';
import { validateBody } from '../../src/middleware/validation.js';
import { createApp } from '../../src/app.js';
import { loadConfig } from '../../src/config.js';
import type { AuthService } from '../../src/security/auth-service.js';

const user = { id: 'u1', name: 'Student', email: 's@example.com', role: 'student' as const };
const token = 'a'.repeat(43);

describe('UT-M4-02 through UT-M4-06 shared middleware', () => {
  function appForAuth(auth: Partial<AuthService>, role?: 'admin' | 'student') {
    const app = express();
    app.get('/', requireAuth(auth as AuthService), ...(role ? [requireRole(role)] : []),
      (req, res) => res.json({ user: req.user }));
    app.use(errorHandler());
    return app;
  }
  it('attaches only the authenticated user context', async () => {
    const authenticate = vi.fn().mockResolvedValue({ user, tokenHash: 'h' });
    const response = await request(appForAuth({ authenticate })).get('/').set('Authorization', 'Bearer ' + token);
    expect(response.status).toBe(200);
    expect(response.body.user).toEqual(user);
    expect(authenticate).toHaveBeenCalledWith(token);
  });
  it.each(['', 'Basic abc', 'Bearer invalid', 'Bearer ' + token + ', Bearer ' + token])('rejects malformed credentials %s', async (header) => {
    const authenticate = vi.fn();
    const response = await request(appForAuth({ authenticate })).get('/').set('Authorization', header);
    expect(response.status).toBe(401);
    expect(authenticate).not.toHaveBeenCalled();
  });
  it('rejects a missing user even when the role guard is mounted alone', async () => {
    const app = express().get('/', requireRole('admin'), (_req, res) => res.sendStatus(200));
    app.use(errorHandler());
    expect((await request(app).get('/')).status).toBe(401);
  });
  it('allows administrators and forbids students', async () => {
    const authenticate = vi.fn().mockResolvedValue({ user, tokenHash: 'h' });
    expect((await request(appForAuth({ authenticate }, 'admin')).get('/').set('Authorization', 'Bearer ' + token)).status).toBe(403);
    authenticate.mockResolvedValue({ user: { ...user, role: 'admin' }, tokenHash: 'h' });
    expect((await request(appForAuth({ authenticate }, 'admin')).get('/').set('Authorization', 'Bearer ' + token)).status).toBe(200);
    expect(() => requireRole()).toThrow();
  });
  it('does not turn a database outage into successful authentication', async () => {
    const authenticate = vi.fn().mockRejectedValue(new Error('passwordHash secret-database-uri'));
    const response = await request(appForAuth({ authenticate })).get('/').set('Authorization', 'Bearer ' + token);
    expect(response.status).toBe(500);
    expect(JSON.stringify(response.body)).not.toMatch(/secret|passwordHash|stack/);
  });
  it('validates values and keeps request data out of errors and logs', async () => {
    const logger = vi.fn();
    const app = express().use(express.json());
    app.post('/', validateBody(z.strictObject({ name: z.string() })), (_req, _res) => {
      throw new Error('private password token correctAnswer');
    });
    app.use(errorHandler(logger));
    const invalid = await request(app).post('/').send({ name: { $ne: null }, password: 'SECRET' });
    expect(invalid.status).toBe(400);
    expect(JSON.stringify(invalid.body)).not.toContain('SECRET');
    const failed = await request(app).post('/').send({ name: 'ok' });
    expect(failed.status).toBe(500);
    expect(logger).toHaveBeenCalledWith({ requestId: undefined, code: 'INTERNAL_ERROR', status: 500 });
  });
  it('maps parsing, oversized JSON, and duplicate key errors to safe messages', async () => {
    const config = loadConfig({ MONGODB_URI: 'mongodb://localhost/csmq' });
    const app = createApp({ config });
    expect((await request(app).post('/').set('Content-Type', 'application/json').send('{"broken":')).status).toBe(400);
    expect((await request(app).post('/').send({ payload: 'x'.repeat(17000) })).status).toBe(413);
    const duplicateApp = express().get('/', () => { throw { code: 11000, keyValue: { password: 'secret' } }; });
    duplicateApp.use(errorHandler());
    const response = await request(duplicateApp).get('/');
    expect(response.status).toBe(409);
    expect(JSON.stringify(response.body)).not.toContain('secret');
  });
  it('preserves safe application errors and delegates when headers have been sent', () => {
    const next = vi.fn();
    errorHandler()(new AppError(400, 'SAFE', 'Safe'), {} as any, { headersSent: true } as any, next);
    expect(next).toHaveBeenCalled();
  });
});

describe('application transport and health', () => {
  const config = loadConfig({ MONGODB_URI: 'mongodb://localhost/csmq' });
  it('reports liveness/readiness independently and returns safe 404s', async () => {
    const app = createApp({ config, databaseReady: () => false });
    expect((await request(app).get('/health')).body.status).toBe('ok');
    expect((await request(app).get('/ready')).status).toBe(503);
    expect((await request(createApp({ config })).get('/ready')).status).toBe(200);
    const response = await request(app).get('/missing');
    expect(response.status).toBe(404);
    expect(response.headers['x-powered-by']).toBeUndefined();
    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-request-id']).toBeTruthy();
  });
  it('uses the configured CORS origin', async () => {
    const response = await request(createApp({ config })).options('/api/auth/login')
      .set('Origin', 'https://evil.example').set('Access-Control-Request-Method', 'POST');
    expect(response.headers['access-control-allow-origin']).toBe(config.CLIENT_ORIGIN);
  });
  it('requires HTTPS in production and refuses spoofed proxy headers by default', async () => {
    const production = { ...config, NODE_ENV: 'production' as const, CLIENT_ORIGIN: 'https://study.example' };
    const response = await request(createApp({ config: production })).post('/api/auth/login').set('X-Forwarded-Proto', 'https');
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('HTTPS_REQUIRED');
    const trusted = createApp({ config: { ...production, TRUST_PROXY: 'loopback' } });
    expect((await request(trusted).get('/api/missing').set('X-Forwarded-Proto', 'https')).status).toBe(404);
  });
  it('refuses to mount unprotected feature routers', () => {
    expect(() => createApp({ config, features: { materials: express.Router() } })).toThrow('require authentication');
  });
});
