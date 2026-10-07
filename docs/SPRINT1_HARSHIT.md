# Harshit Chandak Sprint 1 implementation and verification

USN: PES2UG24CS185. Branch: PES2UG24CS185. Owner: Harshit Chandak.
Reference review date: 7 October 2026.

## Reference decisions

Reviewed the SRS in Markdown/DOCX/PDF, SAD in DOCX/PDF, TEST_PLAN in DOCX/PDF, original and updated work division, the detailed Sprint 1 work plan, the faculty guidelines, and the supplied Sprint 1 announcement. The Jira backlog screenshot identifies the six implementation tasks below. Template documents were identified as templates, not additional product requirements.

- SRS: protect passwords, protected access, administrator actions and input (CSMQ-SR-001..004); invalidate active authentication on logout (CSMQ-F-004).
- SAD: shared Auth/RBAC in a layered MERN backend; safe errors and no sensitive information in logs; preserve teammate feature ownership.
- Test plan: Harshit is QA lead; prepare unit and integration evidence alongside implementation.
- Detailed Sprint 1 plan section 6: hashing, auth middleware, role foundations, Member 1 integration support and CI. Full moderation, NFR load tests and final deployment remain later-sprint work.
- Work division: the shared backend is Harshit's responsibility, while individual feature models/controllers remain with their assigned members.

No production feature code existed at the starting commit. The integration adapter and contract tests establish shared conventions; full teammate/React integration cannot be verified until those modules are present.

## Implementation traceability

| Jira task | Sprint plan / SRS | Code | Verification |
| --- | --- | --- | --- |
| CSMQ-2 Password hashing | S1-M4-01; SR-001 | security/password.ts | UT-M4-01; salted hashes, correct/wrong password, UTF-8 byte boundary and invalid cost |
| CSMQ-3 Authentication middleware | S1-M4-02; SR-002; F-004 | security/sessions.ts, auth-service.ts, middleware/auth.ts | UT-M4-02/03; real MongoDB sessions, logout replay, expiry, deletion/deactivation and reconnect |
| CSMQ-4 Role authorization | S1-M4-03; SR-003 | middleware/auth.ts, app.ts | UT-M4-04/05; admin allowed, student denied, changed role rechecked |
| CSMQ-5 Dharani integration support | S1-M4-04; F-001/F-002/F-004 | types/security.ts, routes/auth.ts; docs/INTEGRATION.md | IT-M4-01/03 through MongoDB account adapter and upload sentinel; actual teammate integration pending |
| CSMQ-6 Jenkins pipeline | S1-M4-05 | Jenkinsfile; supplemental .github/workflows/ci.yml | Automated type/build/test/coverage commands; live Jenkins CI-M4-01/02 pending |
| CSMQ-7 Security and integration tests | S1-M4-06; SR-004 | backend/tests; middleware/validation.ts, errors.ts | UT-M4-06; IT-M4-01..03, malicious fields, invalid JSON, request size, error filtering and rate limits |

Source paths in the code column are relative to backend/src unless otherwise stated.

## Reproduce the automated evidence

Run `npm ci`, then `npm run check` with Node.js 24. It checks types, builds, runs all tests and enforces coverage thresholds. The temporary MongoDB is isolated from user databases. Initial binary download requires network access; a slow Windows first startup has a 60-second allowance.

The suite maps planned case IDs to descriptive test names. Individual parameterized rows count as separate tests. JUnit, HTML/LCOV and JSON coverage reports are generated and archived by CI rather than committed as stale test output.

## Local execution result

On 7 October 2026, Node.js 24.12.0 on Windows: type check and production compilation passed; 61/61 tests passed (44 unit and 17 MongoDB integration cases). V8 coverage: 98.56% lines, 97.71% statements, 97.47% branches, 100% functions. The process entry point and type-only interfaces are excluded from coverage; all shared application/security modules are included.

The first restricted test run passed unit tests but could not start MongoDB within its default 10-second startup window. The verified rerun allowed the isolated process to start and used a 60-second startup allowance. No integration tests were skipped in the passing run.

## Review and remaining external evidence

- CSMQ-5: integrate actual teammate User/material/question/attempt modules and cross-test the React/API flows; sentinel success proves authorization only.
- CSMQ-6: configure the existing or new Jenkins instance using docs/JENKINS.md; demonstrate an automatic green build and a controlled failed assertion on a disposable branch.
- Obtain the independent teammate review/cross-test required by the work division. A draft PR and passing self-tests do not represent peer sign-off.
- Attach actual PR/build/report links to Jira when available. Existing screenshots are reference material and are not proof that this newly written code was already reviewed or tested.
- HTTPS enforcement has automated request-level tests; no live TLS deployment is claimed. No later-sprint moderation, browser compatibility, concurrency/load or full-platform performance verification is claimed.

Task status is intentionally not changed to Done on Jira by this implementation.
