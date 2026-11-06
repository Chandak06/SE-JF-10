# Generate plain-text reports from test commands

From the repository root, run:

```powershell
npm run reports:txt
```

This executes the test tools and saves their real stdout/stderr as three UTF-8 files:

| File | Actual commands included |
| --- | --- |
| `reports/text/Unit_Test_Report.txt` | Backend unit/module tests; frontend component/service/integration tests, with verbose case results |
| `reports/text/System_Validation_Report.txt` | Backend integration tests; Chrome/Edge/Firefox browser tests |
| `reports/text/Code_and_Branch_Coverage_Report.txt` | Full backend and frontend V8 coverage commands; their native tables contain both code and branch metrics |

Or generate one file at a time:

```powershell
npm run report:unit:txt
npm run report:system:txt
npm run report:coverage:txt
```

The files contain command lines, source commit/dirty status, real tool output, timestamps and exit codes. Failures remain in the files and return a nonzero command exit. No written assessment or PDF is generated. Counts can overlap between commands and must not be added as unique cases. Existing JUnit, HTML, JSON and LCOV reporters remain available. Re-running a group replaces its previous complete text file. Generated files live in the existing ignored `reports/` directory until deliberately copied for submission.

Use the project's supported Node >=24.15 <25, installed root/frontend dependencies, Playwright browsers and disposable MongoDB fixtures. Frozen SRS, SAD and Test Plan are unchanged.
