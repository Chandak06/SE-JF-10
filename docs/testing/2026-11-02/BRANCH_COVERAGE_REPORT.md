# Branch coverage report

Execution date: **2026-11-02**, Asia/Calcutta. Source: `303d1a315f2cd1658d08bc6d148d635e88b9a89d`. Branch: `PES2UG24CS185-Sprint-2`. Reports describe this source plus the frontend coverage/reporting configuration changes listed in the execution manifest; no application source was modified.

The initial full browser matrix passed 17/18 cases; Edge bulk moderation hit the 45-second test timeout at the confirm click. All six Edge cases then passed on an isolated rerun with unchanged product code, selectors and timeouts. Final browser evidence combines Chrome/Firefox from the first run with the complete Edge rerun (18 verified scenarios); the initial failure remains recorded. Its exact transient cause is not established. See [initial browser results](INITIAL_BROWSER_RUN.md).

Branch coverage measures executed decision outcomes; it is not Git branch count, requirement coverage or MC/DC. V8 counters and LCOV BRDA records are retained separately for both layers.

| Layer | Covered | Total | Uncovered | Percent |
| --- | --- | --- | --- | --- |
| backend | 429 | 466 | 37 | 92.06 |
| frontend | 987 | 1378 | 391 | 71.62 |

The backend 80% branch gate passed. No frontend gate is claimed. Remaining unexecuted outcomes are coverage gaps, not automatically confirmed defects; prioritize shared authentication, moderation and Quiz service error paths for further tests. Do not remove uncovered product code from measurement just to increase percentages.

