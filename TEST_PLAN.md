## Software Test Plan (STP) - Collaborative Study Material & Quiz Platform

Project: Collaborative Study Material & Quiz Platform

Current editable source: TEST_PLAN.md. TEST_PLAN.pdf is regenerated from this source. The original Word/PDF plan is preserved under docs/historical with unchanged content. This update changes scheduling and CI terminology, not approved requirements or recorded test outcomes.
Regeneration: run `python docs/tools/generate_test_plan.py` with ReportLab available. The Markdown is the maintained editable planning source; the archived Word original is superseded.

Version: 1.1
Authors: Team 10
Date: 25-10-2026
Status: Planning update for review; approval signatures are not asserted

### 1. Introduction

Purpose: This document defines the test plan for the Collaborative Study Material & Quiz Platform v1.0. It outlines objectives, scope, strategy, resources, schedule, and responsibilities for testing.

Scope: Testing covers authentication, study materials, question bank, quiz creation/search, quiz attempt/evaluation, results/history, subject-wise performance, administration, security, performance, reliability, compatibility, and usability.

References: [Final two-sprint plan](docs/TWO_SPRINT_PLAN.md), [current work division](docs/WORK_DIVISION.md), Collaborative Study Material & Quiz Platform SRS v1.5, Detailed Work Division for a 4-Member Software Engineering Team, UML specifications.

Definitions: SRS (Software Requirements Specification), STP (Software Test Plan), UI (User Interface), API (Application Programming Interface), MCQ (Multiple Choice Question), RTM (Requirements Traceability Matrix).

### 2. Test Items

- Authentication module
- Study Material Management module
- Question Bank Management module
- Quiz Creation and Search module
- Quiz Attempt and Evaluation module
- Results, History and Performance module
- Administrator/Admin and Security interface

### 3. Features to be Tested

Features mapped to SRS requirement IDs:
- CSMQ-F-001, F-002, F-004: Registration, login and logout
- CSMQ-F-010, F-012, F-013, F-041: Study-material upload, search/view, download and admin removal
- CSMQ-F-020, F-022, F-042: Question-bank add, search/filter and admin question/quiz removal
- CSMQ-F-030, F-032: Quiz creation and search/view
- CSMQ-F-033, F-034, F-035, F-036: Quiz attempt, evaluation, results and history
- CSMQ-F-040: Subject-wise average score
- CSMQ-NF-001: Response time within 3s
- CSMQ-NF-002: Data persistence after restart
- CSMQ-NF-003: At least 10 concurrent sessions
- CSMQ-NF-004: Supported browser compatibility
- CSMQ-NF-005: Clear and understandable UI feedback

### 4. Features Not to be Tested

- Enterprise/distributed-scale infrastructure beyond the single local/development deployment
- Specialized hardware interfaces (none are required by the SRS)
- Functionality not defined in the approved SRS

### 5. Test Approach and Strategy

Levels:
- Unit tests (module-level)
- Integration tests (frontend, REST APIs, backend, MongoDB)
- System tests (end-to-end Student and Administrator functionality)
- Acceptance tests (UAT)

Types:
- Functional testing (core features)
- Regression testing
- Performance testing (response time, concurrent users)
- Usability testing (UI clarity, navigation, feedback)

Entry Criteria: Stable build delivered, test data available, services and test environment ready.
Exit Criteria: 100% of planned test cases executed, High-priority requirements verified, no unresolved critical defects, all acceptance criteria satisfied.

### 5.1 Security Validation

- Validate password hashing and confirm no plain-text password storage
- Verify authentication before protected pages, functions and APIs
- Verify role-based access control for Administrator-only operations
- Validate and safely handle malformed or malicious input
- Verify HTTPS for sensitive communication in the deployed environment

### 6. Test Environment

Hardware: Desktop/laptop/tablet/smartphone devices; no specialized hardware required.
Software: React.js frontend, Node.js, Express.js REST API, MongoDB, modern web browsers.
Tools: Postman (API), browser developer tools, Jira (defect tracking), GitHub (test evidence/PRs).
Test Data: Student and Administrator accounts, valid/invalid credentials, PDF files, MCQs, quizzes, attempts and results.

### 7. Test Schedule

The project has exactly two implementation sprints. Planning and setup are activities within the first sprint, not a separate implementation sprint.

| Sprint | Test scope | Completion evidence |
| --- | --- | --- |
| Sprint 1 | Core authentication, PDF upload and validation, Question Bank, QuizAttempt/evaluation prototype, security/RBAC foundation, unit/integration testing and GitHub Actions CI/CD | Working first increment; tests/coverage; genuine reviews; PR history; Jira evidence; Sprint 1 demonstration |
| Sprint 2 | Remaining study-material features, complete quiz creation/search and submission/evaluation/results/history/performance, administrator functions, integration, security, persistence, regression/system/NFR testing, performance/concurrency, browser/usability, cross-testing, UAT, deployment/demo and release readiness | All approved SRS acceptance criteria verified on the full integrated application; defects resolved or formally accepted; final reports, Jira/GitHub evidence, final demo and release-ready build |

Unit and integration tests progress alongside development in both sprints. All remaining product, validation and release work must finish within Sprint 2; the schedule does not declare that this work is already implemented. GitHub Actions is the active build/test pipeline.

### 8. Test Deliverables

- Test Plan (this document)
- Test Cases (manual & automated)
- Test Scripts / API test collections
- Test Data
- Test Execution Logs
- Defect Reports
- Test Summary Report

### 9. Roles and Responsibilities

| Role | Name | Responsibility |
| --- | --- | --- |
| QA Lead | Harshit Chandak | Prepare plan, coordinate execution |
| Test Engineer | Team 10 | Design & execute test cases, log defects |
| Developer | Team 10 | Support defect fixes and triage |
| Product Owner | Project Guide | Approve test results, sign-off readiness |

### 10. Risks and Mitigation

| Risk | Mitigation |
| --- | --- |
| Delay in stable build delivery | Request early smoke builds from development team |
| Test environment or service downtime | Maintain backup test setup and restore procedures |
| Integration/API changes cause retesting delays | Coordinate contracts early and run regression smoke tests |

### 11. Assumptions & Dependencies

- MongoDB test database and application services will be stable and available
- Required Student/Administrator test accounts and sample data will be available before execution
- The integrated MERN build and required browser versions will be available for testing

### 12. Suspension & Resumption Criteria

Suspend testing if:
- Test environment is unavailable for a material portion of the test window
- Build instability blocks more than 30% of planned test cases

Resume testing if:
- Blocking defects are resolved or formally accepted
- Environment is stabilized and smoke tests pass

### 13. Test Case Management & Traceability

RTM ensures mapping of SRS requirements to test cases.
Example:
- CSMQ-F-001 (Registration) -> TC-Auth-01
- CSMQ-F-030 (Quiz creation) -> TC-QUIZ-01
- CSMQ-NF-001 (Response time) -> TC-Perf-01

### 14. Test Metrics & Reporting

Metrics collected:
- % test cases executed
- % passed/failed
- Defect density
- Defect aging
- Requirement coverage

Reports:
- Daily execution status
- Final Test Summary Report

### 15. Approvals

| Role | Name | Signature / Date |
| --- | --- | --- |
| QA Lead | Harshit Chandak |  |
| Dev Lead | Team 10 |  |
| Product Owner | Project Guide |  |
