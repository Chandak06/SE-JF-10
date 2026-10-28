import type { Connection } from 'mongoose';
import { getUserModel } from '../models/user.js';
import { registerSchema } from '../middleware/validation.js';
import { hashPassword } from './password.js';

export class AdminProvisioningError extends Error {}

export function readAdminProvisioningInput(env: NodeJS.ProcessEnv) {
  // Explicit confirmation is separate from merely loading a configured database URI.
  if (!['development', 'test'].includes(env.NODE_ENV ?? 'development')
    || env.ADMIN_PROVISION_CONFIRM !== (env.NODE_ENV ?? 'development')) {
    throw new AdminProvisioningError('Provisioning requires development/test mode and matching ADMIN_PROVISION_CONFIRM. Production provisioning is disabled.');
  }
  const result = registerSchema.safeParse({
    name: env.ADMIN_NAME?.trim() || 'Administrator', email: env.ADMIN_EMAIL, password: env.ADMIN_PASSWORD
  });
  if (!result.success) throw new AdminProvisioningError('Set a valid ADMIN_EMAIL, ADMIN_PASSWORD and optional ADMIN_NAME. Password must be at least 12 characters and at most 72 UTF-8 bytes.');
  return result.data;
}

/** Trusted CLI setup only. Never expose this operation through public registration. */
export async function provisionAdmin(connection: Connection, input: unknown, rounds = 12) {
  const result = registerSchema.safeParse(input);
  if (!result.success) throw new AdminProvisioningError('Invalid administrator details.');
  const { name, email, password } = result.data;
  const User = getUserModel(connection);
  await User.init(); // Enforce unique email even when two provisioning processes race.
  async function existingAccount() {
    const existing = await User.findOne({ email }).lean();
    if (!existing) return null;
    if (existing.role !== 'admin') throw new AdminProvisioningError('Email belongs to a Student. Choose a separate administrator email; no account was changed.');
    if (!existing.active) throw new AdminProvisioningError('Administrator is disabled. Use a separately authorized recovery process; no account was changed.');
    return { status: 'already-exists' as const };
  }
  const existing = await existingAccount();
  if (existing) return existing;
  const passwordHash = await hashPassword(password, rounds);
  try {
    await User.create({ name, email, passwordHash, role: 'admin', active: true });
    return { status: 'created' as const };
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000) {
      const concurrent = await existingAccount();
      if (concurrent) return concurrent;
    }
    throw new AdminProvisioningError('Administrator creation failed; no existing account was overwritten.');
  }
}
