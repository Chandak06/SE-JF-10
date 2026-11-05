# Testing reports — 2 November 2026

Execution date: **2026-11-02**, Asia/Calcutta. Source: `303d1a315f2cd1658d08bc6d148d635e88b9a89d`. Branch: `PES2UG24CS185-Sprint-2`. Reports describe this source plus the frontend coverage/reporting configuration changes listed in the execution manifest; no application source was modified.

The initial full browser matrix passed 17/18 cases; Edge bulk moderation hit the 45-second test timeout at the confirm click. All six Edge cases then passed on an isolated rerun with unchanged product code, selectors and timeouts. Final browser evidence combines Chrome/Firefox from the first run with the complete Edge rerun (18 verified scenarios); the initial failure remains recorded. Its exact transient cause is not established. See [initial browser results](INITIAL_BROWSER_RUN.md).

Day-one evidence for the **2–6 November** testing window. Later runs should use a new dated folder; preserve this snapshot.

- [Updated Test Case Document](../../TEST_CASES_UPDATED_2026-11-02.md)
- [Unit Test Report](UNIT_TEST_REPORT.md)
- [System Validation Report](SYSTEM_VALIDATION_REPORT.md)
- [Code Coverage Report](CODE_COVERAGE_REPORT.md)
- [Branch Coverage Report](BRANCH_COVERAGE_REPORT.md)
- [Executed cases](AUTOMATED_TEST_CASE_CATALOGUE.md) / [CSV](AUTOMATED_TEST_CASE_CATALOGUE.csv)
- [Execution manifest and evidence hashes](evidence/manifest.json)

| Test level | Passed | Failed | Skipped |
| --- | --- | --- | --- |
| backend integration | 131 | 0 | 0 |
| backend unit | 199 | 0 | 0 |
| browser system | 18 | 0 | 0 |
| frontend component/service/integration | 185 | 0 | 0 |

## Reproduction

Use supported Node >=24.15 <25, install root and frontend dependencies, and install Playwright Chrome, Edge and Firefox. The version-matched V8 provider is installed by the root `npm ci` and resolves from frontend tests through the parent dependency tree. All Mongo fixtures must remain disposable.

```powershell
npm ci
npm ci --prefix frontend
npm run check
npm run test:coverage --prefix frontend
npm run lint --prefix frontend
npm run demo:build
npm run test:browser --prefix frontend
npm run demo:verify
```

JUnit/HTML/LCOV runner outputs are generated in ignored `reports/`, `coverage/`, `frontend/reports/`, `frontend/coverage/` and `frontend/playwright-report/`. This docs snapshot retains portable sanitized JUnit and JSON/LCOV, not local machine paths, credentials or browser traces. CI retains full generated artifacts. Browser coverage and backend coverage are separate.

After completed executions, record actual command exit codes/source/date and browser versions in ignored `.local/testing-YYYY-MM-DD/execution.json` and `browser-versions.json`, then run:

```powershell
python scripts/generate-testing-reports.py --date 2026-11-02
```

The generator rejects stale evidence, mismatched source revisions and nonzero required command exits. It rejects a non-passing final case set and retains the initial failed browser run separately when a rerun was needed. Never replace pending manual results with automated passes. See the manifest for this snapshot's exact commands/configuration. Original submitted documents are unchanged.
