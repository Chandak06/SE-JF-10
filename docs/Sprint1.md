# Sprint 1 Authentication Implementation Reports

## CSMQ-11 Registration UI and API Implementation and Verification

**Branch:** `PES2UG24CS157`  
**Owner:** Dharani S
**Reference review date:** 11 October 2026

## 1. Implementation Summary

CSMQ-11 covers the student registration user interface and backend API integration. The implementation provides a registration form, validates user input, sends valid registration requests to the backend, and presents success or error feedback to the user.

The implementation also supports backend-side validation, secure password storage, and duplicate-email rejection. Automated tests were executed to verify the registration flow and relevant authentication/security behaviour.

## 2. Requirements Traceability

| Requirement | Implementation / Evidence | Verification |
|---|---|---|
| Registration form accepts name, email and password | Registration UI | Frontend test suite |
| Required fields are validated | Registration form validation | Automated validation tests |
| Email format is validated | Registration form and backend validation | Invalid-email test cases |
| Valid registration requests reach the backend | Frontend registration service and backend API | Registration integration test |
| Successful registration displays feedback | Registration response handling | Success-message test and live API test |
| Invalid registration data is rejected | Backend validation and error handling | Automated validation tests |
| Duplicate email addresses are rejected | Account repository and registration API | Duplicate-registration test |
| Passwords are stored securely | Password hashing in the backend | Password-hashing tests and database verification |
| Registration behaviour is covered by automated tests | Frontend and backend test suites | Test results in Section 4 |
| Code is submitted for review | Feature branch `PES2UG24CS157` | Pull request pending |

## 3. Implementation Details

### 3.1 Registration User Interface

The registration interface provides fields for the user's name, email address and password. Client-side validation checks user input before submission. The interface displays feedback for successful registration and handles duplicate-email and API-error responses.

### 3.2 Backend API Integration

The frontend sends registration requests to the backend API. The backend validates incoming data and rejects invalid requests. Successful registration creates the user account and returns a success response. Repeated registration using an existing email address is rejected.

### 3.3 Password Security

Passwords are hashed before storage rather than stored as plaintext. Automated tests verify password-hashing behaviour, including password comparison and relevant invalid-input cases.

### 3.4 Error Handling

The registration flow handles validation failures, duplicate-email responses and backend connection errors. The frontend displays an appropriate message rather than treating failed requests as successful registrations.

## 4. Automated Verification

The following commands were executed during verification.

| Verification | Result |
|---|---|
| Frontend test suite: `npm run test:ci` | 8 tests passed |
| Backend unit test suite: `npm run test:unit` | 55 tests passed |
| Combined checks: `npm run check` | Passed |
| Combined backend test suite | 72 tests passed |
| Type checking | Passed |
| Backend production build | Passed |

The combined backend suite includes unit and integration tests covering authentication, registration-related security behaviour, session handling, validation and error handling.

### 4.1 Backend Coverage

The combined backend test run reported the following coverage:

| Metric | Coverage |
|---|---:|
| Statements | 97.88% |
| Branches | 97.60% |
| Functions | 100% |
| Lines | 98.69% |

A Mongoose deprecation warning appeared during testing. It did not cause the verification run to fail.

## 5. Live API Verification

Registration was tested against the configured MongoDB-backed backend.

| Test | Expected behaviour | Observed result |
|---|---|---|
| Register a new user | Account is created successfully | HTTP `201 Created` |
| Register again with the same email | Duplicate registration is rejected | HTTP `409 Conflict` |
| Inspect the created user record | Password is not stored as plaintext | A bcrypt password hash was present |

The created test account was also visible in the configured MongoDB database. Test credentials and authentication tokens are intentionally excluded from this report.

## 6. Git and Review Status

The implementation was committed and pushed to the feature branch `PES2UG24CS157`.

Latest verified commit:

`1a34f7b` :- `CSMQ-11: test user model and account repository`

The working tree was clean and the local branch was up to date with `origin/PES2UG24CS157` at the last status check.



## 7. Conclusion

The registration UI and API implementation has passed the recorded frontend tests, backend unit and integration tests, type checking and production build. Live API verification confirmed successful registration and duplicate-email rejection, and database inspection confirmed hashed password storage.

The implementation is ready to be submitted for review. Completion of the pull-request and peer-review steps remains pending.

## CSMQ-12 Student Login and Logout Implementation Report

**Jira issue:** CSMQ-12 : Implement student login and logout functionality and integrate it with the shared authentication mechanism.

