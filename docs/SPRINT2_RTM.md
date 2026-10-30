# Sprint 2 requirement/test matrix — 30 October 2026

Submitted SRS/SAD/Test Plan files are frozen and fingerprint-checked. Validated means executed automated verification, not invented human/faculty acceptance. Current execution and release evidence: [final implementation/test summary](SPRINT2_HARSHIT_FINAL_2026-10-30.md).

| SRS IDs | Evidence / available implementation | Final acceptance boundary |
| --- | --- | --- |
| F-001/002/004 | Real register/login/logout, server-validated refresh; security/runtime/auth/browser tests | Validated for integrated accounts |
| F-010 | PDF metadata/content/size validation and MongoDB/file storage; runtime and browser tests | Validated |
| F-012 | Material title/subject/description search, combined subject filter, paging and searchable subject UI; HTTP/browser tests | Validated for delivered search flow; folder management dropped by Harshit on 30 October |
| F-013 | Protected PDF download/retrieval, removal exclusion and browser downloads | Validated |
| F-041 | Confirmed atomic material removal, retained bytes/audit and read exclusions | Validated |
| F-020/022 | Real Admin MCQ creation/classification/filtering and student-safe serializer; model/API/UI/browser tests | Validated |
| F-042 | Real Question/Quiz moderation, read/submission exclusions and preserved stored attempts; shared-runtime API/browser tests | Implemented and regression tested; genuine review pending |
| F-030/032 | Real Quiz model/create/search/view APIs and Student UI from PRs #25–32; cross-module and browser tests | Integrated and tested |
| F-033/034 | Real Attempt UI loads the actual Quiz and submits to trusted scoring/persistence; stable retry identity prevents duplicate records | Integrated UI/API/browser and racing-retry tests pass |
| F-035/036/040 | Real saved Result/History/Performance pages; full-history subject means include the 51st record; SAD resultId/answer feedback supplied only after saved submission | Automated acceptance and actual browser journey pass |
| NF-001 | All three browsers enforce primary-content under 3s after startup for Materials, Create/Search/View Quiz, Dashboard, Attempt, Result, History and Performance | Pass with timing attachments; normal single-user conditions |
| NF-002 | Accounts, sessions, attempts/history and moderation survive actual MongoDB stop/restart; history remains after Quiz/Question removal | Restart/reconnect and built-release lifecycle pass |
| NF-003 | Separate auth/material and real Quiz retrieval/scoring workloads at 10/50 sessions | Pass; scope and measured p90 values recorded without claiming 50 browser processes |
| NF-004 | 15 journeys across Chrome/Edge/Firefox, including the complete saved Attempt/Result/History/Performance flow | Browser matrix pass |
| NF-005 | Dashboard/navbar at 320/375/768/1024/1440px, no overflow/overlap; loading/error/retry/confirmation/cancel states | Available-module pass; whole-product usability pending |
| SR-001 | Existing bcrypt helper, confirmed initial Admin CLI and credential-exclusion tests | Validated |
| SR-002/003 | Current account/session role, protected routes, Admin/Student UI gates, 401/403 | Validated on integrated routes; owner routes must comply |
| SR-004 | Strict body/ID/filter validation, query-injection tests, safe errors and confirmed deletion | Validated on integrated routes |
| SR-005 | Production transport gate and trusted gateway; dedicated certificate-validated local HTTPS deployment/sensitive-operation smoke in CI, plus direct plaintext rejection | Verify final PR CI; no public host/certificate claim or TLS verification bypass |

All 17 functional, five NFR and five security requirement groups remain represented. Harshit dropped folder management on 30 October; CSMQ-32 now excludes it, and it is not counted as unfinished work. Submitted requirements remain unchanged. Final peer cross-testing, RTM/defect review, Project Guide acceptance, final demo and release freeze remain genuine human acceptance gates. Current modules are no longer marked missing simply because earlier dated reports predate their PRs.
