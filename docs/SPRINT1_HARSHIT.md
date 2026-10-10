# Harshit Chandak Sprint 1 evidence

USN/branch: PES2UG24CS185. Jira: CSMQ-2 through CSMQ-7. Updated 10 October 2026.

## Scope and reference decisions

Reviewed SRS Markdown/DOCX/PDF, SAD DOCX/PDF, test plan DOCX/PDF, original/updated work division, detailed Sprint 1 plan and faculty announcement. Templates are reference templates. Harshit owns shared backend/security, Member 1 integration support, CI and security/integration evidence. Full moderation, load testing and hosted deployment belong to later sprints.

The updated Jira requirements and October 10 project decision replace Jenkins with GitHub Actions. Original plan cases CI-M4-01/02 are demonstrated through Actions. Dharani's commits through 4cd9299 are integrated with authorship preserved. Their User model/repository and React authentication pages are used directly; there is no duplicate production User model. Harshit added the missing runtime/PDF integration and browser upload/logout support. Question/attempt business implementations remain with Prajwal/Karan.

## Requirement and test mapping

| Jira / plan case | Implementation | Expected and verified behavior |
| --- | --- | --- |
| CSMQ-2 / S1-M4-01 / UT-M4-01 | security/password.ts; models/user.ts | Salted bcrypt only; correct password succeeds, wrong fails; plaintext schema write rejected; 72-byte boundary tested |
| CSMQ-3 / S1-M4-02 / UT-M4-02/03 | middleware/auth.ts; security/sessions.ts | Valid token supplies trusted context; missing/invalid/revoked/expired token returns controlled 401; sessions persist after reconnect |
| CSMQ-4 / S1-M4-03 / UT-M4-04/05 | middleware/auth.ts; app.ts | Administrator allowed; student denied with 403; unauthenticated denied first; current database role rechecked |
| CSMQ-5 / S1-M4-04 / IT-M4-01/03 | runtime.ts; Dharani model/repository; materials/upload.ts; frontend client/materials page | Registration hashes; login authenticates; real PDF bytes/metadata persist; logout revokes; anonymous/replay uploads denied |
| CSMQ-6 / S1-M4-05 / CI-M4-01/02 | .github/workflows/ci.yml | Push/PR checkout, dependencies, backend tests/coverage/build, frontend tests/lint/build, reports/packages; failure stops job |
| CSMQ-7 / S1-M4-06 / UT-M4-06 / IT-M4-02 | backend/tests and frontend tests | Malicious/unknown fields, invalid JSON, duplicate/racing emails, upload type/content/size, extra files, metadata and safe errors |

Code paths are relative to backend/src unless stated otherwise. Eight production runtime cases verify genuine MongoDB account/PDF integration. Question/attempt sentinels verify authorization contracts only, not those teammates' business features.

## Executed checks

- Windows, Node 24.12.0: npm run check passed; 69 backend tests (44 unit, 25 integration). Coverage: 97.43% statements, 97.29% branches, 97.01% functions, 98.43% lines.
- Frontend: 14 tests passed; lint and production build passed. Added tests verify multipart/auth headers, logout handling, expired-token cleanup and upload UI.
- npm run db:check passed against the configured MongoDB Atlas URI. Authenticated ping only; no application records changed or credentials printed.
- Integration tests use disposable MongoDB, never the configured Atlas database. Production flow compares stored PDF bytes and reconnects to verify persistence.
- Dependency audits reported zero vulnerabilities. Frontend dependencies request Node 24.15+; use current Node 24 for development/CI.
- .env is ignored; CI uses isolated MongoDB and requires no Atlas secret.

Reproduce with root npm ci / npm run check, then frontend npm ci / npm run test:ci / npm run lint / npm run build. Reports: reports/junit.xml, coverage HTML/LCOV/summary and frontend/reports/junit.xml. Server entry point and type-only interfaces are excluded from coverage.

## Review evidence and remaining sign-off

Current GitHub Actions execution links will be recorded below. Reports and build packages are downloadable artifacts. Controlled failure uses a separate non-merge branch.

The user elected to open the PR themselves. Independent Member 1 or Member 3 review/cross-testing remains required; self-tests and CI do not constitute peer approval. Do not represent Jira tasks as independently reviewed until sign-off. No later-sprint moderation, full-platform performance, live HTTPS or hosted deployment is claimed.
- Atlas-backed compiled runtime smoke: health/readiness returned 200 and anonymous PDF upload returned 401. Runtime indexes initialized; no application records created.

## GitHub Actions and Jira evidence

- Passing integrated build: https://github.com/Chandak06/SE-JF-10/actions/runs/38062842450 (commit d5d14e7).
- Controlled failure detection: https://github.com/Chandak06/SE-JF-10/actions/runs/38062875287. Checkout/install/typecheck/build passed; the intentional assertion failed at backend tests, later build stages were skipped, and the failure report was retained.
- The temporary codex/sprint1-ci-failure-demo branch was deleted after recording evidence. Its intentional assertion never entered PES2UG24CS185.
- Passing run artifacts: sprint-1-test-reports, sprint-1-backend and sprint-1-frontend. Download retained artifacts for the Sprint review; retention is 14 days.
- Evidence links were added to descriptions of CSMQ-2 through CSMQ-7, preserving their acceptance criteria and existing status. Independent review remains pending.

PR preparation: compare main against PES2UG24CS185. Suggested title: CSMQ-2–CSMQ-7: Sprint 1 authentication, Dharani integration and GitHub Actions. Request Member 1 or Member 3 review and verify the PR-triggered workflow before merging.