**Scope:** Student credential login, shared session-token handling, authenticated access, and logout/revocation.

### Implementation Summary

The login page submits the student's email and password through the shared frontend authentication service. The backend validates the request, verifies the password against the stored password hash, and returns a generic invalid-credentials response when the credentials are wrong or the account is unavailable. On success, the backend creates a cryptographically random bearer token and stores only its SHA-256 hash with the user ID and expiration time. The frontend retains the returned token for authenticated requests.

Protected API routes require a valid bearer token and an active, allowed account. Authentication is resolved against the shared session store, including an explicit expiry check. Logout requires authentication, revokes the matching server-side session, and clears the frontend token after successful revocation. Protected requests using a revoked token are rejected.

### Acceptance Criteria Traceability

| # | Acceptance criterion | Implementation | Test evidence |
|---|---|---|---|
| 1 | Student can submit valid email and password credentials. | `frontend/src/pages/LoginPage.tsx`; `frontend/src/services/authService.ts`; backend `loginSchema` in `backend/src/middleware/validation.ts` | `frontend/src/App.test.tsx` checks login submission; `frontend/tests/auth.integration.test.ts` uses the actual frontend client. |
| 2 | Valid credentials result in successful authentication. | `backend/src/security/auth-service.ts` verifies the password and returns the authenticated user and token. | `backend/tests/integration/security.test.ts` verifies login and protected user context; `frontend/tests/auth.integration.test.ts` logs in against the composed backend. |
| 3 | Invalid credentials are rejected with a clear error response. | Login returns a consistent `401` invalid-credentials response; the frontend displays the safe server message. | Security integration tests cover wrong password, unknown account, and disabled account; frontend unit/integration tests cover invalid login feedback. |
| 4 | Successful authentication establishes the agreed session/token. | A 32-byte random bearer token is returned; only its SHA-256 hash, user ID, and expiry are persisted by `backend/src/security/sessions.ts`. | Security integration test checks token shape, persisted hash, and that the raw token is not stored. |
| 5 | Protected functionality is accessible only after successful authentication. | `backend/src/middleware/auth.ts` enforces bearer authentication; feature routers are mounted behind authentication in `backend/src/app.ts`. The frontend protects the materials route in `frontend/src/App.tsx`. | Middleware and security integration tests reject missing, malformed, random, expired, or revoked tokens and allow valid sessions. |
| 6 | Logout clears or invalidates the session/token. | `backend/src/routes/auth.ts` calls the shared auth service to revoke the session. The frontend `logout` function clears its token and user state after the server accepts logout. | `frontend/src/services/authService.test.ts` checks successful clearing and that a failed logout keeps the session available for retry; backend integration covers revocation. |
| 7 | Protected access is rejected after logout. | Revoked token hashes no longer resolve to an active session. | Backend security integration replays the logged-out token against `/api/auth/me` and expects `401`; frontend integration checks protected upload is refused after logout. |
| 8 | Login and logout behavior is covered by unit and integration tests. | Frontend validation/client tests, backend password and auth middleware unit tests, and MongoDB-backed security integration tests cover the flow. | See `frontend/src/App.test.tsx`, `frontend/src/services/authService.test.ts`, `frontend/tests/auth.integration.test.ts`, `backend/tests/unit/password.test.ts`, `backend/tests/unit/middleware.test.ts`, and `backend/tests/integration/security.test.ts`. |

### Verification Record

Automated coverage is present at the UI, client-service, middleware, and MongoDB-backed integration layers. The last project verification results already recorded in `docs/SPRINT1_HARSHIT.md` (12 October 2026 re-audit) report 80 backend tests and 19 frontend tests passing, with backend type/build, frontend build/lint, and coverage gates passing. Those are the existing project results; checks were not rerun as part of this documentation update.

### Conclusion

The implementation and test coverage address all eight CSMQ-12 acceptance criteria. The server-side session is the authority for protected access, and logout invalidates that session so token replay is rejected.

## CSMQ-13: Student User Model and Authentication Integration

**Jira issue:** CSMQ-13
**Branch:** `PES2UG24CS157`

The production User model and Mongo account repository were already integrated with the shared Member 4 authentication service. This CSMQ-13 update adds model-level checks so invalid data is rejected even when a write bypasses the registration request validator:

