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
