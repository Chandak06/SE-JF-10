#!/usr/bin/env bash
# Run from any directory. Validates production builds, acceptance suites and regressions.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
mkdir -p reports/csmq45

echo 'CSMQ-45: backend TypeScript build'
npm run build 2>&1 | tee reports/csmq45/backend-build.log

echo 'CSMQ-45: backend acceptance and full regression suite (run from repo root)'
npx vitest run backend/tests 2>&1 | tee reports/csmq45/backend-tests.log

echo 'CSMQ-45: frontend lint and production build'
(cd frontend && npm run lint && npm run build) 2>&1 | tee reports/csmq45/frontend-build.log

echo 'CSMQ-45: frontend acceptance and full regression suite'
(cd frontend && npx vitest run) 2>&1 | tee reports/csmq45/frontend-tests.log

node scripts/csmq45-evidence.mjs
printf '\nALL CSMQ-45 CHECKS PASSED\n'
printf 'Evidence: reports/csmq45/EVIDENCE.md\n'
