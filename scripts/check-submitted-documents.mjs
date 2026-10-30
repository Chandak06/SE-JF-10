import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const root = new URL('../', import.meta.url);
const expected = JSON.parse(readFileSync(new URL('docs/evidence/submitted-document-hashes.json', root), 'utf8'));
for (const path of ['SRS.md', 'SAD.pdf', 'TEST_PLAN.md', 'TEST_PLAN.pdf']) {
  const bytes = readFileSync(new URL(path, root));
  // Git may check Markdown out with CRLF on Windows. PDF bytes stay exact.
  const content = path.endsWith('.md') ? bytes.toString('utf8').replace(/\r\n/g, '\n') : bytes;
  const actual = createHash('sha256').update(content).digest('hex');
  if (actual !== expected[path]) throw new Error('Submitted document changed: ' + path);
}
console.info('Submitted SRS, SAD and Test Plan match the frozen baseline.');
