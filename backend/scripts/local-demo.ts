import { mkdir, access } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import type { Server } from 'node:http';
import express from 'express';
import helmet from 'helmet';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connectDatabase } from '../src/db.js';
import { loadConfig } from '../src/config.js';
import { createRuntime } from '../src/runtime.js';
import { provisionAdmin, readAdminProvisioningInput } from '../src/security/provision-admin.js';

// Explicit local development only: never imports dotenv or uses MONGODB_URI.
export async function startLocalDemo(options: {
  dataDirectory: string; frontendDirectory: string; binaryDirectory: string;
  port: number; administrator?: ReturnType<typeof readAdminProvisioningInput>;
}) {
  await access(resolve(options.frontendDirectory, 'index.html'));
  await mkdir(options.dataDirectory, { recursive: true });
  const mongo = await MongoMemoryServer.create({
    binary: { downloadDir: options.binaryDirectory },
    instance: { dbPath: options.dataDirectory, storageEngine: 'wiredTiger', ip: '127.0.0.1', launchTimeout: 60_000 }
  });
  let connection: Awaited<ReturnType<typeof connectDatabase>> | undefined;
  let server: Server | undefined;
  let stopped = false;
  const stop = async () => {
    if (stopped) return;
    stopped = true;
    try {
      if (server?.listening) {
        const closing = new Promise<void>((res, reject) => server!.close(error => error ? reject(error) : res()));
        server.closeIdleConnections();
        server.closeAllConnections();
        await closing;
      }
    } finally {
      // Windows terminates standalone mongod immediately on SIGINT. Flush all writes
      // before stopping it, so recently created sessions/content survive restart too.
      try { if (connection?.readyState === 1) await connection.db!.admin().command({ fsync: 1 }); }
      finally {
        try { await connection?.close(); }
        finally { await mongo.stop({ doCleanup: false, force: false }); }
      }
    }
  };
  try {
    connection = await connectDatabase(mongo.getUri('study_commons_local_demo'));
    const runtime = await createRuntime(connection, loadConfig({
      NODE_ENV: 'development', MONGODB_URI: mongo.getUri('study_commons_local_demo'),
      CLIENT_ORIGIN: 'http://127.0.0.1:' + options.port
    }));
    if (options.administrator) await provisionAdmin(connection, options.administrator);
    const gateway = express();
    gateway.disable('x-powered-by');
    gateway.use(helmet());
    gateway.use((req, res, next) => {
      if (req.path === '/api' || req.path.startsWith('/api/') || ['/health', '/ready'].includes(req.path)) {
        runtime.app(req, res, next);
      } else next();
    });
    gateway.use(express.static(options.frontendDirectory, { index: false }));
    gateway.use((req, res) => {
      if (req.method === 'GET' && !extname(req.path) && req.accepts('html')) {
        res.set('Cache-Control', 'no-store').sendFile(resolve(options.frontendDirectory, 'index.html'), { dotfiles: 'allow' });
      } else res.sendStatus(404);
    });
    server = gateway.listen(options.port, '127.0.0.1');
    await new Promise<void>((res, reject) => { server!.once('listening', res); server!.once('error', reject); });
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('Local listener unavailable.');
    return { url: 'http://127.0.0.1:' + address.port, stop, connection };
  } catch (error) {
    await stop();
    throw error;
  }
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const root = fileURLToPath(new URL('../../', import.meta.url));
  let demo: Awaited<ReturnType<typeof startLocalDemo>> | undefined;
  try {
    const args = process.argv.slice(2);
    if (!args.includes('--confirm-local-development') || args.some(arg => !['--confirm-local-development', '--provision-admin'].includes(arg))) {
      throw new Error('Explicit local-development selection required.');
    }
    // Validate provisioning before starting MongoDB. No default/demo password or role promotion.
    const administrator = args.includes('--provision-admin')
      ? readAdminProvisioningInput({ ...process.env, NODE_ENV: 'development' }) : undefined;
    demo = await startLocalDemo({
      dataDirectory: resolve(root, '.local/sprint2-demo/database'),
      frontendDirectory: resolve(root, 'frontend/dist-local-demo'),
      binaryDirectory: resolve(root, 'node_modules/.cache/mongodb-memory-server'),
      port: 8080, administrator
    });
    console.info('Local development demo: ' + demo.url + '. Data is saved in .local/sprint2-demo/database.');
    console.info('Atlas is not used. Press Ctrl+C to stop without deleting local data.');
    const shutdown = () => { void demo!.stop().then(() => process.exit(0), () => process.exit(1)); };
    process.once('SIGINT', shutdown);
    process.once('SIGTERM', shutdown);
  } catch {
    console.error('Local demo could not start. Build it first, select --confirm-local-development, check port 8080 and any requested Admin setup. No Atlas configuration is used.');
    await demo?.stop();
    process.exitCode = 1;
  }
}
