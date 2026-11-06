// Save actual test-tool stdout/stderr as plain UTF-8 text. No authored results.
import { spawn, execFileSync } from 'node:child_process';
import { mkdir, rename, writeFile } from 'node:fs/promises';
import { dirname, join, delimiter, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { StringDecoder } from 'node:string_decoder';
import { stripVTControlCharacters } from 'node:util';

const root = fileURLToPath(new URL('../', import.meta.url));
const verbose = ['--', '--reporter=verbose', '--reporter=junit'];
export const reportPlans = {
  unit: {
    file: 'Unit_Test_Report.txt', title: 'Unit / component test command output',
    steps: [
      ['run', 'test:unit', ...verbose, '--outputFile=reports/unit-junit.xml'],
      ['run', 'test:ci', '--prefix', 'frontend', ...verbose],
    ],
  },
  system: {
    file: 'System_Validation_Report.txt', title: 'Integration / system test command output',
    steps: [
      ['run', 'test:integration', ...verbose, '--outputFile=reports/integration-junit.xml'],
      ['run', 'test:browser', '--prefix', 'frontend'],
    ],
  },
  coverage: {
    file: 'Code_and_Branch_Coverage_Report.txt', title: 'Code and branch coverage command output',
    steps: [
      ['run', 'test:coverage'],
      ['run', 'test:coverage', '--prefix', 'frontend'],
    ],
  },
};

export async function captureCommand({ executable, args, cwd, env = process.env, echo = true }) {
  const chunks = [];
  const stdout = new StringDecoder('utf8');
  const stderr = new StringDecoder('utf8');
  const startedUtc = new Date().toISOString();
  const result = await new Promise(accept => {
    const child = spawn(executable, args, { cwd, env, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
    child.stdout.on('data', buffer => { chunks.push(stdout.write(buffer)); if (echo) process.stdout.write(buffer); });
    child.stderr.on('data', buffer => { chunks.push(stderr.write(buffer)); if (echo) process.stderr.write(buffer); });
    child.on('error', error => chunks.push('\nCOMMAND DID NOT START: ' + error.message + '\n'));
    child.on('close', (code, signal) => accept({ exitCode: code ?? 1, signal }));
  });
  chunks.push(stdout.end(), stderr.end());
  return { ...result, startedUtc, finishedUtc: new Date().toISOString(), output: stripVTControlCharacters(chunks.join('')) };
}

export async function writeTextReport({ target, title, commands, source = 'unavailable', dirty = false, echo = true }) {
  const blocks = [title, 'Source commit: ' + source, 'Tracked source changes: ' + (dirty ? 'yes' : 'no'),
    'Generated from actual command output; test counts in separate commands may overlap.',
    'Frontend test output includes component, service and integration suites.', ''];
  let exitCode = 0;
  for (const command of commands) {
    if (echo) process.stdout.write('\nRunning ' + command.display + '\n');
    const result = await captureCommand({ ...command, echo });
    blocks.push('='.repeat(78), 'COMMAND: ' + command.display, 'Started UTC: ' + result.startedUtc,
      result.output, 'Finished UTC: ' + result.finishedUtc, 'Exit code: ' + result.exitCode,
      ...(result.signal ? ['Signal: ' + result.signal] : []), '');
    if (result.exitCode) exitCode = 1;
  }
  blocks.push('REPORT COMMAND EXIT CODE: ' + exitCode, '');
  await mkdir(dirname(target), { recursive: true });
  // Readers see either the previous complete run or this complete run.
  const temporary = target + '.' + process.pid + '.tmp';
  await writeFile(temporary, blocks.join('\n'), 'utf8');
  await rename(temporary, target);
  return exitCode;
}

async function main() {
  const requested = process.argv.slice(2);
  if (requested.length > 1 || (requested.length && !Object.hasOwn(reportPlans, requested[0]))) {
    throw new Error('Usage: npm run reports:txt [-- unit|system|coverage]');
  }
  const npmCli = process.env.npm_execpath;
  if (!npmCli) throw new Error('Run through the npm scripts in package.json.');
  const env = { ...process.env, NO_COLOR: '1', TERM: 'dumb', npm_config_color: 'false',
    PATH: dirname(process.execPath) + delimiter + process.env.PATH };
  delete env.FORCE_COLOR;
  let source = 'unavailable', dirty = false;
  try {
    source = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8', stdio: ['ignore','pipe','ignore'] }).trim();
    dirty = !!execFileSync('git', ['status', '--porcelain', '--untracked-files=no'], { cwd: root, encoding: 'utf8', stdio: ['ignore','pipe','ignore'] }).trim();
  } catch { /* A source archive without .git can still run its tests. */ }
  for (const key of (requested.length ? requested : Object.keys(reportPlans))) {
    const plan = reportPlans[key];
    const target = join(root, 'reports', 'text', plan.file);
    const code = await writeTextReport({ target, title: plan.title, source, dirty,
      commands: plan.steps.map(args => ({ executable: process.execPath, args: [npmCli, ...args], cwd: root, env, display: 'npm ' + args.join(' ') })) });
    if (code) process.exitCode = 1;
    process.stdout.write('\nSaved ' + target + (code ? ' (contains failed commands)' : '') + '\n');
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
