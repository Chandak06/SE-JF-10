import { describe, it, expect } from 'vitest';
import { loadConfig } from '../../src/config.js';

describe('environment configuration', () => {
  const base = { MONGODB_URI: 'mongodb://127.0.0.1/csmq' };
  it('loads development defaults and validates a production HTTPS origin', () => {
    expect(loadConfig(base)).toMatchObject({ PORT: 5000, BCRYPT_ROUNDS: 12, SESSION_TTL_MINUTES: 60 });
    expect(loadConfig({ ...base, NODE_ENV: 'production', CLIENT_ORIGIN: 'https://study.example' }).NODE_ENV).toBe('production');
  });
  it.each([
    {}, { PORT: '0' }, { PORT: 'invalid' }, { BCRYPT_ROUNDS: '4' },
    { SESSION_TTL_MINUTES: '0' }, { CLIENT_ORIGIN: 'https://study.example/path' },
    { CLIENT_ORIGIN: 'ftp://study.example' }, { TRUST_PROXY: 'true' }, { TRUST_PROXY: '1' },
    { NODE_ENV: 'production' }, { MONGODB_URI: 'invalid-secret-credential' }
  ])('fails closed on invalid configuration %j', (override) => {
    const input = Object.keys(override).length ? { ...base, ...override } : {};
    expect(() => loadConfig(input)).toThrow('Invalid environment configuration');
    try { loadConfig(input); } catch (error) {
      expect(String(error)).not.toContain('invalid-secret-credential');
    }
  });
});
