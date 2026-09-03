# Software Requirements Specification (SRS)

**Project:** Collaborative Study Material & Quiz Platform
**Version:** 1.1 (Revised for feasibility)
**Authors:**
- PES2UG24CS157: Dharani S
- PES2UG24CS910: Prajwal M
- PES2UG24CS903: Karan Varshney
- PES2UG24CS185: Harshit Chandak

**Date:** -
**Status:** Draft

## Revision history
| Version | Date | Author | Change summary | Approval |
|---|---|---|---|---|
| 1.0 | 02-09-2026 | Team 10 | Initial SRS for Collaborative Study Material & Quiz Platform | Pending |
| 1.1 | 03-09-2026 | Team 10 | Scaled down NFR-001 and NFR-003 to be verifiable without dedicated load-testing infrastructure | Pending |

## Approvals
| Role | Name | Signature / Email | Date |
|---|---|---|---|
| Course Coordinator | - | - | - |

## Table of Contents
1. Introduction
2. Overall description
3. External interfaces
4. System features (detailed)
5. Non-functional requirements (detailed)
6. Quality attributes & Acceptance tests
7. UML Use-Case Diagram
8. Requirements Traceability Matrix (RTM)

---

## 1. Introduction

### 1.1 Purpose
This document is the Software Requirements Specification (SRS) for the Collaborative Study Material & Quiz Platform. The purpose of the system is to provide students with a centralized platform for sharing study materials, maintaining question banks, creating and attempting quizzes, and analysing academic performance. This document defines the functional requirements, non-functional requirements, system interfaces, security requirements and acceptance criteria for the proposed system.

### 1.2 Scope
The Collaborative Study Material & Quiz Platform is a web-based application that enables students to upload, access and share academic study materials. Users can create and attempt quizzes, contribute questions to a common question bank and view their quiz performance. Administrators can moderate inappropriate or invalid study materials, questions and quizzes. The system also provides simple subject-wise performance analysis based on quiz attempts and scores.

### 1.3 Audience
- Students
- Developers
- Testers
- Project Guide / Instructor
- System Administrators
- Project Evaluators

### 1.4 Definitions
| Term | Definition |
|---|---|
| SRS | Software Requirements Specification |
| UI | User Interface |
| API | Application Programming Interface |
| CRUD | Create, Read, Update and Delete |
| Quiz | A collection of questions attempted by users |
| Question Bank | Repository containing academic questions |
| Study Material | PDF notes or other academic resources uploaded to the platform |
| Admin | Authorized user responsible for managing the platform |
| MERN | MongoDB, Express.js, React.js and Node.js |

---

## 2. Overall description

### 2.1 Product perspective
The Collaborative Study Material & Quiz Platform is a web-based educational application intended to provide a common space for students to share learning resources and evaluate their knowledge through quizzes. The platform consists of a user-facing web application, backend services and a database. Users interact with the system through a browser while the backend handles authentication, study material management, quiz management, question-bank operations and performance analysis.

### 2.2 Major product functions (detailed)
- User registration and login
- Upload study materials
- Search and access study materials
- Download study materials
- Create questions
- Maintain a question bank
- Create quizzes
- Attempt quizzes
- Automatically evaluate objective questions
- Display quiz results
- View quiz attempt history
- View subject-wise average performance
- Moderate inappropriate study materials
- Moderate inappropriate questions and quizzes
- Search and filter quizzes and resources

### 2.3 User roles and characteristics (expanded)
- **Student:** Can register, log in, upload and access study materials, contribute questions to the question bank, create and attempt quizzes, and view performance analysis.
- **Administrator:** Can moderate study materials, questions and quizzes, and maintain the platform.

### 2.4 Operating environment
The proposed web application will use the MERN stack consisting of MongoDB, Express.js, React.js and Node.js. The system will run as a web application on modern desktop and mobile browsers, developed and demonstrated on a single local/dev deployment (no distributed infrastructure required).

