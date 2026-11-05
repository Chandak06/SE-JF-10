# Whole-project Test Case Document — 5 November 2026

Owner/coordinator: Harshit Chandak (PES2UG24CS185), Team 10. Testing window: **2–6 November 2026**. This supplementary revision updates the test cases for the integrated Sprint 1 and Sprint 2 application. The submitted SRS, SAD and Test Plan remain unchanged. Current execution results are in [the production report pack](testing/2026-11-05-production-validation/README.md); the generated case catalogue records every executed automated case, its source, duration and outcome. The [earlier failed execution](testing/2026-11-05-whole-project/README.md) remains preserved.

## Execution rules and fixtures

Browser system and performance cases build the actual production frontend and serve it with a same-origin API proxy against disposable MongoDB. Production mode and the unchanged 3,000 ms timing limit are identified in Playwright metadata and verified by the report runner. Development-server timing failures remain historical evidence; production loopback passes do not establish representative-network or human acceptance.

Use a disposable database, never the saved demonstration or Atlas database, for destructive tests. Prepare two Students (A and B), an explicitly provisioned Admin, a valid small PDF, a non-PDF, an oversized PDF, four-option MCQs across two subjects/difficulties, and a Quiz with correct, incorrect and unanswered responses. The automated scripts create and clean their own fixtures. Manual testers must record browser/version, build SHA, time, actual result and any Jira defect; an expected result alone is not a pass.

The table describes executable test procedures. Evidence paths are relative to the repository. **A** means automated coverage available, not that human acceptance has been signed. **M** means independent/manual execution remains required; named peer and user acceptance are recorded separately. Consult the dated report for actual execution status.

## Functional and regression cases

