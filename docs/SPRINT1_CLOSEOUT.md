# Sprint 1 authoritative closeout

Updated 25 October 2026. Coding evidence and actual human workflow are reported separately. The project has exactly two implementation sprints; [Sprint 2](TWO_SPRINT_PLAN.md) completes the entire remaining product. Its draft PR #8 remains separate until Harshit explicitly confirms the Sprint 1 recording is complete.

## Implemented core increment

- Dharani: registration/login/logout, User integration and validated PDF upload. PR #18 fixed material-list races, native PDF reselection and theme-storage exceptions.
- Prajwal: Question model, Add MCQ UI/API, validation, filters and student-safe payload. Question Bank recovery and save/filter races were fixed in PRs #9–15.
- Karan: QuizAttempt model, attempt UI/evaluator prototype and contract tests. PR #19 rejects fractional/non-finite scores. Production submission is not mounted by this prototype.
- Harshit: shared backend, password hashing, authentication/RBAC, real account/PDF integration, security/integration tests and GitHub Actions. Responsive navigation and actual-UI-to-evaluator fixture cases are included in the merged source.

PR #22 merged Dharani's review report. A merged report is evidence of its stated review, not automatic approval of every teammate's implementation.

## Recorded automated evidence

The merged Sprint 1 application passed 175 backend tests and 41 frontend tests, backend coverage gates, frontend lint with zero warnings and production builds. PR #21 CI run 39960457545 passed; documentation-only PR #22 CI run 40162949900 passed. These are recorded prior runs, not tests newly executed by this documentation audit. Earlier reports retain their original suite counts and contexts.

Twelve navigation checks covered student/admin at 320, 375, 500, 768, 900 and 1440px using test-only responses. Prototype integration cases use the unchanged student-safe serializer, actual UI and backend evaluator for mixed/unanswered and all-correct answers; the production page still uses sample questions and local submit locking.

Atlas authenticated ping and runtime readiness passed on 23 October after a user-requested six-hour access entry. That entry has expired by this report date. Live database readiness was not reverified during this documentation-only task; run `npm run db:check` before recording. Disposable test databases do not prove current Atlas availability.

## Real Jira and human closeout

Live Jira snapshot on 25 October 2026: 24 Sprint 1 items, 12 Done, 5 Code Review and 7 Testing.

| Implementer | Actual item state | Remaining evidence/action |
| --- | --- | --- |
| Harshit Chandak | CSMQ-2–7: six Done | Dharani's actual CSMQ-5/7 review is preserved in [her report](SPRINT1_DHARANI_REVIEW_HARSHIT.md) |
| Dharani S | CSMQ-11–16: six Done | Workflow is Done; do not infer an unseen submitted GitHub approval from that state |
| Karan Varshney | CSMQ-17–21: five Code Review | Genuine reviewer acceptance and actual workflow completion |
| Prajwal M | CSMQ-22–28: seven Testing | Genuine testing/review results and actual workflow completion |

Do not fabricate approval or transition states merely to match a plan. Review evidence should identify reviewer/date, tested commit, commands/scenarios, expected/actual results and defects or acceptance. Obtain genuine current screenshots where the historical evidence does not show the final state. Sprint 1 is fully closed only when its actual testing/review/Jira workflow and recording evidence are complete; implementation alone does not establish that closeout.

## Remaining checks and risks

- Final Sprint 1 video has no recorded user confirmation here. Follow the [recording guide](SPRINT_SEPARATION.md), show the prototype limitation and omit secrets.
- Dependency audit on 25 October found backend 3 high/1 moderate and frontend 2 high advisories. Package changes are outside this documentation-only task; triage and resolve/accept with evidence before release. Historical review counts can differ as advisory data changes.
- Live Atlas connectivity must be checked for the recording environment; no access setting was changed in this documentation task.

## Final product boundary

Sprint 2 contains all remaining material listing/search/view/download, full quiz creation/management, production submission/evaluation/results/history/performance, admin moderation, security/integration, regression/system/NFR/browser/concurrency/persistence/UAT validation, deployment, final documentation/demo and release readiness. The approved SRS is unchanged. GitHub Actions is the active CI/CD platform; Jenkins is a superseded historical proposal.

Current documentation consistency does not claim that these remaining features, final acceptance, deployment or the human closeout have already happened.