### 2.5 Constraints
- Users must have internet connectivity to access the web application.
- Users must register before accessing protected functionality.
- Uploaded study materials must be PDF files and follow the configured file-size restriction.
- The system shall use MongoDB as the primary database.
- The web application shall be compatible with commonly used modern browsers.
- The project must be completed within the academic project timeline using a small team and shared coursework schedule; NFRs are scoped to be verifiable through manual testing rather than dedicated load-testing infrastructure.
- User passwords and sensitive information must be securely stored.

---

## 3. External interface requirements

### 3.1 User interfaces
The system shall provide a responsive and user-friendly graphical web interface:
- Login page
- Registration page
- Student dashboard
- Study material page
- Upload material page
- Question bank page
- Quiz creation page
- Quiz attempt page
- Quiz results page
- Performance dashboard
- Administrator dashboard

The interface shall provide clear navigation menus, validation messages and appropriate success or error notifications.

### 3.2 Hardware interfaces
The system does not require specialized hardware. Users shall access the platform using devices such as desktop computers, laptops, tablets or smartphones with internet connectivity.

### 3.3 Software interfaces
- MongoDB database for storing users, materials, questions, quizzes and performance information.
- REST APIs for communication between frontend and backend.
- React.js frontend for displaying the user interface.
- Node.js/Express.js backend for implementing business logic and APIs.

### 3.4 Communications
Communication between the client and server shall use HTTP/HTTPS protocols. REST-based APIs shall be used for communication between the frontend and backend. HTTPS shall be used when the application is deployed to protect user credentials and other sensitive information during transmission.

---

## 4. System features (detailed)
Each requirement below includes acceptance criteria and a reference test case. IDs follow CSMQ-F-###.

### 4.1 Authentication
Description: Authenticate registered users and provide secure access to the platform.

| Req ID | Requirement (shall...) | Type | Priority | Source/Stakeholder | Acceptance criteria / Test case ref | Comments / Dependencies |
|---|---|---|---|---|---|---|
| CSMQ-F-001 | The system shall allow a new user to register using name, email address and password. | Functional | High | Student | AC-CSMQ-F-001: Valid and unique registration details create a user account successfully. Test: TC-Auth-01 | Database required |
| CSMQ-F-002 | The system shall allow registered users to log in using valid credentials and reject invalid credentials with an appropriate error message. | Functional | High | Student | AC-CSMQ-F-002: Valid credentials create an authenticated session; invalid credentials are rejected and an error message is displayed. Test: TC-Auth-02 | Registered account required |
| CSMQ-F-004 | The system shall allow an authenticated user to log out and terminate the active session. | Functional | High | Student | AC-CSMQ-F-004: After logout, protected pages cannot be accessed without logging in again. Test: TC-Auth-03 | Active session required |

### 4.2 Study Material Management
Description: Allow students to upload, search and access academic study materials.

| Req ID | Requirement (shall...) | Type | Priority | Source/Stakeholder | Acceptance criteria / Test case ref | Comments / Dependencies |
|---|---|---|---|---|---|---|
| CSMQ-F-010 | The system shall allow authenticated users to upload PDF study materials with a title, subject and description, subject to the configured maximum file size. | Functional | High | Student | AC-CSMQ-F-010: A valid PDF within the file-size limit is uploaded successfully; non-PDF or oversized files are rejected with an appropriate message. Test: TC-MAT-01 | Authentication and storage required |
| CSMQ-F-012 | The system shall allow users to search and filter study materials using keywords or subjects. | Functional | High | Student | AC-CSMQ-F-012: Matching study materials are displayed for the selected search or filter criteria. Test: TC-MAT-02 | Material data required |
| CSMQ-F-013 | The system shall allow users to view and download available study materials. | Functional | High | Student | AC-CSMQ-F-013: Selected study material can be opened or downloaded successfully. Test: TC-MAT-03 | Material must exist |

### 4.3 Question Bank
Description: Maintain a collection of academic questions that can be searched and used while creating quizzes.

