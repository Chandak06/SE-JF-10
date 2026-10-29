# Question / Quiz Attempt API Contract

## Purpose

This document defines shared Question/Attempt payloads and the intended production API. Sprint 1 verifies the student-safe serializer → actual UI → evaluator boundary using fixtures, model tests and a local-submit sample-question prototype. Production submission, server evaluation, results, history and performance integration belong to Sprint 2. Endpoint examples below are contract targets, not claims that production routes are mounted in Sprint 1.

The student-facing frontend must never receive the correct answer before submission.

---

## 1. Student-Safe Question Payload

The Quiz Attempt UI receives questions in this structure:

```json
{
  "quizId": "QUIZ_ID",
  "title": "Computer Science Practice Quiz",
  "questions": [
    {
      "id": "QUESTION_ID",
      "questionText": "Which protocol provides reliable, connection-oriented communication?",
      "options": [
        {
          "id": "A",
          "text": "UDP"
        },
        {
          "id": "B",
          "text": "TCP"
        },
        {
          "id": "C",
          "text": "ARP"
        },
        {
          "id": "D",
          "text": "ICMP"
        }
      ],
      "difficulty": "Easy",
      "marks": 1
    }
  ]
}
```

### Security Rule

The student-facing payload must not contain:

- `correctAnswer`
- `correctOption`
- `correctOptionId`
- `answerKey`

Correct answers remain available only to trusted backend evaluation logic.

---

## 2. Question Contract

Each question contains:

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | Yes | Unique question identifier |
| `questionText` | string | Yes | Question displayed to the student |
| `options` | array | Yes | Available answer options |
| `difficulty` | string | No | Easy, Medium, or Hard |
| `marks` | number | No | Marks assigned to the question |

Each option contains:

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | Yes | Stable option identifier |
| `text` | string | Yes | Option text shown to the student |

---

## 3. Quiz Attempt Submission

### Endpoint

```text
POST /api/attempts
```

### Authentication

The request uses the project's normal Bearer-token authentication.

```text
Authorization: Bearer <token>
```

The frontend must not send a trusted `userId`.

The backend obtains the user identity from the authenticated request context:

```text
req.user.id
```

This prevents one student from submitting an attempt on behalf of another student.

---

## 4. Attempt Request Payload

```json
{
  "quizId": "QUIZ_ID",
  "responses": [
    {
      "questionId": "QUESTION_ID_1",
      "selectedOptionId": "B"
    },
    {
      "questionId": "QUESTION_ID_2",
      "selectedOptionId": "C"
    }
  ]
}
```

### Request Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `quizId` | string | Yes | Quiz being attempted |
| `responses` | array | Yes | Student responses |
| `responses[].questionId` | string | Yes | Question identifier |
| `responses[].selectedOptionId` | string | Yes | Selected option identifier |

An unanswered question may be omitted from the `responses` array.

The evaluation logic must treat omitted questions as unanswered without crashing.

---

## 5. Backend Evaluation Contract

The evaluation module uses:

```ts
interface EvaluationQuestion {
  id: string
  correctOptionId: string
}

interface SubmittedResponse {
  questionId: string
  selectedOptionId: string
}
```

The backend compares submitted responses against the trusted answer key.

The frontend must not calculate the authoritative score.

---

## 6. Evaluation Result

The evaluation helper returns:

```json
{
  "score": 8,
  "total": 10,
  "percentage": 80,
  "correct": 8,
  "incorrect": 1,
  "unanswered": 1
}
```

| Field | Description |
|---|---|
| `score` | Number of correct answers |
| `total` | Total number of quiz questions |
| `percentage` | Percentage score |
| `correct` | Number of correct responses |
| `incorrect` | Number of incorrect responses |
| `unanswered` | Number of unanswered questions |

---

## 7. Successful Attempt Response

A successful submission may return:

```json
{
  "attemptId": "ATTEMPT_ID",
  "quizId": "QUIZ_ID",
  "score": 8,
  "total": 10,
  "percentage": 80,
  "correct": 8,
  "incorrect": 1,
  "unanswered": 1
}
```

The complete answer key does not need to be exposed to the student during the Sprint 1 attempt flow.

---

## 8. QuizAttempt Persistence Contract

After server-side evaluation, the backend stores the result using the QuizAttempt model.

Conceptually:

```json
{
  "user": "AUTHENTICATED_USER_ID",
  "quiz": "QUIZ_ID",
  "responses": [
    {
      "questionId": "QUESTION_ID",
      "selectedOption": "B"
    }
  ],
  "score": 8,
  "percentage": 80
}
```

