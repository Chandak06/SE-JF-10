import 'dotenv/config';
import { loadConfig } from '../src/config.js';
import { connectDatabase } from '../src/db.js';
import { AdminProvisioningError, provisionAdmin, readAdminProvisioningInput } from '../src/security/provision-admin.js';

let connection: Awaited<ReturnType<typeof connectDatabase>> | undefined;
try {
  const input = readAdminProvisioningInput(process.env); // Refuse before connecting if unauthorized/invalid.
  const config = loadConfig();
  connection = await connectDatabase(config.MONGODB_URI);
  const result = await provisionAdmin(connection, input, config.BCRYPT_ROUNDS);
  console.info(result.status === 'created'
    ? 'Administrator created. Use the existing login page.'
    : 'Administrator already exists. Credentials and account details were not changed.');
} catch (error) {
  console.error(error instanceof AdminProvisioningError ? error.message : 'Provisioning failed. Check local configuration and database availability.');
  process.exitCode = 1;
} finally {
  // Never reflect connection errors, URIs, passwords, hashes or tokens in output.
  try { await connection?.close(); }
  catch { console.error('Database cleanup failed.'); process.exitCode = 1; }
}
