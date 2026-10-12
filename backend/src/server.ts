import 'dotenv/config';
import { createRuntime } from './runtime.js';
import { loadConfig } from './config.js';
import { connectDatabase } from './db.js';

try {
  const config = loadConfig();
  const connection = await connectDatabase(config.MONGODB_URI);
  const { app } = await createRuntime(connection, config, {
    logger: (event) => console.error(JSON.stringify(event))
  });
  const server = app.listen(config.PORT, () => {
    console.info(`Backend listening on port ${config.PORT}; authentication and PDF upload are active.`);
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
