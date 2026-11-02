# Unit and module test report

Execution date: **2026-11-02**, Asia/Calcutta. Source: `303d1a315f2cd1658d08bc6d148d635e88b9a89d`. Branch: `PES2UG24CS185-Sprint-2`. Reports describe this source plus the frontend coverage/reporting configuration changes listed in the execution manifest; no application source was modified.

The initial full browser matrix passed 17/18 cases; Edge bulk moderation hit the 45-second test timeout at the confirm click. All six Edge cases then passed on an isolated rerun with unchanged product code, selectors and timeouts. Final browser evidence combines Chrome/Firefox from the first run with the complete Edge rerun (18 verified scenarios); the initial failure remains recorded. Its exact transient cause is not established. See [initial browser results](INITIAL_BROWSER_RUN.md).

| Test level | Passed | Failed | Skipped |
| --- | --- | --- | --- |
| backend integration | 131 | 0 | 0 |
| backend unit | 199 | 0 | 0 |
| browser system | 18 | 0 | 0 |
| frontend component/service/integration | 185 | 0 | 0 |

Backend unit cases are identified by `backend/tests/unit/`; backend integration cases use real MongoDB or injected production-router collaborators as specified in each source. Frontend totals include component, service and integration suites, with mocked HTTP where defined. Browser totals are separately reported as system tests. Test cases exercise normal, malformed, authorization, boundary, concurrency and retry paths.

Evidence: [complete case catalogue](AUTOMATED_TEST_CASE_CATALOGUE.md), [backend JUnit](evidence/backend-junit.xml), [frontend JUnit](evidence/frontend-junit.xml). Zero failures means no failed assertion in this execution; it is not proof of absence of all defects.

| Suite | Cases | Failures/skips |
| --- | --- | --- |
| backend/tests/integration/admin-provisioning.test.ts | 16 | 0 |
| backend/tests/integration/attempt-api.test.ts | 8 | 0 |
| backend/tests/integration/attempt-repository.test.ts | 5 | 0 |
| backend/tests/integration/bulk-moderation.test.ts | 3 | 0 |
| backend/tests/integration/csmq45-history-isolation.test.ts | 6 | 0 |
| backend/tests/integration/csmq45-submission-acceptance.test.ts | 9 | 0 |
| backend/tests/integration/local-demo.test.ts | 2 | 0 |
| backend/tests/integration/question-moderation.test.ts | 4 | 0 |
| backend/tests/integration/questions.test.ts | 8 | 0 |
| backend/tests/integration/quiz-attempt.test.ts | 4 | 0 |
| backend/tests/integration/quiz-contract-cross-module.test.ts | 3 | 0 |
| backend/tests/integration/quizzes.test.ts | 17 | 0 |
| backend/tests/integration/runtime.test.ts | 8 | 0 |
| backend/tests/integration/security.test.ts | 17 | 0 |
| backend/tests/integration/sprint2.test.ts | 12 | 0 |
| backend/tests/integration/team-sprint2.test.ts | 9 | 0 |
| backend/tests/unit/attempt-history-route.test.ts | 3 | 0 |
| backend/tests/unit/attempt-validation.test.ts | 7 | 0 |
| backend/tests/unit/config.test.ts | 12 | 0 |
| backend/tests/unit/csmq-24-question-validation.test.ts | 15 | 0 |
| backend/tests/unit/csmq-28-consolidated-suite.test.ts | 5 | 0 |
| backend/tests/unit/evaluate-quiz.test.ts | 7 | 0 |
| backend/tests/unit/material-upload-validation.test.ts | 8 | 0 |
| backend/tests/unit/middleware.test.ts | 15 | 0 |
| backend/tests/unit/password.test.ts | 17 | 0 |
| backend/tests/unit/question-filters.test.ts | 9 | 0 |
| backend/tests/unit/question-model.test.ts | 13 | 0 |
| backend/tests/unit/question-validation.test.ts | 9 | 0 |
| backend/tests/unit/quiz-attempt-model.test.ts | 8 | 0 |
| backend/tests/unit/quiz-filters.test.ts | 8 | 0 |
| backend/tests/unit/quiz-model.test.ts | 14 | 0 |
| backend/tests/unit/quiz-validation.test.ts | 8 | 0 |
| backend/tests/unit/release-guards.test.ts | 3 | 0 |
| backend/tests/unit/student-safe-serializer.test.ts | 5 | 0 |
| backend/tests/unit/submission-service.test.ts | 10 | 0 |
| backend/tests/unit/trusted-evaluation.test.ts | 7 | 0 |
| backend/tests/unit/user-repository.test.ts | 16 | 0 |
| frontend/src/App.test.tsx | 16 | 0 |
| frontend/src/pages/AdminDashboardPage.test.tsx | 4 | 0 |
| frontend/src/pages/AdminPage.test.tsx | 5 | 0 |
| frontend/src/pages/CreateQuizPage.test.tsx | 10 | 0 |
| frontend/src/pages/MaterialsPage.test.tsx | 15 | 0 |
| frontend/src/pages/QuestionBankPage.test.tsx | 9 | 0 |
| frontend/src/pages/QuizAttemptLoader.test.tsx | 5 | 0 |
| frontend/src/pages/QuizAttemptPage.csmq45-acceptance.test.tsx | 2 | 0 |
| frontend/src/pages/QuizAttemptPage.result-navigation.test.tsx | 2 | 0 |
| frontend/src/pages/QuizAttemptPage.submit.test.tsx | 6 | 0 |
| frontend/src/pages/QuizHistoryPage.insights-navigation.test.tsx | 1 | 0 |
| frontend/src/pages/QuizHistoryPage.test.tsx | 4 | 0 |
| frontend/src/pages/QuizInsightsPage.test.tsx | 4 | 0 |
| frontend/src/pages/QuizListPage.test.tsx | 7 | 0 |
| frontend/src/pages/QuizResultPage.test.tsx | 6 | 0 |
| frontend/src/pages/QuizViewPage.navigation.test.tsx | 2 | 0 |
| frontend/src/pages/QuizViewPage.test.tsx | 3 | 0 |
| frontend/src/pages/StudentDashboardPage.test.tsx | 2 | 0 |
| frontend/src/services/attemptHistoryCsv.test.ts | 4 | 0 |
| frontend/src/services/attemptHistoryService.csmq45-boundaries.test.ts | 3 | 0 |
| frontend/src/services/attemptHistoryService.test.ts | 5 | 0 |
| frontend/src/services/attemptInsights.csmq45-acceptance.test.ts | 4 | 0 |
| frontend/src/services/attemptInsights.test.ts | 5 | 0 |
| frontend/src/services/attemptService.test.ts | 8 | 0 |
| frontend/src/services/authService.test.ts | 16 | 0 |
| frontend/src/services/final-integration.test.ts | 4 | 0 |
| frontend/src/services/quiz-security.test.ts | 2 | 0 |
| frontend/src/services/quizAttemptDataService.test.ts | 10 | 0 |
| frontend/src/services/quizDraft.test.ts | 7 | 0 |
| frontend/src/services/recentMaterials.test.ts | 2 | 0 |
| frontend/tests/admin-routing.test.tsx | 4 | 0 |
| frontend/tests/admin-session.integration.test.tsx | 3 | 0 |
| frontend/tests/auth.integration.test.ts | 3 | 0 |
| frontend/tests/quiz-prototype.integration.test.tsx | 2 | 0 |
