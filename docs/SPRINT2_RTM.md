# Sprint 2 requirement/test matrix — 29 October 2026

SRS/SAD requirements are unchanged. Validated means actual available code/tests, not independent human/faculty acceptance. Execution details: [current status](SPRINT2_HARSHIT.md).

| SRS IDs | Evidence / available implementation | Final acceptance boundary |
| --- | --- | --- |
| F-001/002/004 | Real register/login/logout, server-validated refresh; security/runtime/auth/browser tests | Validated for integrated accounts |
| F-010 | PDF metadata/content/size validation and MongoDB/file storage; runtime and browser tests | Validated |
| F-012 | Material title/subject/description search, combined subject filter, paging and searchable subject UI; HTTP/browser tests | Validated for delivered search flow; folders tracked separately |
| F-013 | Protected PDF download/retrieval, removal exclusion and browser downloads | Validated |
| F-041 | Confirmed atomic material removal, retained bytes/audit and read exclusions | Validated |
| F-020/022 | Real Admin MCQ creation/classification/filtering and student-safe serializer; model/API/UI/browser tests | Validated |
| F-042 | Real Question/Quiz moderation, read/submission exclusions and preserved stored attempts; shared-runtime API/browser tests | Implemented and regression tested; genuine review pending |
| F-030/032 | Real Quiz model/create/search/view APIs and Student UI from PRs #25–32; cross-module and browser tests | Integrated and tested |
| F-033/034 | Production trusted submission/evaluation/persistence from PR #29; real Quiz integration and removed-reference security | API tested; production Attempt UI (CSMQ-41) pending |
| F-035/036/040 | Submission API returns correct result; production Result/history/subject-average routes/UI not delivered | CSMQ-42–44 pending; prototype is not substituted |
| NF-001 | Three browsers assert single-user dashboard content within 3s after app startup; scoped load timings | Scoped pass; full-platform timing pending |
| NF-002 | Accounts/materials/Question removal/sessions survive restart/reconnect; real Quiz moderation preserves saved attempts | Delivered-module pass; full history/performance lifecycle pending |
| NF-003 | Separate auth/material and real Quiz retrieval/scoring workloads at 10/50 sessions | Delivered-module pass; missing workflows pending |
| NF-004 | Chrome/Edge/Firefox matrix includes Quiz creation/view, production API scoring and moderation | Delivered-module pass; missing pages untested |
| NF-005 | Dashboard/navbar at 320/375/768/1024/1440px, no overflow/overlap; loading/error/retry/confirmation/cancel states | Available-module pass; whole-product usability pending |
| SR-001 | Existing bcrypt helper, confirmed initial Admin CLI and credential-exclusion tests | Validated |
| SR-002/003 | Current account/session role, protected routes, Admin/Student UI gates, 401/403 | Validated on integrated routes; owner routes must comply |
| SR-004 | Strict body/ID/filter validation, query-injection tests, safe errors and confirmed deletion | Validated on integrated routes |
| SR-005 | Production HTTPS enforcement, trusted proxy and Caddy; separate loopback development HTTP | Code/config tested; public deployed certificate not claimed |

Approved requirements are unchanged. Material details/viewing, Student Dashboard and real Quiz/Attempt API integration now have delivered-module evidence; material folders, production Attempt/Result screens, history/performance and genuine final acceptance remain pending. See the [current team report](SPRINT2_TEAM_REVIEW_2026-10-29.md) for reviewed heads and findings.
