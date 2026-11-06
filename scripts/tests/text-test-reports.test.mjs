import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { captureCommand, writeTextReport } from '../generate-text-test-reports.mjs';

test('captures both streams, preserves split UTF-8 and strips split terminal escapes', async () => {
  const result = await captureCommand({ executable: process.execPath, echo: false,
    args: ['-e', "process.stdout.write(Buffer.from([0xf0,0x9f]));setTimeout(()=>{process.stdout.write(Buffer.from([0x98,0x80]));process.stdout.write('\\x1b[');setTimeout(()=>{process.stdout.write('32mPASS\\x1b[0m');process.stderr.write('stderr evidence')},20)},20)"],
  });
  assert.equal(result.exitCode, 0);
  assert.match(result.output, /😀PASS/);
  assert.match(result.output, /stderr evidence/);
  assert.ok(!result.output.includes('\x1b'));
});

test('keeps a real nonzero exit and still records subsequent commands', async () => {
  await mkdir('.local/text-report-tests', { recursive: true });
  const folder = await mkdtemp('.local/text-report-tests/run-');
  const target = join(folder, 'report.txt');
  await writeFile(target, 'previous complete report');
  const code = await writeTextReport({ target, title: 'Capture regression', source: 'fixture', echo: false,
    commands: [
      { executable: process.execPath, args: ['-e', "console.error('actual failure');process.exitCode=7"], display: 'failing fixture' },
      { executable: process.execPath, args: ['-e', "console.log('subsequent actual output')"], display: 'next fixture' },
    ],
  });
  const text = await readFile(target, 'utf8');
  assert.equal(code, 1);
  assert.match(text, /actual failure/);
  assert.match(text, /Exit code: 7/);
  assert.match(text, /subsequent actual output/);
  assert.match(text, /REPORT COMMAND EXIT CODE: 1/);
  assert.doesNotMatch(text, /previous complete report/);
});

test('a process that cannot start is recorded as a failure', async () => {
  const result = await captureCommand({ executable: 'missing-report-test-executable-763251', args: [], echo: false });
  assert.notEqual(result.exitCode, 0);
  assert.match(result.output, /COMMAND DID NOT START/);
});
