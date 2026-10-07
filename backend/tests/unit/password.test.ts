import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword, isValidPassword } from '../../src/security/password.js';

describe('UT-M4-01 / TC-Sec-01 password hashing', () => {
  it('uses independently salted hashes and verifies only the correct password', async () => {
    const password = 'a strong password 2026';
    const first = await hashPassword(password, 10);
    const second = await hashPassword(password, 10);
    expect(first).not.toBe(password);
    expect(first).not.toBe(second);
    expect(await verifyPassword(password, first)).toBe(true);
    expect(await verifyPassword('an incorrect password', first)).toBe(false);
  });
  it.each(['', 'short', 'x'.repeat(73), '🔒'.repeat(19), 'valid-length\0password'])('rejects invalid input %j', async (value) => {
    await expect(hashPassword(value, 10)).rejects.toMatchObject({ status: 400 });
  });
  it('accepts exactly 72 bytes and never silently truncates multibyte passwords', async () => {
    const password = '🔒'.repeat(18);
    expect(isValidPassword(password)).toBe(true);
    const hash = await hashPassword(password, 10);
    expect(await verifyPassword(password, hash)).toBe(true);
    expect(await verifyPassword(password + 'x', hash)).toBe(false);
  });
  it.each([0, 4, 9, 15, 10.5])('rejects unsafe cost %s', async (rounds) => {
    await expect(hashPassword('valid password 123', rounds)).rejects.toThrow('Bcrypt cost');
  });
  it.each([null, {}, '$2b$10$garbage', '$2b$31$' + 'a'.repeat(53)])('handles invalid stored hashes safely', async (hash) => {
    expect(await verifyPassword('valid password 123', hash)).toBe(false);
  });
  it('does not coerce non-string input', async () => {
    expect(await verifyPassword({ $ne: null }, 'hash')).toBe(false);
  });
});
