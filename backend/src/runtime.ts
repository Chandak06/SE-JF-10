import type { Connection } from 'mongoose';
import type { Config } from './config.js';
import { createApp, type FeatureRouters } from './app.js';
import { createMongoAccountRepository } from './repositories/mongo-account-repository.js';
import { createMaterialUpload } from './materials/upload.js';
import { createAuthService } from './security/auth-service.js';
import { createMongoSessionStore } from './security/sessions.js';
import type { SafeLogger } from './errors.js';
import { createModerationRouter, type ModerationResources } from './admin/moderation.js';
import { createQuestionsRouter } from './questions/router.js';
import { createQuizzesRouter } from './quizzes/router.js';

export async function createRuntime(connection: Connection, config: Config, options: {
  logger?: SafeLogger;
  authLimit?: number;
  features?: Pick<FeatureRouters, 'questions' | 'quizQuestions' | 'attempts' | 'quizzes'>;
  moderation?: Pick<ModerationResources, 'questions' | 'quizzes'>;
} = {}) {
  const accounts = createMongoAccountRepository(connection);
  const materials = createMaterialUpload(connection, config.MAX_UPLOAD_BYTES);
  const sessions = createMongoSessionStore(connection);
  const questions = createQuestionsRouter(connection);
  const quizzes = createQuizzesRouter(connection);
  await Promise.all([accounts.initialize(), materials.initialize(), sessions.initialize(), questions.initialize(), quizzes.initialize()]);
  const auth = await createAuthService({
    accounts: accounts.accounts, sessions, rounds: config.BCRYPT_ROUNDS, ttlMinutes: config.SESSION_TTL_MINUTES
  });
  const app = createApp({
    config, auth, authLimit: options.authLimit,
    features: {
      materials: materials.router,
      questions: options.features?.questions ?? questions.router,
      quizQuestions: options.features?.quizQuestions ?? questions.studentRouter,
      quizzes: options.features?.quizzes ?? quizzes.router,
      ...options.features,
      admin: createModerationRouter({ materials: materials.moderation, questions: questions.moderation, ...options.moderation })
    },
    databaseReady: () => connection.readyState === 1, logger: options.logger
  });
  return { app, accounts, materials, sessions, auth, questions, quizzes };
}
