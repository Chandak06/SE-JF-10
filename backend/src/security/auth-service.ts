import { randomBytes } from 'node:crypto';
import { AppError, invalidCredentials, unauthorized } from '../errors.js';
import type { Account, AccountRepository, AuthenticatedUser, SessionStore } from '../types/security.js';
import { hashPassword, verifyPassword } from './password.js';
import { hashToken, isSessionToken, newToken } from './sessions.js';

export function publicUser(account: Account): AuthenticatedUser {
  return { id: account.id, name: account.name, email: account.email, role: account.role };
}

export async function createAuthService({ accounts, sessions, rounds = 12, ttlMinutes = 60 }: {
  accounts: AccountRepository; sessions: SessionStore; rounds?: number; ttlMinutes?: number;
}) {
  if (!Number.isInteger(ttlMinutes) || ttlMinutes < 1 || ttlMinutes > 1440) throw new Error('Invalid session lifetime.');
  // A missing email still performs a real password comparison to reduce account enumeration.
  const dummyHash = await hashPassword(randomBytes(24).toString('base64url'), rounds);
  return {
    async register(input: { name: string; email: string; password: string }) {
      const account = await accounts.createStudent({
        name: input.name, email: input.email, passwordHash: await hashPassword(input.password, rounds)
      });
      if (account.role !== 'student') throw new Error('Account adapter must create students only.');
      return publicUser(account);
    },
    async login(email: string, password: string) {
      const account = await accounts.findByEmail(email);
      const valid = await verifyPassword(password, account?.passwordHash ?? dummyHash);
      if (!valid || !account || !account.active || !['student', 'admin'].includes(account.role)) throw invalidCredentials();
      const token = newToken();
      const expiresAt = new Date(Date.now() + ttlMinutes * 60_000);
      await sessions.create({ userId: account.id, tokenHash: hashToken(token), expiresAt });
      return { authenticatedUser: publicUser(account), token, expiresAt: expiresAt.toISOString() };
    },
    async authenticate(token: string) {
      if (!isSessionToken(token)) throw unauthorized();
      const tokenHash = hashToken(token);
      const session = await sessions.findActive(tokenHash, new Date());
      if (!session) throw unauthorized();
      const account = await accounts.findById(session.userId);
      // Resolve role from the current account, never from a client-controlled claim.
      if (!account?.active || !['student', 'admin'].includes(account.role)) throw unauthorized();
      return { user: publicUser(account), tokenHash };
    },
    async logout(tokenHash: string) {
      if (!/^[a-f0-9]{64}$/.test(tokenHash)) throw new AppError(401, 'UNAUTHENTICATED', 'Authentication required.');
      await sessions.revoke(tokenHash);
    }
  };
}

export type AuthService = Awaited<ReturnType<typeof createAuthService>>;
