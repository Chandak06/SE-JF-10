# Reviewed testing reports

Keep these three files for submission:

| Form field | Command-generated TXT |
| --- | --- |
| Unit Test Report | [Unit_Test_Report.txt](txt/Unit_Test_Report.txt) |
| System Validation Report | [System_Validation_Report.txt](txt/System_Validation_Report.txt) |
| Code Coverage Report and Branch Coverage Report as one file | [Code_and_Branch_Coverage_Report.txt](txt/Code_and_Branch_Coverage_Report.txt) |

All three files are unchanged copies of the reviewed 6 November command output at source `93ef68f21d0fba21945c7cb0f675dc7b9ba9f667`. All six command exit codes are 0. The successful system rerun finished at 20:27 IST and includes all 21 browser scenarios. Repeated cases in coverage reruns are not extra unique tests.

Convert these TXT files to PDF yourself if the form requires PDF. The repository no longer keeps redundant PDF exports or old generated report packs; those remain recoverable from Git history.

To create new local TXT output:

```powershell
npm run reports:txt
```

See [generation commands](../TESTING_TXT.md), [current test cases](../TEST_CASES_WHOLE_PROJECT.md) and [manual acceptance requirements](../testing/MANUAL_ACCEPTANCE.md). The command uses real test tools and preserves failed outcomes and exit codes. New local output does not automatically replace these reviewed submission copies.
