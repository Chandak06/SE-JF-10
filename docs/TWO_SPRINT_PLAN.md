# Final two-sprint implementation plan

Updated 25 October 2026. The Collaborative Study Material & Quiz Platform is developed and completed through exactly two implementation sprints: Sprint 1 and Sprint 2. This describes the approved delivery structure; it does not assert that Sprint 2 has been implemented or accepted.

The [SRS](../SRS.md) defines what the system must do; this plan defines when. Approved requirements and the [SAD](../SAD.pdf) remain unchanged. Setup belongs within Sprint 1. All remaining functionality, validation and release work belongs within Sprint 2. The [work division](WORK_DIVISION.md) retains the detailed ownership and requirement mappings; the [Test Plan](../TEST_PLAN.md) covers both increments.

## Sprint 1: core working increment

| Owner | Scope |
| --- | --- |
| Dharani S | Registration, login/logout, User model/API integration, PDF upload and validation |
| Prajwal M | Question model, Question Bank, Add MCQ UI/API, validation, filtering and student-safe payload/API contract |
| Karan Varshney | QuizAttempt model, Quiz Attempt UI prototype, evaluation/scoring prototype, Question/Attempt contract and prototype unit/integration tests |
| Harshit Chandak | Shared backend/MongoDB foundation, password hashing, authentication middleware, role authorization, account/material integration, GitHub Actions and security/integration tests |

All members contribute unit/integration testing, branches/commits/PRs, genuine peer review and cross-testing, Jira workflow/evidence and Sprint 1 documentation. The attempt page remains a sample-question/local-submit prototype; production submission and results are not part of this increment. See the authoritative [Sprint 1 closeout](SPRINT1_CLOSEOUT.md) for actual status.

## Sprint 2: entire remaining project and final release

| Owner | Remaining delivery scope |
| --- | --- |
| Dharani S | Material listing, search/filter, view/download, remaining approved material management, integration, browser compatibility and usability fixes |
| Prajwal M | Complete quiz creation, management/search/view, remaining Question Bank integration, production quiz/question APIs and integration edge cases |
| Karan Varshney | Complete submission, server-side evaluation, results, attempt history, approved performance/subject averages, persistence and frontend/backend integration |
| Harshit Chandak | Administrator moderation/removal, shared backend integration, security enforcement, cross-module validation, regression/system/NFR and performance/concurrency checks, deployment and release readiness |

Shared completion includes cross-testing, persistence and browser checks, regression/system/security/NFR testing, UAT/final validation, bug fixes, final Jira/GitHub evidence, documentation, final demo/video and a release-ready build. Every legitimate remaining activity from the historical schedules is carried into this increment; no approved functionality is removed. The SRS minimum concurrency requirement and the work division's higher validation target remain distinct, unchanged targets.

Sprint 2 is complete only after all remaining approved requirements are implemented and integrated, applicable tests and acceptance checks pass, human reviews and Jira evidence are recorded, a deployment target is confirmed and validated, and final documentation/demo/release evidence exists. Planning text, passing component tests or a draft PR alone do not establish completion.

## Integration and evidence gates

GitHub Actions is the active CI/CD system. Hosted deployment is Sprint 2 work and is not inferred from build artifacts. Preserve Sprint 1 on `main` and `PES2UG24CS185-Sprint-1` for recording. Saved Sprint 2 work remains on `PES2UG24CS185-Sprint-2`, draft PR #8: do not merge until Harshit explicitly confirms the Sprint 1 video is complete. Then reconcile current main, resolve shared routes/runtime/navigation conflicts, rerun the complete integrated validation and obtain real review before release.

Historical reports and [original planning files](historical/README.md) are dated evidence, not competing current schedules. Faculty approval/signatures, teammate reviews, screenshots and completion states must be recorded by the relevant people; this documentation update does not fabricate them.
