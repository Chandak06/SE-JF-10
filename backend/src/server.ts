import 'dotenv/config';
import { createApp } from './app.js';
import { loadConfig } from './config.js';
import { connectDatabase } from './db.js';
import { createMongoSessionStore } from './security/sessions.js';

try {
  const config = loadConfig();
  const connection = await connectDatabase(config.MONGODB_URI);
  await createMongoSessionStore(connection).initialize();
  // Member 1 supplies their AccountRepository before mounting auth; see docs/INTEGRATION.md.
  // Teammate feature routers are deliberately absent from the shared foundation executable.
  const app = createApp({
    config, databaseReady: () => connection.readyState === 1,
    logger: (event) => console.error(JSON.stringify(event))
  });
  const server = app.listen(config.PORT, () => {
    console.info(`Shared backend listening on port ${config.PORT}; teammate modules require composition.`);
  });
  const shutdown = (exitCode = 0) => {
    const timeout = setTimeout(() => process.exit(1), 10_000);
    timeout.unref();
    server.close(() => { void connection.close().then(() => process.exit(exitCode), () => process.exit(1)); });
  };
  process.once('SIGINT', () => shutdown());
  process.once('SIGTERM', () => shutdown());
  server.on('error', () => { console.error('HTTP server failed to start.'); shutdown(1); });
} catch {
  console.error('Backend startup failed. Check environment configuration and MongoDB availability.');
  process.exit(1);
}