The API uses `selectedOptionId` as the external request field.

The route maps this value to the current QuizAttempt model field `selectedOption` before persistence.

The stored `user` value comes from the authenticated request context, not from client input.

Timestamps are generated automatically by the QuizAttempt schema.

---

## 9. Authentication Behaviour

### Authenticated Student

```text
POST /api/attempts
→ authentication succeeds
→ student authorization succeeds
→ responses are evaluated
→ QuizAttempt is stored
→ result is returned
```

### Missing Authentication

```text
POST /api/attempts
→ request rejected
```

### Invalid or Expired Authentication

```text
POST /api/attempts
→ request rejected using the project's controlled authentication response
```

---

## 10. Module Responsibilities

### Question Bank

Provides:

- question ID
- question text
- answer options
- optional difficulty
- optional marks

It must not expose the correct answer in the student-facing payload.

### Quiz Attempt UI

Responsible for:

- rendering questions
- rendering answer options
- maintaining selected responses
- handling unanswered questions
- submitting `quizId` and responses
- displaying the returned evaluation result

### Evaluation Module

Responsible for:

- comparing responses against trusted correct answers
- calculating score
- calculating percentage
- counting correct answers
- counting incorrect answers
- counting unanswered questions

### Authentication Module

Responsible for:

- authenticating requests
- rejecting unauthenticated users
- exposing authenticated user context to protected routes

### QuizAttempt Model

Responsible for storing:

- authenticated user reference
- quiz reference
- submitted responses
- score
- percentage
- timestamps

---

## 11. Sprint 2 Production Integration Target

```text
Question Bank
     ↓
Student-safe Question Payload
     ↓
Quiz Attempt UI
     ↓
POST /api/attempts
     ↓
Authentication / Student Authorization
     ↓
Server-side Evaluation
     ↓
QuizAttempt Persistence
     ↓
Score and Result Response
     ↓
Quiz Attempt UI
```

---

## 12. Sprint boundary

Sprint 1 uses sample/fixture questions and local submission. Sprint 2 completes the production flow above, approved results/history screens, persistence and subject-wise performance. Leaderboards and adaptive recommendations mentioned in older planning are not added as requirements by this schedule change; implement only approved SRS functionality. See the [final plan](TWO_SPRINT_PLAN.md).

---

## 13. Sprint 2 Quiz Retrieval Contract (`GET /api/quizzes/:id`)

**Owner**: Prajwal M (Member 2, Team 10)
**Jira Story**: CSMQ-52 (Integrate student-safe quiz retrieval with attempts)
**Requirements**: SRS CSMQ-F-030, CSMQ-F-032, CSMQ-F-033

### Endpoint

```http
GET /api/quizzes/:id
Authorization: Bearer <student-or-admin-token>
```

### Response Payload

The endpoint returns both top-level attempt fields and a `quiz` object:

```json
{
  "quizId": "65f000000000000000000010",
  "title": "Computer Networks Midterm",
  "subject": "Computer Networks",
  "questionCount": 1,
  "questions": [
    {
      "id": "65f000000000000000000001",
      "questionText": "What protocol operates at Layer 4 and provides reliable delivery?",
      "options": [
        { "id": "A", "text": "UDP" },
        { "id": "B", "text": "TCP" },
        { "id": "C", "text": "IP" },
        { "id": "D", "text": "Ethernet" }
      ],
      "difficulty": "Easy",
      "marks": 1
    }
  ],
  "quiz": {
    "id": "65f000000000000000000010",
    "quizId": "65f000000000000000000010",
    "title": "Computer Networks Midterm",
    "subject": "Computer Networks",
    "questionCount": 1,
    "questions": [ ... ]
  }
}
```

### Invariants & Cross-Module Compatibility
1. **Zero Answer Leakage**: Reuses Sprint 1's `toStudentSafeQuestions` serializer. No `correctAnswer` or answer keys are ever exposed in this response.
2. **Strict Question Reference**: Returns *only* the active questions referenced by the requested quiz.
3. **Stable Option & Question IDs**: Option identifiers match the stable IDs (`'A'`, `'B'`, `'C'`, `'D'`) expected by Karan's evaluation helper (`evaluateQuiz`) and attempt submission (`POST /api/attempts`).
4. **No Remapping Required**: The payload matches the Attempt UI input structure directly.
