# Sprint 1 authoritative closeout

Updated 26 October 2026. Coding evidence and actual human workflow are reported separately. The project has exactly two implementation sprints; [Sprint 2](TWO_SPRINT_PLAN.md) completes the entire remaining product. Its draft PR #8 remains separate until Harshit explicitly confirms the Sprint 1 recording is complete.

## Implemented core increment

- Dharani: registration/login/logout, User integration and validated PDF upload. PR #18 fixed material-list races, native PDF reselection and theme-storage exceptions.
- Prajwal: Question model, Add MCQ UI/API, validation, filters and student-safe payload. Question Bank recovery and save/filter races were fixed in PRs #9–15.
- Karan: QuizAttempt model, attempt UI/evaluator prototype and contract tests. PR #19 rejects fractional/non-finite scores. Production submission is not mounted by this prototype.
- Harshit: shared backend, password hashing, authentication/RBAC, real account/PDF integration, security/integration tests and GitHub Actions. Responsive navigation and actual-UI-to-evaluator fixture cases are included in the merged source.

PR #22 merged Dharani's review report. A merged report is evidence of its stated review, not automatic approval of every teammate's implementation.

## Recorded automated evidence

The merged Sprint 1 application passed 175 backend tests and 41 frontend tests, backend coverage gates, frontend lint with zero warnings and production builds. PR #21 CI run 39960457545 passed; documentation-only PR #22 CI run 40162949900 passed. Those linked runs are earlier evidence. On 26 October the patched preparation branch again passed 175 backend tests with coverage, 41 frontend tests, frontend lint and production build using Node 24.19.0; see the [evaluation readiness report](SPRINT1_EVALUATION_READINESS.md). Earlier reports retain their original suite counts and contexts.

Twelve navigation checks covered student/admin at 320, 375, 500, 768, 900 and 1440px using test-only responses. Prototype integration cases use the unchanged student-safe serializer, actual UI and backend evaluator for mixed/unanswered and all-correct answers; the production page still uses sample questions and local submit locking.

Atlas authenticated ping passed again on 26 October using the existing local configuration; no application records or network access settings were changed. The earlier six-hour entry described in historical evidence is not the basis for this current successful check. Recheck connectivity before recording; disposable test databases alone do not prove live Atlas readiness.

## Real Jira and human closeout

Live Jira snapshot on 26 October 2026: all 24 Sprint 1 items are Done. The 25 October snapshot (12 Done, 5 Code Review, 7 Testing) is historical. This audit made no Jira transitions.

| Implementer | Actual item state | Remaining evidence/action |
| --- | --- | --- |
| Harshit Chandak | CSMQ-2–7: six Done | Dharani's actual CSMQ-5/7 review is preserved in [her report](SPRINT1_DHARANI_REVIEW_HARSHIT.md) |
| Dharani S | CSMQ-11–16: six Done | Workflow is Done; do not infer an unseen submitted GitHub approval from that state |
| Karan Varshney | CSMQ-17–21: five Done | Capture actual independent review/cross-testing evidence where missing |
| Prajwal M | CSMQ-22–28: seven Done | Capture actual independent review/cross-testing evidence where missing |

Do not fabricate approval or transition states merely to match a plan. Review evidence should identify reviewer/date, tested commit, commands/scenarios, expected/actual results and defects or acceptance. Obtain genuine current screenshots where the historical evidence does not show the final state. Sprint 1 is fully closed only when its actual testing/review/Jira workflow and recording evidence are complete; implementation alone does not establish that closeout.

## Remaining checks and risks

- Final Sprint 1 video has no recorded user confirmation here. Follow the [recording guide](SPRINT_SEPARATION.md), show the prototype limitation and omit secrets.
- The advisories reported on 25 October were fixed with compatible dependency updates on 26 October. Both current npm audit reports show zero known vulnerabilities. The preparation branch also declares supported Node 24.15+ and uses bounded, single-worker frontend tests; no assertions were removed.
- Main and the Sprint 1 recording branch remain at the earlier integrated application until the preparation PR is reviewed/merged. Use the tested preparation branch for the updated dependencies and launcher. Keep Sprint 2 separate.

## Final product boundary

Sprint 2 contains all remaining material listing/search/view/download, full quiz creation/management, production submission/evaluation/results/history/performance, admin moderation, security/integration, regression/system/NFR/browser/concurrency/persistence/UAT validation, deployment, final documentation/demo and release readiness. The approved SRS is unchanged. GitHub Actions is the active CI/CD platform; Jenkins is a superseded historical proposal.

The current [evaluation checklist](SPRINT1_EVALUATION_READINESS.md) records remaining human review evidence, the actual one-minute video upload and compulsory team attendance. Current verification does not claim that the remaining final-product features, final acceptance or deployment have already happened.
