// Execute the whole-project plan and capture actual outcomes before publication.
import { spawn, execFileSync } from 'node:child_process';
import { createWriteStream } from 'node:fs';
import { mkdir, readFile, writeFile, access } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const options = new Map();
for (let index = 2; index < process.argv.length; index += 2) {
  const key = process.argv[index]; const value = process.argv[index + 1];
  if (!['--date', '--label'].includes(key) || !value || options.has(key)) throw new Error('Use --date YYYY-MM-DD --label lowercase-label.');
  options.set(key, value);
}
const date = options.get('--date') ?? new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
const label = options.get('--label') ?? 'whole-project';
if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(label)) throw new Error('Invalid execution date or label.');
if (date !== new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date())) throw new Error('The execution date must be today in Asia/Kolkata; do not fabricate future or backdated runs.');
const runId = date + '-' + label;
const local = join(root, '.local', 'testing-' + runId);
const destination = join(root, 'docs', 'testing', runId);
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
const sha = git('rev-parse', 'HEAD');
if (git('status', '--porcelain', '--untracked-files=no')) throw new Error('Commit tracked source changes before recording a source-linked execution.');
git('ls-files', '--error-unmatch', 'scripts/run-project-testing.mjs', 'frontend/e2e/moderation.spec.ts');
if (Number(process.versions.node.split('.')[0]) !== 24 || Number(process.versions.node.split('.')[1]) < 15) throw new Error('Use supported Node >=24.15 <25.');
const npmCli = process.env.npm_execpath;
if (!npmCli) throw new Error('Start this runner through npm run test:project.');
const python = process.env.PROJECT_TEST_PYTHON ?? (process.platform === 'win32' ? 'python' : 'python3');
await mkdir(join(root, '.local'), { recursive: true });
for (const path of [local, destination]) {
  try { await access(path); throw new Error('Execution already exists: ' + path + '. Choose a new label to preserve evidence.'); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
}
await mkdir(local);
const steps = []; const commands = {};
async function run(name, executable, args, command, allowFailure = false) {
  const log = createWriteStream(join(local, name + '.log'));
  const startedUtc = new Date().toISOString();
  console.log('Running ' + command);
  const code = await new Promise((accept, reject) => {
    const child = spawn(executable, args, { cwd: root, env: process.env, windowsHide: true, stdio: ['ignore','pipe','pipe'] });
    child.stdout.pipe(log, { end: false }); child.stderr.pipe(log, { end: false });
    child.once('error', error => { log.end(); reject(error); });
    child.once('close', result => log.end(() => accept(result ?? 1)));
  });
  const step = { command, startedUtc, finishedUtc: new Date().toISOString(), exitCode: code };
  steps.push(step); commands[command] = code;
  await writeFile(join(local, 'progress.json'), JSON.stringify({ sourceRevision: sha, steps }, null, 2));
  console.log((code === 0 ? 'PASS ' : 'FAIL ') + command);
  if (code !== 0 && !allowFailure) throw new Error('Testing stopped at ' + command + '; raw evidence is retained under ' + local + '. Fix the failure and use a new label.');
  return code;
}
const npmStep = (name, args) => run(name, process.execPath, [npmCli, ...args], 'npm ' + args.join(' '));
await npmStep('backend', ['run','check']);
await npmStep('frontend', ['run','test:coverage','--prefix','frontend']);
await npmStep('lint', ['run','lint','--prefix','frontend']);
await npmStep('build', ['run','demo:build']);
await npmStep('release', ['run','demo:verify']);
await run('report-integrity', python, ['scripts/tests/test_testing_reports.py','-v'], 'python scripts/tests/test_testing_reports.py -v');
const browserExit = await run('browser', process.execPath, [npmCli,'run','test:browser','--prefix','frontend'], 'npm run test:browser --prefix frontend', true);
await run('submitted', process.execPath, ['scripts/check-submitted-documents.mjs'], 'node scripts/check-submitted-documents.mjs');
if (git('rev-parse','HEAD') !== sha || git('status','--porcelain','--untracked-files=no')) throw new Error('Source changed during testing. Evidence retained; publication refused.');

const browserJson = JSON.parse(await readFile(join(root,'frontend/reports/browser-results.json'),'utf8'));
if (browserJson.config.metadata?.frontendMode !== 'production-build' || browserJson.config.metadata?.timingLimitMs !== 3000) throw new Error('Expected compiled production browser evidence with the unchanged 3000 ms limit.');
if (browserExit === 0 && (browserJson.errors.length || browserJson.stats.unexpected || browserJson.stats.flaky || browserJson.stats.skipped)) throw new Error('Browser status and command exit disagree.');
const concurrency = []; const attachments = [];
function visit(suites) {
  for (const suite of suites) {
    for (const spec of suite.specs ?? []) for (const test of spec.tests ?? []) {
      const result = test.results.at(-1);
      if (browserExit === 0 && result?.status !== 'passed') throw new Error('A browser case did not pass: ' + spec.title);
      for (const attachment of result.attachments ?? []) attachments.push({ ...attachment, channel:test.projectName, title:spec.title });
    }
    visit(suite.suites ?? []);
  }
}
visit(browserJson.suites);
for (const attachment of attachments.filter(a => a.name === 'concurrent-browser-session-results')) {
  const content = attachment.body ? Buffer.from(attachment.body, 'base64').toString('utf8') : await readFile(attachment.path, 'utf8');
  concurrency.push({ channel:attachment.channel, ...JSON.parse(content) });
}
const completeConcurrency = concurrency.length === 3 && new Set(concurrency.map(x=>x.channel)).size === 3 && concurrency.every(x=>x.sessions===10 && x.completed===10 && !x.pageErrors);
if (browserExit === 0 && !completeConcurrency) throw new Error('Ten-user concurrency evidence is incomplete.');
const versions = Object.fromEntries(concurrency.map(row=>[row.channel,row.browser]));
if (Object.keys(versions).length !== 3) {
  const { chromium, firefox } = await import('../frontend/node_modules/playwright/index.mjs');
  for (const [name,type,opts] of [['chrome',chromium,{channel:'chrome'}],['edge',chromium,{channel:'msedge'}],['firefox',firefox,{}]]) {
    if (versions[name]) continue;
    const browser = await type.launch({headless:true,...opts});
    try { versions[name]=browser.version(); } finally { await browser.close(); }
  }
}
const systemTimings = [];
for (const attachment of attachments.filter(a=>['single-user-primary-content-timings','dashboard-single-user-timing'].includes(a.name))) {
  const content = attachment.body ? Buffer.from(attachment.body,'base64').toString('utf8') : await readFile(attachment.path,'utf8');
  const data = JSON.parse(content);
  for (const point of (Array.isArray(data) ? data : [{page:'Admin Dashboard',milliseconds:data.elapsedMs}])) {
    systemTimings.push({channel:attachment.channel,...point});
  }
}
await writeFile(join(local,'browser-versions.json'),JSON.stringify(versions,null,2));
const ci = [];
try {
  const response = await fetch(`https://api.github.com/repos/Chandak06/SE-JF-10/actions/runs?head_sha=${sha}&per_page=30`,{signal:AbortSignal.timeout(15000)});
  if (response.ok) for (const row of (await response.json()).workflow_runs.filter(r=>r.head_sha===sha)) {
    const responseJobs = await fetch(`https://api.github.com/repos/Chandak06/SE-JF-10/actions/runs/${row.id}/jobs?per_page=100`,{signal:AbortSignal.timeout(15000)});
    ci.push({id:row.id,head:row.head_sha,branch:row.head_branch,status:row.status,conclusion:row.conclusion,url:row.html_url,
      jobs: responseJobs.ok ? (await responseJobs.json()).jobs.map(j=>({name:j.name,status:j.status,conclusion:j.conclusion})) : []});
  }
} catch { console.log('Public CI status unavailable; no remote success claimed.'); }
const guards = (await readFile(join(local,'report-integrity.log'),'utf8')).match(/Ran (\d+) tests?/);
const execution = {date,runLabel:label,sourceRevision:sha,commands,steps,projectScope:true,testCaseDocument:'TEST_CASES_WHOLE_PROJECT.md',
  sourceTrees:Object.fromEntries(['backend/src','backend/tests','frontend/src','frontend/e2e','frontend/tests'].map(p=>[p,git('rev-parse',`HEAD:${p}`)])),
  browserConcurrency:completeConcurrency ? concurrency : [],systemTimings,ciForTestedSource:ci,
  browserEnvironment:browserJson.config.metadata,
  observations:['Browser journeys and page-load timings use the compiled production frontend with same-origin API proxying and disposable real MongoDB. The 3000 ms assertion is unchanged. Earlier development-server timing failures remain in their original dated pack.', ...(browserExit ? ['The local browser command returned a nonzero exit. Actual failed/skipped outcomes remain in the catalogue and JUnit; successful CI is separate evidence and does not erase local failures.'] : [])],
  reportIntegrityChecks:{passed:guards ? Number(guards[1]) : null,exitCode:0,scope:'Synthetic publisher fixtures; separate from product tests.'},
  scope:'All four members and all integrated SRS modules. Disposable local MongoDB only; no Atlas or saved-demo mutations. Submitted documents unchanged.'};
await writeFile(join(local,'execution.json'),JSON.stringify(execution,null,2));
const publishArgs = ['scripts/generate-testing-reports.py','--date',date,'--run-label',label,...(browserExit ? ['--include-failures'] : [])];
await run('publish',python,publishArgs,'python ' + publishArgs.join(' '));
console.log('Whole-project report pack: ' + destination);
process.exitCode = browserExit;
