# System validation report

Execution date: **2026-11-05**, Asia/Calcutta. Source: `4a2b3acbf320f15736f30ab64885c169e22fe8d1`. Branch: `PES2UG24CS185-Sprint-2`. The execution manifest identifies the tested source and reporting configuration.

Scope: **the whole Team 10 project**, covering Auth/Materials (Dharani), Question Bank/Quiz (Prajwal), Attempt/Result/History/Performance (Karan), Admin/Security/CI and shared integration (Harshit). Execution coordination does not replace independent peer acceptance.

| Test level | Passed | Failed | Skipped |
| --- | --- | --- | --- |
| backend integration | 131 | 0 | 0 |
| backend unit | 199 | 0 | 0 |
| browser system | 20 | 1 | 0 |
| frontend component/service/integration | 190 | 0 | 0 |

## Executed validation

- Full backend typecheck, production build, regression and coverage passed. Frontend complete regression, lint and compiled local release build passed.
- Complete Chrome/Edge/Firefox browser matrix: 21 executed cases; individual journeys and channels are listed in the case catalogue. Includes role navigation, PDF upload/search/view/download/removal, Question Bank/Quiz creation and discovery, trusted persisted scoring, result/history/performance, theme/responsive behavior and confirmed bulk moderation including hidden items. These are local loopback/disposable-database results.
- Built release smoke and actual database/application stop/restart passed (`demo:verify`): compiled assets, authentication/RBAC, PDFs, saved attempts, idempotency, result/download contracts, removal and historical data retention. Saved demo data and Atlas were not used for destructive testing.
- Submitted-document fingerprint guard passed. SRS, SAD and Test Plan were preserved.

Browser versions observed for the installed channels immediately after the matrix:

| Browser channel | Version |
| --- | --- |
| chrome | 156.0.8078.80 |
| edge | 156.0.4314.58 |
| firefox | 157.0 |

## Acceptance still to execute or document, 2–6 November

