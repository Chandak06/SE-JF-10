// Execute the real test reporters, then print their output. No authored report body.
import { spawn, execFileSync } from 'node:child_process';
import { createWriteStream } from 'node:fs';
import { access, cp, mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { dirname, extname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { PDFDocument } from 'pdf-lib';
import { chromium } from '../frontend/node_modules/playwright/index.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
const source = git('rev-parse', 'HEAD');
if (git('status', '--porcelain', '--untracked-files=no')) throw new Error('Commit tracked source changes before execution.');
if (Number(process.versions.node.split('.')[0]) !== 24 || Number(process.versions.node.split('.')[1]) < 15) throw new Error('Use Node >=24.15 <25.');
const date = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
const runId = date + '-native-tool-reports';
const work = join(root, '.local', runId);
const native = join(work, 'native');
const published = join(root, 'docs/testing', runId);
const python = process.env.REPORT_PYTHON ?? (process.platform === 'win32' ? 'python' : 'python3');
const npmCli = process.env.npm_execpath;
if (!npmCli) throw new Error('Start with npm run reports:native.');
const exportOnly = process.argv.includes('--export-only');
if (process.argv.slice(2).some(a=>a!=='--export-only')) throw new Error('Only --export-only is supported.');
const env = { ...process.env, PATH: dirname(process.execPath) + (process.platform === 'win32' ? ';' : ':') + process.env.PATH,
  PYTHONPATH: join(root, '.local/report-tools') + (process.env.PYTHONPATH ? (process.platform === 'win32' ? ';' : ':') + process.env.PYTHONPATH : '') };
for (const path of [work, published]) {
  if (exportOnly && path===work) continue;
  try { await access(path); throw new Error('Run already exists: ' + path); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
}
await mkdir(native, { recursive: true });
const previous = exportOnly ? JSON.parse(await readFile(join(work,'execution.json'),'utf8')) : null;
if (previous && previous.source!==source) throw new Error('Cannot export a different execution source.');
const steps = previous?.steps ?? [];
async function command(name, executable, args, display) {
  const startedUtc = new Date().toISOString();
  const log = createWriteStream(join(work, name + '.log'));
  console.log('Running ' + display);
  const exitCode = await new Promise((accept, reject) => {
    const child = spawn(executable, args, { cwd: root, env, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
    child.stdout.pipe(log, { end: false }); child.stderr.pipe(log, { end: false });
    child.once('error', reject);
    child.once('close', code => log.end(() => accept(code ?? 1)));
  });
  steps.push({ command: display, startedUtc, finishedUtc: new Date().toISOString(), exitCode, log: name + '.log' });
  await writeFile(join(work, 'execution.json'), JSON.stringify({ source, date, node:process.version, steps }, null, 2));
  console.log((exitCode ? 'FAIL ' : 'PASS ') + display);
  return exitCode;
}
const npm = (name, args) => command(name, process.execPath, [npmCli, ...args], 'npm ' + args.join(' '));
if (!exportOnly) {
  await npm('backend', ['run', 'test:coverage']);
  await npm('backend-unit', ['run', 'test:unit', '--', '--reporter=default', '--reporter=junit', '--outputFile=reports/unit-junit.xml']);
  await npm('frontend', ['run', 'test:coverage', '--prefix', 'frontend']);
  await npm('browser', ['run', 'test:browser', '--prefix', 'frontend']);
  await npm('submitted', ['run', 'check:submitted']);
}
if (steps.at(-1).exitCode || git('rev-parse', 'HEAD') !== source || git('status', '--porcelain', '--untracked-files=no')) throw new Error('Source/baseline guard failed. Raw execution retained.');

for (const [from, to] of [
  ['reports/junit.xml','backend/junit.xml'], ['reports/unit-junit.xml','backend/unit-junit.xml'],
  ['frontend/reports/junit.xml','frontend/junit.xml'], ['frontend/reports/browser-junit.xml','browser/junit.xml'],
  ['frontend/reports/browser-results.json','browser/results.json'],
  ['coverage','backend/coverage'], ['frontend/coverage','frontend/coverage'],
  ['frontend/playwright-report','browser/playwright-report'],
]) { if (!exportOnly) {await mkdir(dirname(join(native, to)), {recursive:true}); await cp(join(root, from), join(native, to), {recursive:true});} }
const xmlCounts = JSON.parse(execFileSync(python, ['-c', `import json,sys,xml.etree.ElementTree as E
result={}
for f in sys.argv[1:]:
 cases=list(E.parse(f).getroot().iter('testcase'))
 result[f]={'executed':len(cases),'failed':sum(c.find('failure') is not None or c.find('error') is not None for c in cases),'skipped':sum(c.find('skipped') is not None for c in cases)}
print(json.dumps(result))`, ...['backend/junit.xml','backend/unit-junit.xml','frontend/junit.xml','browser/junit.xml'].map(p=>join(native,p))], {cwd:root,env,encoding:'utf8'}));
const browserData = JSON.parse(await readFile(join(native, 'browser/results.json'), 'utf8'));
if (browserData.config.metadata.frontendMode !== 'production-build' || browserData.config.metadata.timingLimitMs !== 3000) throw new Error('Unexpected browser environment.');
for (const layer of ['backend','frontend','browser']) {
  const file = layer === 'backend' ? 'unit-junit.xml' : 'junit.xml';
  if (await command(layer+'-html', python, ['-m','junit2htmlreport',join(native,layer,file),join(native,layer,'test-report.html')], 'python -m junit2htmlreport '+layer+'/'+file+' '+layer+'/test-report.html')) throw new Error('JUnit presentation conversion failed.');
}

// Serve only the isolated report tree, never the repository or its configuration.
const types = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.zip':'application/zip'};
const server = createServer(async (req, res) => {
  try {
    const path = resolve(native, '.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
    if (!path.startsWith(native + sep) || !['GET','HEAD'].includes(req.method)) { res.writeHead(403).end(); return; }
    const file = (await stat(path)).isDirectory() ? join(path,'index.html') : path;
    res.setHeader('Content-Type',types[extname(file)] ?? 'application/octet-stream');
    res.end(req.method==='HEAD' ? undefined : await readFile(file));
  } catch { res.writeHead(404).end(); }
});
await new Promise(accept => server.listen(0,'127.0.0.1',accept));
const base = 'http://127.0.0.1:' + server.address().port;
const browser = await chromium.launch({headless:true,channel:'chrome'});
const staging = join(work,'pdfs'); await mkdir(staging);
const parts = [];
async function print(relativePath, label, playwright = false) {
  const page = await browser.newPage({viewport:{width:1440,height:1000},colorScheme:'light'});
  try {
    await page.goto(base+'/'+relativePath.split('/').map(encodeURIComponent).join('/'),{waitUntil:'networkidle'});
    if (playwright) {
      await page.waitForFunction(()=>document.body.innerText.includes('All') && document.body.innerText.includes('Passed'),{},{timeout:30000});
      // Expand native report file groups; no outcomes/text are rewritten.
      const collapsed = page.locator('button[aria-expanded="false"]');
      for (let i=0;i<100 && await collapsed.count();i++) await collapsed.first().click();
    }
    await page.emulateMedia({media:'print'});
    await page.addStyleTag({content:'html,body{height:auto!important;overflow:visible!important} [class*="scroll"],main{overflow:visible!important;max-height:none!important} *{print-color-adjust:exact!important}'});
    const path = join(staging, 'part-'+parts.length+'.pdf');
    await page.pdf({path,format:'A4',landscape:true,printBackground:true,displayHeaderFooter:true,
      headerTemplate:'<div style="font:8px Arial;width:100%;padding:0 12mm">'+label+' | '+date+' | '+source.slice(0,12)+'</div>',
      footerTemplate:'<div style="font:8px Arial;width:100%;text-align:right;padding:0 12mm">Page <span class="pageNumber"></span> / <span class="totalPages"></span></div>',
      margin:{top:'13mm',bottom:'13mm',left:'9mm',right:'9mm'}});
    parts.push(path); return path;
  } finally {await page.close();}
}
async function combine(paths, filename) {
  const pdf = await PDFDocument.create();
  for (const path of paths) {const sourcePdf=await PDFDocument.load(await readFile(path));const pages=await pdf.copyPages(sourcePdf,sourcePdf.getPageIndices());pages.forEach(p=>pdf.addPage(p));}
  pdf.setTitle(filename.replaceAll('_',' ').replace('.pdf','')); pdf.setProducer('Native test HTML printed by Chromium; combined with pdf-lib');
  const bytes = await pdf.save(); if (bytes.length>=10000000) throw new Error('Form size limit exceeded: '+filename);
  const target=join(staging,filename); await writeFile(target,bytes); return {file:filename,bytes:bytes.length,pages:pdf.getPageCount(),sha256:createHash('sha256').update(bytes).digest('hex')};
}
async function indexes(path) {
  const result=[];
  for (const entry of await readdir(path,{withFileTypes:true})) {
    if (entry.isDirectory() && entry.name!=='lcov-report') result.push(...await indexes(join(path,entry.name)));
    else if (entry.name==='index.html') result.push(join(path,entry.name));
  }
  return result.sort((a,b)=>a.split(sep).length-b.split(sep).length || a.localeCompare(b));
}
const outputs=[];
try {
  outputs.push(await combine([
    await print('backend/test-report.html','Backend unit/module tests - Vitest JUnit rendered by junit2html'),
    await print('frontend/test-report.html','Frontend component/service/integration tests - Vitest JUnit rendered by junit2html')
  ],'Unit_Test_Report.pdf'));
  outputs.push(await combine([
    await print('browser/playwright-report/index.html','System tests - native Playwright HTML report',true),
    await print('browser/test-report.html','All system cases - native Playwright JUnit rendered by junit2html')
  ],'System_Validation_Report.pdf'));
  const coverage=[];
  for (const layer of ['backend','frontend']) for (const index of await indexes(join(native,layer,'coverage'))) {
    coverage.push(await print(relative(native,index).split(sep).join('/'),layer+' - native V8/Istanbul code AND branch coverage'));
  }
  outputs.push(await combine(coverage,'Code_and_Branch_Coverage_Report.pdf'));
} finally {await browser.close();server.closeAllConnections();await new Promise(accept=>server.close(accept));}
const metadata={date,source,node:process.version,steps,xmlCounts,browserStatistics:browserData.stats,browserEnvironment:browserData.config.metadata,outputs,
  format:'Tool-generated JUnit/Playwright/Istanbul output only; JUnit HTML conversion and browser printing do not generate test outcomes.',
  converter:'junit2html 31.1.4',uniquePlannedInvocations:Object.entries(xmlCounts).filter(([p])=>!p.endsWith('unit-junit.xml')).reduce((n,[,c])=>n+c.executed,0),backendUnitRerun:'The separate backend unit command re-executes an existing subset; it is not added to the whole-project unique invocations.'};
await writeFile(join(native,'execution.json'),JSON.stringify(metadata,null,2));
for (const step of steps) await cp(join(work,step.log),join(native,step.log));
await mkdir(published,{recursive:true});
execFileSync(python,['-c',`from pathlib import Path
from zipfile import ZipFile,ZIP_DEFLATED
import sys
root=Path(sys.argv[1])
with ZipFile(sys.argv[2],'w',ZIP_DEFLATED) as z:
 for p in sorted(root.rglob('*')):
  if p.is_file(): z.write(p,p.relative_to(root))`,native,join(published,'native-reports.zip')],{cwd:root,env});
await writeFile(join(published,'execution.json'),JSON.stringify(metadata,null,2));
for (const output of outputs) await cp(join(staging,output.file),join(root,'docs/submission',output.file));
console.log(JSON.stringify(metadata,null,2));
process.exitCode=steps.some(s=>s.exitCode)?1:0;
