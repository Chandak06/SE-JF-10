# Test-tool outputs for the form

## Reviewed TXT command outputs

The latest reviewed TXT files were captured from the actual commands at source `93ef68f21d0fba21945c7cb0f675dc7b9ba9f667`. All six commands returned exit code 0. The successful system rerun completed on 6 November at 20:27 IST: 131 integration cases and all 21 browser scenarios passed, including Firefox. Repeated cases in the coverage commands are not additional unique cases.

- [Unit / component results](txt/Unit_Test_Report.txt)
- [Integration / system results](txt/System_Validation_Report.txt)
- [Code and branch coverage](txt/Code_and_Branch_Coverage_Report.txt)

These files are unchanged copies of `reports/text/` output and can be converted to PDF by the submitter. Earlier native PDF exports and their separate execution record are retained below. [TXT generation commands](../TESTING_TXT.md).

## Earlier native PDF exports

| Upload field | PDF export |
| --- | --- |
| Unit Test Report | [Unit_Test_Report.pdf](Unit_Test_Report.pdf) |
| System Validation Report | [System_Validation_Report.pdf](System_Validation_Report.pdf) |
| Code Coverage Report and Branch Coverage Report as a single PDF | [Code_and_Branch_Coverage_Report.pdf](Code_and_Branch_Coverage_Report.pdf) |

The PDFs are printed exports of test-tool output, not authored narrative reports. The unit PDF contains backend unit/module JUnit results and separately labelled frontend component/service/integration results. The system PDF contains Playwright's HTML report and complete JUnit case list. The combined coverage PDF prints V8/Istanbul HTML tables for both layers, including branch coverage. Exactly three PDFs are provided, each below the form's 10 MB limit.

Latest actual execution: **6 November 2026**. Download the [native HTML/XML/coverage reports and command logs](../testing/2026-11-06-native-tool-reports/native-reports.zip), or inspect the [machine execution record](../testing/2026-11-06-native-tool-reports/execution.json). The HTML files provide the original interactive navigation; PDF exports are static printouts.

## Generate reports by running tests

Use Node >=24.15 <25, installed root/frontend dependencies and Playwright browsers, and Python 3. Tests use disposable MongoDB.

```powershell
python -m pip install --target .local/report-tools -r scripts/native-report-requirements.txt
npm run reports:native
```

The workflow executes and logs these commands:

```powershell
npm run test:coverage
npm run test:unit -- --reporter=default --reporter=junit --outputFile=reports/unit-junit.xml
npm run test:coverage --prefix frontend
npm run test:browser --prefix frontend
npm run check:submitted
```

| Native output | Produced by |
| --- | --- |
| `reports/junit.xml`, `reports/unit-junit.xml` | Vitest JUnit reporter; full backend and separate unit subset |
| `frontend/reports/junit.xml` | Vitest JUnit reporter |
| `coverage/index.html`, `frontend/coverage/index.html`, JSON and LCOV | Vitest V8/Istanbul; branch coverage is a column in the same report |
| `frontend/playwright-report/index.html` | Playwright HTML reporter |
| `frontend/reports/browser-junit.xml`, `browser-results.json` | Playwright JUnit and JSON reporters |

JUnit XML is converted to HTML using the standard junit2html tool. Chromium prints the actual HTML pages; pdf-lib joins the exports. Neither conversion writes outcomes or a narrative assessment.

The dated `docs/testing/<execution-date>-native-tool-reports/` archive retains native HTML, JUnit, coverage data, Playwright output, command logs and execution.json. Extract native-reports.zip to open the reports locally. Actual dates, source SHA, versions, counts and exit codes come from the execution record. The separate unit run repeats a subset and is not added to the whole-project unique-case count.

Tests returning nonzero remain failures in the reports and command exit. If only printing needs to resume after a failed export, `npm run reports:native -- --export-only` uses the same recorded source/execution without rerunning tests. Published dated archives are not overwritten.

Submitted SRS, SAD and Test Plan and historical evidence are unchanged. Human acceptance and required browser-version/network evidence remain in [MANUAL_ACCEPTANCE.md](../testing/MANUAL_ACCEPTANCE.md); passing tool output does not supply approvals.
