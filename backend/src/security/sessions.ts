import { createHash, randomBytes } from 'node:crypto';
import { Schema, type Connection, type Model } from 'mongoose';
import type { SessionRecord, SessionStore } from '../types/security.js';

export const newToken = () => randomBytes(32).toString('base64url');
export const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');
export const isSessionToken = (token: string) => /^[A-Za-z0-9_-]{43}$/.test(token);

export function createMongoSessionStore(connection: Connection): SessionStore & { initialize(): Promise<void> } {
  const schema = new Schema<SessionRecord>({
    tokenHash: { type: String, required: true, unique: true },
    userId: { type: String, required: true, index: true },
    expiresAt: { type: Date, required: true, expires: 0 }
  }, { versionKey: false, timestamps: true });
  const Session = (connection.models.AuthSession as Model<SessionRecord> | undefined) ?? connection.model<SessionRecord>('AuthSession', schema);
  return {
    async initialize() { await Session.init(); },
    async create(session) { await Session.create(session); },
    async findActive(tokenHash, now) {
      // TTL cleanup is asynchronous, so authorization MUST also check expiresAt.
      return Session.findOne({ tokenHash, expiresAt: { $gt: now } }).lean<SessionRecord>().exec();
    },
    async revoke(tokenHash) { await Session.deleteOne({ tokenHash }); }
  };
}
