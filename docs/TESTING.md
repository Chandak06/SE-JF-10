# Whole-project testing - Team 10

## Current reports

The repository keeps these three reviewed command-generated reports:

- [Unit Test Report](submission/txt/Unit_Test_Report.txt)
- [System Validation Report](submission/txt/System_Validation_Report.txt)
- [Code and Branch Coverage Report](submission/txt/Code_and_Branch_Coverage_Report.txt)

The captures identify tested source `93ef68f21d0fba21945c7cb0f675dc7b9ba9f667` and the actual 6 November 2026 execution times. All six captured commands returned exit code 0. Unit/module and frontend results: 199 and 190 passed. Integration and browser results: 131 and 21 passed. Coverage reruns overlap those cases and must not be counted as extra unique tests. The later successful system run includes all Firefox scenarios.

These files are actual tool output, not authored report summaries. Code and branch coverage share one file. Convert the TXT files to PDF separately if required by the submission form.

## Reproduce

From the repository root:

```powershell
npm run reports:txt
```

See [TXT command details and output locations](TESTING_TXT.md). Dependencies, the supported Node 24 runtime, Playwright browsers and disposable MongoDB fixtures are required. Generated JUnit, HTML, JSON, LCOV and text output stays in the existing ignored runtime directories; only the three reviewed TXT captures are committed as submission reports.

For additional build/release checks, run `npm run check`, frontend lint/build, and `npm run demo:build` followed by `npm run demo:verify`. [GitHub Actions](../.github/workflows/ci.yml) validates the integrated project and TXT-capture safeguards.

## Cases and acceptance

- [Current whole-project Test Case Document](TEST_CASES_WHOLE_PROJECT.md)
- [Test data and boundary classes](testing/TEST_DATA.md)
- [Independent/manual acceptance register](testing/MANUAL_ACCEPTANCE.md)
- [Recorded review-evidence inspection](testing/GITHUB_ACCEPTANCE_EVIDENCE_2026-11-05.md)

The whole-project scope includes all four members' modules from both sprints. Automated passing results do not supply peer, representative-user, network/version-matrix or Project Guide approval. Submitted SRS, SAD and Test Plan remain unchanged.

## Previous exports

Redundant dated Markdown/JSON/XML/LCOV packs, PDF/ZIP exports and their obsolete publication tools were removed from the current tree on 8 November at the user's request. Previous outcomes, including failures, remain recoverable in [the pre-cleanup Git history](https://github.com/Chandak06/SE-JF-10/tree/cb440bba6b20bbfb4e50dc8e67519584ba4b3439/docs/testing). No commit history was rewritten. Original submitted references, Sprint 1 video, Jira evidence and genuine member-review records are retained.
