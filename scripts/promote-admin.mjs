import 'dotenv/config';
import { loadConfig } from '../dist/config.js';
import { connectDatabase } from '../dist/db.js';
import { createMongoAccountRepository } from '../dist/repositories/mongo-account-repository.js';
const email = process.argv[2]?.trim().toLowerCase();
if (!email || process.argv[3] !== '--confirm' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error('Usage: node scripts/promote-admin.mjs EMAIL --confirm (trusted operator only).');
  process.exit(1);
}
let connection;
try {
  connection = await connectDatabase(loadConfig().MONGODB_URI);
  const { User } = createMongoAccountRepository(connection);
  const result = await User.updateOne({ email, active: true }, { $set: { role: 'admin' } });
  if (!result.matchedCount) throw new Error('Account unavailable');
  console.info('Existing active account assigned administrator role. Sign in again to open /admin.');
} catch { console.error('Administrator provisioning failed. Check the existing active account and database connection.'); process.exitCode = 1; }
finally { await connection?.close(); }
