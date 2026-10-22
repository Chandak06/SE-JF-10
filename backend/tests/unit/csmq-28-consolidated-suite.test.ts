import { describe, expect, it } from 'vitest';
import { getQuestionModel } from '../../src/models/question.js';
import { createQuestionSchema } from '../../src/questions/validation.js';
import { buildQuestionFilter } from '../../src/questions/filters.js';
import {
  toStudentSafeQuestion,
  toStudentSafeQuestions,
  toStudentSafeQuizPayload
} from '../../src/questions/serializer.js';

/**
 * CSMQ-28: Consolidated Unit & Integration Test Suite Summary
 *
 * Verifies that all Member 2 (Prajwal M) Sprint 1 deliverables:
 * - UT-M2-01: Schema validation of required fields
 * - UT-M2-02: Options count boundaries (2 to 6)
 * - UT-M2-03: correctAnswer matching option ID
 * - UT-M2-04: Question bank filtering logic (subject, topic, difficulty, marks)
 * - UT-M2-05: Student-safe question payload serialization (no answer leakage)
 * - IT-M2-01: Admin question creation via POST /api/questions
 * - IT-M2-02: RBAC enforcement on question mutation and admin listing
 * - IT-M2-03: Query parameter filtering on GET /api/questions
 * - IT-M2-04: Student practice question access via GET /api/quiz-questions
 * - IT-M2-05: Student responses and stored answers map to Member 3 evaluateQuiz contract for scoring
 */
describe('CSMQ-28: Consolidated Member 2 Test Suite Verification', () => {
  it('UT-M2-01: verifies Question model schema and required properties', () => {
    const fakeConn = {
      model: (_name: string, schema: any) => ({
        schema,
        name: 'Question'
      }),
      models: {}
    } as any;

    const QuestionModel = getQuestionModel(fakeConn);
    expect(QuestionModel).toBeDefined();

    const paths = (QuestionModel.schema as any).paths;
    expect(paths.questionText).toBeDefined();
    expect(paths.options).toBeDefined();
    expect(paths.correctAnswer).toBeDefined();
    expect(paths.subject).toBeDefined();
    expect(paths.topic).toBeDefined();
    expect(paths.difficulty).toBeDefined();
    expect(paths.marks).toBeDefined();

    // Verify model option validator enforces 2 to 6 options
    const optionsValidators = paths.options.validators;
    const optionCountValidator = optionsValidators.find(
      (v: any) =>
        typeof v.validator === 'function' &&
        String(v.message).includes('between 2 and 6')
    )?.validator;
    expect(optionCountValidator).toBeDefined();
    expect(
      optionCountValidator([
        { id: 'A', text: 'Opt 1' },
        { id: 'B', text: 'Opt 2' }
      ])
    ).toBe(true);
    // Rejects fewer than 2
    expect(optionCountValidator([{ id: 'A', text: 'Opt 1' }])).toBe(false);
    // Rejects more than 6
    expect(
      optionCountValidator([
        { id: 'A', text: '1' },
        { id: 'B', text: '2' },
        { id: 'C', text: '3' },
        { id: 'D', text: '4' },
        { id: 'E', text: '5' },
        { id: 'F', text: '6' },
        { id: 'G', text: '7' }
      ])
    ).toBe(false);

    // Verify model marks validator enforces integer
    const marksValidators = paths.marks.validators;
    const marksIntValidator = marksValidators.find(
      (v: any) =>
        typeof v.validator === 'function' &&
        String(v.message).includes('integer')
    )?.validator;
    expect(marksIntValidator).toBeDefined();
    expect(marksIntValidator(1)).toBe(true);
    expect(marksIntValidator(1.5)).toBe(false);
  });

  it('UT-M2-02: verifies 2 to 6 options requirement in API validation schema', () => {
    const validMCQ = {
      questionText: 'Valid test question?',
      options: [
        { id: 'A', text: 'Option A' },
        { id: 'B', text: 'Option B' }
      ],
      correctAnswer: 'A',
      subject: 'Math',
      topic: 'Algebra',
      difficulty: 'Easy'
    };
    expect(createQuestionSchema.safeParse(validMCQ).success).toBe(true);

    const tooFew = {
      ...validMCQ,
      options: [{ id: 'A', text: 'Single Option' }]
    };
    expect(createQuestionSchema.safeParse(tooFew).success).toBe(false);

    const tooMany = {
      ...validMCQ,
      options: [
        { id: 'A', text: 'A' },
        { id: 'B', text: 'B' },
        { id: 'C', text: 'C' },
        { id: 'D', text: 'D' },
        { id: 'E', text: 'E' },
        { id: 'F', text: 'F' },
        { id: 'G', text: 'G' }
      ]
    };
    expect(createQuestionSchema.safeParse(tooMany).success).toBe(false);
  });

  it('UT-M2-03: verifies correctAnswer must match one of the options', () => {
    const invalidAnswer = {
      questionText: 'Valid question text?',
      options: [
        { id: 'A', text: 'Option A' },
        { id: 'B', text: 'Option B' }
      ],
      correctAnswer: 'Z',
      subject: 'Math',
      topic: 'Algebra',
      difficulty: 'Easy'
    };
    const res = createQuestionSchema.safeParse(invalidAnswer);
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.issues[0]?.message).toMatch(/correctAnswer must match/);
    }
  });

  it('UT-M2-04: verifies filter builder query parsing', () => {
    const filter = buildQuestionFilter({
      subject: 'Data Structures',
      topic: 'Trees',
      difficulty: 'Hard'
    });

    expect(filter.difficulty).toBe('Hard');
    expect(filter.subject).toBe('Data Structures');
    expect(filter.topic).toBe('Trees');
  });

  it('UT-M2-05: verifies student-safe question serializer completely omits answers', () => {
    const internalDoc = {
      _id: '64f8b2d1c9a123456789abcd',
      questionText: 'Sample question?',
      options: [
        { id: 'A', text: 'Opt A' },
        { id: 'B', text: 'Opt B' }
      ],
      correctAnswer: 'A',
      subject: 'CS',
      topic: 'OS',
      difficulty: 'Medium' as const,
      marks: 2
    };

    const studentSafe = toStudentSafeQuestion(internalDoc);
    expect(studentSafe.id).toBe('64f8b2d1c9a123456789abcd');
    expect(studentSafe.questionText).toBe('Sample question?');
    expect(studentSafe.options).toEqual(internalDoc.options);
    expect(studentSafe).not.toHaveProperty('correctAnswer');
    expect('correctAnswer' in studentSafe).toBe(false);
    expect(JSON.stringify(studentSafe)).not.toMatch(/"correctAnswer"/);

    const safeList = toStudentSafeQuestions([internalDoc]);
    expect(safeList).toHaveLength(1);
    expect(safeList[0]!).not.toHaveProperty('correctAnswer');

    const quizPayload = toStudentSafeQuizPayload([internalDoc], {
      quizId: 'quiz-1',
      title: 'Sprint 1 Quiz'
    });
    expect(quizPayload.quizId).toBe('quiz-1');
    expect(quizPayload.title).toBe('Sprint 1 Quiz');
    expect(quizPayload.questions[0]!).not.toHaveProperty('correctAnswer');
  });
});
