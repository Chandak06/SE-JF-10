import { describe, expect, it } from 'vitest';
import {
  toStudentSafeQuestion,
  toStudentSafeQuestions,
  toStudentSafeQuizPayload
} from '../../src/questions/serializer.js';

describe('Student-safe question payload serializer (CSMQ-26 / UT-M2-05)', () => {
  const fullInternalQuestion = {
    _id: '64f8b2d1c9a123456789abcd',
    questionText: 'Which protocol provides reliable, connection-oriented communication?',
    options: [
      { id: 'A', text: 'UDP' },
      { id: 'B', text: 'TCP' },
      { id: 'C', text: 'ARP' },
      { id: 'D', text: 'ICMP' }
    ],
    correctAnswer: 'B',
    subject: 'Computer Networks',
    topic: 'Transport Layer',
    difficulty: 'Easy' as const,
    marks: 1,
    creator: '64f8b2d1c9a1234567890000',
    createdAt: new Date('2026-10-10T10:00:00Z'),
    updatedAt: new Date('2026-10-10T10:00:00Z')
  };

  it('UT-M2-05: correctly strips correctAnswer from student-facing question object', () => {
    const studentQuestion = toStudentSafeQuestion(fullInternalQuestion);

    // Explicit check that correctAnswer is completely absent
    expect(studentQuestion).not.toHaveProperty('correctAnswer');
    expect('correctAnswer' in studentQuestion).toBe(false);
    expect(studentQuestion).not.toHaveProperty('correctOptionId');
    expect(studentQuestion).not.toHaveProperty('correctOption');
    expect(studentQuestion).not.toHaveProperty('answerKey');

    // JSON serialization verification
    const jsonString = JSON.stringify(studentQuestion);
    expect(jsonString).not.toMatch(/"correctAnswer"/);
    expect(jsonString).not.toMatch(/"correctOption"/);

    // Verify all required student fields are preserved
    expect(studentQuestion.id).toBe(fullInternalQuestion._id);
    expect(studentQuestion.questionText).toBe(fullInternalQuestion.questionText);
    expect(studentQuestion.options).toHaveLength(4);
    expect(studentQuestion.options).toEqual(fullInternalQuestion.options);
    expect(studentQuestion.difficulty).toBe('Easy');
    expect(studentQuestion.marks).toBe(1);
    expect(studentQuestion.subject).toBe('Computer Networks');
    expect(studentQuestion.topic).toBe('Transport Layer');
  });

  it('UT-M2-05: serializes an array of questions without exposing answers', () => {
    const list = [
      fullInternalQuestion,
      {
        _id: '64f8b2d1c9a123456789abce',
        questionText: 'Which data structure follows FIFO?',
        options: [
          { id: 'A', text: 'Stack' },
          { id: 'B', text: 'Queue' }
        ],
        correctAnswer: 'B',
        difficulty: 'Easy' as const,
        marks: 1
      }
    ];

    const safeList = toStudentSafeQuestions(list);
    expect(safeList).toHaveLength(2);
    for (const q of safeList) {
      expect(q).not.toHaveProperty('correctAnswer');
      expect('correctAnswer' in q).toBe(false);
    }
  });

  it('UT-M2-05 / IT-M2-05: creates quiz payload structure matching Member 3 attempt-api-contract', () => {
    const payload = toStudentSafeQuizPayload([fullInternalQuestion], {
      quizId: 'practice-quiz-101',
      title: 'Computer Science Practice Quiz'
    });

    expect(payload.quizId).toBe('practice-quiz-101');
    expect(payload.title).toBe('Computer Science Practice Quiz');
    expect(payload.questions).toHaveLength(1);

    const question = payload.questions[0];
    expect(question).toBeDefined();
    expect(question!.id).toBe(fullInternalQuestion._id);
    expect(question!.questionText).toBe(fullInternalQuestion.questionText);
    expect(question!.options).toEqual(fullInternalQuestion.options);
    expect(question!).not.toHaveProperty('correctAnswer');
  });

  it('handles question objects without options gracefully', () => {
    const safe = toStudentSafeQuestion({
      _id: '123',
      questionText: 'Sample text'
    });

    expect(safe.id).toBe('123');
    expect(safe.options).toEqual([]);
    expect(safe.marks).toBe(1);
  });

  it('handles missing id, missing questionText, and default payload options', () => {
    const safeNoId = toStudentSafeQuestion({
      options: [{ id: undefined, text: undefined }]
    });
    expect(safeNoId.id).toBe('');
    expect(safeNoId.questionText).toBe('');
    expect(safeNoId.options).toEqual([{ id: '', text: '' }]);

    const defaultPayload = toStudentSafeQuizPayload([]);
    expect(defaultPayload.quizId).toBe('practice-quiz-sprint1');
    expect(defaultPayload.title).toBe('Practice Quiz');
    expect(defaultPayload.questions).toEqual([]);
  });
});
