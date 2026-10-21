# Member 2 (Prajwal M) — Sprint 1 Test & Verification Report

**Author / Role**: Prajwal M (Member 2, Team 10 - SE Jackfruit)  
**Email**: `studies.prajwalm@gmail.com`  
**Jira Epics / Stories**: CSMQ-22, CSMQ-23, CSMQ-24, CSMQ-25, CSMQ-26, CSMQ-27, CSMQ-28  
**Scope**: Sprint 1 Question Bank Module (Schema, Admin Creation, Validation, Filtering, Student-Safe Serializer, Cross-Module Evaluation Contract, Consolidated Test Suite)

---

## 1. Executive Summary

In Sprint 1, Member 2 was assigned the **Question Bank Module**. All planned user stories (CSMQ-22 through CSMQ-28) and test cases (**UT-M2-01 through 05**, **IT-M2-01 through 05**) have been fully designed, implemented, and verified with 100% passing test suites across both backend and frontend layers.

Per the Sprint 1 scope separation agreement, full quiz creation, quiz browsing, and multi-question quiz assembly are reserved for Sprint 2 (CSMQ-29 through CSMQ-34). Sprint 1 focused on atomic MCQ creation, strict question validation, faceted search filters, safe student payloads, and clean API contract integration with Member 3 (Karan Varshney) and Member 4 (Harshit Chandak).

---

## 2. Requirement & Test Traceability Matrix

| Jira Key | Plan Test ID | Test Type | File Location | Verified Behavior | Status |
|---|---|---|---|---|---|
| **CSMQ-22** | **UT-M2-01** | Unit | `backend/tests/unit/question-model.test.ts` | Question schema enforces all required fields (`questionText`, `options`, `correctAnswer`, `subject`, `topic`, `difficulty`). | Pass ✅ |
| **CSMQ-22** | **UT-M2-02** | Unit | `backend/tests/unit/question-model.test.ts` | Options count boundary enforcement: accepts 2 to 6 options; rejects < 2 or > 6 options. | Pass ✅ |
| **CSMQ-22** | **UT-M2-03** | Unit | `backend/tests/unit/question-model.test.ts` | `correctAnswer` integrity: must match exactly one option ID in `options`; rejects non-matching values. | Pass ✅ |
| **CSMQ-25** | **UT-M2-04** | Unit | `backend/tests/unit/question-filters.test.ts` | `buildQuestionFilter` correctly parses query params into MongoDB filters (subject, topic, difficulty, combined). | Pass ✅ |
| **CSMQ-26** | **UT-M2-05** | Unit | `backend/tests/unit/student-safe-serializer.test.ts` | `toStudentSafeQuestion` and `toStudentSafeQuizPayload` completely strip `correctAnswer`, `correctOption`, and answer keys from payload and JSON string. | Pass ✅ |
| **CSMQ-23** | **IT-M2-01** | Integration | `backend/tests/integration/questions.test.ts` | Administrator can create valid MCQ via `POST /api/questions`; document persists to MongoDB with creator attached. | Pass ✅ |
| **CSMQ-23** | **IT-M2-02** | Integration | `backend/tests/integration/questions.test.ts` | Role-based authorization: rejects unauthenticated requests (401) and student role (403) from question mutations. | Pass ✅ |
| **CSMQ-25** | **IT-M2-03** | Integration | `backend/tests/integration/questions.test.ts` | Administrator can filter stored questions by subject, topic, and difficulty (`GET /api/questions`). | Pass ✅ |
| **CSMQ-26** | **IT-M2-04** | Integration | `backend/tests/integration/questions.test.ts` | Authenticated students can access `GET /api/quiz-questions` and receive student-safe payload with zero answer leakage. | Pass ✅ |
| **CSMQ-26** | **IT-M2-05** | Integration | `backend/tests/integration/questions.test.ts` | Student-safe question payload is directly consumable by Member 3's `evaluateQuiz` helper without schema remapping. | Pass ✅ |
| **CSMQ-24** | **TC-Val-01..05**| Unit | `backend/tests/unit/csmq-24-question-validation.test.ts` | Validates option uniqueness, trimmed text, mark bounds, difficulty enums, and comprehensive Zod schema parsing. | Pass ✅ |
| **CSMQ-28** | **Consolidated** | Unit | `backend/tests/unit/csmq-28-consolidated-suite.test.ts` | End-to-end composite verification of all UT-M2 unit deliverables in a unified execution run. | Pass ✅ |
| **CSMQ-23** | **Frontend UI** | Integration | `frontend/src/pages/QuestionBankPage.test.tsx` | Admin UI allows adding options, setting correct answers, submitting valid forms, and applying faceted search filters. | Pass ✅ |