| Case / SRS requirement | Preconditions and steps | Expected result and boundary checks | Evidence / mode |
| --- | --- | --- | --- |
| TC-Auth-01 / F-001 | Register a unique Student; repeat normalized email, malformed email and weak/oversized inputs; try supplying an Admin role. | Unique valid account saved with hashed password and Student role; duplicates/invalid inputs rejected; no password hash in responses. | `backend/tests/integration/security.test.ts`, `runtime.test.ts`; A |
| TC-Auth-02 / F-002 | Log in with correct password; wrong password; unknown/disabled account; reload a protected page. | Correct session restored only after server validation; generic invalid-credential response; disabled account denied; no client-only privilege escalation. | `backend/tests/integration/security.test.ts`, `frontend/tests/admin-session.integration.test.tsx`; A |
| TC-Auth-03 / F-004 | Log out, replay old token, reload protected page; send a delayed 401 from an old session after a newer login. | Old session unusable; newer successful session retained; protected navigation returns to login appropriately. | `backend/tests/integration/security.test.ts`, `frontend/src/services/final-integration.test.ts`; A |
| TC-MAT-01 / F-010 | Student uploads valid PDF with metadata; try missing metadata, misleading extension/MIME, malformed PDF, over-limit file and anonymous upload. | Valid bytes and owner persisted; invalid uploads rejected without partial/orphan data; anonymous request denied before upload handling. | `backend/tests/integration/runtime.test.ts`, `backend/tests/unit/material-upload-validation.test.ts`; A |
| TC-MAT-02 / F-012 | Upload materials with distinct titles/subjects/descriptions; combine keyword and subject; page through 26+ matches; upload while filtered. | Correct combined results; next page reachable; filter retained; removed items excluded; query metacharacters treated safely. | `backend/tests/integration/sprint2.test.ts`, `frontend/e2e/moderation.spec.ts`; A |
| TC-MAT-03 / F-013 | Download and view PDF as Student through `/file` and SAD `/download`; repeat anonymously and after removal. | Downloaded bytes equal fixture; correct headers; unauthorized/removed content denied; object URLs released by UI. | `backend/tests/integration/team-sprint2.test.ts`, `frontend/src/pages/MaterialsPage.test.tsx`; A |
| TC-QB-01 / F-020 | Admin adds valid MCQ; try Student/anonymous creation, missing or duplicate options, unknown correct answer, invalid difficulty and forged fields. | Valid classification/key stored; unauthorized creation denied; malformed bodies rejected; Student-safe reads exclude answer keys. | `backend/tests/integration/questions.test.ts`, `backend/tests/unit/question-validation.test.ts`; A |
| TC-QB-02 / F-022 | Admin combines subject/topic/difficulty; search mixed case and literal regex metacharacters; rapidly change filters during a pending request. | Matching questions only; safe literal matching; previous result set cannot be selected under a different filter; errors distinguished from empty results. | `backend/tests/unit/question-filters.test.ts`, `frontend/src/pages/QuestionBankPage.test.tsx`, `CreateQuizPage.test.tsx`; A |
| TC-QUIZ-01 / F-030 | Student creates Quiz from existing active MCQs; try empty/duplicate/missing/removed selections, malformed title/subject and forged key fields. | Valid Quiz saved with real Question references; invalid selections rejected; no answer-key leakage. | `backend/tests/integration/quizzes.test.ts`, `quiz-contract-cross-module.test.ts`; A |
| TC-QUIZ-02 / F-032 | Search/view Quiz, including mixed-case valid ID; change search filters before earlier response completes; remove Quiz. | Correct discovery/view; stale results suppressed; removed Quiz absent/unavailable; safe failure messages. | `frontend/src/pages/QuizListPage.test.tsx`, `QuizAttemptLoader.test.tsx`, `backend/tests/integration/team-sprint2.test.ts`; A |
| TC-QUIZ-03 / F-033 | Open legacy practice URL, discover a real Quiz, explicitly start it, select/navigate/reload answers. | Legacy route leads to real discovery; real Quiz and saved draft loaded; no unsolicited practice timer; UI explicitly has no time limit; draft is not a saved result. | `frontend/src/App.test.tsx`, `frontend/src/services/final-integration.test.ts`, `frontend/e2e/moderation.spec.ts`; A |
| TC-QUIZ-04 / F-034 | Submit mixed correct/incorrect/unanswered MCQs; forge score/user/key; submit unknown/duplicate response IDs. | Server evaluates stored key; one point per correct response; invalid/forged fields rejected; no client-supplied score trusted. | `backend/tests/unit/trusted-evaluation.test.ts`, `backend/tests/integration/attempt-api.test.ts`; A |
| TC-QUIZ-04-Retry / F-034 | Race two requests with one Idempotency-Key; retry after reload/reconnect; reuse key with changed answers; submit new intentional attempt with new key. | One persisted result for same submission; changed payload returns conflict; fresh intentional attempt allowed; no duplicate history on retry. | `backend/tests/integration/team-sprint2.test.ts`, `frontend/src/services/final-integration.test.ts`; A |
| TC-QUIZ-05 / F-035 | Submit successfully, open result; simulate failed save and another Student's result lookup. | Result shown only after successful save; SAD `resultId` matches saved attempt; answer feedback supplied after submission only; no cross-user disclosure. | `frontend/src/pages/QuizResultPage.test.tsx`, `backend/tests/integration/attempt-api.test.ts`; A |
| TC-QUIZ-06 / F-036 | Create multiple attempts as A and B; page history as each; remove source content; reconnect/restart. | Owner-specific saved history; valid paging; no answer-key fields; history retained after source removal and restart. | `backend/tests/integration/csmq45-history-isolation.test.ts`, `team-sprint2.test.ts`; A |
| TC-PERF-01 / F-040 | Seed 51+ attempts across subjects; calculate known means; test empty history, failed later page and inconsistent pagination. | All completed attempts included; arithmetic mean of saved percentages per subject, not total-marks weighting; no silently partial average; clear empty/error state. | `frontend/src/services/final-integration.test.ts`, `attemptInsights.csmq45-acceptance.test.ts`; A |
| TC-ADMIN-01 / F-041 | Admin lists materials, cancels removal then confirms; try Student/anonymous, missing confirmation and repeat removal. | Cancellation changes nothing; confirmed item unavailable to Students; audit/bytes retained; RBAC and strict validation enforced. | `backend/tests/integration/sprint2.test.ts`, `frontend/e2e/moderation.spec.ts`; A |
| TC-ADMIN-02 / F-042 | Remove Question or Quiz; retry discovery, direct view and submission; read a previously completed attempt. | Removed source cannot be used for new operations; saved attempt remains readable by owner; audit records retained. | `backend/tests/integration/team-sprint2.test.ts`, `question-moderation.test.ts`; A |
| TC-ADMIN-Bulk / F-041/042 regression | For each resource, filter to hide another active item; cancel Delete all; confirm Delete all; repeat; try Student/anonymous and malformed confirmation. | Warning explicitly includes hidden items; cancellation sends no mutation; all active items of selected kind soft-removed; repeat count zero; audit/history/PDF bytes retained; only Admin may execute. | `backend/tests/integration/bulk-moderation.test.ts`, `frontend/src/pages/AdminPage.test.tsx`, `frontend/e2e/moderation.spec.ts`; A |
| TC-ADMIN-Nav / SR-002/003 | Admin logs in, navigates dashboard/Question Bank/moderation at narrow/wide viewport; Student visits same URLs. | Role-appropriate navigation; no overflow; direct Student access denied by server and UI. | `frontend/src/pages/AdminDashboardPage.test.tsx`, `frontend/e2e/moderation.spec.ts`; A |

