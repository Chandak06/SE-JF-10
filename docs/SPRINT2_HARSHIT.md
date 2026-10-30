# Harshit Chandak — Sprint 2 status, 28 October 2026

**30 October:** [Current implementation and verification](SPRINT2_HARSHIT_FINAL_2026-10-30.md) supersedes the older availability/status statements below. All real team modules are now published; the submitted SRS/SAD/Test Plan remain frozen, and final integration/verification is implemented against that baseline.

**29 October update:** [Current team integration/review](SPRINT2_TEAM_REVIEW_2026-10-29.md) supersedes the missing-Quiz/Attempt-API/Student-Dashboard statements below. Those modules are now integrated for a PR to **main**, as explicitly requested. The dated evidence is retained as history; production Attempt/Result UI, history/performance and folders remain pending.

Branch: `PES2UG24CS185-Sprint-2`. Owner: Harshit Chandak / PES2UG24CS185. Jira scope: CSMQ-29–34 and new Administrator Dashboard CSMQ-55. This is the current report; [earlier execution records](historical/HISTORICAL_SPRINT2_HARSHIT_2026-10-22.md) remain historical evidence.

## Implemented and integrated

- Integrated latest main `0e73b37` with preserved authorship and unchanged Sprint 1 video. Resolved shared runtime, routes, authentication/session tests, navbar, material loader, Vite and README conflicts. Main was not modified.
- CSMQ-29: existing confirmed material removal, protected search/paging/download and recoverable tombstones remain functional.
- CSMQ-30: wired the real Question model into Admin moderation. Atomic soft removal records timestamp/administrator, excludes both administrator and student-facing question reads, and preserves original Question/QuizAttempt references. Quiz moderation retains the owner adapter contract; absent production Quiz modules return a controlled unavailable response rather than fixture results.
- CSMQ-55: responsive `/admin` Administrator Dashboard; Admin login redirects there; Question Bank and moderation links reuse existing implementations. `/admin/moderation?kind=...` opens the selected category. Anonymous/Student routes are rejected. Loading, error/retry, confirmation, cancellation and unavailable-module states are visible.
- CSMQ-31: retained current-role backend RBAC, validated tab-session restoration, controlled errors, confirmed deletion, safe Question query validation and answer-key filtering. Fixed protected-client 401 cleanup and stale account-response handling. Disabled the old Student-promotion script in favor of explicitly confirmed initial Admin provisioning.
- CSMQ-32: connected all actually published Material/User/Question modules and the attempt prototype to shared runtime conventions. Kept material request ordering, pagination and PDF picker reset while incorporating current main's security/session fixes.
- CSMQ-33/34: regression/browser/NFR evidence and deployable packaging updated; added explicit local Docker demo with persistent local MongoDB and a guarded disposable release smoke test in CI. This is development HTTP on loopback, separate from the existing production HTTPS configuration; it does not use Atlas.

## Verification completed locally

| Check | Result |
| --- | --- |
| Backend types/build/coverage | 207 tests in 21 files passed; 98.87% lines, 95.57% branches, 98.33% statements, 98.23% functions |
| Frontend tests | 71 tests in 11 files passed |
| Frontend lint/build | Passed with zero lint errors/warnings |
| Real browser journeys | 9 passed: three each in Chrome, Edge and Firefox |
| Dashboard usability | 320, 375, 768, 1024 and 1440px; no horizontal overflow or overlapping navigation; mobile/desktop screenshots visually inspected |
| Dashboard timing | All three browsers passed a 3-second bounded single-user login/dashboard-content check after application startup; attachment records conditions |
| Load smoke | 10 sessions/20 protected requests: p90 348ms; 50 sessions/100 protected requests: p90 999ms |
| Persistence | Real PDF/question removal and sessions survive runtime recreation/database reconnect; persisted attempt references remain |
| Local container release | Docker unavailable on this machine; CI builds images, validates production Caddy, starts isolated local Compose and tests the gateway; check pushed-head CI for its actual result |

Tests use disposable MongoDB. No Atlas application records, roles, access settings or credentials were changed. Frontend locked installation reported zero known dependency vulnerabilities. Scoped page/load figures are not whole-platform performance evidence for absent modules. Existing assertions, coverage gates and 3-second limits remain; worker counts/startup budgets bound infrastructure resource use.

