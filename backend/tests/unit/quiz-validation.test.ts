import { describe, expect, it } from 'vitest';
import { Types } from 'mongoose';
import { createQuizSchema } from '../../src/quizzes/validation.js';

describe('Quiz Validation Unit (CSMQ-48)', () => {
  const validQuestionId1 = new Types.ObjectId().toString();
  const validQuestionId2 = new Types.ObjectId().toString();

  it('accepts valid quiz creation payload', () => {
    const input = {
      title: 'Operating Systems Concurrency Quiz',
      subject: 'Operating Systems',
      questionIds: [validQuestionId1, validQuestionId2]
    };

    const result = createQuizSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('rejects missing or empty title', () => {
    const resultEmpty = createQuizSchema.safeParse({
      title: '   ',
      subject: 'Operating Systems',
      questionIds: [validQuestionId1]
    });
    expect(resultEmpty.success).toBe(false);

    const resultMissing = createQuizSchema.safeParse({
      subject: 'Operating Systems',
      questionIds: [validQuestionId1]
    });
    expect(resultMissing.success).toBe(false);
  });

  it('rejects title longer than 150 characters', () => {
    const result = createQuizSchema.safeParse({
      title: 'A'.repeat(151),
      subject: 'Operating Systems',
      questionIds: [validQuestionId1]
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing or empty subject', () => {
    const result = createQuizSchema.safeParse({
      title: 'Valid Title',
      subject: '   ',
      questionIds: [validQuestionId1]
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty questions array', () => {
    const result = createQuizSchema.safeParse({
      title: 'Valid Title',
      subject: 'Valid Subject',
      questionIds: []
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain('At least one question must be selected.');
    }
  });

  it('rejects invalid question ID formatting', () => {
    const result = createQuizSchema.safeParse({
      title: 'Valid Title',
      subject: 'Valid Subject',
      questionIds: ['not-a-valid-hex-24-id']
    });
    expect(result.success).toBe(false);
  });

  it('rejects duplicate question IDs in selection', () => {
    const result = createQuizSchema.safeParse({
      title: 'Valid Title',
      subject: 'Valid Subject',
      questionIds: [validQuestionId1, validQuestionId1]
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain('Question IDs must be unique.');
    }
  });

  it('rejects extra unrecognized fields (strict schema)', () => {
    const result = createQuizSchema.safeParse({
      title: 'Valid Title',
      subject: 'Valid Subject',
      questionIds: [validQuestionId1],
      unrecognizedField: 'malicious'
    });
    expect(result.success).toBe(false);
  });
});
