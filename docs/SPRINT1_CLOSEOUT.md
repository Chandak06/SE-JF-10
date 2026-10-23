# Sprint 1 closeout evidence

Updated 23 October 2026. This separates verified implementation from human review and recording evidence. Sprint 2 PR #8 remains a draft and must not merge before Harshit confirms the Sprint 1 recording is complete.

## Implemented corrections

- Question Bank error recovery, filter/save races and loading finalization: fixed and merged in PRs #9–15.
- Material-list races, native PDF reselection and theme-storage failure handling: fixed and merged in PR #18.
- Fractional/non-finite QuizAttempt scores: rejected by PR #19, with model regression tests.
- Small-screen navigation: brand/actions occupy the first row and feature links wrap into a separate row at widths up to 900px. Student and administrator links have no overlapping bounds at 320, 375, 500, 768, 900 and 1440px.
- IT-M3-02/03: `frontend/tests/quiz-prototype.integration.test.tsx` renders the unchanged Member 2 student-safe serializer output in the actual Quiz Attempt UI. It captures selected answers, verifies question/option identity and feeds them into the actual backend evaluator. Mixed/incorrect/unanswered and all-correct cases verify score, percentage and local submit locking. The production page retains its sample questions and local prototype submission.
- `INTEGRATION.md` now describes the implemented question routers, safe endpoint and the exact prototype boundary.

## Automated evidence

- Backend: 175 tests and coverage gates passed on the merged Sprint 1 application; backend source is unchanged by this closeout patch.
- Frontend: 41 tests pass, including the two new integration cases; the impacted App/quiz cases were rerun after the final hook-dependency adjustment.
- Frontend lint: zero errors and warnings; production build passes.
- Layout: 12 browser checks (student/admin across six widths), using test-only authentication/network responses without changing live records.
- Atlas: authenticated ping passed after the user-requested temporary access entry; compiled runtime health/readiness returned 200 and anonymous material/question access returned 401. Recheck live readiness before recording because the entry expires.

## Human review and Jira closeout

The Sprint 1 Definition of Done requires teammate review. Automated checks and agent audits do not establish that a named teammate reviewed the code. As of the audit, the relevant merged GitHub PRs had no submitted teammate reviews. Do not backdate approval or mark these rows complete without actual evidence.

| Implementer | Suggested teammate reviewer | Reproducible review focus | Jira items awaiting genuine review |
| --- | --- | --- | --- |
| Dharani | Prajwal | Register/login/logout, valid/invalid PDF upload, repeat PDF selection, stale response handling, small-screen navigation and storage exceptions | CSMQ-11–16 |
| Prajwal | Karan | Admin-only MCQ creation, invalid input, filters, student-safe payload and save/filter race cases | CSMQ-22–28 |
| Karan | Harshit | Prototype selection, safe-payload compatibility, known expected scores, unanswered cases and model persistence/invalid scores | CSMQ-17–21 |
| Harshit | Dharani or Karan | Shared auth/hash/RBAC, real account/PDF integration, security/error paths and GitHub Actions | CSMQ-5, CSMQ-7 |

Each reviewer should record the tested commit, commands/scenarios, expected and actual results, defects or pass result, and their own review identity/date in GitHub/Jira. After acceptance criteria and real review are satisfied, move the relevant work item through its actual workflow to Done. Existing Done tasks CSMQ-2/3/4/6 remain unchanged.

The final product video is also human evidence: record the verified Sprint 1 branch, running product, tests/coverage, PR history, Jira traceability and Actions result. Keep the prototype limitation explicit and omit secrets. Follow [the recording guide](SPRINT_SEPARATION.md).

## Scope

Full production quiz submission/results/history, complete quiz creation, material search/download, administrator moderation, hosted deployment and later NFR/UAT work are not pulled into Sprint 1. GitHub Actions is the user-approved replacement for Jenkins in the original planning documents.