| Req ID | Requirement (shall...) | Type | Priority | Source/Stakeholder | Acceptance criteria / Test case ref | Comments / Dependencies |
|---|---|---|---|---|---|---|
| CSMQ-F-020 | The system shall allow authenticated users to add objective/MCQ questions with options, correct answer, subject, topic and difficulty level to the question bank. | Functional | High | Student | AC-CSMQ-F-020: A valid MCQ and its subject, topic and difficulty level are stored successfully in the question bank. Test: TC-QB-01 | Authentication required |
| CSMQ-F-022 | The system shall allow users to search and filter questions by subject, topic or difficulty level. | Functional | High | Student | AC-CSMQ-F-022: Questions matching the selected subject, topic or difficulty criteria are displayed. Test: TC-QB-02 | Question bank data required |

### 4.4 Quiz Management
Description: Allow users to create, search, attempt and evaluate quizzes.

| Req ID | Requirement (shall...) | Type | Priority | Source/Stakeholder | Acceptance criteria / Test case ref | Comments / Dependencies |
|---|---|---|---|---|---|---|
| CSMQ-F-030 | The system shall allow authenticated users to create a quiz by specifying a title and subject and selecting questions from the question bank. | Functional | High | Student | AC-CSMQ-F-030: A quiz with valid details and selected question-bank questions is created and stored successfully. Test: TC-QUIZ-01 | Authentication and question bank required |
| CSMQ-F-032 | The system shall allow users to search and view available quizzes. | Functional | High | Student | AC-CSMQ-F-032: Quizzes matching the search criteria are displayed. Test: TC-QUIZ-02 | Quiz data required |
| CSMQ-F-033 | The system shall allow registered users to attempt available quizzes. | Functional | High | Student | AC-CSMQ-F-033: Selected quiz opens and allows the user to answer its questions. Test: TC-QUIZ-03 | Authentication and quiz required |
| CSMQ-F-034 | The system shall automatically evaluate submitted objective/MCQ responses and calculate the user's score. | Functional | High | Student | AC-CSMQ-F-034: Calculated score matches the correct responses in the quiz. Test: TC-QUIZ-04 | Correct answers required |
| CSMQ-F-035 | The system shall display the quiz result after successful submission and evaluation. | Functional | High | Student | AC-CSMQ-F-035: The calculated result is displayed after quiz submission. Test: TC-QUIZ-05 | Evaluation required |
| CSMQ-F-036 | The system shall maintain a history of quizzes attempted by each user. | Functional | Medium | Student | AC-CSMQ-F-036: Completed quiz attempts appear in the user's quiz history. Test: TC-QUIZ-06 | Completed quiz attempt required |

### 4.5 Performance Analysis & Administration
Description: Provide academic performance analysis and administrator functions for managing the platform.

| Req ID | Requirement (shall...) | Type | Priority | Source/Stakeholder | Acceptance criteria / Test case ref | Comments / Dependencies |
|---|---|---|---|---|---|---|
| CSMQ-F-040 | The system shall display the user's average score for each subject based on previous quiz attempts. | Functional | High | Student | AC-CSMQ-F-040: Subject-wise average scores are calculated from stored quiz results and displayed correctly. Test: TC-PERF-01 | Quiz history required |
| CSMQ-F-041 | The system shall allow an administrator to remove inappropriate or invalid study materials. | Functional | High | Administrator | AC-CSMQ-F-041: Selected material is removed and is no longer accessible. Test: TC-ADMIN-01 | Administrator authentication required |
| CSMQ-F-042 | The system shall allow an administrator to remove inappropriate questions or quizzes. | Functional | High | Administrator | AC-CSMQ-F-042: Selected question or quiz is removed and is no longer accessible. Test: TC-ADMIN-02 | Administrator authentication required |

---

## 5. Non-functional requirements (detailed)
NFRs below are scoped to be verifiable manually by the team, without requiring dedicated load-testing tools or infrastructure. IDs CSMQ-NF-###.

