# Question Bank & Quiz Questions API Contract

**Owner**: Prajwal M (Member 2, Team 10 - SE Jackfruit)  
**Jira Epics / Stories**: CSMQ-22, CSMQ-23, CSMQ-24, CSMQ-25, CSMQ-26, CSMQ-27, CSMQ-28  
**Scope**: Sprint 1 — Question Schema, MCQ Creation, Question Filtering, Student-Safe Serializer, and Cross-Module Contract Integration

---

## 1. Overview & Architectural Boundaries

The **Question Bank Module** is responsible for creating, validating, storing, querying, and serializing Multiple Choice Questions (MCQs) for the Collaborative Study Material & Quiz Platform.

### Role Separation & Endpoint Boundaries
- **Administrator Endpoints (`/api/questions`)**: Protected by `requireAuth(auth)` and `requireRole('admin')`. Administrators can author new MCQs and query questions with full details (including `correctAnswer`).
- **Student-Safe Endpoints (`/api/quiz-questions`)**: Protected by `requireAuth(auth)`. Available to authenticated students and administrators for quiz practice attempts. Invariant: **Must NEVER leak correct answers or answer keys**.
- **Quiz Attempt & Evaluation Integration**: Directly aligns with Member 3's (Karan Varshney) attempt contract in `docs/attempt-api-contract.md` and evaluation helper in `backend/src/attempts/evaluate.ts`.

```
+-------------------------------------------------------------------------------+
|                                Express App                                    |
|                                                                               |
|  +---------------------------+       +-------------------------------------+  |
|  |   POST /api/questions     |       |   GET /api/quiz-questions           |  |
|  |   GET  /api/questions     |       |   (Student-Safe Quiz Payload)       |  |
|  +-------------+-------------+       +------------------+------------------+  |
|                |                                        |                     |
|         [Admin Only]                             [Authenticated]              |
|   requireRole('admin')                         requireAuth(auth)              |
|                |                                        |                     |
|                v                                        v                     |
|      +-------------------+                   +---------------------+          |
|      |  Question Router  |                   |    Student Router   |          |
|      +---------+---------+                   +----------+----------+          |
|                |                                        |                     |
|                |     +----------------------------+     |                     |
|                +---->| Question Model / MongoDB   |<----+                     |
|                      +----------------------------+                           |
|                                     |                                         |
|                                     v                                         |
|                      +----------------------------+                           |
|                      |   toStudentSafeQuestions   |                           |
|                      |   (Strips correctAnswer)   |                           |
|                      +--------------+-------------+                           |
|                                     |                                         |
|                                     v                                         |
|                      +----------------------------+                           |
|                      | Member 3 Quiz Evaluation   |                           |
|                      | (evaluateQuiz Contract)    |                           |
|                      +----------------------------+                           |
+-------------------------------------------------------------------------------+
```

---

## 2. Data Models & TypeScript Specifications

### 2.1 Question Interface (`backend/src/models/question.ts`)

```typescript
export type QuestionDifficulty = 'Easy' | 'Medium' | 'Hard';

export interface QuestionOption {
  id: string; // e.g., 'A', 'B', 'C', 'D'
  text: string; // Non-empty option display string
}

export interface QuestionFields {
  questionText: string;
  options: QuestionOption[];
  correctAnswer: string; // Must match one of options[i].id
  subject: string;
  topic: string;
  difficulty: QuestionDifficulty;
  marks?: number; // Integer >= 1, defaults to 1
  creator?: Types.ObjectId; // References User collection
  createdAt?: Date;
  updatedAt?: Date;
}
```

### 2.2 Validation Rules & Constraints
1. `questionText`: Required, trimmed string, minimum 5 characters, maximum 1000 characters.
2. `options`: Required array containing between **2 and 6** options inclusive.
   - Each option must have a non-empty `id` (e.g., `'A'`) and non-empty `text` (min 1 character, max 500 characters).
   - Option IDs must be strictly unique within the question (no duplicate `'A'` or `'B'`).
3. `correctAnswer`: Required string. Must match exactly one `id` in the `options` array.
4. `subject`: Required, trimmed string, minimum 2 characters, maximum 100 characters.
5. `topic`: Required, trimmed string, minimum 2 characters, maximum 100 characters.
6. `difficulty`: Required enum value: `'Easy'`, `'Medium'`, or `'Hard'`.
7. `marks`: Optional integer, minimum 1, maximum 100 (defaults to `1`).
8. `creator`: Optional `ObjectId` referring to the authoring administrator (`req.user.id`).

