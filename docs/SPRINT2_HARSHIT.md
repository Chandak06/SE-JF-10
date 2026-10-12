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
