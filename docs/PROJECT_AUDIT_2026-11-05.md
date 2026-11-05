# Project and testing audit — 5 November 2026

Reviewed application source: `4d1e735b92114cd0ba84328ce1c882ff55508360` on `PES2UG24CS185-Sprint-2`. Main at review start: `303d1a315f2cd1658d08bc6d148d635e88b9a89d`. Review covered submitted requirement mappings, authentication/session lifecycle, upload/search/download, Question Bank/Quiz contracts, trusted scoring/idempotency, saved result/history/performance, moderation, deployment/CI and report integrity.

## Result

The implemented modules pass the executed automated validation after the corrections below. The audit found **two reproducible product defects** and corrected both on the Sprint 2 branch. Main does not yet contain these fixes or the dated testing packs. No open PR existed when checked; merge/review is a separate integration step.

The four requested reports are available in the [5 November testing pack](testing/2026-11-05/README.md), with [updated test cases](TEST_CASES_UPDATED_2026-11-05.md), per-case outcomes, JUnit, LCOV, coverage summaries and source/evidence fingerprints. Original [2 November evidence](testing/2026-11-02/README.md), including its Edge timeout and rerun, is preserved. The final 5 November browser execution passed all eighteen cases in one complete run.

## Confirmed defects and corrections

| ID / priority | Module ownership | Reproduced behavior | Correction and verification | State |
| --- | --- | --- | --- | --- |
| AUDIT-01 / P2 | Shared auth/material integration, Harshit with Dharani's module | Delayed old upload/list 401 responses or successful old logout cleared a newer login | Capture request token/session version and invalidate only that session. Three regression cases failed before the change; final complete frontend suite passes. `frontend/src/services/authService.test.ts` | Fixed on Sprint 2 branch; main integration pending |
| AUDIT-02 / P2 | Karan's Quiz Attempt UI; integration correction by Harshit | Real submission 401 cleared the user; the next render dereferenced null and crashed | Capture the original draft owner/key; preserve answers on expiry and block submission after an account switch. Real-service expiry case failed before correction; expiry/account-switch regressions pass. `frontend/src/pages/QuizAttemptPage.session-expiry.test.tsx` | Fixed on Sprint 2 branch; main integration pending |
| REPORT-01 / P2, tooling | Harshit | Report generator could partially write evidence before rejecting a run, overwrite a historical pack, and carry fixed 2 November/Edge-timeout wording into a new clean run | Validate provenance/commands and JUnit counts/errors; publish from private staging; reject existing snapshots and partial browser matrices; use actual date and run history. Seven synthetic-fixture integrity regressions pass and run in CI. | Corrected; not counted as a product defect |
| DOC-01 / P3 | Harshit/shared guidance | README described main as Sprint 1, real modules as missing and PR #8 as still awaiting merge | Corrected current README, RTM and supplementary plan; historical reports remain dated. | Corrected |

No additional confirmed defect was found in the executed Question Bank/Quiz authoring, PDF, scoring/history/performance or moderation checks. This is a bounded audit, not a proof that every possible input/environment is defect-free.

Publication follow-up: Windows temporary-directory ACLs initially prevented normal Git from reading the generated pack. Its inherited workspace permissions were restored without changing report contents. Future staging directories inherit normal workspace ACLs; the seven publisher-integrity checks were rerun after this correction.

## Executed verification and metrics

| Verification | Actual result |
| --- | --- |
| Backend unit cases | 199 passed |
| Backend integration cases | 131 passed |
| Frontend component/service/integration cases | 190 passed |
| Browser system cases | 18 passed: six each in installed Chrome, Edge and Firefox |
| Application automated execution/pass rate | 538/538 cases executed and passing in the final evidence; 0 failed, 0 skipped |
| Report-publisher regressions | 7 passed, using synthetic fixtures; separate from product acceptance |
| Backend coverage | 97.85% lines, 97.52% statements, 98.91% functions, 92.06% branches; configured gates pass |
| Frontend coverage | 81.70% lines, 78.64% statements, 79.27% functions, 72.00% branches; measured baseline, no frontend threshold pass claimed |
| Build/lint/release | Backend types/build, frontend lint/compiled build, same-origin release and actual database stop/restart smoke passed |
| Frozen references | Submitted-document fingerprints pass; Sprint 1 branch/video and original plan copies preserved |
| Requirement mapping | All 17 functional, 5 nonfunctional and 5 security requirement IDs remain represented in RTM/cases; mapping does not equal final acceptance |
| Audit defect age | Both product findings discovered and corrected on 5 November: 0 calendar days to branch fix; main integration/closure remains pending |
| Audit-observed defect density | 2 new product findings / 6.970 KLOC = 0.287 findings/KLOC. Denominator: 70 tracked `.ts`/`.tsx` product files, 6,970 nonblank physical lines including comments; excludes tests, setup and declarations. This describes this audit's discoveries, not all historical project defects. |

Tests used disposable local MongoDB fixtures; no destructive Atlas or saved demonstration operations were performed. Final frontend/browser/release checks exercised the corrected source. The backend tree, tests, dependency locks and configuration were unchanged from the fresh complete backend run; the manifest records this provenance. Exact-source CI status and jobs are recorded in the report manifest; report-only later commits have separate runs.

## Evidence still required for complete Test Plan exit

| Item | Verified evidence | Remaining record |
| --- | --- | --- |
| Browser compatibility, NF-004 | One installed version of each engine; exact versions in current report | Acceptance-time latest and previous stable major version for each browser, with core-flow results |
| Normal-network performance, NF-001 | Local content-ready assertions under 3 seconds | Representative campus/broadband device/network measurements |
| Concurrent normal use, NF-003 | Separate 10/50 authenticated HTTP-session load cases pass | At least 10 simultaneous browser sessions/devices doing normal operations, as specified in the SRS verification procedure |
| Usability, NF-005 | Automated navigation, responsive layouts, theme and feedback checks | Representative user performs the workflow without assistance; record observation |
| Independent cross-testing | Automated tests cover all delivered module integrations | Record named peer execution/review: Prajwal tests Dharani, Karan tests Prajwal and Harshit, Dharani tests Karan; all members test integration |
| Acceptance, demonstration and freeze | Built local release works; CI includes certificate-validated HTTPS | Evidence of chosen demo environment/video, actual approval and release freeze |
| Integration into main | Fixes, cases and report packs are published on the named Sprint 2 branch | Review/merge the branch before treating main as the corrected evaluation build |

The [original archived Test Plan](historical/HISTORICAL_TEST_PLAN_2026-09-13.pdf) is byte-identical to the local `Original_Test_Plan.pdf` supplied on 2 November. It requests execution logs, defect reports, daily/final summaries, requirement metrics and approvals. These automated reports and this audit supply the execution/defect/metric records; its approval table remains blank. The original Sprint 0–4 milestone schedule is historical; the supplementary two-implementation-sprint plan carries all remaining validation into Sprint 2. No submitted file was rewritten to hide this schedule history or invent approval.

## Jira consistency

Fresh read-only Jira check: **24/24 known Sprint 2 implementation items are Done**, including Harshit's seven. However, CSMQ-33 and CSMQ-34 descriptions still explicitly say independent cross-testing/demo/freeze are pending; both comment lists were empty. This establishes an evidence/status mismatch in the inspected records, not proof that the team did no offline work. Attach actual results/approval if completed, or reflect outstanding validation in the workflow. Jira statuses were not changed by this audit.

**Automated product validation passes after the fixes. Full project/testing acceptance is not established until the outstanding evidence and main integration are completed.**