### 2.3 MongoDB Indexes
- Compound Index: `{ subject: 1, topic: 1, difficulty: 1 }` for high-performance faceted searches.
- Creator Index: `{ creator: 1 }` for administrative author queries.

---

## 3. Administrative Question API (`/api/questions`)

All requests to `/api/questions` require:
```text
Authorization: Bearer <admin-session-token>
```
Non-admin tokens receive `403 FORBIDDEN`. Unauthenticated requests receive `401 AUTH_REQUIRED`.

---

### 3.1 Create Question (Add MCQ)

- **Method & Path**: `POST /api/questions`
- **Role Required**: `admin`
- **Content-Type**: `application/json`

#### Request Body
```json
{
  "questionText": "Which protocol provides reliable, connection-oriented byte-stream transmission?",
  "options": [
    { "id": "A", "text": "UDP" },
    { "id": "B", "text": "TCP" },
    { "id": "C", "text": "ICMP" },
    { "id": "D", "text": "ARP" }
  ],
  "correctAnswer": "B",
  "subject": "Computer Networks",
  "topic": "Transport Layer",
  "difficulty": "Easy",
  "marks": 1
}
```

#### Success Response: `201 Created`
```json
{
  "message": "Question created successfully",
  "question": {
    "id": "6716039546d1bf5b8f36a941",
    "questionText": "Which protocol provides reliable, connection-oriented byte-stream transmission?",
    "options": [
      { "id": "A", "text": "UDP" },
      { "id": "B", "text": "TCP" },
      { "id": "C", "text": "ICMP" },
      { "id": "D", "text": "ARP" }
    ],
    "correctAnswer": "B",
    "subject": "Computer Networks",
    "topic": "Transport Layer",
    "difficulty": "Easy",
    "marks": 1,
    "creator": "6715fba346d1bf5b8f36a920",
    "createdAt": "2026-10-21T18:00:00.000Z",
    "updatedAt": "2026-10-21T18:00:00.000Z"
  }
}
```

#### Validation Error Responses: `400 Bad Request`
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Question must have between 2 and 6 options"
  },
  "requestId": "server-generated-uuid"
}
```
Standard validation errors:
- `"Question text is required and must be at least 5 characters"`
- `"Question must have between 2 and 6 options"`
- `"All options must have unique identifiers"`
- `"Each option must have an id and non-empty text"`
- `"correctAnswer must match one of the option IDs"`
- `"Difficulty must be one of: Easy, Medium, Hard"`
- `"Subject and topic are required"`

---

### 3.2 Filter / List Questions (Admin View)

- **Method & Path**: `GET /api/questions`
- **Role Required**: `admin`
- **Query Parameters**:
  - `subject` (optional, string): Case-insensitive partial match regex.
  - `topic` (optional, string): Case-insensitive partial match regex.
  - `difficulty` (optional, `'Easy'` | `'Medium'` | `'Hard'`): Exact match.
  - `marks` (optional, integer): Exact match on mark value.

#### Example Request
```text
GET /api/questions?subject=Computer%20Networks&difficulty=Easy
Authorization: Bearer <admin-token>
```

#### Success Response: `200 OK`
```json
{
  "count": 1,
  "questions": [
    {
      "id": "6716039546d1bf5b8f36a941",
      "questionText": "Which protocol provides reliable, connection-oriented byte-stream transmission?",
      "options": [
        { "id": "A", "text": "UDP" },
        { "id": "B", "text": "TCP" },
        { "id": "C", "text": "ICMP" },
        { "id": "D", "text": "ARP" }
      ],
      "correctAnswer": "B",
      "subject": "Computer Networks",
      "topic": "Transport Layer",
      "difficulty": "Easy",
      "marks": 1,
      "createdAt": "2026-10-21T18:00:00.000Z"
    }
  ]
}
```

---

## 4. Student-Safe Question API (`/api/quiz-questions`)

Mounted to allow authenticated students and quiz clients to retrieve questions for practice quiz sessions without leaking the answer key.

- **Method & Path**: `GET /api/quiz-questions`
- **Role Required**: Authenticated user (`student` or `admin`)
- **Query Parameters**:
  - `subject` (optional, string): Filter by subject
  - `topic` (optional, string): Filter by topic
  - `difficulty` (optional, string): Filter by difficulty
  - `quizId` (optional, string): Assigned quiz identifier (defaults to `'practice-quiz-sprint1'`)
  - `title` (optional, string): Assigned quiz title (defaults to `'Practice Quiz'`)

### 4.1 Security Invariant
The student-safe serializer (`backend/src/questions/serializer.ts`) strictly guarantees:
1. `correctAnswer` is never serialized into the response.
2. `correctOption`, `correctOptionId`, and `answerKey` are never included.
3. Plain JSON serialization does not contain the substring `"correctAnswer"`.

### 4.2 Success Response: `200 OK`
```json
{
  "quizId": "practice-quiz-sprint1",
  "title": "Computer Networks Practice",
  "questions": [
    {
      "id": "6716039546d1bf5b8f36a941",
      "questionText": "Which protocol provides reliable, connection-oriented byte-stream transmission?",
      "options": [
        { "id": "A", "text": "UDP" },
        { "id": "B", "text": "TCP" },
        { "id": "C", "text": "ICMP" },
        { "id": "D", "text": "ARP" }
      ],
      "difficulty": "Easy",
      "marks": 1,
      "subject": "Computer Networks",
      "topic": "Transport Layer"
    }
  ]
}
```

---

## 5. Quiz Attempt & Evaluation Integration (Member 3 Contract)

Member 3's Quiz Attempt module requires a clear separation between client submission and server evaluation.

### 5.1 Student Submission Contract
When a student answers questions received from `GET /api/quiz-questions`, the frontend submits:

```json
{
  "quizId": "practice-quiz-sprint1",
  "responses": [
    {
      "questionId": "6716039546d1bf5b8f36a941",
      "selectedOptionId": "B"
    }
  ]
}
```

### 5.2 Server Evaluation Contract (`backend/src/attempts/evaluate.ts`)
The server retrieves the stored questions from MongoDB to construct `EvaluationQuestion` records:

```typescript
export interface EvaluationQuestion {
  id: string;
  correctOptionId: string; // Sourced from Question.correctAnswer
}

