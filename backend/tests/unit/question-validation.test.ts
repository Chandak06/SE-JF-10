import { describe, expect, it } from 'vitest';
import {
  createQuestionSchema
} from '../../src/questions/validation.js';

describe('Question validation (CSMQ-24 / UT-M2-01..03)', () => {
  const validMCQ = {
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
    marks: 1
  };

  it('UT-M2-01: valid MCQ passes validation', () => {
    const result = createQuestionSchema.safeParse(validMCQ);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.questionText).toBe(validMCQ.questionText);
      expect(result.data.correctAnswer).toBe('B');
      expect(result.data.marks).toBe(1);
    }
  });

  it('UT-M2-02: missing questionText is rejected with clear message', () => {
    const payload = { ...validMCQ, questionText: '' };
    const result = createQuestionSchema.safeParse(payload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toMatch(/Question text is required/);
    }
  });

  it('UT-M2-02: missing subject is rejected with clear message', () => {
    const payload = { ...validMCQ, subject: '' };
    const result = createQuestionSchema.safeParse(payload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toMatch(/Subject is required/);
    }
  });

  it('UT-M2-02: missing topic is rejected with clear message', () => {
    const payload = { ...validMCQ, topic: '' };
    const result = createQuestionSchema.safeParse(payload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toMatch(/Topic is required/);
    }
  });

  it('UT-M2-02: invalid difficulty is rejected', () => {
    const payload = { ...validMCQ, difficulty: 'Extreme' };
    const result = createQuestionSchema.safeParse(payload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toMatch(/Difficulty must be Easy, Medium, or Hard/);
    }
  });

  it('UT-M2-02: fewer than 2 options is rejected', () => {
    const payload = {
      ...validMCQ,
      options: [{ id: 'A', text: 'UDP' }]
    };
    const result = createQuestionSchema.safeParse(payload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toMatch(/At least two options are required/);
    }
  });

  it('UT-M2-02: duplicate option IDs are rejected', () => {
    const payload = {
      ...validMCQ,
      options: [
        { id: 'A', text: 'UDP' },
        { id: 'A', text: 'TCP' }
      ]
    };
    const result = createQuestionSchema.safeParse(payload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toMatch(/Option IDs must be unique/);
    }
  });

  it('UT-M2-03: correctAnswer not matching any option is rejected with clear message', () => {
    const payload = { ...validMCQ, correctAnswer: 'Z' };
    const result = createQuestionSchema.safeParse(payload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toMatch(
        /correctAnswer must match one of the provided options/
      );
    }
  });

  it('rejects option with empty text', () => {
    const payload = {
      ...validMCQ,
      options: [
        { id: 'A', text: '' },
        { id: 'B', text: 'TCP' }
      ]
    };
    const result = createQuestionSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });
});