## Security, system and acceptance cases

| Case / requirement | Procedure | Expected result / evidence boundary | Mode |
| --- | --- | --- | --- |
| TC-SEC-01 / SR-001 | Inspect persisted fixture password and session storage, initial Admin CLI refusal/success cases, API responses and CLI output. | Password hashed; bootstrap explicit/confirmed; registration cannot elevate Student; no secrets leaked. `backend/tests/integration/admin-provisioning.test.ts`, `security.test.ts`. | A |
| TC-SEC-02 / SR-002/003 | Exercise protected APIs with missing, forged, revoked, expired, disabled-user and wrong-role credentials, including changed role after login. | Controlled 401/403, current server role applied, no unauthorized mutation. `security.test.ts`, `bulk-moderation.test.ts`. | A |
| TC-SEC-03 / SR-004 | Supply extra fields, malformed IDs/paging/regex input, invalid JSON and upload boundaries. | Controlled safe errors, strict schemas, no query injection or partial save. `middleware.test.ts`, `security.test.ts`, `sprint2.test.ts`. | A |
| TC-SEC-04 / SR-005 | Build isolated HTTPS release, trust only its test CA; perform sensitive flows; send direct plaintext production API request. | Certificate validation enabled; real HTTPS flow passes; plaintext rejected with HTTPS_REQUIRED. CI container job in `.github/workflows/ci.yml`; local Docker execution must be recorded separately. | A in CI; current evidence must be linked |
| TC-Perf-01 / NF-001 | Measure content-ready navigation/actions on integrated pages; independently repeat on typical campus/broadband connection and record device/network. | Under 3 seconds under specified normal conditions; automated loopback timings alone do not prove target-network acceptance. Browser suite timing attachments. | A + M target-network confirmation |
| TC-Rel-01 / NF-002 | Save accounts/session/PDF/Question/Quiz/attempt/result; restart actual local application/database; verify equality and removal audit afterward. | Saved data/history/session state retained; valid PDF bytes retrievable; removed content remains blocked. `local-demo.test.ts`, `npm run demo:verify`. | A |
| TC-Scale-01 / NF-003 | Execute isolated 10/50 authenticated HTTP-session workloads; run ten isolated browser sessions together through browsing/upload/creation/attempt/history/performance in all three engines. | No crash/functional loss; distinguish HTTP load simulation from required multi-browser normal-operation acceptance. `runtime.test.ts`, `quizzes.test.ts`. | A + independent peer review |
| TC-Compat-01 / NF-004 | Execute core journeys in Chrome, Edge and Firefox; record actual versions. Separately cover previous stable major of each browser. | Latest two stable major versions at acceptance, all core journeys; one installed version per engine is only partial matrix evidence. | A current installed versions + M missing version matrix |
| TC-UX-01 / NF-005 | Representative user registers, uses materials, creates and attempts Quiz without help; test loading/error/retry/cancel and responsive layout, light/dark themes. | Understandable navigation/feedback and no assistance needed. Automated DOM/browser checks supplement genuine usability observation. | A + M representative-user observation |
| TC-SYS-01 / integrated FR | Admin provisions MCQs; Student uploads/finds/downloads PDF and creates/finds/attempts Quiz, sees result/history/performance; Admin removes sources; Student rechecks history. | Consistent IDs/roles/scoring/storage across real modules; removal excludes new access while completed history remains. `frontend/e2e/moderation.spec.ts`, `team-sprint2.test.ts`, release verifier. | A + independent peer cross-test |
| TC-UAT-01 / Test Plan exit | Team reviews results/defects/RTM, records cross-tests, performs agreed demo and obtains Project Guide acceptance. | All planned cases executed, high-priority requirements verified, no critical open defects, genuine acceptance recorded; no automated signature. | M |

## Changes since Sprint 1

- Replace prototype-only proof with real persisted Quiz/Attempt/Result/History/Performance journeys; retain prototype tests as regression fixtures, not production acceptance claims.
- Add retry races/reload identity, 51st-history-record aggregation, stale-request handling, current-session 401 behavior and SAD-compatible result/download contracts.
- Add Admin provisioning, confirmed single and bulk moderation, hidden-filter scope, retained audit/PDF/history and source-removal rejection.
- Record no time limit and one-point scoring; do not start an arbitrary practice timer when opening navigation.
- Folder management was dropped by Harshit on 30 October; it is not a new acceptance case or an amendment to the submitted documents.
- Keep human review, supported-version coverage, representative usability, browser concurrency and final sign-off visible as separate acceptance work.

## Independent testing record to complete, 2–6 November

