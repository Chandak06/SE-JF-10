import { expect, it } from 'vitest';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const run = promisify(execFile);
it('refuses release smoke writes without explicit disposable-environment confirmation', async () => {
  const error = await run(process.execPath, ['scripts/check-local-release.mjs'], { env: { ...process.env, RELEASE_SMOKE_CONFIRM: '' }, timeout: 5000 }).catch(error => error);
  expect(error.code).toBe(1); expect(error.stderr).toContain('Confirm an isolated disposable local deployment');
});
it('refuses non-loopback release smoke targets without transmitting or printing embedded credentials', async () => {
  const error = await run(process.execPath, ['scripts/check-local-release.mjs'], { env: { ...process.env, RELEASE_SMOKE_CONFIRM: 'disposable-local', RELEASE_SMOKE_URL: 'https://example.invalid' }, timeout: 5000 }).catch(error => error);
  expect(error.code).toBe(1); expect(error.stderr).toContain('Only a credential-free loopback');
});
it('disables the old public-Student promotion shortcut before any database operation', async () => {
  const error = await run(process.execPath, ['scripts/promote-admin.mjs', 'student@example.test', '--confirm'], { timeout: 5000 }).catch(error => error);
  expect(error.code).toBe(1); expect(error.stderr).toContain('legacy promotion command is disabled');
});