| Req ID | Requirement | Category | Priority | Acceptance criteria / Measurement |
|---|---|---|---|---|
| CSMQ-NF-001 | Standard application pages (dashboard, material list, quiz attempt) shall load and respond within approximately 3 seconds under normal single-user use on a typical broadband/campus connection. | Performance | High | Verified by manually timing page loads and key actions (login, search, quiz submit) during team testing; no dedicated load-testing tool required. Test: TC-Perf-01 |
| CSMQ-NF-002 | The system shall preserve successfully saved user, study material, question, quiz and result data after an application restart. | Reliability | High | Saved records remain available and correct after restarting the backend/server and reconnecting to the database. Test: TC-Rel-01 |
| CSMQ-NF-003 | The system shall remain functional with at least 10 users active at the same time (e.g. multiple team members using separate browser sessions/incognito windows simultaneously), without crashing or returning errors. | Scalability | Medium | Manual test: team members access the app concurrently from separate sessions/devices and perform typical actions (browse, upload, attempt quiz) without functional failure. Test: TC-Scale-01 |
| CSMQ-NF-004 | The system shall support recent versions of Google Chrome, Microsoft Edge and Mozilla Firefox. | Compatibility | Medium | Core functions (register, login, upload, quiz attempt) are manually verified on all three browsers. Test: TC-Compat-01 |
| CSMQ-NF-005 | The user interface shall provide clear navigation and understandable success, validation and error messages. | Usability | Medium | A user can register, access study material and attempt a quiz without external assistance, verified through a walkthrough with a test user. Test: TC-UX-01 |

### 5.1 Security

#### 5.1.1 Security Objectives
1. **Confidentiality:** Protect user credentials and personal information from unauthorized access or disclosure.
2. **Integrity and Access Control:** Prevent unauthorized access, modification or deletion of user accounts, study materials, questions and quizzes.

#### 5.1.2 Security Requirements

| Req ID | Requirement (shall...) | Type | Priority | Acceptance criteria / Test case ref |
|---|---|---|---|---|
| CSMQ-SR-001 | The system shall securely hash user passwords (e.g. using bcrypt) and shall not store passwords in plain text. | Security | High | Database inspection confirms that passwords are stored only as password hashes. Test: TC-Sec-01 |
| CSMQ-SR-002 | The system shall require authentication (e.g. via JWT/session token) before allowing access to protected functionality. | Security | High | Unauthenticated users are denied access to protected functions/API routes. Test: TC-Sec-02 |
| CSMQ-SR-003 | The system shall enforce role-based access control for administrator-only functionality. | Security | High | Student accounts cannot access administrator routes or UI. Test: TC-Sec-03 |
| CSMQ-SR-004 | The system shall validate and sanitize user input before processing or storing it. | Security | High | Invalid or malicious input (e.g. script injection, malformed data) is rejected or sanitized without affecting stored data. Test: TC-Sec-04 |
| CSMQ-SR-005 | The deployed system shall use HTTPS for sensitive communication between the client and server. | Security | High | Sensitive client-server requests are transmitted using HTTPS in the deployed environment. Test: TC-Sec-05 |

---

## 6. Quality attributes & Acceptance tests
- **Exit criteria for acceptance:** All high-priority functional requirements implemented and verified, no critical NFR or security failures, and RTM shows all test cases passed.
- **Acceptance test suites:** Authentication, Study Material Management, Question Bank, Quiz Management, Performance Analysis, Administration, Performance (manual timing), Reliability, Scalability (manual multi-session), Security, Compatibility, and Usability tests.

---

## 7. System models and diagrams

### 7.1 UML Use-Case Diagram
<!-- UML Use-Case Diagram 1 goes here -->
![uml1.png]()
**Diagram 1: Content & Question Bank**
Actor: Student (+ Administrator connecting into "Remove Material" and "Remove Question/Quiz")

Use cases:
- Register
- Login
- Logout
- Upload Study Material
- Search/View Study Materials
- Download Study Material
- Add Question to Bank
- Search/Filter Questions
- Remove Study Material *(Administrator)*
- Remove Question/Quiz *(Administrator)*

Relationships worth showing: `Upload Study Material` and `Add Question to Bank` both `<<include>>` a generic "Authenticate" use case (or just draw Login as a precondition); Administrator is a separate actor stacked above/below Student.

