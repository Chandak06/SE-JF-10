# Sprint 2 requirement/test matrix — 28 October 2026

SRS/SAD requirements are unchanged. Validated means actual available code/tests, not independent human/faculty acceptance. Execution details: [current status](SPRINT2_HARSHIT.md).

| SRS IDs | Evidence / available implementation | Final acceptance boundary |
| --- | --- | --- |
| F-001/002/004 | Real register/login/logout, server-validated refresh; security/runtime/auth/browser tests | Validated for integrated accounts |
| F-010 | PDF metadata/content/size validation and MongoDB/file storage; runtime and browser tests | Validated |
| F-012 | Material title search/list/paging and subject-filter API; loader, HTTP integration and browser cases | Available flow validated; remaining owner UI/folders pending |
| F-013 | Protected PDF download/retrieval, removal exclusion and browser downloads | Validated |
| F-041 | Confirmed atomic material removal, retained bytes/audit and read exclusions | Validated |
| F-020/022 | Real Admin MCQ creation/classification/filtering and student-safe serializer; model/API/UI/browser tests | Validated |
| F-042 | Real Question moderation/read exclusions; shared Quiz adapter contract | Question validated; real Quiz removal blocked on owner module |
| F-030/032 | No published production Quiz creation/search model/routes/UI | Blocked on owner module |
| F-033/034 | Existing model/evaluator/sample-question UI and fixture integration | Prototype validated; production submission/evaluation pending |
| F-035/036/040 | No production results/history/subject-average routes/UI published | Blocked on owner modules |
| NF-001 | Three browsers assert single-user dashboard content within 3s after app startup; scoped load timings | Scoped pass; full-platform timing pending |
| NF-002 | Accounts/materials/Question removal/sessions survive runtime recreation/reconnect; stored attempt references retained | Available-module pass; production Quiz/result lifecycle pending |
| NF-003 | Separate 10-session/20-request and 50-session/100-request cases; 3s p90 assertion | Scoped pass; real Quiz workload pending |
| NF-004 | Chrome, Edge, Firefox: 9 real journeys | Available-module pass; missing pages untested |
| NF-005 | Dashboard/navbar at 320/375/768/1024/1440px, no overflow/overlap; loading/error/retry/confirmation/cancel states | Available-module pass; whole-product usability pending |
| SR-001 | Existing bcrypt helper, confirmed initial Admin CLI and credential-exclusion tests | Validated |
| SR-002/003 | Current account/session role, protected routes, Admin/Student UI gates, 401/403 | Validated on integrated routes; owner routes must comply |
| SR-004 | Strict body/ID/filter validation, query-injection tests, safe errors and confirmed deletion | Validated on integrated routes |
| SR-005 | Production HTTPS enforcement, trusted proxy and Caddy; separate loopback development HTTP | Code/config tested; public deployed certificate not claimed |

All approved functional, non-functional and security IDs are represented without deleting requirements. Admin Dashboard CSMQ-55 and extra Jira integration of folders/Student Dashboard are tracked in the [Jira acceptance table](SPRINT2_HARSHIT.md). Missing modules and actual human review remain visible, not relabelled complete.
