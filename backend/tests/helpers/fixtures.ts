import { Schema, type Connection, type Model } from 'mongoose';
import { Router } from 'express';
import type { Account, AccountRepository } from '../../src/types/security.js';
import { createAuthService } from '../../src/security/auth-service.js';
import { createMongoSessionStore } from '../../src/security/sessions.js';
import { createApp } from '../../src/app.js';
import { loadConfig } from '../../src/config.js';

// Contract fixtures only: these are not the teammates' production models/controllers.
interface FixtureAccount { name: string; email: string; passwordHash: string; role: 'student' | 'admin'; active: boolean }

export async function createFixture(connection: Connection, authLimit = 500) {
  const schema = new Schema<FixtureAccount>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['student', 'admin'], default: 'student' },
    active: { type: Boolean, default: true }
  });
  const User = (connection.models.FixtureUser as Model<FixtureAccount> | undefined) ?? connection.model<FixtureAccount>('FixtureUser', schema);
  await User.init();
  function account(value: (FixtureAccount & { _id: unknown }) | null): Account | null {
    return value ? {
      id: String(value._id), name: value.name, email: value.email, role: value.role,
      active: value.active, passwordHash: value.passwordHash
    } : null;
  }
  const accounts: AccountRepository = {
    async findById(id) { return account(await User.findById(id).lean()); },
    async findByEmail(email) { return account(await User.findOne({ email }).lean()); },
    async createStudent(input) { return account(await User.create({ ...input, role: 'student' }))!; }
  };
  const sessions = createMongoSessionStore(connection);
  await sessions.initialize();
  const auth = await createAuthService({ accounts, sessions, rounds: 10 });
  const materials = Router();
  const questions = Router();
  const attempts = Router();
  // Sentinels prove the guard runs before the feature handler. No PDF/MCQ business logic is claimed.
  materials.post('/', (req, res) => res.status(201).json({ reached: 'upload', userId: req.user!.id }));
  questions.post('/', (_req, res) => res.status(201).json({ reached: 'add-question' }));
  attempts.post('/', (_req, res) => res.status(201).json({ reached: 'attempt' }));
  const config = loadConfig({ MONGODB_URI: 'mongodb://127.0.0.1:27017/fixture', NODE_ENV: 'test' });
  const app = createApp({ config, auth, features: { materials, questions, attempts }, authLimit });
  return { app, auth, accounts, sessions, User, config };
}
