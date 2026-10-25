# Sprint 1 peer review — Harshit’s security and integration work

**Reviewer:** Dharani S
**Review date:** 25 October 2026  
**Reviewed commit:** `233a1c4f5c3078ce03b562580e302865c9e796c4`  
**Scope:** Harshit’s CSMQ-5 and CSMQ-7 work, as assigned in the Sprint 1 closeout. Related shared password, authentication, role authorization, and CI code was inspected to assess these integrations. Existing Done items CSMQ-2/3/4/6 are unchanged.

## Review result

**Pass for the reviewed acceptance criteria. No implementation defects were found in scope.**

The password flow hashes before account creation; the user model requires a bcrypt-formatted `passwordHash`, excludes it from ordinary reads, and rejects unknown fields. Authentication uses a random bearer token backed by a hashed, expiring server-side session. The middleware attaches a sanitized user context, and route authorization uses the current account role. The PDF integration requires a student session, validates metadata and actual PDF content, persists bytes and metadata, and removes uploaded bytes if metadata persistence fails. Error responses avoid exposing submitted values and internal error details.

## Commands and results

The reviewer ran these commands in the project checkout. `npm run check` runs the backend typecheck, build, and coverage-enabled test suite.

| Working directory | Command | Expected result | Actual result |
| --- | --- | --- | --- |
| Repository root | `npm ci` | Dependencies install | Completed; npm reported 2 high-severity vulnerabilities in the backend dependency tree. |
| Repository root | `npm run check` | Typecheck, build, and backend tests pass | Passed; 17 test files and 175 tests passed. |
| `frontend` | `npm ci` | Dependencies install | Completed; npm reported 3 high and 1 moderate vulnerability in the frontend dependency tree. |
| `frontend` | `npm run test:ci` | Frontend tests pass | Passed; 7 test files and 41 tests passed. |
| `frontend` | `npm run lint` | No lint errors | Passed. |
| `frontend` | `npm run build` | Production build succeeds | Passed. |

## Scenarios reviewed

| Scenario | Expected result | Actual result |
| --- | --- | --- |
| Password registration and storage | Persist a bcrypt hash, never the submitted plaintext; do not return credential material | Implementation hashes before `createStudent`; model only accepts `passwordHash`, marks it `select: false`, and registration integration checks confirm a hash is persisted and omitted from the response. |
| Password verification | Correct password succeeds; incorrect password fails | Unit tests cover both, independently salted hashes, invalid inputs, and the bcrypt byte limit. |
| Authentication | Missing, malformed, random, expired, revoked, or replayed tokens are rejected; valid session attaches sanitized user context | Middleware and MongoDB-backed tests cover these cases, session persistence, logout/replay rejection, and safe error responses. |
| Role authorization | Student cannot use administrator routes; unauthenticated requests are rejected before role checks; current database role applies | Unit and integration tests cover 401/403 behavior and role changes taking effect immediately. |
| Registration, login, logout, PDF upload integration | Valid login supports authenticated upload; logout invalidates access; stored PDF bytes and metadata match the request | Runtime integration tests cover registration/login, actual PDF persistence, byte comparison, logout/replay rejection, and reconnect persistence using disposable MongoDB. |
| Malformed and hostile requests | Invalid JSON, unknown fields, malformed credentials, invalid PDF content/type/size, extra files, and oversized metadata receive controlled errors without persistence or secret leakage | Unit and integration tests cover these cases and safe error responses. |
| CI workflow | Pushes and pull requests run checks; failures fail the job; reports/builds are retained | `.github/workflows/ci.yml` configures push, pull-request, and manual triggers, runs backend/frontend checks, and uploads reports and build artifacts. |

## Findings and follow-up

- **No defects found** against the reviewed CSMQ-5 and CSMQ-7 acceptance criteria.
- `npm ci` reported dependency audit findings: 2 high-severity backend vulnerabilities and 3 high plus 1 moderate frontend vulnerability. The affected packages and applicability were not established in this review; track and triage these separately. The test/build pass does not mean the dependency audit is clean.
- The reported automated integration tests use disposable MongoDB. No live Atlas data or credentials were used as part of this review.

**Disposition:** The review is complete for CSMQ-5 and CSMQ-7. This report does not change Jira workflow status; move those items through their actual workflow after confirming the acceptance criteria and project process. Existing Done tasks CSMQ-2/3/4/6 remain unchanged.