| Layer | Source | Covered | Total | Uncovered | Percent |
| --- | --- | --- | --- | --- | --- |
| backend | backend/src/admin/moderation.ts | 10 | 12 | 2 | 83.33 |
| backend | backend/src/app.ts | 30 | 30 | 0 | 100 |
| backend | backend/src/attempts/evaluate.ts | 8 | 8 | 0 | 100 |
| backend | backend/src/attempts/history-route.ts | 5 | 6 | 1 | 83.33 |
| backend | backend/src/attempts/history.ts | 0 | 0 | 0 | 0 |
| backend | backend/src/attempts/mongo-repository.ts | 25 | 33 | 8 | 75.75 |
| backend | backend/src/attempts/router.ts | 6 | 6 | 0 | 100 |
| backend | backend/src/attempts/submission-service.ts | 15 | 16 | 1 | 93.75 |
| backend | backend/src/attempts/trusted-evaluation.ts | 11 | 12 | 1 | 91.66 |
| backend | backend/src/attempts/validation.ts | 2 | 2 | 0 | 100 |
| backend | backend/src/config.ts | 11 | 11 | 0 | 100 |
| backend | backend/src/db.ts | 0 | 0 | 0 | 100 |
| backend | backend/src/errors.ts | 22 | 23 | 1 | 95.65 |
| backend | backend/src/materials/upload.ts | 47 | 50 | 3 | 94 |
| backend | backend/src/middleware/auth.ts | 12 | 12 | 0 | 100 |
| backend | backend/src/middleware/validation.ts | 2 | 2 | 0 | 100 |
| backend | backend/src/models/question.ts | 13 | 13 | 0 | 100 |
| backend | backend/src/models/quiz-attempt.ts | 4 | 4 | 0 | 100 |
| backend | backend/src/models/quiz.ts | 20 | 20 | 0 | 100 |
| backend | backend/src/models/user.ts | 2 | 2 | 0 | 100 |
| backend | backend/src/questions/filters.ts | 13 | 13 | 0 | 100 |
| backend | backend/src/questions/router.ts | 16 | 20 | 4 | 80 |
| backend | backend/src/questions/serializer.ts | 19 | 19 | 0 | 100 |
| backend | backend/src/questions/validation.ts | 7 | 8 | 1 | 87.5 |
| backend | backend/src/quizzes/filters.ts | 15 | 15 | 0 | 100 |
| backend | backend/src/quizzes/router.ts | 22 | 30 | 8 | 73.33 |
| backend | backend/src/quizzes/validation.ts | 5 | 6 | 1 | 83.33 |
| backend | backend/src/repositories/mongo-account-repository.ts | 6 | 6 | 0 | 100 |
| backend | backend/src/routes/auth.ts | 1 | 1 | 0 | 100 |
| backend | backend/src/runtime.ts | 9 | 9 | 0 | 100 |
| backend | backend/src/security/auth-service.ts | 25 | 27 | 2 | 92.59 |
| backend | backend/src/security/password.ts | 17 | 17 | 0 | 100 |
| backend | backend/src/security/provision-admin.ts | 27 | 31 | 4 | 87.09 |
| backend | backend/src/security/sessions.ts | 2 | 2 | 0 | 100 |
| frontend | frontend/src/App.tsx | 22 | 29 | 7 | 75.86 |
| frontend | frontend/src/components/FormField.tsx | 8 | 8 | 0 | 100 |
| frontend | frontend/src/components/MaterialLibrary.tsx | 0 | 23 | 23 | 0 |
| frontend | frontend/src/components/Navbar.tsx | 23 | 26 | 3 | 88.46 |
| frontend | frontend/src/components/ThemeToggle.tsx | 8 | 10 | 2 | 80 |
| frontend | frontend/src/hooks/useMaterialLibrary.ts | 17 | 22 | 5 | 77.27 |
| frontend | frontend/src/main.tsx | 0 | 0 | 0 | 100 |
| frontend | frontend/src/pages/AdminDashboardPage.tsx | 20 | 25 | 5 | 80 |
| frontend | frontend/src/pages/AdminPage.tsx | 95 | 123 | 28 | 77.23 |
| frontend | frontend/src/pages/CreateQuizPage.tsx | 60 | 66 | 6 | 90.9 |
| frontend | frontend/src/pages/HomePage.tsx | 0 | 0 | 0 | 100 |
| frontend | frontend/src/pages/LoginPage.tsx | 10 | 12 | 2 | 83.33 |
| frontend | frontend/src/pages/MaterialsPage.tsx | 121 | 183 | 62 | 66.12 |
| frontend | frontend/src/pages/QuestionBankPage.tsx | 66 | 84 | 18 | 78.57 |
| frontend | frontend/src/pages/QuizAttemptLoader.tsx | 9 | 12 | 3 | 75 |
| frontend | frontend/src/pages/QuizAttemptPage.tsx | 72 | 97 | 25 | 74.22 |
| frontend | frontend/src/pages/QuizHistoryPage.tsx | 19 | 28 | 9 | 67.85 |
| frontend | frontend/src/pages/QuizInsightsPage.tsx | 15 | 22 | 7 | 68.18 |
| frontend | frontend/src/pages/QuizListPage.tsx | 37 | 47 | 10 | 78.72 |
| frontend | frontend/src/pages/QuizResultPage.tsx | 58 | 62 | 4 | 93.54 |
| frontend | frontend/src/pages/QuizViewPage.tsx | 25 | 36 | 11 | 69.44 |
| frontend | frontend/src/pages/RegisterPage.tsx | 9 | 10 | 1 | 90 |
| frontend | frontend/src/pages/StudentDashboardPage.tsx | 5 | 8 | 3 | 62.5 |
| frontend | frontend/src/services/attemptHistoryCsv.ts | 6 | 12 | 6 | 50 |
| frontend | frontend/src/services/attemptHistoryService.ts | 59 | 65 | 6 | 90.76 |
| frontend | frontend/src/services/attemptInsights.ts | 9 | 12 | 3 | 75 |
| frontend | frontend/src/services/attemptService.ts | 27 | 38 | 11 | 71.05 |
| frontend | frontend/src/services/authService.ts | 70 | 116 | 46 | 60.34 |
| frontend | frontend/src/services/authValidation.ts | 27 | 32 | 5 | 84.37 |
| frontend | frontend/src/services/questionService.ts | 9 | 27 | 18 | 33.33 |
| frontend | frontend/src/services/quizAttemptDataService.ts | 53 | 70 | 17 | 75.71 |
| frontend | frontend/src/services/quizDraft.ts | 11 | 11 | 0 | 100 |
| frontend | frontend/src/services/quizService.ts | 3 | 45 | 42 | 6.66 |
| frontend | frontend/src/services/recentMaterials.ts | 14 | 17 | 3 | 82.35 |

Detailed line/branch counters: [backend LCOV](evidence/backend-lcov.info), [frontend LCOV](evidence/frontend-lcov.info).
