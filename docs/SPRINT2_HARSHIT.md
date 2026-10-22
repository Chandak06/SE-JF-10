# Harshit Chandak Sprint 2 implementation

Owner: PES2UG24CS185. Branch: PES2UG24CS185. Jira CSMQ-29–34. Reference date: 12 October 2026.

Sprint 1's shared contribution was merged in PR #3 with green push, PR and main CI. The entire team's missing Question Bank/Attempt work and independent review are not retroactively represented as complete.

Updated Jira defines the six Sprint 2 issues below. It supersedes the older four-sprint sequencing in the work-division document. Feature-specific schemas/controllers remain assigned to their owners.

| Issue | Implemented and verified here | Required external completion evidence |
| --- | --- | --- |
| CSMQ-29 material removal | Admin-only list/removal; two-step UI confirmation; atomic recoverable tombstone; removed content excluded from protected search/download; invalid/missing/repeated IDs and role changes tested | PR link and independent cross-test |
| CSMQ-30 question/quiz removal | Shared admin API/UI and owner-supplied moderation adapter contract; both adapter types tested with labelled fixtures | Actual Question/Quiz models/controllers and their removed-data exclusion rules |
| CSMQ-31 security | Shared auth/current RBAC, strict queries/body/IDs, protected downloads, confirmation and safe errors; frontend/backend regression; production HTTPS enforcement and gateway configuration | Correct-answer disclosure checks on real Quiz/Attempt modules; actual deployment certificate/HTTPS |
| CSMQ-32 integration | Real existing Material and User modules integrated; search/download/moderation and login/logout browser flow tested | Real Question Bank/Quiz/Attempt/evaluation/history/subject-performance code |
| CSMQ-33 NFR/regression | 50 authenticated concurrent sessions, 100 protected operations; p90 510 ms in initial scoped Windows run; removal/auth persistence after reconnect; Chrome/Edge/Firefox real-browser flow | Full-platform/page timing, all high-priority team functions, independent review and final RTM |
| CSMQ-34 readiness | Setup/admin-provisioning/deployment instructions; Docker images, HTTPS gateway, CI browser/container checks; secrets excluded from images/source | Hosting target/domain, deployed smoke/demo/video, all modules and final freeze |

The initial automated run passed 87 backend tests and 22 frontend tests. Chrome and Edge passed the actual register/login/PDF upload/download/admin cancellation/confirmation flow; Firefox passed the same flow. A further reconnect case is included in final verification. The load measurement covers existing authentication/material routes only, not absent quiz operations or hosted performance.

Moderation retains PDF bytes and recorded removedAt/removedBy fields; this is a recoverable removal, not an untested permanent purge. All student reads and downloads exclude tombstones. Question/quiz adapters must provide the same exclusion guarantee in their own business routes.

See docs/DEPLOYMENT.md for the runbook and adapter contract. Tests use disposable MongoDB; no Atlas account roles or production content were changed. No hosting target was provided. The user's reply confirmed proceeding with Harshit's scope but did not identify missing module paths or a host.

Status: available-module implementation ready for verified integration; whole Sprint 2 cannot be marked complete until the external evidence in the table is supplied.

## Final local verification
88 backend tests and 22 frontend tests passed; all three browser projects passed (Chrome, Edge, Firefox). Backend type/build/coverage and frontend lint/build passed. Final coverage: 97.88% statements, 97.72% branches, 97.43% functions, 98.69% lines. The final concurrent smoke run, overlapping browser/regression work, measured p90 1,433 ms for the same 50-session/100-request scope; the earlier run measured 510 ms. These are development smoke measurements, not hosted or full-platform performance evidence.

## Audit after branch relocation — 12 October 2026

