export type Role = 'student' | 'admin';

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Account extends AuthenticatedUser {
  passwordHash: string;
  active: boolean;
}

/** Member 1 adapts their User model to this interface; no feature schema is duplicated. */
export interface AccountRepository {
  findById(id: string): Promise<Account | null>;
  findByEmail(email: string): Promise<Account | null>;
  createStudent(input: { name: string; email: string; passwordHash: string }): Promise<Account>;
}

export interface SessionRecord {
  tokenHash: string;
  userId: string;
  expiresAt: Date;
}

export interface SessionStore {
  create(session: SessionRecord): Promise<void>;
  findActive(tokenHash: string, now: Date): Promise<SessionRecord | null>;
  revoke(tokenHash: string): Promise<void>;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      authSession?: { tokenHash: string };
      requestId?: string;
    }
  }
}