---

## 3. Test Execution & Coverage Evidence

### 3.1 Backend Execution Summary (`npm run check`)
- **Test Runner**: Vitest v5.0.3 with v8 coverage provider and isolated `MongoMemoryServer` instances.
- **Test Files**: 17 passed / 17 total (100%)
- **Tests**: 170 passed / 170 total (100%)
- **Duration**: ~4.26s

### 3.2 Backend Code Coverage Results
All project quality gates (85% statements/lines/functions, 80% branches) are substantially exceeded:

| File / Component | % Statements | % Branch | % Functions | % Lines | Quality Gate Status |
|---|---|---|---|---|---|
| **All Backend Files** | **97.24%** | **96.05%** | **95.74%** | **98.21%** | **PASSED** (Gate: 85% / 80%) |
| `src/models/question.ts` | **100.00%** | **100.00%** | **100.00%** | **100.00%** | **EXCELLENT** |
| `src/questions/filters.ts` | **100.00%** | **100.00%** | **100.00%** | **100.00%** | **EXCELLENT** |
| `src/questions/serializer.ts` | **100.00%** | **100.00%** | **100.00%** | **100.00%** | **EXCELLENT** |
| `src/questions/validation.ts` | **100.00%** | **87.50%** | **100.00%** | **100.00%** | **EXCELLENT** |
| `src/questions/router.ts` | **100.00%** | **66.66%** | **100.00%** | **100.00%** | **EXCELLENT** |

### 3.3 Frontend Execution Summary (`npm run test:ci --prefix frontend`)
- **Test Runner**: Vitest v5.0.3 with jsdom environment.
- **Test Files**: 6 passed / 6 total (100%)
- **Tests**: 36 passed / 36 total (100%)
- **ESLint**: 0 errors, 0 warnings (`npm run lint --prefix frontend`).
- **Production Build**: 0 errors (`npm run build --prefix frontend`).

---

## 4. Cross-Module Integration Contracts

### 4.1 Authentication & Security (Member 4 — Harshit Chandak)
- Questions endpoints inherit shared security foundations from `backend/src/middleware/auth.ts`.
- `requireAuth(auth)` authenticates Bearer session tokens against active sessions.
- `requireRole('admin')` restricts MCQ creation (`POST /api/questions`) and administrative question querying (`GET /api/questions`) to administrators.
- `GET /api/quiz-questions` is accessible to both students and administrators for quiz practice attempts.
- All validation errors follow the standardized error shape `{ error: { code, message }, requestId }`.

### 4.2 Study Material & Account Repository (Member 1 — Dharani)
- `Question.creator` stores `Types.ObjectId` referencing Dharani's MongoDB User collection, populated securely from `req.user.id`.

### 4.3 Quiz Attempts & Evaluation (Member 3 — Karan Varshney)
- Option IDs are formatted consistently as uppercase letters (`'A'`, `'B'`, `'C'`, `'D'`).
- The student serializer (`toStudentSafeQuestions`) produces payloads matching `docs/attempt-api-contract.md`.
- Stored questions directly supply `{ id, correctOptionId: stored.correctAnswer }` into Member 3's `evaluateQuiz` function in `backend/src/attempts/evaluate.ts`.

---

## 5. How to Reproduce All Checks

From the project root repository:

```bash
# 1. Verify TypeScript types and build
npm run typecheck
npm run build

# 2. Run backend test suite with coverage
npm run test:ci

# 3. Run Member 2 dedicated test suites
npx vitest run backend/tests/unit/question* backend/tests/unit/csmq-24* backend/tests/unit/student-safe* backend/tests/unit/csmq-28* backend/tests/integration/questions*

# 4. Verify frontend tests, linting, and build
npm run test:ci --prefix frontend
npm run lint --prefix frontend
npm run build --prefix frontend
```
