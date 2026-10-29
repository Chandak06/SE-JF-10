import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, join, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { startLocalDemo } from './local-demo.js';

// This check always allocates its own disposable database, never the saved demo.
const root = fileURLToPath(new URL('../../', import.meta.url));
const fixture = await mkdtemp(join(tmpdir(), 'study-commons-release-'));
let demo: Awaited<ReturnType<typeof startLocalDemo>> | undefined;
try {
  demo = await startLocalDemo({
    dataDirectory: resolve(fixture, 'database'),
    frontendDirectory: resolve(root, 'frontend/dist-local-demo'),
    binaryDirectory: resolve(root, 'node_modules/.cache/mongodb-memory-server'), port: 0
  });
  const page = await fetch(demo.url);
  const html = await page.text();
  const assets = [...html.matchAll(/(?:src|href)="(\/assets\/[^"<>]+)"/g)].map(match => match[1]!);
  if (assets.length < 2) throw new Error('Frontend build does not reference compiled assets.');
  for (const path of assets) {
    const asset = await fetch(demo.url + path);
    if (!asset.ok || !Number(asset.headers.get('content-length'))) throw new Error('Compiled asset unavailable.');
  }
  const child = spawn(process.execPath, [resolve(root, 'scripts/check-local-release.mjs')], {
    cwd: root, stdio: 'inherit',
    env: { ...process.env, RELEASE_SMOKE_CONFIRM: 'disposable-local', RELEASE_SMOKE_URL: demo.url }
  });
  await new Promise<void>((res, reject) => {
    child.once('error', reject);
    child.once('exit', code => code === 0 ? res() : reject(new Error('Built local release smoke failed.')));
  });
  console.info('Built local Node demo verified with isolated MongoDB and real frontend assets.');
} catch {
  console.error('Built local demo verification failed. No Atlas or persistent user demo was selected.');
  process.exitCode = 1;
} finally {
  try { await demo?.stop(); }
  finally {
    const child = relative(tmpdir(), fixture);
    if (!child.startsWith('study-commons-release-') || isAbsolute(child) || child.includes('..')) throw new Error('Invalid temporary release cleanup path.');
    await rm(fixture, { recursive: true, force: true });
  }
}
