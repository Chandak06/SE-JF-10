# Code coverage report

Execution date: **2026-11-02**, Asia/Calcutta. Source: `303d1a315f2cd1658d08bc6d148d635e88b9a89d`. Branch: `PES2UG24CS185-Sprint-2`. Reports describe this source plus the frontend coverage/reporting configuration changes listed in the execution manifest; no application source was modified.

The initial full browser matrix passed 17/18 cases; Edge bulk moderation hit the 45-second test timeout at the confirm click. All six Edge cases then passed on an isolated rerun with unchanged product code, selectors and timeouts. Final browser evidence combines Chrome/Firefox from the first run with the complete Edge rerun (18 verified scenarios); the initial failure remains recorded. Its exact transient cause is not established. See [initial browser results](INITIAL_BROWSER_RUN.md).

Measured by Vitest 5.0.3 and its version-matched V8 provider during the backend/frontend suites. Browser coverage is not merged into these numbers.

| Layer | Metric | Covered | Total | Percent |
| --- | --- | --- | --- | --- |
| backend | lines | 592 | 605 | 97.85 |
| backend | statements | 671 | 688 | 97.52 |
| backend | functions | 183 | 185 | 98.91 |
| backend | branches | 429 | 466 | 92.06 |
| frontend | lines | 1000 | 1233 | 81.1 |
| frontend | statements | 1217 | 1560 | 78.01 |
| frontend | functions | 327 | 414 | 78.98 |
| frontend | branches | 987 | 1378 | 71.62 |

Backend scope: `backend/src/**/*.ts`, excluding the server entry point and type-only directory, as configured in `vitest.config.ts`. Backend gates: lines/statements/functions >=85%, branches >=80%; all passed. Frontend scope: all `frontend/src/**/*.{ts,tsx}`, excluding test files, test setup and declarations; unused/legacy UI and the application entry point remain included. No frontend numeric gate was previously defined; these measured results establish the baseline, not an implied backend-threshold pass. CSS/assets and deployment scripts are outside V8 source coverage.

Evidence: sanitized per-file [backend summary](evidence/backend-coverage-summary.json), [frontend summary](evidence/frontend-coverage-summary.json), [backend LCOV](evidence/backend-lcov.info), [frontend LCOV](evidence/frontend-lcov.info). LCOV records identify unexecuted lines and branch counters. Lower frontend service percentages can coexist with passing browser journeys because browser execution is not included here.