## Current Jira acceptance boundaries

| Jira | Coding/validation status | Remaining acceptance |
| --- | --- | --- |
| CSMQ-29 | Material moderation implemented and regression/browser tested | Genuine peer review and Jira PR/evidence closeout |
| CSMQ-30 | Real Question moderation complete; shared Quiz adapter endpoint/confirmation/RBAC tested with explicit fixtures | Owner's production Quiz model/routes and removed-data exclusion before actual Quiz integration can pass |
| CSMQ-31 | Security enforced for integrated modules; production HTTPS configuration retained | Correct-answer security on real Quiz/Attempt flow; actual deployment/network checks and independent review |
| CSMQ-32 | All published owner modules integrated consistently | Missing production Quiz/Attempt/results/history/performance, folder management and Student Dashboard modules |
| CSMQ-33 | Available-module regression, 10/50-session load, three-browser and persistence checks pass | Full-platform RTM/NFR/system/UAT and independent cross-testing once owner modules exist |
| CSMQ-34 | Local run/release packaging, environment and demo instructions supplied; CI release smoke prepared | Atlas connectivity or selected local environment, all final modules, actual final demonstration/review and release freeze |
| CSMQ-55 | Admin Dashboard and role navigation implemented and tested | Genuine peer review; Quiz card honestly identifies unavailable owner integration |

Jira was initially To Do at audit time. The verified evidence is now linked: CSMQ-29/55 are Code Review and CSMQ-30–34 are In Progress. These states were rechecked against Jira on 28 October; missing integrations are not marked Done and independent reviews are not invented.

## Branch and integration audit

See [all-branch audit](SPRINT2_BRANCH_INTEGRATION.md), [requirement/test matrix](SPRINT2_RTM.md) and [owner handoff contract](SPRINT2_HANDOFF.md). Every published teammate branch was inspected, including merged Question Bank branches and Karan/Dharani branches. Their available contributions are already in main; no production Quiz creation, real submission/history/performance, material folders or Student Dashboard was found on any published branch or open owner PR. The old prototype is not substituted for those modules.

## Live environment issue

Read-only Atlas ping failed on 28 October. Configuration validates and DNS resolves three servers, but each TLS handshake fails with `ERR_SSL_TLSV1_ALERT_INTERNAL_ERROR` before database authentication. This is not proof of an application-password defect. The operator must verify Atlas cluster/network access and approved environment settings; no TLS verification was disabled or network access widened. Do not claim live deployment/demo readiness from disposable tests.

For a separate local Docker environment that does not require Atlas, follow [deployment/demo instructions](DEPLOYMENT.md). Docker must be installed by the operator; no global software installation or cloud deployment was attempted.

### Follow-up local release completion

The available product can now run on this workstation without either Docker or Atlas: `./scripts/start-sprint2.ps1`. The launcher selects supported Node, builds a separate same-origin frontend and starts loopback-only real MongoDB with persistent WiredTiger data under `.local/sprint2-demo/database`. It never loads the Atlas `.env` or seeds users automatically. Explicit first-Admin setup uses the existing trusted helper; no promotion/reset shortcut is added. Windows shutdown flushes database writes before stopping MongoDB.

Follow-up verification passed 209 backend tests in 22 files (types/build/coverage), the dedicated frontend build and a real built-gateway release smoke. The new integration test fully stops/restarts MongoDB, verifies saved sessions and Question-removal metadata, confirms Student exclusion, and verifies logout revocation. CI also executes the built local Node demo smoke on every change. This completes an available-module local demonstration path; missing production owner modules, independent cross-testing and final release freeze remain acceptance dependencies.

## Delivery

All work stays on the requested branch and existing draft [PR #8](https://github.com/Chandak06/SE-JF-10/pull/8). Push/PR Actions validate the actual head and retain integrated test/build/browser artifacts. The PR stays unmerged; the two-sprint scope, approved SRS/SAD and Sprint 1 evidence are preserved. Whole Sprint 2 is not release-complete until the dependencies and genuine human evidence above are resolved.
