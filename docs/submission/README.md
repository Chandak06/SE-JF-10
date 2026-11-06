# Form submission PDFs - Team 10

Upload exactly one PDF to each matching field in the form:

| Form field | File |
| --- | --- |
| Unit Test Report | [Unit_Test_Report.pdf](Unit_Test_Report.pdf) |
| System Validation Report | [System_Validation_Report.pdf](System_Validation_Report.pdf) |
| Code Coverage Report and Branch Coverage Report as a single PDF | [Code_and_Branch_Coverage_Report.pdf](Code_and_Branch_Coverage_Report.pdf) |

This directory contains exactly **three PDFs**, all below the form's **10 MB per file** limit. The coverage PDF includes both reports as clearly labelled parts; do not upload separate code/branch files to that field. Download the actual PDF files from GitHub before selecting them in the form.

Prepared **6 November 2026** from the verified **5 November** production-validation execution; this packaging does not claim a new 6 November test run. Scope: the whole Team 10 project, both sprints. JUnit and catalogue totals agree: **199 backend unit-directory/module + 131 backend integration + 190 mixed frontend + 21 browser cases = 541 passed**. Nine additional browser timing rechecks are reported separately. Coverage counters are weighted across both layers, with the existing backend gates distinguished from the measured frontend/combined values.

The builder verified all 17 evidence hashes, per-suite case counts, JUnit outcomes, combined coverage arithmetic, and matching application/test trees on integrated main. The three PDFs were rendered and visually reviewed; text/page bounds and the upload limits were checked. Linked source evidence uses immutable repository commit URLs.

The System Validation Report retains outstanding independent peer, representative-user/network, latest/previous browser-major and Guide acceptance evidence. Automated success is not a human approval. Submitted SRS, SAD and Test Plan and all historical report packs remain unchanged. Source evidence: [production-validation pack](../testing/2026-11-05-production-validation/README.md); [post-run follow-up](../testing/PRODUCTION_VALIDATION_2026-11-05.md).

To reproduce with Python 3, ReportLab and pypdf, after refreshing `origin/main`:

```powershell
python scripts/build-submission-pdfs.py --prepared-date 2026-11-06
```

The preparation date is metadata for this submission. The report's actual execution date remains 5 November. The builder refuses mismatched source/evidence rather than treating old results as a new execution. Re-render and inspect PDFs after any formatting change.
