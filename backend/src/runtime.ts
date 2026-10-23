import type { Connection } from 'mongoose';
import type { Config } from './config.js';
import { createApp, type FeatureRouters } from './app.js';
import { createMongoAccountRepository } from './repositories/mongo-account-repository.js';
import { createMaterialUpload } from './materials/upload.js';
import { createAuthService } from './security/auth-service.js';
import { createMongoSessionStore } from './security/sessions.js';
import type { SafeLogger } from './errors.js';

import { createQuestionsRouter } from './questions/router.js';

export async function createRuntime(connection: Connection, config: Config, options: {
  logger?: SafeLogger; authLimit?: number; features?: Pick<FeatureRouters, 'questions' | 'attempts'>;
} = {}) {
  const accounts = createMongoAccountRepository(connection);
  const materials = createMaterialUpload(connection, config.MAX_UPLOAD_BYTES);
  const sessions = createMongoSessionStore(connection);
  const questions = createQuestionsRouter(connection);
  await Promise.all([accounts.initialize(), materials.initialize(), sessions.initialize(), questions.initialize()]);
  const auth = await createAuthService({
    accounts: accounts.accounts, sessions, rounds: config.BCRYPT_ROUNDS, ttlMinutes: config.SESSION_TTL_MINUTES
  });
  const app = createApp({
    config, auth, authLimit: options.authLimit,
    features: {
      materials: materials.router,
      questions: options.features?.questions ?? questions.router,
      ...options.features
    },
    databaseReady: () => connection.readyState === 1, logger: options.logger
  });
  return { app, accounts, materials, sessions, auth, questions };
}
