// Writes only to an explicitly selected disposable loopback deployment; never loads .env.
import { randomUUID } from 'node:crypto';
if (process.env.RELEASE_SMOKE_CONFIRM !== 'disposable-local') throw new Error('Confirm an isolated disposable local deployment before running this smoke test.');
let base;
try { base = new URL(process.env.RELEASE_SMOKE_URL || 'http://127.0.0.1:8080'); }
catch { throw new Error('Invalid disposable loopback URL.'); }
if (!['http:', 'https:'].includes(base.protocol) || !['localhost', '127.0.0.1'].includes(base.hostname) || base.username || base.password || base.pathname !== '/') throw new Error('Only a credential-free loopback HTTP/HTTPS deployment is permitted.');
async function call(path, options = {}) { return fetch(new URL(path, base), { ...options, signal: AbortSignal.timeout(10_000) }); }
for (let i = 0; i < 60; i++) {
  try { const ready = await call('/ready'); if (ready.ok && (await ready.json()).status === 'ready') break; } catch { /* Bounded startup polling. */ }
  if (i === 59) throw new Error('Disposable deployment did not become ready.');
  await new Promise(resolve => setTimeout(resolve, 1000));
}
const page = await call('/'); if (!page.ok || !(await page.text()).toLowerCase().includes('<!doctype html>')) throw new Error('Frontend build is not served.');
const account = { name: 'Disposable Release Smoke', email: randomUUID() + '@example.test', password: randomUUID() + '!' };
const post = body => ({ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
const registered = await call('/api/auth/register', post(account));
if (registered.status !== 201 || (await registered.json()).authenticatedUser.role !== 'student') throw new Error('Registration through gateway failed.');
const login = await call('/api/auth/login', post({ email: account.email, password: account.password }));
if (login.status !== 200) throw new Error('Login through gateway failed.');
const session = await login.json(); const headers = { Authorization: 'Bearer ' + session.token };
if ((await call('/api/auth/me', { headers })).status !== 200) throw new Error('Session was not accepted.');
if ((await call('/api/admin/resources', { headers })).status !== 403) throw new Error('Student Admin access was not denied.');
if ((await call('/api/auth/logout', { method: 'POST', headers })).status !== 204) throw new Error('Logout failed.');
if ((await call('/api/auth/me', { headers })).status !== 401) throw new Error('Revoked session was accepted.');
console.info('Disposable local release smoke passed: frontend, readiness, registration/login, RBAC and logout.');
