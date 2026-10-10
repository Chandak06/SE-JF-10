import 'dotenv/config';
import { loadConfig } from '../dist/config.js';
import { connectDatabase } from '../dist/db.js';
let connection;
try {
  const config = loadConfig();
  connection = await connectDatabase(config.MONGODB_URI);
  await connection.db.admin().ping();
  console.info('MongoDB connection and authenticated ping passed. No application records were changed.');
} catch {
  console.error('MongoDB connection failed. Check the local URI, Atlas database user and IP access list.');
  process.exitCode = 1;
} finally { await connection?.close(); }
