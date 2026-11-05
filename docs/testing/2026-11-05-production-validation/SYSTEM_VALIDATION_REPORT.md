# System validation report

Execution date: **2026-11-05**, Asia/Calcutta. Source: `888c0666ae78e14be134a6c090be860d254ddb00`. Branch: `PES2UG24CS185-Sprint-2`. The execution manifest identifies the tested source and reporting configuration.

Scope: **the whole Team 10 project**, covering Auth/Materials (Dharani), Question Bank/Quiz (Prajwal), Attempt/Result/History/Performance (Karan), Admin/Security/CI and shared integration (Harshit). Execution coordination does not replace independent peer acceptance.

| Test level | Passed | Failed | Skipped |
| --- | --- | --- | --- |
| backend integration | 131 | 0 | 0 |
| backend unit | 199 | 0 | 0 |
| browser system | 21 | 0 | 0 |
| frontend component/service/integration | 190 | 0 | 0 |

## Executed validation

- Full backend typecheck, production build, regression and coverage passed. Frontend complete regression, lint and compiled local release build passed.
- Complete Chrome/Edge/Firefox browser matrix: 21 verified cases; individual journeys and channels are listed in the case catalogue. Includes role navigation, PDF upload/search/view/download/removal, Question Bank/Quiz creation and discovery, trusted persisted scoring, result/history/performance, theme/responsive behavior and confirmed bulk moderation including hidden items. These are local loopback/disposable-database results.
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
| SR-005 deployed HTTPS | Production transport tests locally; all five jobs passed in [exact-source CI run 41988979219](https://github.com/Chandak06/SE-JF-10/actions/runs/41988979219), including the certificate-validated HTTPS container smoke | Exact-source HTTPS automated evidence is available in CI; no public deployment claim and no local Docker execution |
| Independent peer cross-testing | Automated checks do not establish an independent human review | Prajwal tests Auth/Materials; Karan tests Question/Quiz and Admin/Security; Dharani tests Attempt/Result/History/Performance; all test integration |
| UAT / exit / release | No automated failures in executed cases | QA/team/Guide review, complete RTM/defect log, genuine acceptance, demo and release freeze |

## Defects and conclusion

The final automated run passed without failed or skipped cases. Historical failures remain recorded in their original dated packs; confirmed audit findings are listed below when applicable. Lower frontend coverage and incomplete acceptance evidence are explicitly retained as gaps. The historical CSMQ-45 latest-50/weighted-average description was corrected in the supplementary matrix to match the current all-pages/arithmetic-mean implementation. Generated coverage/build files were excluded from frontend lint inputs.

**Automated validation passed; complete Test Plan/UAT exit is still pending the evidence above.** No human approval, unexecuted browser version or unexecuted test result is fabricated. See [updated cases](../../TEST_CASES_WHOLE_PROJECT.md) and [case catalogue](AUTOMATED_TEST_CASE_CATALOGUE.md).

Source CI: [exact-source CI run 41988979219](https://github.com/Chandak06/SE-JF-10/actions/runs/41988979219), all five jobs successful (backend, three browsers and containers). This links the tested application source; the new reporting/configuration commit will receive its own CI run after push.

## Concurrent browser-session evidence

| Channel | Actual version | Sessions | Completed | Page errors | Elapsed ms |
| --- | --- | --- | --- | --- | --- |
| chrome | 156.0.8078.80 | 10 | 10 | 0 | 37058 |
| edge | 156.0.4314.58 | 10 | 10 | 0 | 38609 |
| firefox | 157.0 | 10 | 10 | 0 | 51149 |

## Single-user primary-content timings

Local same-origin fixture, application already started; browser actions/content-ready assertions, 3,000 ms limit. Concurrency timings above are a separate functional workload.

| Channel | Page/action | Milliseconds | Limit |
| --- | --- | --- | --- |
| chrome | Materials | 250 | 3000 |
| chrome | Create Quiz | 373 | 3000 |
| chrome | Quiz Search | 218 | 3000 |
| chrome | Student Dashboard | 368 | 3000 |
| chrome | Quiz View | 207 | 3000 |
| chrome | Quiz Attempt | 325 | 3000 |
| chrome | Submission and Result | 590 | 3000 |
| chrome | Attempt History | 184 | 3000 |
| chrome | Quiz View | 358 | 3000 |
| chrome | Quiz Attempt | 180 | 3000 |
| chrome | Submission and Result | 429 | 3000 |
| chrome | Attempt History | 351 | 3000 |
| chrome | Subject Performance | 303 | 3000 |
| chrome | Admin Dashboard | 207 | 3000 |
| edge | Materials | 188 | 3000 |
| edge | Create Quiz | 276 | 3000 |
| edge | Quiz Search | 162 | 3000 |
| edge | Student Dashboard | 146 | 3000 |
| edge | Quiz View | 141 | 3000 |
| edge | Quiz Attempt | 126 | 3000 |
| edge | Submission and Result | 324 | 3000 |
| edge | Attempt History | 169 | 3000 |
| edge | Quiz View | 213 | 3000 |
| edge | Quiz Attempt | 169 | 3000 |
| edge | Submission and Result | 360 | 3000 |
| edge | Attempt History | 118 | 3000 |
| edge | Subject Performance | 238 | 3000 |
| edge | Admin Dashboard | 350 | 3000 |
| firefox | Materials | 294 | 3000 |
| firefox | Create Quiz | 275 | 3000 |
| firefox | Quiz Search | 326 | 3000 |
| firefox | Student Dashboard | 204 | 3000 |
| firefox | Quiz View | 250 | 3000 |
| firefox | Quiz Attempt | 150 | 3000 |
| firefox | Submission and Result | 400 | 3000 |
| firefox | Attempt History | 138 | 3000 |
| firefox | Quiz View | 241 | 3000 |
| firefox | Quiz Attempt | 117 | 3000 |
| firefox | Submission and Result | 367 | 3000 |
| firefox | Attempt History | 187 | 3000 |
| firefox | Subject Performance | 194 | 3000 |
| firefox | Admin Dashboard | 401 | 3000 |

## Execution observations

Browser journeys and page-load timings use the compiled production frontend with same-origin API proxying and disposable real MongoDB. The 3000 ms assertion is unchanged. Earlier development-server timing failures remain in their original dated pack.