Sprint 1 (Harshit's CSMQ-2–7 implementation): hashing, authentication/logout, RBAC, real Member 1 registration/PDF integration, validation/security tests and GitHub Actions are implemented. PR #3 was merged after green checks. Independent peer sign-off is not recorded and the Jira tasks remain To Do; the entire team's Sprint 1 cannot be marked complete without the missing Question Bank/Attempt deliverables.

Sprint 2: CSMQ-29 material moderation is implemented/tested. CSMQ-30 has shared adapters and fixture evidence only; actual Question/Quiz removal is not integrated. CSMQ-31–34 remain partial until real quiz/attempt integration, full-platform performance/RTM, deployed HTTPS/demo and independent review are verified. Container configuration is build-validated, not a live deployment.

The latest relocated-branch CI (38266371714 and 38266311868) exposed a Chrome test navigation race, while backend/frontend, containers, Edge and Firefox passed. The error context showed an empty login email: the test could fill a registration field while the SPA switched to login, because both forms share labels. The test now waits for the actual login heading before filling credentials and verifies the email value. No sleeps, retries or relaxed assertions were added. Fresh CI must pass before treating the current PR as green.

All Sprint 2 work is on PES2UG24CS185 and replacement draft PR #5; draft #4 was closed when its old source branch was removed. main remains at the verified Sprint 1 merge.

## Teammate integration — 17 October 2026

Reviewed and integrated Dharani's PR #7 and Karan's PR #6 into main, preserving their original commits. Main's reviewed integration commit 86f6bf8 passed Actions run 38993489669 (110 backend tests and 30 frontend tests, builds, lint and coverage).

This draft absorbed that reviewed main history. Resolved conflicts in material upload/listing, application routes, login navigation, the materials page/tests and shared session helpers. Preserved bounded search, removed-material exclusions, protected PDF downloads and administrator moderation while retaining Dharani's upload drawer/profile/logout and Karan's authenticated student quiz prototype. Browser tests now use the actual redirect, upload drawer and profile menu.

The combined draft passed 118 backend tests and 33 frontend tests, type/build/lint/coverage. Scoped load smoke p90: 1,426 ms across 50 sessions and 100 protected requests. Original coverage gates remain enforced. The User repository test now waits for MongoDB indexes before asserting duplicate-email rejection, matching production startup initialization.

Karan's QuizAttempt model, evaluation helper and seed-question UI are now present. A production Question/Quiz data provider, real attempt-submission/history flow and deployed HTTPS target remain outstanding; the prototype does not claim server scoring or submission persistence.

## Material search and paging corrections — 22 October 2026

These fixes are saved only on `PES2UG24CS185-Sprint-2`, updating draft PR #8. Keep Sprint 2 unmerged until Harshit confirms the Sprint 1 video is finished. The Sprint 1 application and recording branch are unchanged.

- **H1 resolved:** the paginated client preserves `nextCursor`, sends it together with the current search, and provides **Load more materials**. A new search resets the cursor; subsequent pages append results without duplicate cards. Server-side page limits remain intact.
- **H2 resolved:** upload refresh and retry use the last submitted search. Retrying a failed next page retains its cursor and the already displayed results. Search input edits alone do not silently change the submitted query.
- Both material views use one guarded loader. Stale initial/search/page responses cannot overwrite newer results, requests are cancelled on replacement/unmount, and loading is finalized on success or failure. Failed downloads are reported separately from listing failures.
- The Sprint 2 upload drawer also resets its native file picker after success, allowing the same PDF to be selected again. This correction does not change Dharani's saved Sprint 1 UI.

Verification: 118 backend tests passed with typecheck/build and coverage gates (98.8% lines, 97.84% branches). All 42 frontend tests passed, including a real frontend-client/backend pagination integration with 26 matching records; frontend lint and production build passed. Six browser cases passed across Chrome, Edge and Firefox: the existing upload/download/moderation journey plus the new 26-result pagination and search-after-upload journey in each browser. Tests use disposable local MongoDB; Atlas content and roles were not changed.

These corrections complete the two material-UI findings. They do not establish whole-platform Sprint 2 completion, production quiz/attempt integration, deployment readiness or resolution of the Atlas connectivity blocker.
