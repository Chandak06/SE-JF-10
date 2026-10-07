import type { RequestHandler } from 'express';
import { AppError, unauthorized } from '../errors.js';
import type { AuthService } from '../security/auth-service.js';
import type { Role } from '../types/security.js';

export function requireAuth(auth: AuthService): RequestHandler {
  return async (req, _res, next) => {
    const match = /^Bearer ([A-Za-z0-9_-]{43})$/i.exec(req.headers.authorization ?? '');
    if (!match?.[1]) throw unauthorized();
    const { user, tokenHash } = await auth.authenticate(match[1]);
    req.user = user;
    req.authSession = { tokenHash };
    next();
  };
}

export function requireRole(...roles: Role[]): RequestHandler {
  if (!roles.length || roles.some((role) => !['admin', 'student'].includes(role))) {
    throw new Error('At least one valid role is required.');
  }
  return (req, _res, next) => {
    if (!req.user) throw unauthorized();
    if (!roles.includes(req.user.role)) throw new AppError(403, 'FORBIDDEN', 'You do not have permission for this action.');
    next();
  };
}
