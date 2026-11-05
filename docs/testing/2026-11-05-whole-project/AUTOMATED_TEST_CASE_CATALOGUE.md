# Executed automated test cases

Execution date: **2026-11-05**, Asia/Calcutta. Source: `4a2b3acbf320f15736f30ab64885c169e22fe8d1`. Branch: `PES2UG24CS185-Sprint-2`. The execution manifest identifies the tested source and reporting configuration.

Scope: **the whole Team 10 project**, covering Auth/Materials (Dharani), Question Bank/Quiz (Prajwal), Attempt/Result/History/Performance (Karan), Admin/Security/CI and shared integration (Harshit). Execution coordination does not replace independent peer acceptance.

Every concrete parameterized case from the fresh JUnit reports is included below. These evidence IDs identify this snapshot; the stable SRS test IDs/procedures are in [the updated Test Case Document](../../TEST_CASES_WHOLE_PROJECT.md). Test titles and linked source assertions define each automated expected result. Frontend suites include mocks and DOM integration and are not all isolated unit tests.

| Evidence ID | Level | Source | Test / expected behavior | Outcome | Seconds |
| --- | --- | --- | --- | --- | --- |
| BACKEND-001 | backend integration | backend/tests/integration/admin-provisioning.test.ts | creates an administrator in the configured named database using the existing bcrypt helper | PASS | 1.191 |
| BACKEND-002 | backend integration | backend/tests/integration/admin-provisioning.test.ts | repeats safely without overwriting an existing admin password or name | PASS | 0.663 |
| BACKEND-003 | backend integration | backend/tests/integration/admin-provisioning.test.ts | handles concurrent provisioning with one account and no password reset | PASS | 1.404 |
| BACKEND-004 | backend integration | backend/tests/integration/admin-provisioning.test.ts | rejects an existing student rather than promoting them | PASS | 0.633 |
| BACKEND-005 | backend integration | backend/tests/integration/admin-provisioning.test.ts | does not reactivate a disabled administrator | PASS | 0.442 |
| BACKEND-006 | backend integration | backend/tests/integration/admin-provisioning.test.ts | rejects missing/invalid provisioning input without writes | PASS | 0.015 |
| BACKEND-007 | backend integration | backend/tests/integration/admin-provisioning.test.ts | rejects missing/invalid provisioning input without writes | PASS | 0.015 |
| BACKEND-008 | backend integration | backend/tests/integration/admin-provisioning.test.ts | rejects missing/invalid provisioning input without writes | PASS | 0.014 |
| BACKEND-009 | backend integration | backend/tests/integration/admin-provisioning.test.ts | rejects missing/invalid provisioning input without writes | PASS | 0.018 |
| BACKEND-010 | backend integration | backend/tests/integration/admin-provisioning.test.ts | rejects missing/invalid provisioning input without writes | PASS | 0.018 |
| BACKEND-011 | backend integration | backend/tests/integration/admin-provisioning.test.ts | rejects missing/invalid provisioning input without writes | PASS | 0.017 |
| BACKEND-012 | backend integration | backend/tests/integration/admin-provisioning.test.ts | requires an explicit development/test confirmation and disables production | PASS | 0.012 |
| BACKEND-013 | backend integration | backend/tests/integration/admin-provisioning.test.ts | runs the real CLI only against disposable MongoDB, uses its database, exits cleanly and prints no secrets | PASS | 4.150 |
| BACKEND-014 | backend integration | backend/tests/integration/admin-provisioning.test.ts | refuses the CLI before connecting when production or confirmation is invalid | PASS | 2.091 |
| BACKEND-015 | backend integration | backend/tests/integration/admin-provisioning.test.ts | exits cleanly after a database-connected CLI refusal without promoting a Student or leaking input | PASS | 3.659 |
| BACKEND-016 | backend integration | backend/tests/integration/admin-provisioning.test.ts | uses the common login and server-verified RBAC for real Question Bank creation and persistence | PASS | 2.542 |
| BACKEND-017 | backend integration | backend/tests/integration/attempt-api.test.ts | CSMQ-40: Production Quiz Attempt API > submits, evaluates and persists an authenticated attempt | PASS | 1.988 |
| BACKEND-018 | backend integration | backend/tests/integration/attempt-api.test.ts | CSMQ-40: Production Quiz Attempt API > rejects unauthenticated submissions | PASS | 0.042 |
| BACKEND-019 | backend integration | backend/tests/integration/attempt-api.test.ts | CSMQ-40: Production Quiz Attempt API > rejects non-student accounts | PASS | 0.556 |
| BACKEND-020 | backend integration | backend/tests/integration/attempt-api.test.ts | CSMQ-40: Production Quiz Attempt API > rejects invalid quiz IDs | PASS | 1.321 |
| BACKEND-021 | backend integration | backend/tests/integration/attempt-api.test.ts | CSMQ-40: Production Quiz Attempt API > rejects client-supplied scores and user IDs | PASS | 0.846 |
| BACKEND-022 | backend integration | backend/tests/integration/attempt-api.test.ts | CSMQ-40: Production Quiz Attempt API > rejects questions outside the selected quiz | PASS | 0.468 |
| BACKEND-023 | backend integration | backend/tests/integration/attempt-api.test.ts | CSMQ-40: Production Quiz Attempt API > rejects invalid answer options | PASS | 0.593 |
| BACKEND-024 | backend integration | backend/tests/integration/attempt-api.test.ts | CSMQ-40: Production Quiz Attempt API > rejects removed quizzes | PASS | 1.100 |
| BACKEND-025 | backend integration | backend/tests/integration/attempt-repository.test.ts | CSMQ-40: MongoDB attempt repository > fetches a quiz and its trusted questions | PASS | 0.205 |
| BACKEND-026 | backend integration | backend/tests/integration/attempt-repository.test.ts | CSMQ-40: MongoDB attempt repository > evaluates and persists a real quiz attempt | PASS | 0.088 |
| BACKEND-027 | backend integration | backend/tests/integration/attempt-repository.test.ts | CSMQ-40: MongoDB attempt repository > rejects a nonexistent quiz without saving | PASS | 0.071 |
| BACKEND-028 | backend integration | backend/tests/integration/attempt-repository.test.ts | CSMQ-40: MongoDB attempt repository > rejects a removed quiz without saving | PASS | 0.029 |
| BACKEND-029 | backend integration | backend/tests/integration/attempt-repository.test.ts | CSMQ-40: MongoDB attempt repository > rejects invalid options without persisting | PASS | 0.029 |
| BACKEND-030 | backend integration | backend/tests/integration/bulk-moderation.test.ts | bulk materials removal enforces roles/confirmation, retains audit/history and covers hidden items | PASS | 1.068 |
| BACKEND-031 | backend integration | backend/tests/integration/bulk-moderation.test.ts | bulk questions removal enforces roles/confirmation, retains audit/history and covers hidden items | PASS | 0.445 |
| BACKEND-032 | backend integration | backend/tests/integration/bulk-moderation.test.ts | bulk quizzes removal enforces roles/confirmation, retains audit/history and covers hidden items | PASS | 0.429 |
| BACKEND-033 | backend integration | backend/tests/integration/csmq45-history-isolation.test.ts | CSMQ-45 / real MongoDB student isolation and history > returns only the signed-in student history, including persisted quiz details | PASS | 0.149 |
| BACKEND-034 | backend integration | backend/tests/integration/csmq45-history-isolation.test.ts | CSMQ-45 / real MongoDB student isolation and history > never returns student A data to student B | PASS | 0.025 |
| BACKEND-035 | backend integration | backend/tests/integration/csmq45-history-isolation.test.ts | CSMQ-45 / real MongoDB student isolation and history > does not allow query parameters to change the authenticated identity | PASS | 0.020 |
| BACKEND-036 | backend integration | backend/tests/integration/csmq45-history-isolation.test.ts | CSMQ-45 / real MongoDB student isolation and history > rejects unauthenticated access to history | PASS | 0.056 |
| BACKEND-037 | backend integration | backend/tests/integration/csmq45-history-isolation.test.ts | CSMQ-45 / real MongoDB student isolation and history > returns the empty history state for a new student | PASS | 0.027 |
| BACKEND-038 | backend integration | backend/tests/integration/csmq45-history-isolation.test.ts | CSMQ-45 / real MongoDB student isolation and history > respects page size and total counts without cross-user leakage | PASS | 0.022 |
| BACKEND-039 | backend integration | backend/tests/integration/csmq45-submission-acceptance.test.ts | CSMQ-45 / production POST /api/attempts acceptance > saves a server-evaluated correct/incorrect result under the authenticated student | PASS | 0.125 |
| BACKEND-040 | backend integration | backend/tests/integration/csmq45-submission-acceptance.test.ts | CSMQ-45 / production POST /api/attempts acceptance > counts an omitted question as unanswered rather than incorrect | PASS | 0.012 |
| BACKEND-041 | backend integration | backend/tests/integration/csmq45-submission-acceptance.test.ts | CSMQ-45 / production POST /api/attempts acceptance > rejects an unauthenticated submission without saving | PASS | 0.009 |
| BACKEND-042 | backend integration | backend/tests/integration/csmq45-submission-acceptance.test.ts | CSMQ-45 / production POST /api/attempts acceptance > rejects invalid quiz ID without persisting | PASS | 0.008 |
| BACKEND-043 | backend integration | backend/tests/integration/csmq45-submission-acceptance.test.ts | CSMQ-45 / production POST /api/attempts acceptance > rejects invalid question ID without persisting | PASS | 0.008 |
| BACKEND-044 | backend integration | backend/tests/integration/csmq45-submission-acceptance.test.ts | CSMQ-45 / production POST /api/attempts acceptance > rejects invalid option without persisting | PASS | 0.007 |
| BACKEND-045 | backend integration | backend/tests/integration/csmq45-submission-acceptance.test.ts | CSMQ-45 / production POST /api/attempts acceptance > rejects duplicate question response without persisting | PASS | 0.007 |
| BACKEND-046 | backend integration | backend/tests/integration/csmq45-submission-acceptance.test.ts | CSMQ-45 / production POST /api/attempts acceptance > does not let client-supplied userId override the session identity | PASS | 0.007 |
| BACKEND-047 | backend integration | backend/tests/integration/csmq45-submission-acceptance.test.ts | CSMQ-45 / production POST /api/attempts acceptance > rejects forged score/percentage values supplied by the client | PASS | 0.007 |
| BACKEND-048 | backend integration | backend/tests/integration/local-demo.test.ts | serves protected APIs and SPA routes, preserving sessions, questions and removal across actual MongoDB restarts | PASS | 9.132 |
| BACKEND-049 | backend integration | backend/tests/integration/local-demo.test.ts | fails before starting a database when the frontend build is missing | PASS | 0.006 |
| BACKEND-050 | backend integration | backend/tests/integration/question-moderation.test.ts | moderates the actual Question model, excludes both read APIs and preserves persisted attempt references | PASS | 1.545 |
| BACKEND-051 | backend integration | backend/tests/integration/question-moderation.test.ts | requires current admin role, confirmation and valid identifiers; removal is atomic | PASS | 1.016 |
| BACKEND-052 | backend integration | backend/tests/integration/question-moderation.test.ts | discovers integrated modules and rejects malicious query/body fields | PASS | 1.169 |
| BACKEND-053 | backend integration | backend/tests/integration/question-moderation.test.ts | persists question moderation and sessions after runtime recreation and database reconnect | PASS | 1.098 |
| BACKEND-054 | backend integration | backend/tests/integration/questions.test.ts | Question API integration (CSMQ-23 / IT-M2-01..02) > IT-M2-01: admin can create a question and it persists to MongoDB with creator attached | PASS | 0.582 |
| BACKEND-055 | backend integration | backend/tests/integration/questions.test.ts | Question API integration (CSMQ-23 / IT-M2-01..02) > IT-M2-02: student role is rejected from creating questions with 403 Forbidden | PASS | 0.476 |
| BACKEND-056 | backend integration | backend/tests/integration/questions.test.ts | Question API integration (CSMQ-23 / IT-M2-01..02) > rejects unauthenticated requests to create questions with 401 Unauthenticated | PASS | 0.019 |
| BACKEND-057 | backend integration | backend/tests/integration/questions.test.ts | Question API integration (CSMQ-23 / IT-M2-01..02) > CSMQ-24: rejects invalid payload with 400 and clear error message | PASS | 0.464 |
| BACKEND-058 | backend integration | backend/tests/integration/questions.test.ts | Question API integration (CSMQ-23 / IT-M2-01..02) > IT-M2-03: admin can list questions and apply subject/topic/difficulty filters | PASS | 0.948 |
| BACKEND-059 | backend integration | backend/tests/integration/questions.test.ts | Question API integration (CSMQ-23 / IT-M2-01..02) > IT-M2-04: student can access /api/quiz-questions and receives student-safe payload without correctAnswer | PASS | 1.044 |
| BACKEND-060 | backend integration | backend/tests/integration/questions.test.ts | Question API integration (CSMQ-23 / IT-M2-01..02) > IT-M2-05: student responses and stored question answers map to Member 3 evaluateQuiz contract for accurate scoring | PASS | 0.989 |
| BACKEND-061 | backend integration | backend/tests/integration/questions.test.ts | Question API integration (CSMQ-23 / IT-M2-01..02) > supports quizId, title, and subject filters on /api/quiz-questions | PASS | 1.028 |
| BACKEND-062 | backend integration | backend/tests/integration/quiz-attempt.test.ts | QuizAttempt integration > evaluates an authenticated student attempt and persists it in MongoDB | PASS | 0.551 |
| BACKEND-063 | backend integration | backend/tests/integration/quiz-attempt.test.ts | QuizAttempt integration > rejects an unauthenticated attempt before anything is persisted | PASS | 0.022 |
| BACKEND-064 | backend integration | backend/tests/integration/quiz-attempt.test.ts | QuizAttempt integration > uses the authenticated user instead of a client supplied userId | PASS | 0.530 |
| BACKEND-065 | backend integration | backend/tests/integration/quiz-attempt.test.ts | QuizAttempt integration > rejects a non-student account through the application role middleware | PASS | 0.380 |
| BACKEND-066 | backend integration | backend/tests/integration/quiz-contract-cross-module.test.ts | Quiz Cross-Module Contract & Comprehensive Integration (CSMQ-53) > verifies end-to-end quiz creation, persistence, model-level lookup, and safe retrieval | PASS | 0.696 |
| BACKEND-067 | backend integration | backend/tests/integration/quiz-contract-cross-module.test.ts | Quiz Cross-Module Contract & Comprehensive Integration (CSMQ-53) > verifies cross-module contract with Karan's evaluateQuiz and QuizAttempt model without remapping | PASS | 0.442 |
| BACKEND-068 | backend integration | backend/tests/integration/quiz-contract-cross-module.test.ts | Quiz Cross-Module Contract & Comprehensive Integration (CSMQ-53) > verifies moderation removal compatibility (softDeleteQuizById and deleteQuizById) | PASS | 0.486 |
| BACKEND-069 | backend integration | backend/tests/integration/quizzes.test.ts | Quiz API integration (CSMQ-48 / SRS CSMQ-F-030) > IT-M2-QUIZ-01: authenticated student creates a valid quiz from existing Question Bank questions | PASS | 0.985 |
| BACKEND-070 | backend integration | backend/tests/integration/quizzes.test.ts | Quiz API integration (CSMQ-48 / SRS CSMQ-F-030) > IT-M2-QUIZ-02: rejects unauthenticated requests with 401 Unauthorized | PASS | 0.066 |
| BACKEND-071 | backend integration | backend/tests/integration/quizzes.test.ts | Quiz API integration (CSMQ-48 / SRS CSMQ-F-030) > IT-M2-QUIZ-03: rejects quiz creation with empty questions array | PASS | 0.617 |
| BACKEND-072 | backend integration | backend/tests/integration/quizzes.test.ts | Quiz API integration (CSMQ-48 / SRS CSMQ-F-030) > IT-M2-QUIZ-04: rejects quiz creation with unknown question IDs not in Question Bank | PASS | 0.668 |
| BACKEND-073 | backend integration | backend/tests/integration/quizzes.test.ts | Quiz API integration (CSMQ-48 / SRS CSMQ-F-030) > IT-M2-QUIZ-05: rejects quiz creation with duplicate question IDs in the selection | PASS | 1.032 |
| BACKEND-074 | backend integration | backend/tests/integration/quizzes.test.ts | Quiz API integration (CSMQ-48 / SRS CSMQ-F-030) > IT-M2-QUIZ-06: rejects quiz creation with missing required fields (title, subject) | PASS | 0.660 |
| BACKEND-075 | backend integration | backend/tests/integration/quizzes.test.ts | Quiz API integration (CSMQ-48 / SRS CSMQ-F-030) > IT-M2-QUIZ-07: rejects unexpected extra fields ensuring students cannot add/edit questions | PASS | 0.536 |
| BACKEND-076 | backend integration | backend/tests/integration/quizzes.test.ts | Quiz API integration (CSMQ-48 / SRS CSMQ-F-030) > IT-M2-QUIZ-08: authenticated student retrieves quiz by ID and receives student-safe payload with zero answer leakage | PASS | 0.404 |
| BACKEND-077 | backend integration | backend/tests/integration/quizzes.test.ts | Quiz API integration (CSMQ-48 / SRS CSMQ-F-030) > IT-M2-QUIZ-09: returns 404 for non-existent quiz and 400 for malformed quiz ID | PASS | 0.350 |
| BACKEND-078 | backend integration | backend/tests/integration/quizzes.test.ts | Quiz API integration (CSMQ-48 / SRS CSMQ-F-030) > IT-M2-QUIZ-10: moderation interface lists active quizzes and soft-deletes a quiz | PASS | 0.371 |
| BACKEND-079 | backend integration | backend/tests/integration/quizzes.test.ts | Quiz API integration (CSMQ-48 / SRS CSMQ-F-030) > IT-M2-QUIZ-11: GET /api/quizzes returns all active quizzes with metadata and question count | PASS | 0.445 |
| BACKEND-080 | backend integration | backend/tests/integration/quizzes.test.ts | Quiz API integration (CSMQ-48 / SRS CSMQ-F-030) > IT-M2-QUIZ-12: GET /api/quizzes?search=... filters quizzes by title keyword case-insensitively | PASS | 0.427 |
| BACKEND-081 | backend integration | backend/tests/integration/quizzes.test.ts | Quiz API integration (CSMQ-48 / SRS CSMQ-F-030) > IT-M2-QUIZ-13: GET /api/quizzes?subject=... filters quizzes by subject case-insensitively | PASS | 0.873 |
| BACKEND-082 | backend integration | backend/tests/integration/quizzes.test.ts | Quiz API integration (CSMQ-48 / SRS CSMQ-F-030) > IT-M2-QUIZ-14: GET /api/quizzes?search=...&subject=... applies combined filters | PASS | 1.134 |
| BACKEND-083 | backend integration | backend/tests/integration/quizzes.test.ts | Quiz API integration (CSMQ-48 / SRS CSMQ-F-030) > IT-M2-QUIZ-15: GET /api/quizzes returns empty list when nothing matches search or subject | PASS | 1.358 |
| BACKEND-084 | backend integration | backend/tests/integration/quizzes.test.ts | Quiz API integration (CSMQ-48 / SRS CSMQ-F-030) > IT-M2-QUIZ-16: GET /api/quizzes excludes soft-deleted/moderated quizzes | PASS | 1.502 |
| BACKEND-085 | backend integration | backend/tests/integration/quizzes.test.ts | Quiz API integration (CSMQ-48 / SRS CSMQ-F-030) > IT-M2-QUIZ-17: GET /api/quizzes never leaks question options, questions array, or correctAnswer | PASS | 1.448 |
| BACKEND-086 | backend integration | backend/tests/integration/runtime.test.ts | CSMQ-14/15 authenticated PDF upload and validation integration > registers, logs in, persists a real PDF and metadata, then rejects upload after logout | PASS | 0.785 |
| BACKEND-087 | backend integration | backend/tests/integration/runtime.test.ts | CSMQ-14/15 authenticated PDF upload and validation integration > rejects unauthenticated upload before accepting file data | PASS | 0.024 |
| BACKEND-088 | backend integration | backend/tests/integration/runtime.test.ts | CSMQ-14/15 authenticated PDF upload and validation integration > rejects missing metadata, missing files, non-PDFs, forged PDFs, and oversized files with controlled errors | PASS | 0.546 |
| BACKEND-089 | backend integration | backend/tests/integration/runtime.test.ts | CSMQ-14/15 authenticated PDF upload and validation integration > rejects unknown/malicious metadata, extra files, and oversized text fields | PASS | 0.423 |
| BACKEND-090 | backend integration | backend/tests/integration/runtime.test.ts | CSMQ-14/15 authenticated PDF upload and validation integration > enforces the student upload role using the database role | PASS | 0.413 |
| BACKEND-091 | backend integration | backend/tests/integration/runtime.test.ts | CSMQ-14/15 authenticated PDF upload and validation integration > removes uploaded bytes if saving metadata fails and returns a safe error | PASS | 0.377 |
| BACKEND-092 | backend integration | backend/tests/integration/runtime.test.ts | CSMQ-14/15 authenticated PDF upload and validation integration > rejects a PDF with no pages | PASS | 0.333 |
| BACKEND-093 | backend integration | backend/tests/integration/runtime.test.ts | CSMQ-14/15 authenticated PDF upload and validation integration > enforces account hash storage and handles missing or malformed identity lookups | PASS | 0.046 |
| BACKEND-094 | backend integration | backend/tests/integration/security.test.ts | IT-M4-01 / TC-Auth-01..03 MongoDB-backed account integration > registers, normalizes email, hashes the password, logs in and reads protected context | PASS | 0.524 |
| BACKEND-095 | backend integration | backend/tests/integration/security.test.ts | IT-M4-01 / TC-Auth-01..03 MongoDB-backed account integration > rejects duplicate emails with a controlled response, including a concurrent registration race | PASS | 0.350 |
| BACKEND-096 | backend integration | backend/tests/integration/security.test.ts | IT-M4-01 / TC-Auth-01..03 MongoDB-backed account integration > rejects malformed data and privilege escalation | PASS | 0.016 |
| BACKEND-097 | backend integration | backend/tests/integration/security.test.ts | IT-M4-01 / TC-Auth-01..03 MongoDB-backed account integration > rejects malformed data and privilege escalation | PASS | 0.017 |
| BACKEND-098 | backend integration | backend/tests/integration/security.test.ts | IT-M4-01 / TC-Auth-01..03 MongoDB-backed account integration > rejects malformed data and privilege escalation | PASS | 0.028 |
| BACKEND-099 | backend integration | backend/tests/integration/security.test.ts | IT-M4-01 / TC-Auth-01..03 MongoDB-backed account integration > rejects malformed data and privilege escalation | PASS | 0.029 |
| BACKEND-100 | backend integration | backend/tests/integration/security.test.ts | IT-M4-01 / TC-Auth-01..03 MongoDB-backed account integration > rejects malformed data and privilege escalation | PASS | 0.016 |
| BACKEND-101 | backend integration | backend/tests/integration/security.test.ts | IT-M4-01 / TC-Auth-01..03 MongoDB-backed account integration > rejects malformed data and privilege escalation | PASS | 0.016 |
| BACKEND-102 | backend integration | backend/tests/integration/security.test.ts | IT-M4-01 / TC-Auth-01..03 MongoDB-backed account integration > uses the same error for wrong passwords and unknown or disabled accounts | PASS | 0.798 |
| BACKEND-103 | backend integration | backend/tests/integration/security.test.ts | IT-M4-01 / TC-Auth-01..03 MongoDB-backed account integration > revokes only the active session on logout and rejects replay after recreating the app | PASS | 0.724 |
| BACKEND-104 | backend integration | backend/tests/integration/security.test.ts | IT-M4-01 / TC-Auth-01..03 MongoDB-backed account integration > persists sessions across a database reconnect and refuses expired sessions before TTL cleanup | PASS | 0.388 |
| BACKEND-105 | backend integration | backend/tests/integration/security.test.ts | IT-M4-01 / TC-Auth-01..03 MongoDB-backed account integration > rejects missing, random, malformed and revoked credentials, including query-string tokens | PASS | 0.368 |
| BACKEND-106 | backend integration | backend/tests/integration/security.test.ts | IT-M4-01 / TC-Auth-01..03 MongoDB-backed account integration > rejects deleted or disabled users without waiting for session expiry | PASS | 0.314 |
| BACKEND-107 | backend integration | backend/tests/integration/security.test.ts | IT-M4-01 / TC-Auth-01..03 MongoDB-backed account integration > rate limits authentication attempts | PASS | 0.336 |
| BACKEND-108 | backend integration | backend/tests/integration/security.test.ts | IT-M4-02/03 / TC-Sec-02/03 teammate route contracts > protects the upload route before its handler receives multipart bytes | PASS | 0.337 |
| BACKEND-109 | backend integration | backend/tests/integration/security.test.ts | IT-M4-02/03 / TC-Sec-02/03 teammate route contracts > denies a student at Add Question and allows an administrator; role changes take effect immediately | PASS | 0.344 |
| BACKEND-110 | backend integration | backend/tests/integration/security.test.ts | IT-M4-02/03 / TC-Sec-02/03 teammate route contracts > protects the attempt prototype and supplies the student context | PASS | 0.380 |
| BACKEND-111 | backend integration | backend/tests/integration/sprint2.test.ts | lists only enabled moderation resources and rejects student/anonymous administration | PASS | 0.835 |
| BACKEND-112 | backend integration | backend/tests/integration/sprint2.test.ts | removes material atomically and closes both search and download while retaining recoverable data | PASS | 1.461 |
| BACKEND-113 | backend integration | backend/tests/integration/sprint2.test.ts | requires explicit confirmation and validates identifiers, missing/repeated removals and query limits | PASS | 1.426 |
| BACKEND-114 | backend integration | backend/tests/integration/sprint2.test.ts | searches all material metadata and combines keyword with a subject filter | PASS | 0.902 |
| BACKEND-115 | backend integration | backend/tests/integration/sprint2.test.ts | lists searchable subjects from available materials only | PASS | 0.712 |
| BACKEND-116 | backend integration | backend/tests/integration/sprint2.test.ts | returns selected material metadata by identifier and rejects invalid or unavailable identifiers | PASS | 0.590 |
| BACKEND-117 | backend integration | backend/tests/integration/sprint2.test.ts | validates safe searches and download options, escapes regex and paginates | PASS | 0.937 |
| BACKEND-118 | backend integration | backend/tests/integration/sprint2.test.ts | uses owner-supplied question and quiz moderation adapters behind the same admin gate | PASS | 0.708 |
| BACKEND-119 | backend integration | backend/tests/integration/sprint2.test.ts | handles missing PDF storage safely and makes revoked administrator access ineffective | PASS | 0.523 |
| BACKEND-120 | backend integration | backend/tests/integration/sprint2.test.ts | keeps normal protected operations within three seconds for 10 concurrent authenticated sessions | PASS | 4.814 |
| BACKEND-121 | backend integration | backend/tests/integration/sprint2.test.ts | keeps normal protected operations within three seconds for 50 concurrent authenticated sessions | PASS | 16.090 |
| BACKEND-122 | backend integration | backend/tests/integration/sprint2.test.ts | persists removal and existing authentication after runtime recreation and database reconnect | PASS | 0.799 |
| BACKEND-123 | backend integration | backend/tests/integration/team-sprint2.test.ts | connects real Question creation, Quiz discovery, trusted submission and persisted attempt without answer leakage | PASS | 1.264 |
| BACKEND-124 | backend integration | backend/tests/integration/team-sprint2.test.ts | enforces actual Quiz moderation, excludes discovery/submission and preserves existing attempt history | PASS | 1.142 |
| BACKEND-125 | backend integration | backend/tests/integration/team-sprint2.test.ts | makes moderated Questions unavailable through real Quiz reads and trusted scoring | PASS | 1.010 |
| BACKEND-126 | backend integration | backend/tests/integration/team-sprint2.test.ts | rejects malformed Quiz filters, forged scores and Admin submissions | PASS | 1.009 |
| BACKEND-127 | backend integration | backend/tests/integration/team-sprint2.test.ts | deduplicates racing retries of one submission, rejects changed answers and permits a fresh repeat attempt | PASS | 0.988 |
| BACKEND-128 | backend integration | backend/tests/integration/team-sprint2.test.ts | retains history and retry identity after reconnect and after moderation without exposing post-submission keys through history | PASS | 1.154 |
| BACKEND-129 | backend integration | backend/tests/integration/team-sprint2.test.ts | supports the submitted SAD download path with the same authenticated PDF bytes and removal denial | PASS | 1.219 |
| BACKEND-130 | backend integration | backend/tests/integration/team-sprint2.test.ts | serves real Quiz retrieval and trusted submissions for 10 concurrent Student sessions | PASS | 4.019 |
| BACKEND-131 | backend integration | backend/tests/integration/team-sprint2.test.ts | serves real Quiz retrieval and trusted submissions for 50 concurrent Student sessions | PASS | 51.082 |
| BACKEND-132 | backend unit | backend/tests/unit/attempt-history-route.test.ts | CSMQ-43: Attempt history API > uses the authenticated user ID | PASS | 0.087 |
| BACKEND-133 | backend unit | backend/tests/unit/attempt-history-route.test.ts | CSMQ-43: Attempt history API > rejects invalid pagination | PASS | 0.013 |
| BACKEND-134 | backend unit | backend/tests/unit/attempt-history-route.test.ts | CSMQ-43: Attempt history API > does not trust a userId query parameter | PASS | 0.007 |
| BACKEND-135 | backend unit | backend/tests/unit/attempt-validation.test.ts | CSMQ-40: Quiz attempt submission validation > accepts a valid quiz submission | PASS | 0.008 |
| BACKEND-136 | backend unit | backend/tests/unit/attempt-validation.test.ts | CSMQ-40: Quiz attempt submission validation > rejects an invalid quiz ID | PASS | 0.001 |
| BACKEND-137 | backend unit | backend/tests/unit/attempt-validation.test.ts | CSMQ-40: Quiz attempt submission validation > rejects duplicate question responses | PASS | 0.001 |
| BACKEND-138 | backend unit | backend/tests/unit/attempt-validation.test.ts | CSMQ-40: Quiz attempt submission validation > rejects a missing selected option | PASS | 0.001 |
| BACKEND-139 | backend unit | backend/tests/unit/attempt-validation.test.ts | CSMQ-40: Quiz attempt submission validation > rejects student-supplied scores | PASS | 0.000 |
| BACKEND-140 | backend unit | backend/tests/unit/attempt-validation.test.ts | CSMQ-40: Quiz attempt submission validation > rejects student-supplied user IDs | PASS | 0.000 |
| BACKEND-141 | backend unit | backend/tests/unit/attempt-validation.test.ts | CSMQ-40: Quiz attempt submission validation > rejects submissions exceeding the response limit | PASS | 0.006 |
| BACKEND-142 | backend unit | backend/tests/unit/config.test.ts | environment configuration > loads development defaults and validates a production HTTPS origin | PASS | 0.015 |
| BACKEND-143 | backend unit | backend/tests/unit/config.test.ts | environment configuration > fails closed on invalid configuration {} | PASS | 0.004 |
| BACKEND-144 | backend unit | backend/tests/unit/config.test.ts | environment configuration > fails closed on invalid configuration {"PORT":"0"} | PASS | 0.001 |
| BACKEND-145 | backend unit | backend/tests/unit/config.test.ts | environment configuration > fails closed on invalid configuration {"PORT":"invalid"} | PASS | 0.001 |
| BACKEND-146 | backend unit | backend/tests/unit/config.test.ts | environment configuration > fails closed on invalid configuration {"BCRYPT_ROUNDS":"4"} | PASS | 0.001 |
| BACKEND-147 | backend unit | backend/tests/unit/config.test.ts | environment configuration > fails closed on invalid configuration {"SESSION_TTL_MINUTES":"0"} | PASS | 0.001 |
| BACKEND-148 | backend unit | backend/tests/unit/config.test.ts | environment configuration > fails closed on invalid configuration {"CLIENT_ORIGIN":"https://study.example/path"} | PASS | 0.001 |
| BACKEND-149 | backend unit | backend/tests/unit/config.test.ts | environment configuration > fails closed on invalid configuration {"CLIENT_ORIGIN":"ftp://study.example"} | PASS | 0.001 |
| BACKEND-150 | backend unit | backend/tests/unit/config.test.ts | environment configuration > fails closed on invalid configuration {"TRUST_PROXY":"true"} | PASS | 0.001 |
| BACKEND-151 | backend unit | backend/tests/unit/config.test.ts | environment configuration > fails closed on invalid configuration {"TRUST_PROXY":"1"} | PASS | 0.000 |
| BACKEND-152 | backend unit | backend/tests/unit/config.test.ts | environment configuration > fails closed on invalid configuration {"NODE_ENV":"production"} | PASS | 0.000 |
| BACKEND-153 | backend unit | backend/tests/unit/config.test.ts | environment configuration > fails closed on invalid configuration {"MONGODB_URI":"invalid-secret-credential"} | PASS | 0.000 |
| BACKEND-154 | backend unit | backend/tests/unit/csmq-24-question-validation.test.ts | CSMQ-24 Question Validation Suite > Required fields validation > accepts a fully compliant question payload | PASS | 0.009 |
| BACKEND-155 | backend unit | backend/tests/unit/csmq-24-question-validation.test.ts | CSMQ-24 Question Validation Suite > Required fields validation > rejects missing or empty questionText with clear error | PASS | 0.002 |
| BACKEND-156 | backend unit | backend/tests/unit/csmq-24-question-validation.test.ts | CSMQ-24 Question Validation Suite > Required fields validation > rejects questionText exceeding maximum length | PASS | 0.001 |
| BACKEND-157 | backend unit | backend/tests/unit/csmq-24-question-validation.test.ts | CSMQ-24 Question Validation Suite > Required fields validation > rejects missing or empty subject with clear error | PASS | 0.000 |
| BACKEND-158 | backend unit | backend/tests/unit/csmq-24-question-validation.test.ts | CSMQ-24 Question Validation Suite > Required fields validation > rejects missing or empty topic with clear error | PASS | 0.001 |
| BACKEND-159 | backend unit | backend/tests/unit/csmq-24-question-validation.test.ts | CSMQ-24 Question Validation Suite > Required fields validation > rejects invalid difficulty values with clear error | PASS | 0.001 |
| BACKEND-160 | backend unit | backend/tests/unit/csmq-24-question-validation.test.ts | CSMQ-24 Question Validation Suite > Required fields validation > rejects non-positive marks | PASS | 0.001 |
| BACKEND-161 | backend unit | backend/tests/unit/csmq-24-question-validation.test.ts | CSMQ-24 Question Validation Suite > Options and correctAnswer validation > rejects when correctAnswer does not match any option ID | PASS | 0.001 |
| BACKEND-162 | backend unit | backend/tests/unit/csmq-24-question-validation.test.ts | CSMQ-24 Question Validation Suite > Options and correctAnswer validation > rejects when fewer than 2 options are provided | PASS | 0.001 |
| BACKEND-163 | backend unit | backend/tests/unit/csmq-24-question-validation.test.ts | CSMQ-24 Question Validation Suite > Options and correctAnswer validation > rejects when more than 6 options are provided | PASS | 0.001 |
| BACKEND-164 | backend unit | backend/tests/unit/csmq-24-question-validation.test.ts | CSMQ-24 Question Validation Suite > Options and correctAnswer validation > rejects duplicate option IDs | PASS | 0.000 |
| BACKEND-165 | backend unit | backend/tests/unit/csmq-24-question-validation.test.ts | CSMQ-24 Question Validation Suite > Options and correctAnswer validation > rejects option with missing or blank text | PASS | 0.001 |
| BACKEND-166 | backend unit | backend/tests/unit/csmq-24-question-validation.test.ts | CSMQ-24 Question Validation Suite > Unexpected fields and middleware behavior > rejects unrecognized extra fields in request body | PASS | 0.000 |
| BACKEND-167 | backend unit | backend/tests/unit/csmq-24-question-validation.test.ts | CSMQ-24 Question Validation Suite > Unexpected fields and middleware behavior > middleware throws AppError with 400 status and message on failure | PASS | 0.002 |
| BACKEND-168 | backend unit | backend/tests/unit/csmq-24-question-validation.test.ts | CSMQ-24 Question Validation Suite > Unexpected fields and middleware behavior > middleware attaches parsed data and proceeds when valid | PASS | 0.003 |
| BACKEND-169 | backend unit | backend/tests/unit/csmq-28-consolidated-suite.test.ts | CSMQ-28: Consolidated Member 2 Test Suite Verification > UT-M2-01: verifies Question model schema and required properties | PASS | 0.005 |
| BACKEND-170 | backend unit | backend/tests/unit/csmq-28-consolidated-suite.test.ts | CSMQ-28: Consolidated Member 2 Test Suite Verification > UT-M2-02: verifies 2 to 6 options requirement in API validation schema | PASS | 0.008 |
| BACKEND-171 | backend unit | backend/tests/unit/csmq-28-consolidated-suite.test.ts | CSMQ-28: Consolidated Member 2 Test Suite Verification > UT-M2-03: verifies correctAnswer must match one of the options | PASS | 0.002 |
| BACKEND-172 | backend unit | backend/tests/unit/csmq-28-consolidated-suite.test.ts | CSMQ-28: Consolidated Member 2 Test Suite Verification > UT-M2-04: verifies filter builder query parsing | PASS | 0.002 |
| BACKEND-173 | backend unit | backend/tests/unit/csmq-28-consolidated-suite.test.ts | CSMQ-28: Consolidated Member 2 Test Suite Verification > UT-M2-05: verifies student-safe question serializer completely omits answers | PASS | 0.004 |
| BACKEND-174 | backend unit | backend/tests/unit/evaluate-quiz.test.ts | evaluateQuiz > returns full score when all answers are correct | PASS | 0.005 |
| BACKEND-175 | backend unit | backend/tests/unit/evaluate-quiz.test.ts | evaluateQuiz > returns zero score when all answers are incorrect | PASS | 0.000 |
| BACKEND-176 | backend unit | backend/tests/unit/evaluate-quiz.test.ts | evaluateQuiz > calculates the exact score for mixed answers | PASS | 0.000 |
| BACKEND-177 | backend unit | backend/tests/unit/evaluate-quiz.test.ts | evaluateQuiz > handles unanswered questions without crashing | PASS | 0.000 |
| BACKEND-178 | backend unit | backend/tests/unit/evaluate-quiz.test.ts | evaluateQuiz > treats an empty selected option as unanswered | PASS | 0.000 |
| BACKEND-179 | backend unit | backend/tests/unit/evaluate-quiz.test.ts | evaluateQuiz > rounds percentage to two decimal places | PASS | 0.000 |
| BACKEND-180 | backend unit | backend/tests/unit/evaluate-quiz.test.ts | evaluateQuiz > handles an empty quiz safely | PASS | 0.000 |
| BACKEND-181 | backend unit | backend/tests/unit/material-upload-validation.test.ts | study material upload metadata validation > accepts complete metadata and trims surrounding whitespace | PASS | 0.009 |
| BACKEND-182 | backend unit | backend/tests/unit/material-upload-validation.test.ts | study material upload metadata validation > rejects missing title | PASS | 0.001 |
| BACKEND-183 | backend unit | backend/tests/unit/material-upload-validation.test.ts | study material upload metadata validation > rejects missing subject | PASS | 0.001 |
| BACKEND-184 | backend unit | backend/tests/unit/material-upload-validation.test.ts | study material upload metadata validation > rejects missing description | PASS | 0.000 |
| BACKEND-185 | backend unit | backend/tests/unit/material-upload-validation.test.ts | study material upload metadata validation > rejects invalid or unexpected metadata | PASS | 0.001 |
| BACKEND-186 | backend unit | backend/tests/unit/material-upload-validation.test.ts | study material upload metadata validation > rejects invalid or unexpected metadata | PASS | 0.000 |
| BACKEND-187 | backend unit | backend/tests/unit/material-upload-validation.test.ts | study material upload metadata validation > rejects invalid or unexpected metadata | PASS | 0.000 |
| BACKEND-188 | backend unit | backend/tests/unit/material-upload-validation.test.ts | study material upload metadata validation > rejects invalid or unexpected metadata | PASS | 0.000 |
| BACKEND-189 | backend unit | backend/tests/unit/middleware.test.ts | UT-M4-02 through UT-M4-06 shared middleware > attaches only the authenticated user context | PASS | 0.100 |
| BACKEND-190 | backend unit | backend/tests/unit/middleware.test.ts | UT-M4-02 through UT-M4-06 shared middleware > rejects malformed credentials  | PASS | 0.011 |
| BACKEND-191 | backend unit | backend/tests/unit/middleware.test.ts | UT-M4-02 through UT-M4-06 shared middleware > rejects malformed credentials Basic abc | PASS | 0.006 |
| BACKEND-192 | backend unit | backend/tests/unit/middleware.test.ts | UT-M4-02 through UT-M4-06 shared middleware > rejects malformed credentials Bearer invalid | PASS | 0.006 |
| BACKEND-193 | backend unit | backend/tests/unit/middleware.test.ts | UT-M4-02 through UT-M4-06 shared middleware > rejects malformed credentials Bearer aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa, Bearer aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa | PASS | 0.006 |
| BACKEND-194 | backend unit | backend/tests/unit/middleware.test.ts | UT-M4-02 through UT-M4-06 shared middleware > rejects a missing user even when the role guard is mounted alone | PASS | 0.006 |
| BACKEND-195 | backend unit | backend/tests/unit/middleware.test.ts | UT-M4-02 through UT-M4-06 shared middleware > allows administrators and forbids students | PASS | 0.016 |
| BACKEND-196 | backend unit | backend/tests/unit/middleware.test.ts | UT-M4-02 through UT-M4-06 shared middleware > does not turn a database outage into successful authentication | PASS | 0.008 |
| BACKEND-197 | backend unit | backend/tests/unit/middleware.test.ts | UT-M4-02 through UT-M4-06 shared middleware > validates values and keeps request data out of errors and logs | PASS | 0.041 |
| BACKEND-198 | backend unit | backend/tests/unit/middleware.test.ts | UT-M4-02 through UT-M4-06 shared middleware > maps parsing, oversized JSON, and duplicate key errors to safe messages | PASS | 0.034 |
| BACKEND-199 | backend unit | backend/tests/unit/middleware.test.ts | UT-M4-02 through UT-M4-06 shared middleware > preserves safe application errors and delegates when headers have been sent | PASS | 0.001 |
| BACKEND-200 | backend unit | backend/tests/unit/middleware.test.ts | application transport and health > reports liveness/readiness independently and returns safe 404s | PASS | 0.025 |
| BACKEND-201 | backend unit | backend/tests/unit/middleware.test.ts | application transport and health > uses the configured CORS origin | PASS | 0.008 |
| BACKEND-202 | backend unit | backend/tests/unit/middleware.test.ts | application transport and health > requires HTTPS in production and refuses spoofed proxy headers by default | PASS | 0.018 |
| BACKEND-203 | backend unit | backend/tests/unit/middleware.test.ts | application transport and health > refuses to mount unprotected feature routers | PASS | 0.001 |
| BACKEND-204 | backend unit | backend/tests/unit/password.test.ts | UT-M4-01 / TC-Sec-01 password hashing > uses independently salted hashes and verifies only the correct password | PASS | 0.715 |
| BACKEND-205 | backend unit | backend/tests/unit/password.test.ts | UT-M4-01 / TC-Sec-01 password hashing > rejects invalid input "" | PASS | 0.003 |
| BACKEND-206 | backend unit | backend/tests/unit/password.test.ts | UT-M4-01 / TC-Sec-01 password hashing > rejects invalid input "short" | PASS | 0.000 |
| BACKEND-207 | backend unit | backend/tests/unit/password.test.ts | UT-M4-01 / TC-Sec-01 password hashing > rejects invalid input "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" | PASS | 0.000 |
| BACKEND-208 | backend unit | backend/tests/unit/password.test.ts | UT-M4-01 / TC-Sec-01 password hashing > rejects invalid input "🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒" | PASS | 0.000 |
| BACKEND-209 | backend unit | backend/tests/unit/password.test.ts | UT-M4-01 / TC-Sec-01 password hashing > rejects invalid input "valid-length\u0000password" | PASS | 0.000 |
| BACKEND-210 | backend unit | backend/tests/unit/password.test.ts | UT-M4-01 / TC-Sec-01 password hashing > accepts exactly 72 bytes and never silently truncates multibyte passwords | PASS | 0.364 |
| BACKEND-211 | backend unit | backend/tests/unit/password.test.ts | UT-M4-01 / TC-Sec-01 password hashing > rejects unsafe cost 0 | PASS | 0.002 |
| BACKEND-212 | backend unit | backend/tests/unit/password.test.ts | UT-M4-01 / TC-Sec-01 password hashing > rejects unsafe cost 4 | PASS | 0.000 |
| BACKEND-213 | backend unit | backend/tests/unit/password.test.ts | UT-M4-01 / TC-Sec-01 password hashing > rejects unsafe cost 9 | PASS | 0.000 |
| BACKEND-214 | backend unit | backend/tests/unit/password.test.ts | UT-M4-01 / TC-Sec-01 password hashing > rejects unsafe cost 15 | PASS | 0.000 |
| BACKEND-215 | backend unit | backend/tests/unit/password.test.ts | UT-M4-01 / TC-Sec-01 password hashing > rejects unsafe cost 10.5 | PASS | 0.000 |
| BACKEND-216 | backend unit | backend/tests/unit/password.test.ts | UT-M4-01 / TC-Sec-01 password hashing > handles invalid stored hashes safely | PASS | 0.000 |
| BACKEND-217 | backend unit | backend/tests/unit/password.test.ts | UT-M4-01 / TC-Sec-01 password hashing > handles invalid stored hashes safely | PASS | 0.000 |
| BACKEND-218 | backend unit | backend/tests/unit/password.test.ts | UT-M4-01 / TC-Sec-01 password hashing > handles invalid stored hashes safely | PASS | 0.000 |
| BACKEND-219 | backend unit | backend/tests/unit/password.test.ts | UT-M4-01 / TC-Sec-01 password hashing > handles invalid stored hashes safely | PASS | 0.000 |
| BACKEND-220 | backend unit | backend/tests/unit/password.test.ts | UT-M4-01 / TC-Sec-01 password hashing > does not coerce non-string input | PASS | 0.000 |
| BACKEND-221 | backend unit | backend/tests/unit/question-filters.test.ts | Question filter logic (CSMQ-25 / UT-M2-04) > UT-M2-04: returns empty filter object when no parameters are passed | PASS | 0.004 |
| BACKEND-222 | backend unit | backend/tests/unit/question-filters.test.ts | Question filter logic (CSMQ-25 / UT-M2-04) > UT-M2-04: ignores empty, whitespace-only, or non-string parameters | PASS | 0.000 |
| BACKEND-223 | backend unit | backend/tests/unit/question-filters.test.ts | Question filter logic (CSMQ-25 / UT-M2-04) > UT-M2-04: builds filter by subject correctly | PASS | 0.001 |
| BACKEND-224 | backend unit | backend/tests/unit/question-filters.test.ts | Question filter logic (CSMQ-25 / UT-M2-04) > UT-M2-04: builds filter by topic correctly | PASS | 0.001 |
| BACKEND-225 | backend unit | backend/tests/unit/question-filters.test.ts | Question filter logic (CSMQ-25 / UT-M2-04) > matches partial text without treating user input as a regular expression | PASS | 0.001 |
| BACKEND-226 | backend unit | backend/tests/unit/question-filters.test.ts | Question filter logic (CSMQ-25 / UT-M2-04) > UT-M2-04: builds filter by difficulty correctly | PASS | 0.001 |
| BACKEND-227 | backend unit | backend/tests/unit/question-filters.test.ts | Question filter logic (CSMQ-25 / UT-M2-04) > UT-M2-04: ignores invalid difficulty values | PASS | 0.000 |
| BACKEND-228 | backend unit | backend/tests/unit/question-filters.test.ts | Question filter logic (CSMQ-25 / UT-M2-04) > UT-M2-04: builds combined filter with subject and topic | PASS | 0.000 |
| BACKEND-229 | backend unit | backend/tests/unit/question-filters.test.ts | Question filter logic (CSMQ-25 / UT-M2-04) > UT-M2-04: builds combined filter with subject, topic, and difficulty | PASS | 0.000 |
| BACKEND-230 | backend unit | backend/tests/unit/question-model.test.ts | Question model (CSMQ-22) > UT-M2-01: creates and persists a valid Question with MCQ fields, timestamps, and creator | PASS | 0.068 |
| BACKEND-231 | backend unit | backend/tests/unit/question-model.test.ts | Question model (CSMQ-22) > UT-M2-02: rejects missing question text | PASS | 0.009 |
| BACKEND-232 | backend unit | backend/tests/unit/question-model.test.ts | Question model (CSMQ-22) > UT-M2-02: rejects missing subject | PASS | 0.005 |
| BACKEND-233 | backend unit | backend/tests/unit/question-model.test.ts | Question model (CSMQ-22) > UT-M2-02: rejects missing topic | PASS | 0.005 |
| BACKEND-234 | backend unit | backend/tests/unit/question-model.test.ts | Question model (CSMQ-22) > UT-M2-02: rejects missing or invalid difficulty | PASS | 0.007 |
| BACKEND-235 | backend unit | backend/tests/unit/question-model.test.ts | Question model (CSMQ-22) > UT-M2-02: rejects fewer than two options | PASS | 0.006 |
| BACKEND-236 | backend unit | backend/tests/unit/question-model.test.ts | Question model (CSMQ-22) > UT-M2-02: rejects more than six options in the database model | PASS | 0.006 |
| BACKEND-237 | backend unit | backend/tests/unit/question-model.test.ts | Question model (CSMQ-22) > UT-M2-02: rejects fractional marks in the database model | PASS | 0.013 |
| BACKEND-238 | backend unit | backend/tests/unit/question-model.test.ts | Question model (CSMQ-22) > UT-M2-02: rejects option text longer than 500 characters in the database model | PASS | 0.006 |
| BACKEND-239 | backend unit | backend/tests/unit/question-model.test.ts | Question model (CSMQ-22) > UT-M2-02: rejects duplicate option IDs | PASS | 0.005 |
| BACKEND-240 | backend unit | backend/tests/unit/question-model.test.ts | Question model (CSMQ-22) > UT-M2-03: rejects when correctAnswer does not match any allowed option ID | PASS | 0.006 |
| BACKEND-241 | backend unit | backend/tests/unit/question-model.test.ts | Question model (CSMQ-22) > allows question creation without optional creator field | PASS | 0.008 |
| BACKEND-242 | backend unit | backend/tests/unit/question-model.test.ts | Question model (CSMQ-22) > reuses the model registered on the same connection | PASS | 0.003 |
| BACKEND-243 | backend unit | backend/tests/unit/question-validation.test.ts | Question validation (CSMQ-24 / UT-M2-01..03) > UT-M2-01: valid MCQ passes validation | PASS | 0.011 |
| BACKEND-244 | backend unit | backend/tests/unit/question-validation.test.ts | Question validation (CSMQ-24 / UT-M2-01..03) > UT-M2-02: missing questionText is rejected with clear message | PASS | 0.002 |
| BACKEND-245 | backend unit | backend/tests/unit/question-validation.test.ts | Question validation (CSMQ-24 / UT-M2-01..03) > UT-M2-02: missing subject is rejected with clear message | PASS | 0.001 |
| BACKEND-246 | backend unit | backend/tests/unit/question-validation.test.ts | Question validation (CSMQ-24 / UT-M2-01..03) > UT-M2-02: missing topic is rejected with clear message | PASS | 0.001 |
| BACKEND-247 | backend unit | backend/tests/unit/question-validation.test.ts | Question validation (CSMQ-24 / UT-M2-01..03) > UT-M2-02: invalid difficulty is rejected | PASS | 0.001 |
| BACKEND-248 | backend unit | backend/tests/unit/question-validation.test.ts | Question validation (CSMQ-24 / UT-M2-01..03) > UT-M2-02: fewer than 2 options is rejected | PASS | 0.001 |
| BACKEND-249 | backend unit | backend/tests/unit/question-validation.test.ts | Question validation (CSMQ-24 / UT-M2-01..03) > UT-M2-02: duplicate option IDs are rejected | PASS | 0.001 |
| BACKEND-250 | backend unit | backend/tests/unit/question-validation.test.ts | Question validation (CSMQ-24 / UT-M2-01..03) > UT-M2-03: correctAnswer not matching any option is rejected with clear message | PASS | 0.001 |
| BACKEND-251 | backend unit | backend/tests/unit/question-validation.test.ts | Question validation (CSMQ-24 / UT-M2-01..03) > rejects option with empty text | PASS | 0.001 |
| BACKEND-252 | backend unit | backend/tests/unit/quiz-attempt-model.test.ts | QuizAttempt model > creates a valid quiz attempt | PASS | 0.050 |
| BACKEND-253 | backend unit | backend/tests/unit/quiz-attempt-model.test.ts | QuizAttempt model > rejects missing required fields | PASS | 0.023 |
| BACKEND-254 | backend unit | backend/tests/unit/quiz-attempt-model.test.ts | QuizAttempt model > rejects percentage below 0 | PASS | 0.005 |
| BACKEND-255 | backend unit | backend/tests/unit/quiz-attempt-model.test.ts | QuizAttempt model > rejects percentage above 100 | PASS | 0.006 |
| BACKEND-256 | backend unit | backend/tests/unit/quiz-attempt-model.test.ts | QuizAttempt model > rejects fractional scores | PASS | 0.015 |
| BACKEND-257 | backend unit | backend/tests/unit/quiz-attempt-model.test.ts | QuizAttempt model > rejects infinite scores | PASS | 0.011 |
| BACKEND-258 | backend unit | backend/tests/unit/quiz-attempt-model.test.ts | QuizAttempt model > stores and reads an attempt from MongoDB | PASS | 0.024 |
| BACKEND-259 | backend unit | backend/tests/unit/quiz-attempt-model.test.ts | QuizAttempt model > reuses the model registered on the same connection | PASS | 0.004 |
| BACKEND-260 | backend unit | backend/tests/unit/quiz-filters.test.ts | Quiz Filter Unit Tests (CSMQ-50) > returns default active filter when empty params provided | PASS | 0.007 |
| BACKEND-261 | backend unit | backend/tests/unit/quiz-filters.test.ts | Quiz Filter Unit Tests (CSMQ-50) > filters by search keyword matching title case-insensitively | PASS | 0.001 |
| BACKEND-262 | backend unit | backend/tests/unit/quiz-filters.test.ts | Quiz Filter Unit Tests (CSMQ-50) > accepts keyword parameter as alias for search | PASS | 0.000 |
| BACKEND-263 | backend unit | backend/tests/unit/quiz-filters.test.ts | Quiz Filter Unit Tests (CSMQ-50) > filters by subject case-insensitively | PASS | 0.000 |
| BACKEND-264 | backend unit | backend/tests/unit/quiz-filters.test.ts | Quiz Filter Unit Tests (CSMQ-50) > combines keyword search and subject filter | PASS | 0.001 |
| BACKEND-265 | backend unit | backend/tests/unit/quiz-filters.test.ts | Quiz Filter Unit Tests (CSMQ-50) > escapes regex metacharacters properly to prevent injection / regex errors | PASS | 0.001 |
| BACKEND-266 | backend unit | backend/tests/unit/quiz-filters.test.ts | Quiz Filter Unit Tests (CSMQ-50) > ignores empty strings and whitespace-only parameters | PASS | 0.000 |
| BACKEND-267 | backend unit | backend/tests/unit/quiz-filters.test.ts | Quiz Filter Unit Tests (CSMQ-50) > ignores invalid types for search and subject | PASS | 0.000 |
| BACKEND-268 | backend unit | backend/tests/unit/quiz-model.test.ts | Quiz model & API (CSMQ-47) > UT-M2-QUIZ-01: creates and persists a valid Quiz document with title, subject, question references, creator, and timestamps | PASS | 0.050 |
| BACKEND-269 | backend unit | backend/tests/unit/quiz-model.test.ts | Quiz model & API (CSMQ-47) > UT-M2-QUIZ-02: rejects missing or empty title | PASS | 0.011 |
| BACKEND-270 | backend unit | backend/tests/unit/quiz-model.test.ts | Quiz model & API (CSMQ-47) > UT-M2-QUIZ-03: rejects title exceeding 150 characters | PASS | 0.005 |
| BACKEND-271 | backend unit | backend/tests/unit/quiz-model.test.ts | Quiz model & API (CSMQ-47) > UT-M2-QUIZ-04: rejects missing or empty subject | PASS | 0.008 |
| BACKEND-272 | backend unit | backend/tests/unit/quiz-model.test.ts | Quiz model & API (CSMQ-47) > UT-M2-QUIZ-05: rejects subject exceeding 100 characters | PASS | 0.005 |
| BACKEND-273 | backend unit | backend/tests/unit/quiz-model.test.ts | Quiz model & API (CSMQ-47) > UT-M2-QUIZ-06: rejects missing or empty questions array | PASS | 0.006 |
| BACKEND-274 | backend unit | backend/tests/unit/quiz-model.test.ts | Quiz model & API (CSMQ-47) > UT-M2-QUIZ-07: rejects duplicate question references in a quiz | PASS | 0.004 |
| BACKEND-275 | backend unit | backend/tests/unit/quiz-model.test.ts | Quiz model & API (CSMQ-47) > UT-M2-QUIZ-08: rejects missing creator | PASS | 0.009 |
| BACKEND-276 | backend unit | backend/tests/unit/quiz-model.test.ts | Quiz model & API (CSMQ-47) > UT-M2-QUIZ-09: rejects unknown fields in strict mode | PASS | 0.004 |
| BACKEND-277 | backend unit | backend/tests/unit/quiz-model.test.ts | Quiz model & API (CSMQ-47) > UT-M2-QUIZ-10: findQuizById retrieves existing quiz and returns null for non-existent or invalid ID | PASS | 0.017 |
| BACKEND-278 | backend unit | backend/tests/unit/quiz-model.test.ts | Quiz model & API (CSMQ-47) > UT-M2-QUIZ-11: deleteQuizById deletes existing quiz and returns null for non-existent or invalid ID | PASS | 0.010 |
| BACKEND-279 | backend unit | backend/tests/unit/quiz-model.test.ts | Quiz model & API (CSMQ-47) > UT-M2-QUIZ-12: softDeleteQuizById marks quiz with removedAt and administrator ID | PASS | 0.016 |
| BACKEND-280 | backend unit | backend/tests/unit/quiz-model.test.ts | Quiz model & API (CSMQ-47) > UT-M2-QUIZ-13: reuses the model registered on the same connection | PASS | 0.002 |
| BACKEND-281 | backend unit | backend/tests/unit/quiz-model.test.ts | Quiz model & API (CSMQ-47) > UT-M2-QUIZ-14: rejects falsy or missing question ID elements in questions array | PASS | 0.002 |
| BACKEND-282 | backend unit | backend/tests/unit/quiz-validation.test.ts | Quiz Validation Unit (CSMQ-48) > accepts valid quiz creation payload | PASS | 0.007 |
| BACKEND-283 | backend unit | backend/tests/unit/quiz-validation.test.ts | Quiz Validation Unit (CSMQ-48) > rejects missing or empty title | PASS | 0.001 |
| BACKEND-284 | backend unit | backend/tests/unit/quiz-validation.test.ts | Quiz Validation Unit (CSMQ-48) > rejects title longer than 150 characters | PASS | 0.000 |
| BACKEND-285 | backend unit | backend/tests/unit/quiz-validation.test.ts | Quiz Validation Unit (CSMQ-48) > rejects missing or empty subject | PASS | 0.000 |
| BACKEND-286 | backend unit | backend/tests/unit/quiz-validation.test.ts | Quiz Validation Unit (CSMQ-48) > rejects empty questions array | PASS | 0.001 |
| BACKEND-287 | backend unit | backend/tests/unit/quiz-validation.test.ts | Quiz Validation Unit (CSMQ-48) > rejects invalid question ID formatting | PASS | 0.000 |
| BACKEND-288 | backend unit | backend/tests/unit/quiz-validation.test.ts | Quiz Validation Unit (CSMQ-48) > rejects duplicate question IDs in selection | PASS | 0.001 |
| BACKEND-289 | backend unit | backend/tests/unit/quiz-validation.test.ts | Quiz Validation Unit (CSMQ-48) > rejects extra unrecognized fields (strict schema) | PASS | 0.000 |
| BACKEND-290 | backend unit | backend/tests/unit/release-guards.test.ts | refuses release smoke writes without explicit disposable-environment confirmation | PASS | 0.207 |
| BACKEND-291 | backend unit | backend/tests/unit/release-guards.test.ts | refuses non-loopback release smoke targets without transmitting or printing embedded credentials | PASS | 0.131 |
| BACKEND-292 | backend unit | backend/tests/unit/release-guards.test.ts | disables the old public-Student promotion shortcut before any database operation | PASS | 0.136 |
| BACKEND-293 | backend unit | backend/tests/unit/student-safe-serializer.test.ts | Student-safe question payload serializer (CSMQ-26 / UT-M2-05) > UT-M2-05: correctly strips correctAnswer from student-facing question object | PASS | 0.010 |
| BACKEND-294 | backend unit | backend/tests/unit/student-safe-serializer.test.ts | Student-safe question payload serializer (CSMQ-26 / UT-M2-05) > UT-M2-05: serializes an array of questions without exposing answers | PASS | 0.001 |
| BACKEND-295 | backend unit | backend/tests/unit/student-safe-serializer.test.ts | Student-safe question payload serializer (CSMQ-26 / UT-M2-05) > UT-M2-05 / IT-M2-05: creates quiz payload structure matching Member 3 attempt-api-contract | PASS | 0.002 |
| BACKEND-296 | backend unit | backend/tests/unit/student-safe-serializer.test.ts | Student-safe question payload serializer (CSMQ-26 / UT-M2-05) > handles question objects without options gracefully | PASS | 0.000 |
| BACKEND-297 | backend unit | backend/tests/unit/student-safe-serializer.test.ts | Student-safe question payload serializer (CSMQ-26 / UT-M2-05) > handles missing id, missing questionText, and default payload options | PASS | 0.000 |
| BACKEND-298 | backend unit | backend/tests/unit/submission-service.test.ts | CSMQ-40: Quiz submission service > evaluates and saves a valid quiz attempt | PASS | 0.007 |
| BACKEND-299 | backend unit | backend/tests/unit/submission-service.test.ts | CSMQ-40: Quiz submission service > handles partially answered quizzes | PASS | 0.001 |
| BACKEND-300 | backend unit | backend/tests/unit/submission-service.test.ts | CSMQ-40: Quiz submission service > rejects a quiz that does not exist | PASS | 0.003 |
| BACKEND-301 | backend unit | backend/tests/unit/submission-service.test.ts | CSMQ-40: Quiz submission service > rejects a removed quiz | PASS | 0.001 |
| BACKEND-302 | backend unit | backend/tests/unit/submission-service.test.ts | CSMQ-40: Quiz submission service > rejects an empty quiz | PASS | 0.001 |
| BACKEND-303 | backend unit | backend/tests/unit/submission-service.test.ts | CSMQ-40: Quiz submission service > rejects missing database questions | PASS | 0.001 |
| BACKEND-304 | backend unit | backend/tests/unit/submission-service.test.ts | CSMQ-40: Quiz submission service > rejects an invalid selected option | PASS | 0.001 |
| BACKEND-305 | backend unit | backend/tests/unit/submission-service.test.ts | CSMQ-40: Quiz submission service > rejects questions outside the quiz | PASS | 0.001 |
| BACKEND-306 | backend unit | backend/tests/unit/submission-service.test.ts | CSMQ-40: Quiz submission service > rejects duplicate quiz question references | PASS | 0.001 |
| BACKEND-307 | backend unit | backend/tests/unit/submission-service.test.ts | CSMQ-40: Quiz submission service > normalizes case-insensitive question IDs | PASS | 0.001 |
| BACKEND-308 | backend unit | backend/tests/unit/trusted-evaluation.test.ts | CSMQ-40: Trusted server-side evaluation > calculates scores using the server answer key | PASS | 0.008 |
| BACKEND-309 | backend unit | backend/tests/unit/trusted-evaluation.test.ts | CSMQ-40: Trusted server-side evaluation > rejects questions outside the quiz | PASS | 0.003 |
| BACKEND-310 | backend unit | backend/tests/unit/trusted-evaluation.test.ts | CSMQ-40: Trusted server-side evaluation > rejects options not belonging to the question | PASS | 0.001 |
| BACKEND-311 | backend unit | backend/tests/unit/trusted-evaluation.test.ts | CSMQ-40: Trusted server-side evaluation > rejects duplicate responses | PASS | 0.001 |
| BACKEND-312 | backend unit | backend/tests/unit/trusted-evaluation.test.ts | CSMQ-40: Trusted server-side evaluation > rejects empty quizzes | PASS | 0.001 |
| BACKEND-313 | backend unit | backend/tests/unit/trusted-evaluation.test.ts | CSMQ-40: Trusted server-side evaluation > rejects invalid trusted answer keys | PASS | 0.001 |
| BACKEND-314 | backend unit | backend/tests/unit/trusted-evaluation.test.ts | CSMQ-40: Trusted server-side evaluation > accepts MongoDB IDs regardless of letter case | PASS | 0.001 |
| BACKEND-315 | backend unit | backend/tests/unit/user-repository.test.ts | Production User model and Mongo account repository > User model > applies defaults and normalizes email | PASS | 0.040 |
| BACKEND-316 | backend unit | backend/tests/unit/user-repository.test.ts | Production User model and Mongo account repository > User model > rejects a user with missing required fields | PASS | 0.009 |
| BACKEND-317 | backend unit | backend/tests/unit/user-repository.test.ts | Production User model and Mongo account repository > User model > rejects invalid persisted user data: { name: '   ', …(1) } | PASS | 0.005 |
| BACKEND-318 | backend unit | backend/tests/unit/user-repository.test.ts | Production User model and Mongo account repository > User model > rejects invalid persisted user data: { name: '<script>', …(1) } | PASS | 0.004 |
| BACKEND-319 | backend unit | backend/tests/unit/user-repository.test.ts | Production User model and Mongo account repository > User model > rejects invalid persisted user data: { name: 'Test Student', …(1) } | PASS | 0.004 |
| BACKEND-320 | backend unit | backend/tests/unit/user-repository.test.ts | Production User model and Mongo account repository > User model > rejects plaintext password data | PASS | 0.004 |
| BACKEND-321 | backend unit | backend/tests/unit/user-repository.test.ts | Production User model and Mongo account repository > User model > enforces unique normalized email addresses in MongoDB | PASS | 0.013 |
| BACKEND-322 | backend unit | backend/tests/unit/user-repository.test.ts | Production User model and Mongo account repository > User model > rejects a role outside the allowed values | PASS | 0.005 |
| BACKEND-323 | backend unit | backend/tests/unit/user-repository.test.ts | Production User model and Mongo account repository > User model > hides passwordHash in ordinary queries | PASS | 0.025 |
| BACKEND-324 | backend unit | backend/tests/unit/user-repository.test.ts | Production User model and Mongo account repository > User model > reuses the model registered on the same connection | PASS | 0.003 |
| BACKEND-325 | backend unit | backend/tests/unit/user-repository.test.ts | Production User model and Mongo account repository > Mongo account repository > initializes the User model and indexes | PASS | 0.008 |
| BACKEND-326 | backend unit | backend/tests/unit/user-repository.test.ts | Production User model and Mongo account repository > Mongo account repository > finds an account by ID, including its password hash | PASS | 0.011 |
| BACKEND-327 | backend unit | backend/tests/unit/user-repository.test.ts | Production User model and Mongo account repository > Mongo account repository > returns null for an unknown ID | PASS | 0.006 |
| BACKEND-328 | backend unit | backend/tests/unit/user-repository.test.ts | Production User model and Mongo account repository > Mongo account repository > finds accounts using a trimmed, case-insensitive email | PASS | 0.010 |
| BACKEND-329 | backend unit | backend/tests/unit/user-repository.test.ts | Production User model and Mongo account repository > Mongo account repository > returns null for an unknown email | PASS | 0.006 |
| BACKEND-330 | backend unit | backend/tests/unit/user-repository.test.ts | Production User model and Mongo account repository > Mongo account repository > creates a student with a trimmed name and normalized email | PASS | 0.013 |
| FRONTEND-001 | frontend component/service/integration | frontend/src/App.test.tsx | Study Commons routes and forms > redirects anonymous quiz access to login | PASS | 0.382 |
| FRONTEND-002 | frontend component/service/integration | frontend/src/App.test.tsx | Study Commons routes and forms > redirects the retired prototype URL to real quiz discovery without starting an attempt | PASS | 0.242 |
| FRONTEND-003 | frontend component/service/integration | frontend/src/App.test.tsx | Study Commons routes and forms > keeps independent answers in the isolated Sprint 1 component | PASS | 1.088 |
| FRONTEND-004 | frontend component/service/integration | frontend/src/App.test.tsx | Study Commons routes and forms > shows landing navigation and opens registration | PASS | 0.243 |
| FRONTEND-005 | frontend component/service/integration | frontend/src/App.test.tsx | Study Commons routes and forms > switches theme and remembers the choice | PASS | 0.084 |
| FRONTEND-006 | frontend component/service/integration | frontend/src/App.test.tsx | Study Commons routes and forms > validates registration fields before calling the API | PASS | 0.433 |
| FRONTEND-007 | frontend component/service/integration | frontend/src/App.test.tsx | Study Commons routes and forms > shows a success message after successful registration | PASS | 3.234 |
| FRONTEND-008 | frontend component/service/integration | frontend/src/App.test.tsx | Study Commons routes and forms > shows a duplicate-email error during registration | PASS | 1.453 |
| FRONTEND-009 | frontend component/service/integration | frontend/src/App.test.tsx | Study Commons routes and forms > shows a useful error when registration cannot reach the server | PASS | 1.716 |
| FRONTEND-010 | frontend component/service/integration | frontend/src/App.test.tsx | Study Commons routes and forms > shows login validation and API errors | PASS | 3.259 |
| FRONTEND-011 | frontend component/service/integration | frontend/src/App.test.tsx | Study Commons routes and forms > does not accept invalid email or short password on login | PASS | 0.289 |
| FRONTEND-012 | frontend component/service/integration | frontend/src/App.test.tsx | Study Commons routes and forms > redirects logged-out visitors from materials to login | PASS | 0.124 |
| FRONTEND-013 | frontend component/service/integration | frontend/src/App.test.tsx | Study Commons routes and forms > redirects anonymous dashboard access to login | PASS | 0.121 |
| FRONTEND-014 | frontend component/service/integration | frontend/src/App.test.tsx | Study Commons routes and forms > shows student navigation destinations including quiz history and performance | PASS | 0.494 |
| FRONTEND-015 | frontend component/service/integration | frontend/src/App.test.tsx | Study Commons routes and forms > navigates to the student dashboard after successful login | PASS | 1.757 |
| FRONTEND-016 | frontend component/service/integration | frontend/src/App.test.tsx | Study Commons routes and forms > logs out and returns to login with logged-out navigation | PASS | 0.632 |
| FRONTEND-017 | frontend component/service/integration | frontend/src/pages/AdminDashboardPage.test.tsx | shows available moderation actions and identifies missing Quiz integration | PASS | 0.262 |
| FRONTEND-018 | frontend component/service/integration | frontend/src/pages/AdminDashboardPage.test.tsx | refuses a server-identified Student without querying administrator resources | PASS | 0.033 |
| FRONTEND-019 | frontend component/service/integration | frontend/src/pages/AdminDashboardPage.test.tsx | shows controlled loading/error states and retries a failed resource request | PASS | 0.142 |
| FRONTEND-020 | frontend component/service/integration | frontend/src/pages/AdminDashboardPage.test.tsx | offers Quiz moderation when a real owner adapter has been registered | PASS | 0.049 |
| FRONTEND-021 | frontend component/service/integration | frontend/src/pages/AdminPage.test.tsx | confirms that Delete all includes filtered-out items and cancellation sends no request | PASS | 1.858 |
| FRONTEND-022 | frontend component/service/integration | frontend/src/pages/AdminPage.test.tsx | opens the moderation category selected from the dashboard | PASS | 0.074 |
| FRONTEND-023 | frontend component/service/integration | frontend/src/pages/AdminPage.test.tsx | blocks student moderation before loading resources | PASS | 0.019 |
| FRONTEND-024 | frontend component/service/integration | frontend/src/pages/AdminPage.test.tsx | offers per-item deletion with a separate confirmation and cancellation | PASS | 0.612 |
| FRONTEND-025 | frontend component/service/integration | frontend/src/pages/AdminPage.test.tsx | retains the resource and confirmation when removal fails | PASS | 0.241 |
| FRONTEND-026 | frontend component/service/integration | frontend/src/pages/CreateQuizPage.test.tsx | CreateQuizPage (CSMQ-49) > prevents selecting stale questions while filters load and distinguishes errors from no matches | PASS | 0.385 |
| FRONTEND-027 | frontend component/service/integration | frontend/src/pages/CreateQuizPage.test.tsx | CreateQuizPage (CSMQ-49) > renders page header, title, subject, and question picker | PASS | 0.091 |
| FRONTEND-028 | frontend component/service/integration | frontend/src/pages/CreateQuizPage.test.tsx | CreateQuizPage (CSMQ-49) > shows error if question bank fetch fails | PASS | 0.041 |
| FRONTEND-029 | frontend component/service/integration | frontend/src/pages/CreateQuizPage.test.tsx | CreateQuizPage (CSMQ-49) > validates empty title on submission | PASS | 0.198 |
| FRONTEND-030 | frontend component/service/integration | frontend/src/pages/CreateQuizPage.test.tsx | CreateQuizPage (CSMQ-49) > validates empty subject on submission | PASS | 0.566 |
| FRONTEND-031 | frontend component/service/integration | frontend/src/pages/CreateQuizPage.test.tsx | CreateQuizPage (CSMQ-49) > validates zero questions selected on submission | PASS | 1.848 |
| FRONTEND-032 | frontend component/service/integration | frontend/src/pages/CreateQuizPage.test.tsx | CreateQuizPage (CSMQ-49) > toggles question selection and updates counter | PASS | 0.570 |
| FRONTEND-033 | frontend component/service/integration | frontend/src/pages/CreateQuizPage.test.tsx | CreateQuizPage (CSMQ-49) > supports select all and deselect all buttons | PASS | 0.627 |
| FRONTEND-034 | frontend component/service/integration | frontend/src/pages/CreateQuizPage.test.tsx | CreateQuizPage (CSMQ-49) > submits valid quiz and displays success message | PASS | 1.761 |
| FRONTEND-035 | frontend component/service/integration | frontend/src/pages/CreateQuizPage.test.tsx | CreateQuizPage (CSMQ-49) > displays API error message when creation fails | PASS | 2.173 |
| FRONTEND-036 | frontend component/service/integration | frontend/src/pages/MaterialsPage.test.tsx | shows the empty library state and opens a separate upload form | PASS | 1.014 |
| FRONTEND-037 | frontend component/service/integration | frontend/src/pages/MaterialsPage.test.tsx | submits PDF metadata through the shared authenticated service | PASS | 2.058 |
| FRONTEND-038 | frontend component/service/integration | frontend/src/pages/MaterialsPage.test.tsx | loads the 26th material and resets pagination when a new search is submitted | PASS | 3.297 |
| FRONTEND-039 | frontend component/service/integration | frontend/src/pages/MaterialsPage.test.tsx | retries a failed next page with the same search and cursor, keeping existing results | PASS | 0.477 |
| FRONTEND-040 | frontend component/service/integration | frontend/src/pages/MaterialsPage.test.tsx | preserves the submitted search after upload and resets the native PDF picker | PASS | 0.999 |
| FRONTEND-041 | frontend component/service/integration | frontend/src/pages/MaterialsPage.test.tsx | ignores an older initial response after an upload refresh and finishes loading | PASS | 0.281 |
| FRONTEND-042 | frontend component/service/integration | frontend/src/pages/MaterialsPage.test.tsx | does not append an older page after a different search completes | PASS | 0.291 |
| FRONTEND-043 | frontend component/service/integration | frontend/src/pages/MaterialsPage.test.tsx | retries a failed first-page search with the same query | PASS | 0.216 |
| FRONTEND-044 | frontend component/service/integration | frontend/src/pages/MaterialsPage.test.tsx | combines keyword and subject filters and explains unmatched results | PASS | 0.683 |
| FRONTEND-045 | frontend component/service/integration | frontend/src/pages/MaterialsPage.test.tsx | searches existing subjects in the filter menu and applies a selected subject | PASS | 0.698 |
| FRONTEND-046 | frontend component/service/integration | frontend/src/pages/MaterialsPage.test.tsx | loads and displays metadata for a selected material | PASS | 0.149 |
| FRONTEND-047 | frontend component/service/integration | frontend/src/pages/MaterialsPage.test.tsx | opens the recent material PDF directly from the dashboard link | PASS | 0.073 |
| FRONTEND-048 | frontend component/service/integration | frontend/src/pages/MaterialsPage.test.tsx | shows an unavailable message when selected material details cannot be loaded | PASS | 0.130 |
| FRONTEND-049 | frontend component/service/integration | frontend/src/pages/MaterialsPage.test.tsx | opens the selected PDF inline and releases its object URL when closed | PASS | 0.416 |
| FRONTEND-050 | frontend component/service/integration | frontend/src/pages/MaterialsPage.test.tsx | downloads the selected PDF with a title based PDF filename | PASS | 0.131 |
| FRONTEND-051 | frontend component/service/integration | frontend/src/pages/QuestionBankPage.test.tsx | QuestionBankPage (CSMQ-23 / CSMQ-24) > renders Question Bank header and empty state initially | PASS | 0.354 |
| FRONTEND-052 | frontend component/service/integration | frontend/src/pages/QuestionBankPage.test.tsx | QuestionBankPage (CSMQ-23 / CSMQ-24) > opens Add MCQ form when clicking + Add New MCQ | PASS | 0.525 |
| FRONTEND-053 | frontend component/service/integration | frontend/src/pages/QuestionBankPage.test.tsx | QuestionBankPage (CSMQ-23 / CSMQ-24) > submits valid MCQ form and displays success message | PASS | 6.409 |
| FRONTEND-054 | frontend component/service/integration | frontend/src/pages/QuestionBankPage.test.tsx | QuestionBankPage (CSMQ-23 / CSMQ-24) > renders questions list when questions exist | PASS | 0.073 |
| FRONTEND-055 | frontend component/service/integration | frontend/src/pages/QuestionBankPage.test.tsx | QuestionBankPage (CSMQ-23 / CSMQ-24) > triggers listQuestions with subject filter | PASS | 0.293 |
| FRONTEND-056 | frontend component/service/integration | frontend/src/pages/QuestionBankPage.test.tsx | QuestionBankPage (CSMQ-23 / CSMQ-24) > triggers listQuestions with difficulty filter | PASS | 0.174 |
| FRONTEND-057 | frontend component/service/integration | frontend/src/pages/QuestionBankPage.test.tsx | QuestionBankPage (CSMQ-23 / CSMQ-24) > clears listing error banner when subsequent filter request succeeds | PASS | 0.233 |
| FRONTEND-058 | frontend component/service/integration | frontend/src/pages/QuestionBankPage.test.tsx | QuestionBankPage (CSMQ-23 / CSMQ-24) > ensures only results for current filters update the list when filter changes during save | PASS | 3.184 |
| FRONTEND-059 | frontend component/service/integration | frontend/src/pages/QuestionBankPage.test.tsx | QuestionBankPage (CSMQ-23 / CSMQ-24) > clears loading state and displays results when an MCQ is saved while initial list is still loading | PASS | 2.072 |
| FRONTEND-060 | frontend component/service/integration | frontend/src/pages/QuizAttemptLoader.test.tsx | CSMQ-41: Real quiz attempt loader > accepts the canonical lowercase ID returned for an uppercase MongoDB URL | PASS | 0.077 |
| FRONTEND-061 | frontend component/service/integration | frontend/src/pages/QuizAttemptLoader.test.tsx | CSMQ-41: Real quiz attempt loader > loads and renders real quiz questions | PASS | 0.143 |
| FRONTEND-062 | frontend component/service/integration | frontend/src/pages/QuizAttemptLoader.test.tsx | CSMQ-41: Real quiz attempt loader > shows errors when quiz loading fails | PASS | 0.033 |
| FRONTEND-063 | frontend component/service/integration | frontend/src/pages/QuizAttemptLoader.test.tsx | CSMQ-41: Real quiz attempt loader > retries after a failed request | PASS | 0.072 |
| FRONTEND-064 | frontend component/service/integration | frontend/src/pages/QuizAttemptLoader.test.tsx | CSMQ-41: Real quiz attempt loader > loads new questions when quiz ID changes | PASS | 0.013 |
| FRONTEND-065 | frontend component/service/integration | frontend/src/pages/QuizAttemptPage.csmq45-acceptance.test.tsx | CSMQ-45 / real frontend submission service to result callback > POSTs authenticated answers to the server and uses its result | PASS | 0.345 |
| FRONTEND-066 | frontend component/service/integration | frontend/src/pages/QuizAttemptPage.csmq45-acceptance.test.tsx | CSMQ-45 / real frontend submission service to result callback > does not advance to a result when the server rejects a submission | PASS | 0.157 |
| FRONTEND-067 | frontend component/service/integration | frontend/src/pages/QuizAttemptPage.result-navigation.test.tsx | CSMQ-42: result navigation triggered only by saved attempts > calls the success handler with the server result | PASS | 0.369 |
| FRONTEND-068 | frontend component/service/integration | frontend/src/pages/QuizAttemptPage.result-navigation.test.tsx | CSMQ-42: result navigation triggered only by saved attempts > does not navigate after a failed submission | PASS | 0.160 |
| FRONTEND-069 | frontend component/service/integration | frontend/src/pages/QuizAttemptPage.session-expiry.test.tsx | keeps the quiz and original user draft available when submission expires the session | PASS | 0.521 |
| FRONTEND-070 | frontend component/service/integration | frontend/src/pages/QuizAttemptPage.session-expiry.test.tsx | does not submit or reassign a draft after a different account logs in | PASS | 0.143 |
| FRONTEND-071 | frontend component/service/integration | frontend/src/pages/QuizAttemptPage.submit.test.tsx | CSMQ-41: Quiz Attempt frontend integration > describes SRS scoring as one point per correct response regardless of marks metadata | PASS | 0.190 |
| FRONTEND-072 | frontend component/service/integration | frontend/src/pages/QuizAttemptPage.submit.test.tsx | CSMQ-41: Quiz Attempt frontend integration > does not invent a time limit or expire an unsubmitted real quiz | PASS | 1.799 |
| FRONTEND-073 | frontend component/service/integration | frontend/src/pages/QuizAttemptPage.submit.test.tsx | CSMQ-41: Quiz Attempt frontend integration > sends selected answers to the real API | PASS | 0.916 |
| FRONTEND-074 | frontend component/service/integration | frontend/src/pages/QuizAttemptPage.submit.test.tsx | CSMQ-41: Quiz Attempt frontend integration > preserves answers when submission fails | PASS | 0.442 |
| FRONTEND-075 | frontend component/service/integration | frontend/src/pages/QuizAttemptPage.submit.test.tsx | CSMQ-41: Quiz Attempt frontend integration > prevents duplicate clicks while submitting | PASS | 0.244 |
| FRONTEND-076 | frontend component/service/integration | frontend/src/pages/QuizAttemptPage.submit.test.tsx | CSMQ-41: Quiz Attempt frontend integration > keeps the sample quiz in local demo mode | PASS | 0.293 |
| FRONTEND-077 | frontend component/service/integration | frontend/src/pages/QuizHistoryPage.insights-navigation.test.tsx | performance insights navigation > provides a link from history to performance insights | PASS | 0.567 |
| FRONTEND-078 | frontend component/service/integration | frontend/src/pages/QuizHistoryPage.test.tsx | CSMQ-43: Quiz History page > renders saved quiz attempts | PASS | 0.237 |
| FRONTEND-079 | frontend component/service/integration | frontend/src/pages/QuizHistoryPage.test.tsx | CSMQ-43: Quiz History page > shows an empty state | PASS | 0.081 |
| FRONTEND-080 | frontend component/service/integration | frontend/src/pages/QuizHistoryPage.test.tsx | CSMQ-43: Quiz History page > supports retrying failed requests | PASS | 0.069 |
| FRONTEND-081 | frontend component/service/integration | frontend/src/pages/QuizHistoryPage.test.tsx | CSMQ-43: Quiz History page > loads the next history page | PASS | 0.063 |
| FRONTEND-082 | frontend component/service/integration | frontend/src/pages/QuizInsightsPage.test.tsx | QuizInsightsPage > loads the complete history and shows saved metrics | PASS | 0.301 |
| FRONTEND-083 | frontend component/service/integration | frontend/src/pages/QuizInsightsPage.test.tsx | QuizInsightsPage > does not pretend a limited sample represents the full history | PASS | 0.020 |
| FRONTEND-084 | frontend component/service/integration | frontend/src/pages/QuizInsightsPage.test.tsx | QuizInsightsPage > handles an empty history | PASS | 0.015 |
| FRONTEND-085 | frontend component/service/integration | frontend/src/pages/QuizInsightsPage.test.tsx | QuizInsightsPage > retries a failed history request | PASS | 0.082 |
| FRONTEND-086 | frontend component/service/integration | frontend/src/pages/QuizListPage.test.tsx | QuizListPage (CSMQ-51) > hides previous results while a new filter loads and does not call a failed search empty | PASS | 0.182 |
| FRONTEND-087 | frontend component/service/integration | frontend/src/pages/QuizListPage.test.tsx | QuizListPage (CSMQ-51) > renders header, search inputs, and loads available quizzes | PASS | 0.041 |
| FRONTEND-088 | frontend component/service/integration | frontend/src/pages/QuizListPage.test.tsx | QuizListPage (CSMQ-51) > displays empty state when no quizzes exist | PASS | 0.030 |
| FRONTEND-089 | frontend component/service/integration | frontend/src/pages/QuizListPage.test.tsx | QuizListPage (CSMQ-51) > filters quizzes by search keyword and subject inputs | PASS | 0.361 |
| FRONTEND-090 | frontend component/service/integration | frontend/src/pages/QuizListPage.test.tsx | QuizListPage (CSMQ-51) > clears filters when Clear Filters button is clicked | PASS | 0.172 |
| FRONTEND-091 | frontend component/service/integration | frontend/src/pages/QuizListPage.test.tsx | QuizListPage (CSMQ-51) > shows error banner and retries successfully | PASS | 0.084 |
| FRONTEND-092 | frontend component/service/integration | frontend/src/pages/QuizListPage.test.tsx | QuizListPage (CSMQ-51) > links to quiz view details page | PASS | 0.048 |
| FRONTEND-093 | frontend component/service/integration | frontend/src/pages/QuizResultPage.test.tsx | CSMQ-42: Quiz Result screen > shows submitted-SAD answer feedback only in a matching successful result | PASS | 0.292 |
| FRONTEND-094 | frontend component/service/integration | frontend/src/pages/QuizResultPage.test.tsx | CSMQ-42: Quiz Result screen > renders trusted submission metrics and navigation | PASS | 0.121 |
| FRONTEND-095 | frontend component/service/integration | frontend/src/pages/QuizResultPage.test.tsx | CSMQ-42: Quiz Result screen > never exposes question answer keys | PASS | 0.020 |
| FRONTEND-096 | frontend component/service/integration | frontend/src/pages/QuizResultPage.test.tsx | CSMQ-42: Quiz Result screen > shows a safe empty state when navigated to directly | PASS | 0.035 |
| FRONTEND-097 | frontend component/service/integration | frontend/src/pages/QuizResultPage.test.tsx | CSMQ-42: Quiz Result screen > rejects a result that does not match the URL | PASS | 0.024 |
| FRONTEND-098 | frontend component/service/integration | frontend/src/pages/QuizResultPage.test.tsx | CSMQ-42: Quiz Result screen > does not display malformed or inflated scores | PASS | 0.022 |
| FRONTEND-099 | frontend component/service/integration | frontend/src/pages/QuizViewPage.navigation.test.tsx | CSMQ-41: Quiz start navigation > opens the real quiz attempt route | PASS | 0.851 |
| FRONTEND-100 | frontend component/service/integration | frontend/src/pages/QuizViewPage.navigation.test.tsx | CSMQ-41: Quiz start navigation > does not allow starting an empty quiz | PASS | 0.072 |
| FRONTEND-101 | frontend component/service/integration | frontend/src/pages/QuizViewPage.test.tsx | QuizViewPage (CSMQ-51) > renders quiz header, subject badge, question count, and questions list | PASS | 0.306 |
| FRONTEND-102 | frontend component/service/integration | frontend/src/pages/QuizViewPage.test.tsx | QuizViewPage (CSMQ-51) > CRITICAL SECURITY: never displays or contains correctAnswer or answer keys | PASS | 0.054 |
| FRONTEND-103 | frontend component/service/integration | frontend/src/pages/QuizViewPage.test.tsx | QuizViewPage (CSMQ-51) > renders error state and back link when quiz is not found | PASS | 0.081 |
| FRONTEND-104 | frontend component/service/integration | frontend/src/pages/StudentDashboardPage.test.tsx | shows recently opened active materials and links back to their details | PASS | 0.366 |
| FRONTEND-105 | frontend component/service/integration | frontend/src/pages/StudentDashboardPage.test.tsx | keeps each student recent list separate and shows a first-open empty state | PASS | 0.050 |
| FRONTEND-106 | frontend component/service/integration | frontend/src/services/attemptHistoryCsv.test.ts | createAttemptHistoryCsv > includes column headers and the actual saved scores | PASS | 0.007 |
| FRONTEND-107 | frontend component/service/integration | frontend/src/services/attemptHistoryCsv.test.ts | createAttemptHistoryCsv > escapes comma and double quotes | PASS | 0.001 |
| FRONTEND-108 | frontend component/service/integration | frontend/src/services/attemptHistoryCsv.test.ts | createAttemptHistoryCsv > prevents spreadsheet formulas from executing on import | PASS | 0.001 |
| FRONTEND-109 | frontend component/service/integration | frontend/src/services/attemptHistoryCsv.test.ts | createAttemptHistoryCsv > includes headers even with no attempts | PASS | 0.002 |
| FRONTEND-110 | frontend component/service/integration | frontend/src/services/attemptHistoryService.csmq45-boundaries.test.ts | CSMQ-45 / history API frontend authorization boundaries > fetches only the current session history, never requesting a user ID | PASS | 0.012 |
| FRONTEND-111 | frontend component/service/integration | frontend/src/services/attemptHistoryService.csmq45-boundaries.test.ts | CSMQ-45 / history API frontend authorization boundaries > rejects expired sessions and forbidden history access | PASS | 0.005 |
| FRONTEND-112 | frontend component/service/integration | frontend/src/services/attemptHistoryService.csmq45-boundaries.test.ts | CSMQ-45 / history API frontend authorization boundaries > rejects malformed history payloads rather than displaying untrusted data | PASS | 0.002 |
| FRONTEND-113 | frontend component/service/integration | frontend/src/services/attemptHistoryService.test.ts | CSMQ-43: Attempt history service > fetches authenticated student history | PASS | 0.011 |
| FRONTEND-114 | frontend component/service/integration | frontend/src/services/attemptHistoryService.test.ts | CSMQ-43: Attempt history service > requires authentication | PASS | 0.004 |
| FRONTEND-115 | frontend component/service/integration | frontend/src/services/attemptHistoryService.test.ts | CSMQ-43: Attempt history service > handles expired sessions | PASS | 0.001 |
| FRONTEND-116 | frontend component/service/integration | frontend/src/services/attemptHistoryService.test.ts | CSMQ-43: Attempt history service > rejects malformed history responses | PASS | 0.001 |
| FRONTEND-117 | frontend component/service/integration | frontend/src/services/attemptHistoryService.test.ts | CSMQ-43: Attempt history service > rejects invalid pagination | PASS | 0.001 |
| FRONTEND-118 | frontend component/service/integration | frontend/src/services/attemptInsights.csmq45-acceptance.test.ts | CSMQ-45 / performance acceptance and export safety > groups only provided student attempts by subject with correct averages | PASS | 0.008 |
| FRONTEND-119 | frontend component/service/integration | frontend/src/services/attemptInsights.csmq45-acceptance.test.ts | CSMQ-45 / performance acceptance and export safety > does not mix attempts from different accounts when analyzing their separate API responses | PASS | 0.001 |
| FRONTEND-120 | frontend component/service/integration | frontend/src/services/attemptInsights.csmq45-acceptance.test.ts | CSMQ-45 / performance acceptance and export safety > handles empty performance and unknown subjects without fabricated scores | PASS | 0.002 |
| FRONTEND-121 | frontend component/service/integration | frontend/src/services/attemptInsights.csmq45-acceptance.test.ts | CSMQ-45 / performance acceptance and export safety > protects exported CSV fields against spreadsheet formula execution | PASS | 0.001 |
| FRONTEND-122 | frontend component/service/integration | frontend/src/services/attemptInsights.test.ts | calculateAttemptInsights > returns a useful empty state | PASS | 0.007 |
| FRONTEND-123 | frontend component/service/integration | frontend/src/services/attemptInsights.test.ts | calculateAttemptInsights > computes average, best, latest and subject summaries | PASS | 0.002 |
| FRONTEND-124 | frontend component/service/integration | frontend/src/services/attemptInsights.test.ts | calculateAttemptInsights > shows the trend in chronological order | PASS | 0.001 |
| FRONTEND-125 | frontend component/service/integration | frontend/src/services/attemptInsights.test.ts | calculateAttemptInsights > limits the displayed chart to 12 most recent dated attempts | PASS | 0.003 |
| FRONTEND-126 | frontend component/service/integration | frontend/src/services/attemptInsights.test.ts | calculateAttemptInsights > groups missing subject under General | PASS | 0.001 |
| FRONTEND-127 | frontend component/service/integration | frontend/src/services/attemptService.test.ts | CSMQ-41: Quiz Attempt API Service > submits responses with authentication | PASS | 0.009 |
| FRONTEND-128 | frontend component/service/integration | frontend/src/services/attemptService.test.ts | CSMQ-41: Quiz Attempt API Service > rejects submission without login | PASS | 0.004 |
| FRONTEND-129 | frontend component/service/integration | frontend/src/services/attemptService.test.ts | CSMQ-41: Quiz Attempt API Service > handles expired sessions | PASS | 0.001 |
| FRONTEND-130 | frontend component/service/integration | frontend/src/services/attemptService.test.ts | CSMQ-41: Quiz Attempt API Service > displays backend validation errors | PASS | 0.001 |
| FRONTEND-131 | frontend component/service/integration | frontend/src/services/attemptService.test.ts | CSMQ-41: Quiz Attempt API Service > handles network failures | PASS | 0.001 |
| FRONTEND-132 | frontend component/service/integration | frontend/src/services/attemptService.test.ts | CSMQ-41: Quiz Attempt API Service > rejects incomplete results | PASS | 0.001 |
| FRONTEND-133 | frontend component/service/integration | frontend/src/services/attemptService.test.ts | CSMQ-41: Quiz Attempt API Service > rejects invalid numeric results | PASS | 0.001 |
| FRONTEND-134 | frontend component/service/integration | frontend/src/services/attemptService.test.ts | CSMQ-41: Quiz Attempt API Service > handles server errors | PASS | 0.001 |
| FRONTEND-135 | frontend component/service/integration | frontend/src/services/authService.test.ts | registers without creating a client session | PASS | 0.026 |
| FRONTEND-136 | frontend component/service/integration | frontend/src/services/authService.test.ts | sends the session in a header and multipart data without setting a false content type | PASS | 0.017 |
| FRONTEND-137 | frontend component/service/integration | frontend/src/services/authService.test.ts | invalidates locally after server logout and refuses further upload | PASS | 0.011 |
| FRONTEND-138 | frontend component/service/integration | frontend/src/services/authService.test.ts | clears expired authentication on protected-route rejection | PASS | 0.003 |
| FRONTEND-139 | frontend component/service/integration | frontend/src/services/authService.test.ts | keeps the session when the logout request fails so revocation can be retried | PASS | 0.003 |
| FRONTEND-140 | frontend component/service/integration | frontend/src/services/authService.test.ts | preserves a newer login when an older upload request finishes | PASS | 0.005 |
| FRONTEND-141 | frontend component/service/integration | frontend/src/services/authService.test.ts | preserves a newer login when an older list request finishes | PASS | 0.004 |
| FRONTEND-142 | frontend component/service/integration | frontend/src/services/authService.test.ts | preserves a newer login when an older logout request finishes | PASS | 0.004 |
| FRONTEND-143 | frontend component/service/integration | frontend/src/services/authService.test.ts | rejects an incomplete login response and shows controlled login errors | PASS | 0.006 |
| FRONTEND-144 | frontend component/service/integration | frontend/src/services/authService.test.ts | restores only a token after refresh and obtains the current role from the server | PASS | 0.008 |
| FRONTEND-145 | frontend component/service/integration | frontend/src/services/authService.test.ts | fails closed on rejected restoration and clears stored credentials (401) | PASS | 0.003 |
| FRONTEND-146 | frontend component/service/integration | frontend/src/services/authService.test.ts | fails closed on rejected restoration and clears stored credentials (503) | PASS | 0.002 |
| FRONTEND-147 | frontend component/service/integration | frontend/src/services/authService.test.ts | fails closed on offline restoration | PASS | 0.004 |
| FRONTEND-148 | frontend component/service/integration | frontend/src/services/authService.test.ts | deduplicates restoration and does not resurrect a session after logout during restoration | PASS | 0.003 |
| FRONTEND-149 | frontend component/service/integration | frontend/src/services/authService.test.ts | retains in-memory login if browser session storage is unavailable | PASS | 0.005 |
| FRONTEND-150 | frontend component/service/integration | frontend/src/services/authService.test.ts | preserves pagination metadata and sends the search, cursor and abort signal | PASS | 0.005 |
| FRONTEND-151 | frontend component/service/integration | frontend/src/services/authService.test.ts | rejects malformed pagination responses instead of silently losing the cursor | PASS | 0.005 |
| FRONTEND-152 | frontend component/service/integration | frontend/src/services/authService.test.ts | loads validated available material subjects using the authenticated endpoint | PASS | 0.005 |
| FRONTEND-153 | frontend component/service/integration | frontend/src/services/authService.test.ts | requests inline and attachment PDFs through the authenticated material endpoint | PASS | 0.005 |
| FRONTEND-154 | frontend component/service/integration | frontend/src/services/final-integration.test.ts | includes the 51st attempt in subject averages rather than truncating performance to the newest page | PASS | 0.024 |
| FRONTEND-155 | frontend component/service/integration | frontend/src/services/final-integration.test.ts | rejects an incomplete or shifting history instead of presenting an incorrect subject average | PASS | 0.005 |
| FRONTEND-156 | frontend component/service/integration | frontend/src/services/final-integration.test.ts | clears expired shared authentication for history | PASS | 0.003 |
| FRONTEND-157 | frontend component/service/integration | frontend/src/services/final-integration.test.ts | clears expired shared authentication for submission | PASS | 0.002 |
| FRONTEND-158 | frontend component/service/integration | frontend/src/services/quiz-security.test.ts | clears the expired session consistently when Quiz discovery returns 401 | PASS | 0.018 |
| FRONTEND-159 | frontend component/service/integration | frontend/src/services/quiz-security.test.ts | does not clear a newer login when an older Quiz request is rejected | PASS | 0.003 |
| FRONTEND-160 | frontend component/service/integration | frontend/src/services/quizAttemptDataService.test.ts | CSMQ-41: Real quiz loading service > loads student-safe quiz questions | PASS | 0.019 |
| FRONTEND-161 | frontend component/service/integration | frontend/src/services/quizAttemptDataService.test.ts | CSMQ-41: Real quiz loading service > rejects an invalid quiz ID | PASS | 0.007 |
| FRONTEND-162 | frontend component/service/integration | frontend/src/services/quizAttemptDataService.test.ts | CSMQ-41: Real quiz loading service > requires authentication | PASS | 0.001 |
| FRONTEND-163 | frontend component/service/integration | frontend/src/services/quizAttemptDataService.test.ts | CSMQ-41: Real quiz loading service > handles unavailable quizzes | PASS | 0.001 |
| FRONTEND-164 | frontend component/service/integration | frontend/src/services/quizAttemptDataService.test.ts | CSMQ-41: Real quiz loading service > handles network failures | PASS | 0.002 |
| FRONTEND-165 | frontend component/service/integration | frontend/src/services/quizAttemptDataService.test.ts | CSMQ-41: Real quiz loading service > rejects empty quizzes | PASS | 0.001 |
| FRONTEND-166 | frontend component/service/integration | frontend/src/services/quizAttemptDataService.test.ts | CSMQ-41: Real quiz loading service > rejects malformed question data | PASS | 0.001 |
| FRONTEND-167 | frontend component/service/integration | frontend/src/services/quizAttemptDataService.test.ts | CSMQ-41: Real quiz loading service > rejects mismatched quiz IDs | PASS | 0.002 |
| FRONTEND-168 | frontend component/service/integration | frontend/src/services/quizAttemptDataService.test.ts | CSMQ-41: Real quiz loading service > does not expose correct answers | PASS | 0.002 |
| FRONTEND-169 | frontend component/service/integration | frontend/src/services/quizAttemptDataService.test.ts | CSMQ-41: Real quiz loading service > rejects duplicate question IDs | PASS | 0.001 |
| FRONTEND-170 | frontend component/service/integration | frontend/src/services/quizDraft.test.ts | ignores malformed draft null | PASS | 0.005 |
| FRONTEND-171 | frontend component/service/integration | frontend/src/services/quizDraft.test.ts | ignores malformed draft [] | PASS | 0.000 |
| FRONTEND-172 | frontend component/service/integration | frontend/src/services/quizDraft.test.ts | ignores malformed draft 42 | PASS | 0.000 |
| FRONTEND-173 | frontend component/service/integration | frontend/src/services/quizDraft.test.ts | ignores malformed draft "text" | PASS | 0.000 |
| FRONTEND-174 | frontend component/service/integration | frontend/src/services/quizDraft.test.ts | ignores malformed draft {broken | PASS | 0.000 |
| FRONTEND-175 | frontend component/service/integration | frontend/src/services/quizDraft.test.ts | retains only valid options for known questions | PASS | 0.001 |
| FRONTEND-176 | frontend component/service/integration | frontend/src/services/quizDraft.test.ts | survives disabled browser storage | PASS | 0.000 |
| FRONTEND-177 | frontend component/service/integration | frontend/src/services/recentMaterials.test.ts | ignores corrupted/out-of-range recent dates rather than crashing the dashboard | PASS | 0.008 |
| FRONTEND-178 | frontend component/service/integration | frontend/src/services/recentMaterials.test.ts | keeps recent materials scoped to the current user and deduplicates repeated opens | PASS | 0.001 |
| FRONTEND-179 | frontend component/service/integration | frontend/tests/admin-routing.test.tsx | redirects unauthenticated dashboard access to common login | PASS | 0.497 |
| FRONTEND-180 | frontend component/service/integration | frontend/tests/admin-routing.test.tsx | keeps Students away from /admin and opens the student dashboard | PASS | 0.409 |
| FRONTEND-181 | frontend component/service/integration | frontend/tests/admin-routing.test.tsx | keeps Students away from /admin/moderation and opens the student dashboard | PASS | 0.308 |
| FRONTEND-182 | frontend component/service/integration | frontend/tests/admin-routing.test.tsx | routes successful Admin login to the dashboard with Question Bank and moderation links | PASS | 1.678 |
| FRONTEND-183 | frontend component/service/integration | frontend/tests/admin-session.integration.test.tsx | waits for server validation before restoring Admin navigation and Question Bank after refresh | PASS | 0.571 |
| FRONTEND-184 | frontend component/service/integration | frontend/tests/admin-session.integration.test.tsx | ignores a forged browser role and redirects a server-identified Student to their dashboard | PASS | 0.307 |
| FRONTEND-185 | frontend component/service/integration | frontend/tests/admin-session.integration.test.tsx | redirects an expired stored session to the common login page after refresh | PASS | 0.169 |
| FRONTEND-186 | frontend component/service/integration | frontend/tests/auth.integration.test.ts | connects the actual frontend client to registration, login, PDF storage and revoking logout | PASS | 2.343 |
| FRONTEND-187 | frontend component/service/integration | frontend/tests/auth.integration.test.ts | rejects an anonymous real multipart upload before storing bytes | PASS | 0.012 |
| FRONTEND-188 | frontend component/service/integration | frontend/tests/auth.integration.test.ts | retrieves all 26 matching materials through the real paginated client and backend | PASS | 0.335 |
| FRONTEND-189 | frontend component/service/integration | frontend/tests/quiz-prototype.integration.test.tsx | IT-M3-02/03: renders Member 2 payload and evaluates mixed correct, incorrect and unanswered… from the actual UI | PASS | 0.553 |
| FRONTEND-190 | frontend component/service/integration | frontend/tests/quiz-prototype.integration.test.tsx | IT-M3-02/03: renders Member 2 payload and evaluates all correct selections from the actual UI | PASS | 0.613 |
| BROWSER-001 | browser system | frontend/e2e/moderation.spec.ts | [chrome] bulk material moderation confirms hidden scope, supports cancellation and retains PDF audit data | PASS | 6.605 |
| BROWSER-002 | browser system | frontend/e2e/moderation.spec.ts | [chrome] complete Student attempt, result, history and subject performance survive Quiz moderation | FAIL | 14.150 |
| BROWSER-003 | browser system | frontend/e2e/moderation.spec.ts | [chrome] real Quiz creation, discovery, trusted API scoring and confirmed Quiz moderation integrate | PASS | 8.351 |
| BROWSER-004 | browser system | frontend/e2e/moderation.spec.ts | [chrome] student uploads, administrator confirms removal and removed content cannot be downloaded | PASS | 8.451 |
| BROWSER-005 | browser system | frontend/e2e/moderation.spec.ts | [chrome] student loads the 26th search match and keeps the search after another upload | PASS | 5.492 |
| BROWSER-006 | browser system | frontend/e2e/moderation.spec.ts | [chrome] Admin dashboard integrates real Question Bank moderation, responsive navigation and Student denial | PASS | 9.131 |
| BROWSER-007 | browser system | frontend/e2e/moderation.spec.ts | [chrome] ten isolated browser sessions concurrently upload, create quizzes, submit and read their own history | PASS | 63.044 |
| BROWSER-008 | browser system | frontend/e2e/moderation.spec.ts | [edge] bulk material moderation confirms hidden scope, supports cancellation and retains PDF audit data | PASS | 7.127 |
| BROWSER-009 | browser system | frontend/e2e/moderation.spec.ts | [edge] complete Student attempt, result, history and subject performance survive Quiz moderation | PASS | 21.751 |
| BROWSER-010 | browser system | frontend/e2e/moderation.spec.ts | [edge] real Quiz creation, discovery, trusted API scoring and confirmed Quiz moderation integrate | PASS | 7.626 |
| BROWSER-011 | browser system | frontend/e2e/moderation.spec.ts | [edge] student uploads, administrator confirms removal and removed content cannot be downloaded | PASS | 17.709 |
| BROWSER-012 | browser system | frontend/e2e/moderation.spec.ts | [edge] student loads the 26th search match and keeps the search after another upload | PASS | 8.160 |
| BROWSER-013 | browser system | frontend/e2e/moderation.spec.ts | [edge] Admin dashboard integrates real Question Bank moderation, responsive navigation and Student denial | PASS | 8.779 |
| BROWSER-014 | browser system | frontend/e2e/moderation.spec.ts | [edge] ten isolated browser sessions concurrently upload, create quizzes, submit and read their own history | PASS | 47.927 |
| BROWSER-015 | browser system | frontend/e2e/moderation.spec.ts | [firefox] bulk material moderation confirms hidden scope, supports cancellation and retains PDF audit data | PASS | 13.478 |
| BROWSER-016 | browser system | frontend/e2e/moderation.spec.ts | [firefox] complete Student attempt, result, history and subject performance survive Quiz moderation | PASS | 28.044 |
| BROWSER-017 | browser system | frontend/e2e/moderation.spec.ts | [firefox] real Quiz creation, discovery, trusted API scoring and confirmed Quiz moderation integrate | PASS | 6.340 |
| BROWSER-018 | browser system | frontend/e2e/moderation.spec.ts | [firefox] student uploads, administrator confirms removal and removed content cannot be downloaded | PASS | 9.526 |
| BROWSER-019 | browser system | frontend/e2e/moderation.spec.ts | [firefox] student loads the 26th search match and keeps the search after another upload | PASS | 5.278 |
| BROWSER-020 | browser system | frontend/e2e/moderation.spec.ts | [firefox] Admin dashboard integrates real Question Bank moderation, responsive navigation and Student denial | PASS | 8.153 |
| BROWSER-021 | browser system | frontend/e2e/moderation.spec.ts | [firefox] ten isolated browser sessions concurrently upload, create quizzes, submit and read their own history | PASS | 99.472 |