| Layer | Source | Lines % | Statements % | Functions % | Branches % |
| --- | --- | --- | --- | --- | --- |
| backend | backend/src/admin/moderation.ts | 85.18 | 87.5 | 85.71 | 83.33 |
| backend | backend/src/app.ts | 100 | 100 | 100 | 100 |
| backend | backend/src/attempts/evaluate.ts | 100 | 100 | 100 | 100 |
| backend | backend/src/attempts/history-route.ts | 91.66 | 91.66 | 100 | 83.33 |
| backend | backend/src/attempts/history.ts | 0 | 0 | 0 | 0 |
| backend | backend/src/attempts/mongo-repository.ts | 95.23 | 93.47 | 100 | 75.75 |
| backend | backend/src/attempts/router.ts | 100 | 100 | 100 | 100 |
| backend | backend/src/attempts/submission-service.ts | 96.15 | 96.15 | 100 | 93.75 |
| backend | backend/src/attempts/trusted-evaluation.ts | 96 | 96 | 100 | 91.66 |
| backend | backend/src/attempts/validation.ts | 100 | 100 | 100 | 100 |
| backend | backend/src/config.ts | 100 | 100 | 100 | 100 |
| backend | backend/src/db.ts | 60 | 60 | 100 | 100 |
| backend | backend/src/errors.ts | 100 | 100 | 100 | 95.65 |
| backend | backend/src/materials/upload.ts | 100 | 98.79 | 95.23 | 94 |
| backend | backend/src/middleware/auth.ts | 100 | 100 | 100 | 100 |
| backend | backend/src/middleware/validation.ts | 100 | 100 | 100 | 100 |
| backend | backend/src/models/question.ts | 100 | 100 | 100 | 100 |
| backend | backend/src/models/quiz-attempt.ts | 100 | 100 | 100 | 100 |
| backend | backend/src/models/quiz.ts | 100 | 100 | 100 | 100 |
| backend | backend/src/models/user.ts | 100 | 100 | 100 | 100 |
| backend | backend/src/questions/filters.ts | 100 | 100 | 100 | 100 |
| backend | backend/src/questions/router.ts | 100 | 100 | 100 | 80 |
| backend | backend/src/questions/serializer.ts | 100 | 100 | 100 | 100 |
| backend | backend/src/questions/validation.ts | 100 | 100 | 100 | 87.5 |
| backend | backend/src/quizzes/filters.ts | 100 | 100 | 100 | 100 |
| backend | backend/src/quizzes/router.ts | 97.72 | 97.91 | 100 | 73.33 |
| backend | backend/src/quizzes/validation.ts | 100 | 100 | 100 | 83.33 |
| backend | backend/src/repositories/mongo-account-repository.ts | 100 | 100 | 100 | 100 |
| backend | backend/src/routes/auth.ts | 100 | 100 | 100 | 100 |
| backend | backend/src/runtime.ts | 100 | 100 | 100 | 100 |
| backend | backend/src/security/auth-service.ts | 100 | 93.33 | 100 | 92.59 |
| backend | backend/src/security/password.ts | 100 | 100 | 100 | 100 |
| backend | backend/src/security/provision-admin.ts | 96 | 96.87 | 100 | 87.09 |
| backend | backend/src/security/sessions.ts | 100 | 100 | 100 | 100 |
| frontend | frontend/src/App.tsx | 71.05 | 72.5 | 64.7 | 75.86 |
| frontend | frontend/src/components/FormField.tsx | 100 | 100 | 100 | 100 |
| frontend | frontend/src/components/MaterialLibrary.tsx | 0 | 0 | 0 | 0 |
| frontend | frontend/src/components/Navbar.tsx | 92.3 | 94.44 | 100 | 88.46 |
| frontend | frontend/src/components/ThemeToggle.tsx | 100 | 88.23 | 87.5 | 80 |
| frontend | frontend/src/hooks/useMaterialLibrary.ts | 100 | 96.29 | 100 | 77.27 |
| frontend | frontend/src/main.tsx | 0 | 0 | 100 | 100 |
| frontend | frontend/src/pages/AdminDashboardPage.tsx | 100 | 100 | 100 | 80 |
| frontend | frontend/src/pages/AdminPage.tsx | 86.59 | 86.23 | 86.36 | 77.23 |
| frontend | frontend/src/pages/CreateQuizPage.tsx | 92.3 | 92.68 | 85.18 | 90.9 |
| frontend | frontend/src/pages/HomePage.tsx | 100 | 100 | 100 | 100 |
| frontend | frontend/src/pages/LoginPage.tsx | 100 | 100 | 100 | 83.33 |
| frontend | frontend/src/pages/MaterialsPage.tsx | 82.67 | 75.11 | 70 | 66.12 |
| frontend | frontend/src/pages/QuestionBankPage.tsx | 80.73 | 80.86 | 78.37 | 78.57 |
| frontend | frontend/src/pages/QuizAttemptLoader.tsx | 95.45 | 88 | 88.88 | 75 |
| frontend | frontend/src/pages/QuizAttemptPage.tsx | 76.53 | 76.57 | 71.42 | 74.22 |
| frontend | frontend/src/pages/QuizHistoryPage.tsx | 96.66 | 93.75 | 92.85 | 67.85 |
| frontend | frontend/src/pages/QuizInsightsPage.tsx | 96 | 96.66 | 93.33 | 68.18 |
| frontend | frontend/src/pages/QuizListPage.tsx | 89.13 | 89.13 | 91.66 | 78.72 |
| frontend | frontend/src/pages/QuizResultPage.tsx | 94.87 | 92.68 | 100 | 93.54 |
| frontend | frontend/src/pages/QuizViewPage.tsx | 100 | 88 | 100 | 69.44 |
| frontend | frontend/src/pages/RegisterPage.tsx | 100 | 100 | 100 | 90 |
| frontend | frontend/src/pages/StudentDashboardPage.tsx | 100 | 100 | 100 | 62.5 |
| frontend | frontend/src/services/attemptHistoryCsv.ts | 41.17 | 47.61 | 83.33 | 50 |
| frontend | frontend/src/services/attemptHistoryService.ts | 90 | 84.44 | 87.5 | 90.76 |
| frontend | frontend/src/services/attemptInsights.ts | 100 | 100 | 100 | 75 |
| frontend | frontend/src/services/attemptService.ts | 91.3 | 84 | 50 | 71.05 |
| frontend | frontend/src/services/authService.ts | 72.97 | 70 | 64.51 | 60.34 |
| frontend | frontend/src/services/authValidation.ts | 100 | 80 | 100 | 84.37 |
| frontend | frontend/src/services/questionService.ts | 50 | 40 | 25 | 33.33 |
| frontend | frontend/src/services/quizAttemptDataService.ts | 80 | 80 | 87.5 | 75.71 |
| frontend | frontend/src/services/quizDraft.ts | 100 | 100 | 100 | 100 |
| frontend | frontend/src/services/quizService.ts | 11.62 | 9.09 | 12.5 | 6.66 |
| frontend | frontend/src/services/recentMaterials.ts | 91.66 | 77.77 | 100 | 82.35 |