- Names are trimmed, required, 1–100 characters, and reject control characters and markup delimiters.
- Emails are trimmed and lowercased, limited to 254 characters, validated for email shape, and protected by a unique database index.
- `passwordHash` is required, excluded from ordinary queries, and must match the shared bcrypt hash format. Plaintext passwords are not valid model data.
- The model retains the shared `student`/`admin` role enum, with new users defaulting to active students. Public registration continues to force the student role through the repository.


### Verification recorded for this update

| Check | Result |
|---|---|
| User model/repository tests | 16 passed |
| Backend integration tests (runtime and security) | 25 passed |
| TypeScript typecheck | Passed |
| Backend production build | Passed |

## CSMQ-14: Authenticated Student PDF Study-Material Upload

**Jira issue:** CSMQ-14 (under CSMQ-8)
**Implementation branch:** `PES2UG24CS157`


### Implementation summary

The authenticated Materials page exposes an upload form with title, subject, description, and PDF file fields. The frontend sends these as multipart form data with the shared bearer session token. The Express application authenticates the request before the material router accepts the multipart body, then requires the current account role to be `student`.

The API validates required metadata, rejects unknown or unsafe fields, enforces a single PDF file and the configured size limit, and parses the bytes to confirm the file is a non-empty valid PDF. PDF bytes are stored in MongoDB GridFS; a Material record stores the metadata, authenticated `uploadedBy` user ID, GridFS `fileId`, byte size, and timestamps. If metadata persistence fails after file storage, the uploaded GridFS file is removed. Successful requests return HTTP `201` with a clear material response. The frontend displays an upload success message and refreshes the library.

### Acceptance criteria traceability

| # | Acceptance criterion | Implementation / evidence |
|---|---|---|
| 1 | Authenticated student can open PDF upload functionality. | Materials page is protected by the frontend session route; its upload action opens the form. Backend material routes require authentication. |
| 2 | Form accepts title, subject, description, and PDF. | `frontend/src/pages/MaterialsPage.tsx` provides required metadata fields and a PDF file input. |
| 3 | Valid PDF files submit successfully. | `backend/src/materials/upload.ts` parses the PDF and stores validated bytes in GridFS. |
| 4 | Upload is associated with the authenticated user. | Backend sets `uploadedBy` from `req.user.id`; clients cannot supply this field. |
| 5 | Required material metadata is stored correctly. | Material schema persists title, subject, and description with validation and length limits. |
| 6 | File storage reference is persisted correctly. | Material schema stores the unique GridFS `fileId` and byte size; integration test reads back identical file bytes. |
| 7 | Unauthenticated uploads are rejected. | `requireAuth` guards `/api/materials`; runtime integration verifies HTTP `401` before any file is stored. |
| 8 | Successful upload returns a clear response. | API returns HTTP `201` and material details; UI displays “Your material has been uploaded.” |
| 9 | Relevant upload integration tests pass. | Backend runtime integration: 8 passed. Frontend authenticated-client and upload-form integration/unit tests: 4 passed. |
| 10 | Jira-linked feature branch and Pull Request submitted for review. | Code is on the existing `PES2UG24CS157` branch. No commit or PR was created per the current instruction; Jira-linked branch/PR submission and review remain pending. |

### Verification run

| Command | Result |
|---|---|
| `npm exec vitest run backend/tests/integration/runtime.test.ts` | 8 tests passed |
| `cd frontend && npm run test:ci -- --run tests/auth.integration.test.ts src/pages/MaterialsPage.test.tsx` | 4 tests passed |

The test runs used disposable MongoDB instances. This documentation update and implementation work remain uncommitted as requested.

## CSMQ-15: Sprint 1 Study-Material Upload Validation

**Jira issue:** CSMQ-15
**Parent:** CSMQ-8


### Validation changes

The backend metadata schema is exported for focused unit coverage and remains the source of validation for multipart requests. It requires non-empty title, subject, and description values, trims surrounding whitespace, applies field length limits, rejects unsafe control/markup characters, and rejects unexpected fields. The upload middleware enforces one file, a configured byte limit, and PDF MIME type plus `.pdf` extension. The API parses the uploaded bytes and rejects malformed, encrypted, or page-less PDFs before writing to GridFS or creating a Material record. Validation errors return controlled HTTP responses with stable error codes. Storage cleanup also removes the GridFS object if a later metadata write fails.

### Acceptance criteria traceability

