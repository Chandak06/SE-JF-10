# Whole-project testing submission — Team 10

Testing window: **2–6 November 2026**. Current complete automated execution: **5 November**, covering both implementation sprints and every team member's delivered modules. Harshit coordinates execution/reporting; original implementation and test contributions retain their authorship.

## Submission documents

**Form uploads from actual test tools:** [three native PDF exports and commands](submission/README.md). Vitest JUnit, Playwright HTML/JUnit and V8/Istanbul HTML replace the authored PDF summaries. Actual dates, counts and raw reports are retained in the dated native-report archive. Markdown packs below remain historical interpretations and evidence.

Latest command execution: [6 November native reports and logs](testing/2026-11-06-native-tool-reports/native-reports.zip), with [actual commands, timestamps, exit codes and counts](testing/2026-11-06-native-tool-reports/execution.json).

- [Updated whole-project Test Case Document](TEST_CASES_WHOLE_PROJECT.md)
- [Unit Test Report](testing/2026-11-05-production-validation/UNIT_TEST_REPORT.md)
- [System Validation Report](testing/2026-11-05-production-validation/SYSTEM_VALIDATION_REPORT.md)
- [Code Coverage Report](testing/2026-11-05-production-validation/CODE_COVERAGE_REPORT.md)
- [Branch Coverage Report](testing/2026-11-05-production-validation/BRANCH_COVERAGE_REPORT.md)
- [Whole-project execution summary, case catalogue and machine evidence](testing/2026-11-05-production-validation/README.md)
- [Current production validation and defect follow-up](testing/PRODUCTION_VALIDATION_2026-11-05.md)
- [Earlier failed execution and load observations, preserved](testing/WHOLE_PROJECT_SUMMARY_2026-11-05.md)
- [Test data and boundary classes](testing/TEST_DATA.md)
- [Independent/manual acceptance register](testing/MANUAL_ACCEPTANCE.md)
- [GitHub review-evidence inspection](testing/GITHUB_ACCEPTANCE_EVIDENCE_2026-11-05.md)
- [Current defect/audit record](PROJECT_AUDIT_2026-11-05.md)

## Scope by member

| Member | Module verification included |
| --- | --- |
| Dharani | Register/login/logout/session restoration, PDF upload/validation/search/paging/view/download, Student Dashboard |
| Prajwal | Question Bank model/API/UI, validation/classification/filtering, student-safe serializer, Quiz creation/search/view |
| Karan | Attempt/submission/evaluation, idempotent retry, saved Result/History, complete subject performance, cross-user isolation and expiry |
| Harshit | Admin Dashboard, confirmed single/bulk moderation, authentication/RBAC, safe validation/errors, shared integration, NFR/load, persistence, release/HTTPS and report integrity |
| All modules together | Real Student/Admin browser journeys, 10 concurrent isolated browser sessions per engine, 10/50 HTTP-session loads, actual compiled release and database restart |

Coverage reports include per-layer and weighted whole measured source totals. Whole totals sum covered/total counters; they do not average module percentages. The existing backend gates remain 85% lines/statements/functions and 80% branches. Frontend and combined coverage are measured separately without inventing a new passing threshold.

## Repeat the full execution

Prerequisites: supported Node >=24.15 <25, Python 3, root/frontend locked dependencies, Playwright Chrome/Edge/Firefox and cached/downloadable MongoDB fixture binary. On Windows, make Python available on PATH or set `PROJECT_TEST_PYTHON` to its executable. Use only disposable fixtures; do not substitute Atlas or saved-demo URIs.

```powershell
npm ci
npm ci --prefix frontend
npm run test:project -- --date 2026-11-05 --label production-validation
```

Use today's actual Asia/Kolkata date. Use a fresh label for a later run on the same date; existing snapshots and failed raw executions are preserved. The runner requires committed source, executes all test/build/release stages, records actual command exits and timestamps, captures browser versions/concurrency/timings from test attachments and generates all four reports. Browser failures are published as failed outcomes and the command returns nonzero; they are never converted into a passing pack. Missing build/evidence prerequisites stop publication. Ignored raw logs remain under `.local/testing-<date>-<label>/`; sanitized JUnit, counters, per-case results and the execution log are retained in the repository pack. GitHub Actions also runs the tests and retains complete browser/coverage artifacts.

The latest complete run passed **541/541** cases against source `888c0666ae78e14be134a6c090be860d254ddb00`. Browser validation now builds and serves the compiled production frontend instead of using Vite development transforms and React development diagnostics. All 42 recorded content timings across Chrome, Edge and Firefox were **117–590 ms**; the unchanged limit is **<3,000 ms**. These are loopback measurements, not target-network acceptance. The earlier development-server execution and its 3,726/3,082 ms failures remain unchanged in the [original pack](testing/2026-11-05-whole-project/README.md). See the current follow-up for the additional timing rechecks and fifty-session measurements.

## Acceptance boundary

Automated pass is supported by named cases, actual saved data and recorded execution. Human peer cross-testing, representative-user usability, acceptance-time latest/previous-major browser slots and Project Guide acceptance require actual evidence. The register records what is known and what is Pending; no signature or future 6 November execution is invented. All currently delivered functional modules are included; folder management was explicitly dropped on 30 October.

Submitted SRS, SAD and Test Plan remain unchanged. The original plan's testing categories and exit criteria are retained; earlier Sprint 0–4 milestones are mapped to the agreed two implementation sprints through supplementary documentation. [2 November](testing/2026-11-02/README.md) and [earlier 5 November audit evidence](testing/2026-11-05/README.md) remain immutable historical executions. The whole-project pack adds measured ten-browser-session coverage and reproducible execution on top of those records.