Use the explicit cross-test matrix in `docs/WORK_DIVISION.md`: Prajwal tests Dharani's Auth/Materials; Karan tests Prajwal's Question Bank/Quiz and Harshit's Admin/Security; Dharani tests Karan's Attempt/Result/History/Performance; all members test integration. The submitted SRS responsibility bullets conflict with its explicit matrix; clarify the assignment in the team evidence without editing the submitted SRS.

| Date/build/browser versions | Tester / cases | Actual outcome and Jira defect links | Reviewer / acceptance evidence |
| --- | --- | --- | --- |
| Pending genuine team execution | As assigned above | Not recorded by this automated run | Pending |

## 5 November audit additions

- TC-QUIZ-Session-01/02: use the real auth/submission services, expire the session during submission and separately sign in as a different account before submitting. The page must show an error without crashing, preserve the original owner's answers and never submit/reassign them under the other account. The expiry case reproduced a null-user render crash before the correction; both cases are in `frontend/src/pages/QuizAttemptPage.session-expiry.test.tsx`.

- TC-Auth-Race-01/02/03: delay an old upload, material-list or logout response; complete a newer login, then finish the old request (401 for materials, 204 for logout). The newer token, user and saved session must survive. All three failed before the correction and pass afterward in `frontend/src/services/authService.test.ts`. Current-session rejection and normal logout still invalidate the intended session.
- Report integrity: nine synthetic-fixture checks in scripts/tests/test_testing_reports.py verify immutable historical snapshots, source mismatch, missing execution commands, partial browser matrices, suite-level errors, count mismatches, and clean date-specific publication with portable evidence hashes. Synthetic fixtures are never counted as application acceptance.
- This revision supersedes the 2 November case document for current execution; its original report snapshot and initial Edge timeout remain preserved.

## Whole-project ownership and execution scope

This is the updated Test Case Document for **all four members**, both implementation sprints and the complete integrated application. It supersedes the dated case document for the team-wide testing submission while preserving earlier evidence. Harshit coordinates execution; the existing test authors and implementation contributions remain intact.

| Member/module owner | Cases and delivered module scope | Independent cross-tester |
| --- | --- | --- |
| Dharani S | TC-Auth-01/02/03; TC-MAT-01/02/03; registration/session, PDF upload/search/view/download, Student Dashboard | Prajwal |
| Prajwal M | TC-QB-01/02; TC-QUIZ-01/02; Question validation/classification/filtering and Quiz creation/discovery | Karan |
| Karan Varshney | TC-QUIZ-03/04/05/06, Retry, Session; TC-PERF-01; saved submission/evaluation/results/history/subject averages | Dharani |
| Harshit Chandak | TC-ADMIN-01/02/Bulk/Nav; TC-SEC-01/02/03/04; shared session/integration, persistence, NFR/load, CI/release and reporting | Karan |
| Team 10 | TC-SYS-01, TC-Rel-01, TC-Scale-01, TC-Compat-01, TC-UX-01 and TC-UAT-01 | All members / representative user / Guide as applicable |

### New browser concurrency case, TC-SCALE-UI-10

Preconditions: disposable database, one real MCQ, ten distinct registered Students, ten separate browser contexts with isolated sessionStorage.

1. Open all ten contexts together and authenticate each through the actual login UI.
2. While every context remains open, run all ten flows concurrently: upload PDF; create Quiz from the Question Bank; submit a correct response; open result, owner history and subject performance.
3. Verify ten saved PDFs, ten distinct attempt IDs, matching authenticated owners and 100% server-scored results. Confirm no page errors and all ten sessions remain authenticated.
4. Repeat in Chrome, Edge and Firefox; close all fixture contexts and disposable database.

Expected: all ten users complete without crashes, loss or cross-user history/draft leakage. This functional concurrency scenario has a bounded execution budget, separate from the existing under-three-second **single-user** content checks. Source: `frontend/e2e/moderation.spec.ts`. Actual browser versions, completion counts, timings and final outcomes are retained in the whole-project System Validation Report. The first draft of this new test omitted closing the upload drawer; that test-navigation error was corrected before final execution and is not recorded as a product defect.

### Automated execution and acceptance records

Run `npm run test:project -- --date 2026-11-05 --label whole-project` after committing the source. The runner executes the complete backend/frontend suites, coverage, lint/build, real compiled release/restart checks, report-integrity guards, full browser matrix and frozen-document check; records actual exit codes; and publishes the four reports. Use a new label for a later execution on the same date, preserving previous evidence.

The concrete executed-case catalogue records every parameterized assertion. [Test data](testing/TEST_DATA.md) and [manual acceptance record](testing/MANUAL_ACCEPTANCE.md) are part of the submission. No automated pass is substituted for named independent peer review, representative-user usability or Project Guide acceptance.
