# CSMQ-11 Registration UI and API Implementation and Verification

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

