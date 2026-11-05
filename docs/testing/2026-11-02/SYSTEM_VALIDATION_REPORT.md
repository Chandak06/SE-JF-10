# System validation report

Execution date: **2026-11-02**, Asia/Calcutta. Source: `303d1a315f2cd1658d08bc6d148d635e88b9a89d`. Branch: `PES2UG24CS185-Sprint-2`. Reports describe this source plus the frontend coverage/reporting configuration changes listed in the execution manifest; no application source was modified.

The initial full browser matrix passed 17/18 cases; Edge bulk moderation hit the 45-second test timeout at the confirm click. All six Edge cases then passed on an isolated rerun with unchanged product code, selectors and timeouts. Final browser evidence combines Chrome/Firefox from the first run with the complete Edge rerun (18 verified scenarios); the initial failure remains recorded. Its exact transient cause is not established. See [initial browser results](INITIAL_BROWSER_RUN.md).

| Test level | Passed | Failed | Skipped |
| --- | --- | --- | --- |
| backend integration | 131 | 0 | 0 |
| backend unit | 199 | 0 | 0 |
| browser system | 18 | 0 | 0 |
| frontend component/service/integration | 185 | 0 | 0 |

## Executed validation

- Full backend typecheck, production build, regression and coverage passed. Frontend complete regression, lint and compiled local release build passed.
- Complete browser matrix: six real integrated journeys per browser, Chrome/Edge/Firefox, eighteen cases. Includes role navigation, PDF upload/search/view/download/removal, Question Bank/Quiz creation and discovery, trusted persisted scoring, result/history/performance, theme/responsive behavior and confirmed bulk moderation including hidden items. These are local loopback/disposable-database results.
- Built release smoke and actual database/application stop/restart passed (`demo:verify`): compiled assets, authentication/RBAC, PDFs, saved attempts, idempotency, result/download contracts, removal and historical data retention. Saved demo data and Atlas were not used for destructive testing.
- Submitted-document fingerprint guard passed. SRS, SAD and Test Plan were preserved.

Browser versions observed for the installed channels immediately after the matrix:

| Browser channel | Version |
| --- | --- |
| chrome | 156.0.8078.79 |
| edge | 156.0.4314.58 |
| firefox | 157.0 |

## Acceptance still to execute or document, 2–6 November

| Test Plan / SRS item | Current evidence | Remaining evidence / owner |
| --- | --- | --- |
| NF-001 normal-network timing | Automated local content-ready assertions under 3 seconds | Team records typical campus/broadband device/network measurements |
| NF-003 concurrent normal use | Automated 10/50 authenticated HTTP-session workloads | Team records at least 10 simultaneous browser sessions/devices covering ordinary operations |
| NF-004 latest two stable major versions | One installed Chrome/Edge/Firefox channel each, actual versions above | Team supplies acceptance-time latest/previous-major version matrix and results; three engines alone do not satisfy six version slots |
| NF-005 usability | Automated navigation, error and responsive assertions | Representative user completes core workflow without assistance; record observation |
| SR-005 deployed HTTPS | Production transport tests locally; all five jobs passed in [exact-source CI run 41317600728](https://github.com/Chandak06/SE-JF-10/actions/runs/41317600728), including the certificate-validated HTTPS container smoke | Exact-source HTTPS automated evidence is available in CI; no public deployment claim and no local Docker execution |
| Independent peer cross-testing | Automated checks do not establish an independent human review | Prajwal tests Auth/Materials; Karan tests Question/Quiz and Admin/Security; Dharani tests Attempt/Result/History/Performance; all test integration |
| UAT / exit / release | No automated failures in executed cases | QA/team/Guide review, complete RTM/defect log, genuine acceptance, demo and release freeze |

## Defects and conclusion

The final verified automated results pass. The initial Edge bulk-moderation timeout and isolated rerun are recorded above; its exact transient cause is not established. No new product-code defect was confirmed. Continue monitoring this case for flakiness. Lower frontend coverage and incomplete acceptance evidence are explicitly retained as gaps. The historical CSMQ-45 latest-50/weighted-average description was corrected in the supplementary matrix to match the current all-pages/arithmetic-mean implementation. Generated coverage/build files were excluded from frontend lint inputs.

**Automated validation passed; complete Test Plan/UAT exit is still pending the evidence above.** No human approval, unexecuted browser version or future 3–6 November test result is fabricated. See [updated cases](../../TEST_CASES_UPDATED_2026-11-02.md) and [case catalogue](AUTOMATED_TEST_CASE_CATALOGUE.md).

Source CI: [exact-source CI run 41317600728](https://github.com/Chandak06/SE-JF-10/actions/runs/41317600728), all five jobs successful (backend, three browsers and containers). This links the tested application source; the new reporting/configuration commit will receive its own CI run after push.
