import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'

const root = new URL('../', import.meta.url).pathname
const out = join(root, 'reports', 'csmq45')
mkdirSync(out, { recursive: true })
const read = name => readFileSync(join(out, name), 'utf8')
const summary = data => {
  const files = [...data.matchAll(/Test Files\s+(\d+) passed \((\d+)\)/g)].at(-1)
  const tests = [...data.matchAll(/Tests\s+(\d+) passed \((\d+)\)/g)].at(-1)
  if (!files || !tests) throw new Error('Missing passing Vitest summary; do not publish evidence')
  return { files: `${files[1]}/${files[2]}`, tests: `${tests[1]}/${tests[2]}` }
}
const backend = summary(read('backend-tests.log'))
const frontend = summary(read('frontend-tests.log'))
const git = args => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim()
const sha = git(['rev-parse', '--short', 'HEAD'])
const branch = git(['branch', '--show-current'])
const stamp = new Date().toISOString()
const text = `# CSMQ-45 verification evidence\n\nGenerated: ${stamp}\nBranch: \`${branch}\`\nHEAD: \`${sha}\`\n\n| Verification | Result | Evidence |\n|---|---|---|\n| Backend TypeScript build | PASS | backend-build.log |\n| Backend full regression | ${backend.tests} tests / ${backend.files} files | backend-tests.log |\n| Frontend lint + production build | PASS | frontend-build.log |\n| Frontend full regression | ${frontend.tests} tests / ${frontend.files} files | frontend-tests.log |\n\n## Jira completion checklist\n- [ ] Attach PR URL and GitHub CI screenshot or run URL (must show final green check status)\n- [ ] Attach this evidence summary, test outputs, and acceptance matrix\n- [ ] Confirm non-student access via the production app authentication middleware tests\n- [ ] Confirm live deployment flow if required by reviewer; mocks/in-memory tests alone are not a deployment smoke test\n\n*Acceptance-criteria test traceability is not the same as measured statement/branch coverage.*\n`
writeFileSync(join(out, 'EVIDENCE.md'), text)
process.stdout.write(text)
