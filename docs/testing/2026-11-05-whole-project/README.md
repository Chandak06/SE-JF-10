# Testing reports — 2026-11-05

Execution date: **2026-11-05**, Asia/Calcutta. Source: `4a2b3acbf320f15736f30ab64885c169e22fe8d1`. Branch: `PES2UG24CS185-Sprint-2`. The execution manifest identifies the tested source and reporting configuration.

Scope: **the whole Team 10 project**, covering Auth/Materials (Dharani), Question Bank/Quiz (Prajwal), Attempt/Result/History/Performance (Karan), Admin/Security/CI and shared integration (Harshit). Execution coordination does not replace independent peer acceptance.

Execution evidence for the **2–6 November** testing window. Later runs should use a new dated folder; preserve this snapshot.

- [Updated Test Case Document](../../TEST_CASES_WHOLE_PROJECT.md)
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
| browser system | 20 | 1 | 0 |
| frontend component/service/integration | 190 | 0 | 0 |

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
python scripts/generate-testing-reports.py --date 2026-11-05
```

The generator rejects stale evidence, mismatched source revisions and nonzero required command exits. It rejects a non-passing final case set and retains the initial failed browser run separately when a rerun was needed. Never replace pending manual results with automated passes. See the manifest for this snapshot's exact commands/configuration. Original submitted documents are unchanged.

**Local execution includes failed/skipped cases; full Test Plan exit is not satisfied.** CI and later rechecks are separate evidence and do not erase these results.

This pack explicitly includes failed outcomes (`--include-failures`). The nonzero browser command and failed case are preserved. Default passing-only publication still rejects them.
