# Final whole-project test summary and defect record — 5 November 2026

Scope: every delivered module from both sprints and all four Team 10 members. Execution source: `4a2b3acbf320f15736f30ab64885c169e22fe8d1`. Testing window: 2–6 November; only actual completed executions are recorded. Submitted SRS, SAD and Test Plan are unchanged.

## Submission and result

The [whole-project pack](2026-11-05-whole-project/README.md) contains the Unit, System Validation, Code Coverage and Branch Coverage reports; the [updated Test Case Document](../TEST_CASES_WHOLE_PROJECT.md) maps all module owners and requirement families. JUnit/CSV case outcomes, per-file JSON/LCOV, actual command exits/timestamps, browser versions, page timings and concurrency evidence are retained in the pack.

| Local full-run category | Executed | Passed | Failed | Skipped |
| --- | --- | --- | --- | --- |
| Backend unit-directory/module cases | 199 | 199 | 0 | 0 |
| Backend integration | 131 | 131 | 0 | 0 |
| Frontend component/service/integration | 190 | 190 | 0 | 0 |
| Chrome/Edge/Firefox system scenarios | 21 | 20 | 1 | 0 |
| **Total** | **541** | **540** | **1** | **0** |

Automated planned-case execution: **100%**. Original local full-run pass rate: **99.82%** (540/541). These are automated-case metrics, not the overall manual/UAT completion percentage. Two additional isolated timing rechecks produced **one pass and one failure**; they are separate rechecks of one case and are not added to the 541 planned invocations or substituted into the original results. Eight report-integrity cases passed during the original run; the expanded final publisher suite passed nine cases, including truthful failed-result publication.

Backend typecheck/build, complete frontend regression/coverage/lint/build, the actual compiled release, MongoDB restart/persistence and frozen-document checks passed. The complete [exact-source CI run](https://github.com/Chandak06/SE-JF-10/actions/runs/41977098538) passed all five jobs, including HTTPS containers and all three browser projects. That successful CI environment result does not erase the local failures.

## Whole measured source coverage

| Metric | Covered / measured total | Percent |
| --- | --- | --- |
| Lines | 1,606 / 1,846 | 87.00% |
| Statements | 1,905 / 2,257 | 84.40% |
| Functions | 512 / 600 | 85.33% |
| Branches | 1,427 / 1,852 | 77.05% |

Totals sum backend/frontend counters, using the exclusions described in the coverage reports. Backend coverage is 97.85% lines / 92.06% branches; frontend coverage is 81.70% lines / 72.00% branches. The existing backend-only coverage gates pass. No whole-project or frontend threshold was silently invented. Real browser execution is separate from these V8 counters.

## Performance, load and concurrency observations

| Executed workload | Observed p90 / result | Interpretation |
| --- | --- | --- |
| Real Quiz, 10 HTTP sessions / 20 paired retrieval-submission requests | 234 ms p90; no functional failure | Defined backend workload; separate from UI/session concurrency |
| Real Quiz, 50 HTTP sessions / 100 paired requests | 23,471 ms p90; all requests functionally completed | Slow stress response observed on this host; record/profile before claiming acceptable 50-user latency |
| Auth/material scoped smoke, 10 sessions / 20 authenticated requests | 890 ms p90 | Passing bounded smoke |
| Auth/material scoped smoke, 50 sessions / 100 authenticated requests | 1,673 ms p90 | Passing bounded smoke |
| Chrome, 10 isolated browser sessions | All 10 complete, 47,587 ms for the combined multi-step workload, 0 page errors | Login, PDF upload, Quiz creation, saved submission, own history and performance |
| Edge, 10 isolated browser sessions | All 10 complete, 39,527 ms for the workload, 0 page errors | Same real UI workload and owner assertions |
| Firefox, 10 isolated browser sessions | All 10 complete, 78,433 ms for the workload, 0 page errors | Same real UI workload and owner assertions |

The SRS NF-003 minimum is ten simultaneously active sessions without crashes/functional failure; the work division additionally calls for a defined fifty-user load test. Both workloads were executed. The three-second NF-001 limit concerns normal single-user primary-content loading; it is not a three-second limit for completing an entire multi-step ten-user workload. The slower 50-session Quiz response is retained as a stress-performance observation, not hidden behind the functional pass.

## Defect / recheck record

| ID | Finding and evidence | State / follow-up |
| --- | --- | --- |
| PERF-01, P2 | Original Chrome full-flow case: Create Quiz primary content **3,726 ms**, required **<3,000 ms**. Isolated repeat 1 passed; repeat 2 failed Quiz View at **3,082 ms**, same unchanged limit. Source code/assertions were unchanged. Original browser JUnit retains the failed case; recheck outcomes and successful timing measurements are recorded in the execution manifest. | **Open performance/revalidation item.** Timing is not consistently within the local limit; root cause is not established. Revalidate/profile representative conditions and the chosen evaluation build. Do not declare NF-001 fully accepted from CI or a selected pass alone. |
| STRESS-01, observation | Fifty-session Quiz workload p90 **23.471 s**, with functional completion. | Profile/repeat the defined stress workload before making a low-latency claim at fifty sessions. No separate numeric fifty-session latency gate is stated in the inspected work-division row. |
| AUDIT-01 / AUDIT-02 | Earlier stale-session invalidation and Quiz expiry/draft-owner defects are corrected and regression-tested. | Fixed on the Sprint 2 branch; [original audit](../PROJECT_AUDIT_2026-11-05.md) retains reproduction/ownership evidence. Integration into main still requires review/merge. |

PERF-01 was discovered on 5 November and remains open as of this report (age 0 calendar days). The earlier audit's two product findings were fixed on the same day; its limited audit-observed density is recorded there. An overall historical defect density cannot be inferred from this single run; no missing historical defect count is invented.

## Test Plan exit and remaining evidence

The automated execution and requested reporting deliverables are complete for the whole project. **Full Test Plan exit is not satisfied:** local timing violations remain, acceptance-time latest/previous browser-major coverage is not established, and named peer/user/Guide acceptance has not been supplied in the inspected records. The [manual acceptance register](MANUAL_ACCEPTANCE.md) identifies the exact checks, testers, expected observations and Pending evidence.

GitHub inspection found no submitted review events in 22 inspected PRs and no discussion entries in nine inspected timelines. Dharani's genuine, scoped Sprint 1 review document is preserved; it is not promoted into a whole-Sprint-2/faculty approval. Jira Done states alone do not supply missing actual outcomes or signatures. No messages, approvals, signatures or future 6 November results were created on others' behalf.

The updated runner now generates explicit failed-result reports when browser assertions fail and returns a nonzero exit. It continues to reject missing/stale evidence and preserves earlier snapshots. This follow-up pack used that explicit failure-publication mode after the original runner stopped on its browser failure; all original exits/outcomes remain recorded.
