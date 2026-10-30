# CSMQ-45 — Sprint 2 integration, security and acceptance testing

Jira: CSMQ-45 · Parent: CSMQ-10 · Assignee: project student developer

## Scope and test sources

This task extends **existing integration and unit suites**, rather than replacing the production code. New tests invoke the production POST router, a real in-memory MongoDB-backed history repository, the React quiz submit component and its actual API service, and the performance aggregation/export utilities. Existing tests exercise the production app's student/admin role middleware, Quiz moderation and other Sprint 1 routes.

| Jira acceptance criterion | Test source(s) | Evidence required |
|---|---|---|
| Production `POST /api/attempts` | `backend/tests/integration/csmq45-submission-acceptance.test.ts`; existing `attempt-api.test.ts` | Passed backend suite |
| Authenticated student submits valid answers | New submission test; existing `attempt-api.test.ts` | Saved result + HTTP 201 |
| Unauthenticated submission rejected | New submission test; existing `attempt-api.test.ts` | HTTP 401 |
| Non-student submission rejected | Existing `backend/tests/integration/team-sprint2.test.ts` and `attempt-api.test.ts` (app-level guard) | Confirm CI passes; manual inspection of the role guard if needed |
| Forged `userId` cannot override session identity | New submission identity test | Saved owner must be authenticated user, or request rejected |
| Invalid quiz ID | New submission test + existing validation tests | Controlled 4xx, no save |
| Invalid question/option IDs | New submission test + existing validation tests | Controlled 4xx, no save |
| Duplicate/malformed responses | New submission test + existing `attempt-validation.test.ts` | Controlled 4xx, no save |
| Unanswered questions | New submission test + existing trusted evaluation tests | Unanswered count and score |
| Correct/incorrect/unanswered/score/percentage | New submission result test + existing `trusted-evaluation.test.ts` | Server-calculated values |
| MongoDB attempt persistence | Existing `attempt-repository.test.ts`, `quiz-attempt.test.ts`, `team-sprint2.test.ts`; new history isolation test confirms persisted records are readable | MongoDB integration suite |
| Result-screen response integration | `frontend/src/pages/QuizAttemptPage.csmq45-acceptance.test.tsx`; existing `QuizResultPage.test.tsx` and `QuizAttemptPage.result-navigation.test.tsx` | API result and safe display |
| Student attempt history retrieval | New `csmq45-history-isolation.test.ts`; existing `attempt-history-route.test.ts` | HTTP 200 with persisted fields |
| No retrieval of other student's history | New MongoDB isolation test | Separate student tokens/identities return disjoint records |
| Subject-wise performance aggregation | `frontend/src/services/attemptInsights.csmq45-acceptance.test.ts` | Expected weighted averages by subject |
| Cannot read another student's performance | The performance page consumes `/api/attempts/history`; new MongoDB student isolation + frontend history service tests verify auth-bound data path | Review that **no independent unguarded performance endpoint** was added |
| Empty history/performance | New MongoDB empty-history and frontend aggregation tests; existing `QuizInsightsPage.test.tsx` and `QuizHistoryPage.test.tsx` | Empty UI and empty API payload |
| Frontend submission/result/history/performance regression | Run complete `frontend` Vitest suite | JUnit and terminal logs |
| Full backend/frontend regressions | `scripts/run-csmq45-acceptance.sh` | 100% passing test files |
| Coverage and CI evidence in Jira | This matrix, generated `reports/csmq45/EVIDENCE.md`, PR CI check URL/screenshot | Attach after verification |

## Important testing boundaries

- An Express router unit/integration test with an injected student identity does **not**, by itself, prove that the application-level admin guard works. That guard is covered by the existing app-level integration tests and must remain enabled on `/api/attempts`.
- The history isolation test uses an in-memory MongoDB instance. It verifies persistence and student filtering in a real database engine; it is not a deployed production smoke test.
- Subject-wise insights are calculated on the **latest 50 authenticated history records** returned by the API, not all historical records if more exist. The UI states this limit.
- The matrix is an *acceptance-criteria coverage map*, not numeric line or branch coverage. If numerical coverage is explicitly required, generate it separately with the version-matched Vitest coverage provider.
- Do not claim Jira completion until the **new** and **existing** tests pass, GitHub checks are green, and the reviewer has reviewed the PR.