export interface SubmittedResponse {
  questionId: string;
  selectedOptionId?: string;
}

export interface EvaluationResult {
  score: number;
  total: number;
  percentage: number;
  correct: number;
  incorrect: number;
  unanswered: number;
}
```

The server evaluates the quiz using:
```typescript
const result = evaluateQuiz(evaluationQuestions, studentResponses);
```

Because `Question.options[].id` matches `SubmittedResponse.selectedOptionId` and `Question.correctAnswer` maps to `EvaluationQuestion.correctOptionId`, the evaluation contract integrates cleanly with standard attempt scoring.

---

## 6. Test Traceability Matrix

| Test ID | Type | Description | File Location | Status |
|---|---|---|---|---|
| **UT-M2-01** | Unit | Question schema enforces all required fields | `backend/tests/unit/question-model.test.ts` | Pass |
| **UT-M2-02** | Unit | Rejects invalid options count (<2 or >6), fractional marks, and long option text in model and API | `backend/tests/unit/question-model.test.ts` | Pass |
| **UT-M2-03** | Unit | Rejects correctAnswer not matching any option id | `backend/tests/unit/question-model.test.ts` | Pass |
| **UT-M2-04** | Unit | Question filter builder query logic | `backend/tests/unit/question-filters.test.ts` | Pass |
| **UT-M2-05** | Unit | Student-safe question serializer strips correctAnswer | `backend/tests/unit/student-safe-serializer.test.ts` | Pass |
| **IT-M2-01** | Integration | Admin can create valid MCQ via POST /api/questions | `backend/tests/integration/questions.test.ts` | Pass |
| **IT-M2-02** | Integration | Rejects non-admin question creation (403/401) | `backend/tests/integration/questions.test.ts` | Pass |
| **IT-M2-03** | Integration | Admin can filter questions by subject, topic, difficulty | `backend/tests/integration/questions.test.ts` | Pass |
| **IT-M2-04** | Integration | Student accesses GET /api/quiz-questions without answers | `backend/tests/integration/questions.test.ts` | Pass |
| **IT-M2-05** | Integration | Student responses and stored question answers map to Member 3 evaluateQuiz contract | `backend/tests/integration/questions.test.ts` | Pass |
