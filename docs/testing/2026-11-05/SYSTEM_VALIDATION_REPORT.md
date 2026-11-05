# System validation report

Execution date: **2026-11-05**, Asia/Calcutta. Source: `4d1e735b92114cd0ba84328ce1c882ff55508360`. Branch: `PES2UG24CS185-Sprint-2`. The execution manifest identifies the tested source and reporting configuration.

| Test level | Passed | Failed | Skipped |
| --- | --- | --- | --- |
| backend integration | 131 | 0 | 0 |
| backend unit | 199 | 0 | 0 |
| browser system | 18 | 0 | 0 |
| frontend component/service/integration | 190 | 0 | 0 |

## Executed validation

- Full backend typecheck, production build, regression and coverage passed. Frontend complete regression, lint and compiled local release build passed.
- Complete Chrome/Edge/Firefox browser matrix: 18 verified cases; individual journeys and channels are listed in the case catalogue. Includes role navigation, PDF upload/search/view/download/removal, Question Bank/Quiz creation and discovery, trusted persisted scoring, result/history/performance, theme/responsive behavior and confirmed bulk moderation including hidden items. These are local loopback/disposable-database results.
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
| NF-003 concurrent normal use | Automated 10/50 authenticated HTTP-session workloads | Team records at least 10 simultaneous browser sessions/devices covering ordinary operations |
| NF-004 latest two stable major versions | One installed Chrome/Edge/Firefox channel each, actual versions above | Team supplies acceptance-time latest/previous-major version matrix and results; three engines alone do not satisfy six version slots |
| NF-005 usability | Automated navigation, error and responsive assertions | Representative user completes core workflow without assistance; record observation |
| SR-005 deployed HTTPS | Production transport tests locally; all five jobs passed in [exact-source CI run 41974338002](https://github.com/Chandak06/SE-JF-10/actions/runs/41974338002), including the certificate-validated HTTPS container smoke | Exact-source HTTPS automated evidence is available in CI; no public deployment claim and no local Docker execution |
| Independent peer cross-testing | Automated checks do not establish an independent human review | Prajwal tests Auth/Materials; Karan tests Question/Quiz and Admin/Security; Dharani tests Attempt/Result/History/Performance; all test integration |
| UAT / exit / release | No automated failures in executed cases | QA/team/Guide review, complete RTM/defect log, genuine acceptance, demo and release freeze |

## Defects and conclusion

The final automated run passed without failed or skipped cases. Historical failures remain recorded in their original dated packs; confirmed audit findings are listed below when applicable. Lower frontend coverage and incomplete acceptance evidence are explicitly retained as gaps. The historical CSMQ-45 latest-50/weighted-average description was corrected in the supplementary matrix to match the current all-pages/arithmetic-mean implementation. Generated coverage/build files were excluded from frontend lint inputs.

**Automated validation passed; complete Test Plan/UAT exit is still pending the evidence above.** No human approval, unexecuted browser version or unexecuted test result is fabricated. See [updated cases](../../TEST_CASES_UPDATED_2026-11-05.md) and [case catalogue](AUTOMATED_TEST_CASE_CATALOGUE.md).

Source CI: [exact-source CI run 41974338002](https://github.com/Chandak06/SE-JF-10/actions/runs/41974338002), all five jobs successful (backend, three browsers and containers). This links the tested application source; the new reporting/configuration commit will receive its own CI run after push.

## Confirmed audit findings

| Finding | Owner/module | Status | Correction and verification |
| --- | --- | --- | --- |
| AUDIT-01 | Harshit / shared auth-material integration | Fixed on Sprint 2 branch; main integration pending | Delayed upload/list 401 and old logout cleared a newer login. Three tests failed before the correction and pass in the final full frontend run: frontend/src/services/authService.test.ts. |
| AUDIT-02 | Karan / Attempt UI; shared integration fix by Harshit | Fixed on Sprint 2 branch; main integration pending | Real submission expiry caused a null-user render crash. Stable owner-bound drafts and submission identity checks preserve answers and reject changed sessions. Expiry failed before correction; expiry/account-switch cases pass: frontend/src/pages/QuizAttemptPage.session-expiry.test.tsx. |
| REPORT-01 | Harshit / report publisher | Fixed and guarded in CI | Report publication now validates before publishing, stages output privately, preserves existing snapshots, rejects missing commands/count mismatches/suite errors/partial matrices, and uses the actual date without an inherited timeout claim. Seven integrity regressions pass. |
| DOC-01 | Harshit / current guidance | Corrected | README/RTM/plan clarify that main already has Sprint 2 integrations, Sprint 1 is saved separately, real Quiz/Attempt/History modules are available, and current test reports remain on the audit branch. |
