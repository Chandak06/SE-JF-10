import 'dotenv/config';
import { createApp } from './app.js';
import { loadConfig } from './config.js';
import { connectDatabase } from './db.js';
import { createMongoAccountRepository } from './repositories/mongo-account-repository.js';
import { createAuthService } from './security/auth-service.js';
import { createMongoSessionStore } from './security/sessions.js';

try {
  const config = loadConfig();
  const connection = await connectDatabase(config.MONGODB_URI);

  const accountRepository = createMongoAccountRepository(connection);
  await accountRepository.initialize();

  const sessions = createMongoSessionStore(connection);
  await sessions.initialize();

  const auth = await createAuthService({
    accounts: accountRepository.accounts,
    sessions,
    rounds: config.BCRYPT_ROUNDS,
    ttlMinutes: config.SESSION_TTL_MINUTES
  });

  const app = createApp({
    config,
    auth,
    databaseReady: () => connection.readyState === 1,
    logger: (event) => console.error(JSON.stringify(event))
  });

  const server = app.listen(config.PORT, () => {
    console.info(`Backend listening on port ${config.PORT}.`);
  });

  const shutdown = (exitCode = 0) => {
    const timeout = setTimeout(() => process.exit(1), 10_000);
    timeout.unref();

    server.close(() => {
      void connection.close().then(
        () => process.exit(exitCode),
        () => process.exit(1)
      );
    });
  };

  process.once('SIGINT', () => shutdown());
  process.once('SIGTERM', () => shutdown());

  server.on('error', () => {
    console.error('HTTP server failed to start.');
    shutdown(1);
  });
} catch {
  console.error(
    'Backend startup failed. Check environment configuration and MongoDB availability.'
  );
  process.exit(1);
}