<!-- UML Use-Case Diagram 2 goes here -->
![uml2.png]()
**Diagram 2: Quiz & Performance**
Actor: Student

Use cases:
- Create Quiz (selects from Question Bank — you can show this as a dependency arrow to Diagram 1 conceptually, or just note it in text)
- Search/View Quizzes
- Attempt Quiz
- Evaluate Quiz *(system auto-triggers this — often shown as `<<include>>` from Attempt Quiz)*
- View Quiz Result
- View Quiz History
- View Subject-wise Performance

Relationships worth showing: `Attempt Quiz` `<<include>>` `Evaluate Quiz` `<<include>>` `Display Result`; `View Subject-wise Performance` depends on quiz history data.

---

## 8. Requirements Traceability Matrix (RTM)

| Req ID | Requirement short | Section ref / Design Spec | Module | Test case(s) | Status (N/P/A) | Comments |
|---|---|---|---|---|---|---|
| CSMQ-F-001 | User registration | 4.1 | AuthModule | TC-Auth-01 | N | |
| CSMQ-F-002 | User login | 4.1 | AuthModule | TC-Auth-02 | N | |
| CSMQ-F-004 | User logout | 4.1 | AuthModule | TC-Auth-03 | N | |
| CSMQ-F-010 | Upload/validate PDF material | 4.2 | MaterialModule | TC-MAT-01 | N | |
| CSMQ-F-012 | Search/filter material | 4.2 | MaterialModule | TC-MAT-02 | N | |
| CSMQ-F-013 | View/download material | 4.2 | MaterialModule | TC-MAT-03 | N | |
| CSMQ-F-020 | Add/classify MCQ question | 4.3 | QuestionBankModule | TC-QB-01 | N | |
| CSMQ-F-022 | Search/filter question | 4.3 | QuestionBankModule | TC-QB-02 | N | |
| CSMQ-F-030 | Create quiz with questions | 4.4 | QuizModule | TC-QUIZ-01 | N | |
| CSMQ-F-032 | Search/view quiz | 4.4 | QuizModule | TC-QUIZ-02 | N | |
| CSMQ-F-033 | Attempt quiz | 4.4 | QuizModule | TC-QUIZ-03 | N | |
| CSMQ-F-034 | Evaluate MCQ quiz | 4.4 | EvaluationModule | TC-QUIZ-04 | N | |
| CSMQ-F-035 | Display result | 4.4 | EvaluationModule | TC-QUIZ-05 | N | |
| CSMQ-F-036 | Quiz attempt history | 4.4 | EvaluationModule | TC-QUIZ-06 | N | |
| CSMQ-F-040 | Subject-wise average score | 4.5 | PerformanceModule | TC-PERF-01 | N | |
| CSMQ-F-041 | Moderate materials | 4.5 | AdminModule | TC-ADMIN-01 | N | |
| CSMQ-F-042 | Moderate questions/quizzes | 4.5 | AdminModule | TC-ADMIN-02 | N | |
| CSMQ-NF-001 | Response time (manual check) | 5 | WebUI / Backend | TC-Perf-01 | N | |
| CSMQ-NF-002 | Data persistence | 5 | Backend / Database | TC-Rel-01 | N | |
| CSMQ-NF-003 | Concurrent users (10, manual) | 5 | Backend / Database | TC-Scale-01 | N | |
| CSMQ-NF-004 | Browser compatibility | 5 | WebUI | TC-Compat-01 | N | |
| CSMQ-NF-005 | Usability | 5 | WebUI | TC-UX-01 | N | |
| CSMQ-SR-001 | Password hashing | 5.1 | AuthModule | TC-Sec-01 | N | |
| CSMQ-SR-002 | Protected access | 5.1 | AuthModule | TC-Sec-02 | N | |
| CSMQ-SR-003 | Role-based access | 5.1 | AuthModule / AdminModule | TC-Sec-03 | N | |
| CSMQ-SR-004 | Input validation | 5.1 | Backend | TC-Sec-04 | N | |
| CSMQ-SR-005 | HTTPS communication | 5.1 | WebUI / Backend | TC-Sec-05 | N | |