| # | Acceptance criterion | Implementation / evidence |
|---|---|---|
| 1 | Missing required metadata is rejected. | `materialMetadataSchema` requires title, subject, and description; unit tests and multipart integration cases cover each missing field. |
| 2 | Missing file is rejected. | API returns `400 FILE_REQUIRED`; runtime integration asserts the error response. |
| 3 | Non-PDF files are rejected. | Upload filter checks MIME type and filename; runtime integration asserts `400 INVALID_FILE_TYPE`. PDF-like invalid bytes are separately rejected as `INVALID_PDF`. |
| 4 | Files over the configured maximum size are rejected. | Multer uses `MAX_UPLOAD_BYTES`; runtime configures a 2 KiB test limit and asserts a larger upload returns `413 FILE_TOO_LARGE`. |
| 5 | Valid PDFs within the configured limit are accepted. | Runtime integration submits a generated valid PDF below the 2 KiB limit and expects `201`. |
| 6 | Validation errors are clear and controlled. | API returns safe messages and stable codes for metadata, missing-file, file-type, invalid-PDF, and size failures. |
| 7 | Invalid uploads do not create corrupt or incomplete records. | Integration test verifies no Material or GridFS file records exist after all invalid upload cases; persistence-failure coverage verifies uploaded bytes are cleaned up. |
| 8 | Validation is enforced at the backend/API. | All checks run in the backend route and storage path, independent of frontend form constraints. |
| 9 | Relevant unit and integration tests pass. | Metadata validation unit tests: 8 passed. MongoDB-backed runtime upload integration tests: 8 passed. |
| 10 | Jira-linked branch and Pull Request submitted for review. | Work remains on `PES2UG24CS157`; no commit or PR was created. Jira-linked branch/PR submission remains pending. |

### Verification run

| Command | Result |
|---|---|
| `npm exec vitest run backend/tests/unit/material-upload-validation.test.ts backend/tests/integration/runtime.test.ts` | 16 tests passed |

Tests use a disposable MongoDB instance and a 2 KiB configured upload limit. Changes remain uncommitted.

## CSMQ-16: Sprint 1 Authentication and PDF Upload Test Evidence

**Jira issue:** CSMQ-16
**Parent:** CSMQ-8


### Coverage

The automated backend suites cover student registration and validation, duplicate accounts, valid and invalid login, session persistence and revocation, protected-route authentication, shared role/auth middleware, PDF validation, configured upload size limits, authenticated upload persistence, and anonymous upload rejection. Runtime integration uses a disposable MongoDB instance and the production Express/runtime composition. Frontend unit and integration tests exercise registration/login/logout views, protected navigation, multipart upload requests with the shared bearer token, and an end-to-end client flow through registration, login, PDF upload, and logout.

### Acceptance criteria results

| Acceptance criteria | Evidence |
|---|---|
| Valid/invalid registration and login | `backend/tests/integration/security.test.ts`; frontend registration/login tests |
| Logout blocks protected access | Backend session revocation and replay tests; frontend logout/protected-route tests |
| Valid PDF, invalid file type, and oversized PDF | `backend/tests/integration/runtime.test.ts`; metadata schema unit tests |
| Authenticated upload stores metadata and file reference | Runtime integration reads stored metadata and GridFS bytes back |
| Anonymous upload is rejected | Runtime and security integration verify `401` before persistence |
| Shared authentication/security middleware integration | MongoDB-backed security suite and full runtime composition tests |
| Non-interactive project test commands | Backend and frontend CI-compatible commands below completed successfully |

### Verification run

| Command | Result / evidence |
|---|---|
| `npm test` | 7 backend test files passed; 93 tests passed |
| `npm run test:ci` | 7 backend test files passed; 93 tests passed. Coverage: 96.21% statements, 97.29% branches, 94.20% functions, 97.43% lines. |
| `cd frontend && npm run test:ci` | 4 frontend test files passed; 21 tests passed |
| `npm run typecheck` | Passed after the CSMQ-15 test changes |

JUnit reports were generated at `reports/junit.xml` and `frontend/reports/junit.xml`; backend coverage reports are in `coverage/`. The reports are ignored local artifacts. The repository's `.github/workflows/ci.yml` runs backend `npm run test:ci`, frontend `npm run test:ci`, lint, and build non-interactively on pushes and pull requests, then retains JUnit/coverage evidence in the `sprint-1-test-reports` workflow artifact for 14 days. These are local results; no new GitHub Actions run was triggered during this task.

The test results and report locations are recorded here for CSMQ-16. Jira attachment/linking remains pending because no Atlassian connection is currently available in this session.

