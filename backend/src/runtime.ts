

import type { Connection } from 'mongoose';
import type { Config } from './config.js';

import { createApp, type FeatureRouters } from './app.js';

import { createMongoAccountRepository } from './repositories/mongo-account-repository.js';

import { createMaterialUpload } from './materials/upload.js';

import { createAuthService } from './security/auth-service.js';
import { createMongoSessionStore } from './security/sessions.js';

import type { SafeLogger } from './errors.js';

import { createQuestionsRouter } from './questions/router.js';

// CSMQ-40: Quiz Attempt API integration
import { createAttemptRouter } from './attempts/router.js';
import { createMongoAttemptRepository } from './attempts/mongo-repository.js';

export async function createRuntime(
  connection: Connection,
  config: Config,
  options: {
    logger?: SafeLogger;
    authLimit?: number;
    features?: Pick<
      FeatureRouters,
      'questions' | 'quizQuestions' | 'attempts'
    >;
  } = {}
) {
  // Initialize existing repositories and services
  const accounts = createMongoAccountRepository(connection);

  const materials = createMaterialUpload(
    connection,
    config.MAX_UPLOAD_BYTES
  );

  const sessions = createMongoSessionStore(connection);

  const questions = createQuestionsRouter(connection);

  // CSMQ-40: Initialize Quiz Attempt repository
  const attemptRepository = createMongoAttemptRepository(
    connection
  );

  // CSMQ-40: Create the production Quiz Attempt router
  const attempts = createAttemptRouter(attemptRepository);

  // Initialize database models and required indexes
  await Promise.all([
    accounts.initialize(),
    materials.initialize(),
    sessions.initialize(),
    questions.initialize()
  ]);

  // Initialize existing authentication service
  const auth = await createAuthService({
    accounts: accounts.accounts,
    sessions,
    rounds: config.BCRYPT_ROUNDS,
    ttlMinutes: config.SESSION_TTL_MINUTES
  });

  // Create application and register routes
  const app = createApp({
    config,
    auth,
    authLimit: options.authLimit,

    features: {
      // Existing material management
      materials: materials.router,

      // Existing administrator question management
      questions:
        options.features?.questions ?? questions.router,

      // Existing student-safe question access
      quizQuestions:
        options.features?.quizQuestions ??
        questions.studentRouter,

      // CSMQ-40: Real Quiz Attempt submission API
      attempts:
        options.features?.attempts ?? attempts,

      // Preserve feature overrides for testing
      ...options.features
    },

    databaseReady: () => connection.readyState === 1,

    logger: options.logger
  });

  return {
    app,
    accounts,
    materials,
    sessions,
    auth,
    questions
  };
}
