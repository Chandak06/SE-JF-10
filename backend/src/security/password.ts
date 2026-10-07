import bcrypt from 'bcryptjs';
import { AppError } from '../errors.js';

export function isValidPassword(password: unknown): password is string {
  return typeof password === 'string' && password.length >= 12
    && Buffer.byteLength(password, 'utf8') <= 72 && !password.includes('\0');
}

export async function hashPassword(password: string, rounds = 12): Promise<string> {
  if (!isValidPassword(password)) {
    throw new AppError(400, 'INVALID_PASSWORD', 'Password must contain at least 12 characters and at most 72 UTF-8 bytes.');
  }
  if (!Number.isInteger(rounds) || rounds < 10 || rounds > 14) {
    throw new Error('Bcrypt cost must be an integer between 10 and 14.');
  }
  return bcrypt.hash(password, rounds);
}

export async function verifyPassword(password: unknown, hash: unknown): Promise<boolean> {
  if (!isValidPassword(password) || typeof hash !== 'string' || !/^\$2[aby]\$(10|11|12|13|14)\$[./A-Za-z0-9]{53}$/.test(hash)) return false;
  return bcrypt.compare(password, hash);
}
