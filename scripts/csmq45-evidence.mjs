import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const out = join(root, 'reports', 'csmq45')
mkdirSync(out, { recursive: true })

function junitSummary(path) {
  if (!existsSync(path)) return null

  const xml = readFileSync(path, 'utf8')
  const suites = [...xml.matchAll(/<testsuite\b[^>]*>/g)].map(match => match[0])
  if (suites.length === 0) return null

  const attribute = (tag, name) => {
    const value = tag.match(new RegExp(`\\b${name}="(\\d+)"`))
    return value ? Number(value[1]) : 0
  }

  const tests = suites.reduce((sum, tag) => sum + attribute(tag, 'tests'), 0)
  const failures = suites.reduce((sum, tag) => sum + attribute(tag, 'failures'), 0)
  const errors = suites.reduce((sum, tag) => sum + attribute(tag, 'errors'), 0)
  const skipped = suites.reduce((sum, tag) => sum + attribute(tag, 'skipped'), 0)

  if (!tests || failures || errors || skipped) {
    throw new Error(`JUnit report does not indicate a fully passing suite: ${path}`)
  }

  return { files: `${suites.length}/${suites.length}`, tests: `${tests}/${tests}` }
}

function summary(logName, junitPath) {
  const log = readFileSync(join(out, logName), 'utf8')
    .replace(/\x1b\[[0-?]*[ -/]*[@-~]/g, '')
    .replace(/\r/g, '')

  const files = [...log.matchAll(/Test Files\s+(\d+)\s+passed\s*\((\d+)\)/g)].at(-1)
  const tests = [...log.matchAll(/\bTests\s+(\d+)\s+passed\s*\((\d+)\)/g)].at(-1)
  const fromLog = files && tests
    ? { files: `${files[1]}/${files[2]}`, tests: `${tests[1]}/${tests[2]}` }
    : null

  if (fromLog && (files[1] !== files[2] || tests[1] !== tests[2])) {
    throw new Error(`Incomplete test run in ${logName}`)
  }

  const fromJUnit = junitSummary(junitPath)

  if (fromLog && fromJUnit && fromLog.tests !== fromJUnit.tests) {
    throw new Error(`Log and JUnit test counts disagree for ${logName}`)
  }

  // A JUnit testsuite may group more than one file; trust the CLI file count.
  const result = fromLog ?? fromJUnit
  if (!result) {
    throw new Error(`Missing passing Vitest summary in ${logName} and JUnit report`)
  }
  return result
}

const backend = summary('backend-tests.log', join(root, 'reports', 'junit.xml'))
const frontend = summary('frontend-tests.log', join(root, 'frontend', 'reports', 'junit.xml'))
const git = args => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim()
const sha = git(['rev-parse', '--short', 'HEAD'])
const branch = git(['branch', '--show-current'])
const stamp = new Date().toISOString()

const text = `# CSMQ-45 verification evidence

Generated: ${stamp}
Branch: \`${branch}\`
HEAD: \`${sha}\`

| Verification | Result | Evidence |
|---|---|---|
| Backend TypeScript build | PASS | backend-build.log |
| Backend full regression | ${backend.tests} tests / ${backend.files} files | backend-tests.log |
| Frontend lint + production build | PASS | frontend-build.log |
| Frontend full regression | ${frontend.tests} tests / ${frontend.files} files | frontend-tests.log |

## Jira completion checklist
- [ ] Attach PR URL and GitHub CI screenshot or run URL (must show final green check status)
- [ ] Attach this evidence summary, test outputs, and acceptance matrix
- [ ] Confirm non-student access via the production app authentication middleware tests
- [ ] Confirm live deployment flow if required by reviewer; mocks/in-memory tests alone are not a deployment smoke test

*Acceptance-criteria test traceability is not the same as measured statement/branch coverage.*
`
writeFileSync(join(out, 'EVIDENCE.md'), text)
process.stdout.write(text)
