# Sprint 1 evaluation readiness — 26 October 2026

Evaluation: **Tuesday, 27 October 2026, fourth hour**. Attendance is required for Dharani S, Prajwal M, Karan Varshney and Harshit Chandak.

## Scope and implementation

The tested branch is `two-sprint-docs-and-jira-evidence`, based on the integrated Sprint 1 `main` commit `e13c050`. It includes the current two-sprint documentation, genuine Jira screenshots and the evaluation fixes below. Main and `PES2UG24CS185-Sprint-1` do not receive these new fixes until the prepared branch is reviewed and merged. Sprint 2 remains separately saved on `PES2UG24CS185-Sprint-2`, draft PR #8; it was not merged or changed.

The [SRS](../SRS.md), [SAD](../SAD.pdf), [Test Plan](../TEST_PLAN.md) and [final sprint plan](TWO_SPRINT_PLAN.md) were checked against the implementation and live backlog acceptance criteria. Approved requirements remain unchanged. The final product is intentionally larger than the Sprint 1 increment.

| Member / backlog | Sprint 1 requirement and evidence |
| --- | --- |
| Dharani — CSMQ-11–16 | Registration/login/logout/User integration, PDF upload/validation. SRS F-001/002/004/010; backend `runtime.test.ts`, `security.test.ts`, frontend auth/material/App tests |
| Prajwal — CSMQ-22–28 | Question model, Add MCQ, validation, subject/topic/difficulty filters and student-safe contract. SRS F-020/022; question model/validation/filter/serializer/API and QuestionBankPage tests |
| Karan — CSMQ-17–21 | QuizAttempt model, attempt UI/evaluation prototype and contract tests. F-033/034 prototype increment; evaluator/model/attempt tests and actual-UI-to-evaluator fixture integration |
| Harshit — CSMQ-2–7 | Hashing, auth/RBAC, real account/PDF integration, security tests and GitHub Actions. SRS SR-001/002/003/004; password/middleware/security/runtime tests and CI |

The architecture matches the SAD's React → Express/domain modules → MongoDB/file storage structure, shared authentication/RBAC, safe errors and server-side validation. Registration cannot self-assign administrator privileges. Question keys are excluded from student payloads. HTTP on local development is permitted by the submitted SRS; deployed HTTPS remains part of final-product validation.

The student attempt page uses sample questions and local submit locking. Full production quiz creation/submission/evaluation/results/history/performance, material search/download, moderation, hosted deployment and final NFR/UAT work belong to Sprint 2. They are not falsely presented as completed Sprint 1 features.

## Fixes completed for this evaluation

- Compatible lockfile security updates: backend body-parser 2.4.0, ip-address 10.7.5, multer 2.5.0, qs 6.16.1 and zod 4.6.7; frontend undici 8.12.3 and zod 4.6.7. No forced major upgrades or product feature changes.
- Frontend test suites use one worker and a bounded 15-second test budget. Multi-field UI tests exceeded the previous five-second budget on this Windows laptop, causing unfinished user-event operations to interfere with subsequent tests. Assertions, scenarios and coverage requirements are retained; final suites pass.
- Node declarations now require Node 24.15+ within Node 24; `.nvmrc` specifies 24.19.0. Validation used available Node 24.19.0. The system Node 24.12.0 is too old for several existing frontend dependencies.
- Added [Windows launcher](../scripts/start-sprint1.ps1): uses a supported installed Node or the available bundled runtime, without changing global PATH or printing secrets.
- Added the [video upload location and 60-second outline](../demos/README.md). The actual video remains Harshit's deliverable.

## Verification completed on 26 October

| Check | Result |
| --- | --- |
| Backend typecheck/build/coverage suite | 17 files, 175 tests passed; 98.22% lines, 96.10% branches, 97.26% statements, 95.83% functions |
| Frontend suite | 7 files, 41 tests passed with final configuration |
| Frontend lint | Passed, zero errors/warnings |
| Frontend production build | Passed |
| Current npm audit, backend and frontend | Zero known vulnerabilities reported in both updated trees |
| Live Atlas | Authenticated database ping passed; no application records changed |
| Browser journey | Passed in actual headless Chrome: registration, login/PDF persistence, prototype submission, administrator MCQ creation, matching/nonmatching filters, logout/protected redirect; disposable local MongoDB only |
| Requirements/evidence | Approved SRS/SAD and original screenshot pixels preserved |

Local command logs and raw audit/browser results are retained under ignored `.local/evaluation-2026-10-26/`; normal JUnit/coverage reports are in `reports/`, `coverage/` and `frontend/reports/`. CI retains its own reports/build artifacts. No private configuration is published.

## Backlog, PRs, reviews and Actions

The live Jira check on 26 October returned **all 24 Sprint 1 tasks Done**: Harshit 6, Dharani 6, Karan 5, Prajwal 7. No workflow statuses were changed by this audit. Older dated screenshots/reports still show their actual former states.

Merged evidence includes [Harshit PR #3](https://github.com/Chandak06/SE-JF-10/pull/3), [Question Bank PR #15 and its preceding chain](https://github.com/Chandak06/SE-JF-10/pull/15), [Dharani fixes #18](https://github.com/Chandak06/SE-JF-10/pull/18), [Karan model fix #19](https://github.com/Chandak06/SE-JF-10/pull/19), [integration/mobile closeout #21](https://github.com/Chandak06/SE-JF-10/pull/21) and [Dharani's genuine review report #22](https://github.com/Chandak06/SE-JF-10/pull/22).

The review API returned no submitted review events on sampled PRs #3, #15, #18, #19, #21 and #22. Dharani's [committed review report](SPRINT1_DHARANI_REVIEW_HARSHIT.md) is genuine recorded review of Harshit's CSMQ-5/7 work. Jira Done and agent testing alone do not prove independent reviews for every member. Relevant teammates must add their own genuine review/cross-testing evidence where it is absent; this task cannot invent a teammate identity or approval.

The previously pushed recording-preparation branch passed [Actions run 40187144835](https://github.com/Chandak06/SE-JF-10/actions/runs/40187144835). That run predates today's dependency/test-runtime fixes. Use the latest run for the new head from [branch Actions](https://github.com/Chandak06/SE-JF-10/actions?query=branch%3Atwo-sprint-docs-and-jira-evidence); do not treat the older run as verification of new commits. Keep this branch unmerged until review; the earlier no-automatic-merge instruction remains in force.

## Run and record

Use the tested preparation branch until its PR is accepted. From the repository root, start these in two separate PowerShell terminals:

```powershell
.\scripts\start-sprint1.ps1 -Service backend
```

```powershell
.\scripts\start-sprint1.ps1 -Service frontend
```

The launcher uses existing installed dependencies and the existing ignored backend configuration. If installing fresh, use supported Node 24, run `npm ci` at the root and in `frontend`, and keep your configured environment files local. Verify `npm run db:check` before recording. Use the frontend URL printed by Vite and restart servers after branch switches. Do not display connection values or administrator credentials.

## Remaining human deliverables

1. Relevant teammates record any missing independent review/cross-testing evidence, then review the preparation PR. A green CI run is not a substitute for a person’s review.
2. Harshit records the actual one-minute working-output video, checks playback and uploads/commits/pushes it to `demos/sprint-1-demo.mp4` in the repository. No video is fabricated by this task.
3. All four members attend Tuesday's fourth-hour evaluation and can explain their own implementation/tests.

The implemented Sprint 1 code is verified for its planned scope. Overall evaluation readiness remains conditional on actual review evidence, the recorded/uploaded video and attendance; full Sprint 2 product completion is not required for this evaluation.