| Test Plan / SRS item | Current evidence | Remaining evidence / owner |
| --- | --- | --- |
| NF-001 normal-network timing | Automated local content-ready assertions under 3 seconds | Team records typical campus/broadband device/network measurements |
| NF-003 concurrent normal use | 10 isolated browser contexts concurrently complete login, PDF upload, Quiz creation, saved submission, owner history and performance in each of Chrome/Edge/Firefox; 10/50 HTTP-session workloads also pass | Automated isolated-browser-session scenario passed; independent peer observation remains separate |
| NF-004 latest two stable major versions | One installed Chrome/Edge/Firefox channel each, actual versions above | Team supplies acceptance-time latest/previous-major version matrix and results; three engines alone do not satisfy six version slots |
| NF-005 usability | Automated navigation, error and responsive assertions | Representative user completes core workflow without assistance; record observation |
| SR-005 deployed HTTPS | Production transport tests locally; all five jobs passed in [exact-source CI run 41977098538](https://github.com/Chandak06/SE-JF-10/actions/runs/41977098538), including the certificate-validated HTTPS container smoke | Exact-source HTTPS automated evidence is available in CI; no public deployment claim and no local Docker execution |
| Independent peer cross-testing | Automated checks do not establish an independent human review | Prajwal tests Auth/Materials; Karan tests Question/Quiz and Admin/Security; Dharani tests Attempt/Result/History/Performance; all test integration |
| UAT / exit / release | Local failed timing case retained | QA/team/Guide review, complete RTM/defect log, genuine acceptance, demo and release freeze |

## Defects and conclusion

The local execution has failed/skipped cases recorded below. Historical failures remain recorded in their original dated packs; confirmed audit findings are listed below when applicable. Lower frontend coverage and incomplete acceptance evidence are explicitly retained as gaps. The historical CSMQ-45 latest-50/weighted-average description was corrected in the supplementary matrix to match the current all-pages/arithmetic-mean implementation. Generated coverage/build files were excluded from frontend lint inputs.

**Local automated validation has failures; complete Test Plan/UAT exit is pending correction/revalidation and the evidence above.** No human approval, unexecuted browser version or unexecuted test result is fabricated. See [updated cases](../../TEST_CASES_WHOLE_PROJECT.md) and [case catalogue](AUTOMATED_TEST_CASE_CATALOGUE.md).

Source CI: [exact-source CI run 41977098538](https://github.com/Chandak06/SE-JF-10/actions/runs/41977098538), all five jobs successful (backend, three browsers and containers). This links the tested application source; the new reporting/configuration commit will receive its own CI run after push.

## Concurrent browser-session evidence

| Channel | Actual version | Sessions | Completed | Page errors | Elapsed ms |
| --- | --- | --- | --- | --- | --- |
| chrome | 156.0.8078.80 | 10 | 10 | 0 | 47587 |
| edge | 156.0.4314.58 | 10 | 10 | 0 | 39527 |
| firefox | 157.0 | 10 | 10 | 0 | 78433 |

## Single-user primary-content timings

Local same-origin fixture, application already started; browser actions/content-ready assertions, 3,000 ms limit. Concurrency timings above are a separate functional workload.

| Channel | Page/action | Milliseconds | Limit |
| --- | --- | --- | --- |
| chrome | Admin Dashboard | 600 | 3000 |
| edge | Materials | 2456 | 3000 |
| edge | Create Quiz | 2086 | 3000 |
| edge | Quiz Search | 1215 | 3000 |
| edge | Student Dashboard | 1135 | 3000 |
| edge | Quiz View | 1093 | 3000 |
| edge | Quiz Attempt | 423 | 3000 |
| edge | Submission and Result | 411 | 3000 |
| edge | Attempt History | 391 | 3000 |
| edge | Quiz View | 1066 | 3000 |
| edge | Quiz Attempt | 139 | 3000 |
| edge | Submission and Result | 302 | 3000 |
| edge | Attempt History | 191 | 3000 |
| edge | Subject Performance | 220 | 3000 |
| edge | Admin Dashboard | 554 | 3000 |
| firefox | Materials | 1490 | 3000 |
| firefox | Create Quiz | 2180 | 3000 |
| firefox | Quiz Search | 2145 | 3000 |
| firefox | Student Dashboard | 1823 | 3000 |
| firefox | Quiz View | 1614 | 3000 |
| firefox | Quiz Attempt | 326 | 3000 |
| firefox | Submission and Result | 825 | 3000 |
| firefox | Attempt History | 369 | 3000 |
| firefox | Quiz View | 1246 | 3000 |
| firefox | Quiz Attempt | 287 | 3000 |
| firefox | Submission and Result | 780 | 3000 |
| firefox | Attempt History | 285 | 3000 |
| firefox | Subject Performance | 519 | 3000 |
| firefox | Admin Dashboard | 576 | 3000 |

**Local execution includes failed/skipped cases; full Test Plan exit is not satisfied.** CI and later rechecks are separate evidence and do not erase these results.

## Local failed/skipped cases

| Evidence ID | Channel/case | Outcome |
| --- | --- | --- |
| BROWSER-002 | [chrome] complete Student attempt, result, history and subject performance survive Quiz moderation | FAIL |

## Execution observations

PERF-01 (open, P2): the original local full run failed Create Quiz primary-content timing at 3,726 ms against the unchanged 3,000 ms assertion. All 21 original outcomes remain in the catalogue/JUnit; no later pass replaces that failure.

Two isolated repeats of the same Chrome scenario used unchanged product code and assertions: one passed, one failed Quiz View at 3,082 ms. These are additional rechecks, not replacements or extra unique planned cases. Timing is not consistently within the limit on this host; root cause is not established.

The exact-source GitHub Actions matrix passed backend/frontend, HTTPS containers and all three browser jobs. That successful environment result is retained separately from the local timing failures.

All ten isolated browser users completed the upload/create/submit/history/performance workload in each engine: thirty successful concurrent-user flows. The fifty-session API workload is a separate stress measurement; its slower p90 is recorded in the final summary.

The first full runner stopped on its nonzero browser result as designed at that revision. This report-only follow-up explicitly publishes the failed result with --include-failures. Updated reporting automation preserves browser failures in reports and still returns a nonzero exit; it does not weaken the assertion.
