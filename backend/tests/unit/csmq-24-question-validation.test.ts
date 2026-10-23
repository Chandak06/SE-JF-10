import { describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';
import {
  createQuestionSchema,
  validateQuestionBody
} from '../../src/questions/validation.js';
import { AppError } from '../../src/errors.js';

describe('CSMQ-24 Question Validation Suite', () => {
  const baseValidPayload = {
    questionText: 'Which protocol is connection-oriented at the Transport Layer?',
    options: [
      { id: 'A', text: 'UDP' },
      { id: 'B', text: 'TCP' },
      { id: 'C', text: 'IP' },
      { id: 'D', text: 'ICMP' }
    ],
    correctAnswer: 'B',
    subject: 'Computer Networks',
    topic: 'Transport Layer',
    difficulty: 'Easy' as const,
    marks: 1
  };

  describe('Required fields validation', () => {
    it('accepts a fully compliant question payload', () => {
      const result = createQuestionSchema.safeParse(baseValidPayload);
      expect(result.success).toBe(true);
    });

    it('rejects missing or empty questionText with clear error', () => {
      const missing = { ...baseValidPayload, questionText: '' };
      const res = createQuestionSchema.safeParse(missing);
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0]?.message).toBe('Question text is required.');
      }
    });

    it('rejects questionText exceeding maximum length', () => {
      const tooLong = { ...baseValidPayload, questionText: 'a'.repeat(2001) };
      const res = createQuestionSchema.safeParse(tooLong);
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0]?.message).toMatch(/must not exceed 2000 characters/);
      }
    });

    it('rejects missing or empty subject with clear error', () => {
      const missing = { ...baseValidPayload, subject: '   ' };
      const res = createQuestionSchema.safeParse(missing);
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0]?.message).toBe('Subject is required.');
      }
    });

    it('rejects missing or empty topic with clear error', () => {
      const missing = { ...baseValidPayload, topic: '' };
      const res = createQuestionSchema.safeParse(missing);
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0]?.message).toBe('Topic is required.');
      }
    });

    it('rejects invalid difficulty values with clear error', () => {
      const invalid = { ...baseValidPayload, difficulty: 'Impossible' };
      const res = createQuestionSchema.safeParse(invalid);
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0]?.message).toBe('Difficulty must be Easy, Medium, or Hard.');
      }
    });

    it('rejects non-positive marks', () => {
      const invalidMarks = { ...baseValidPayload, marks: 0 };
      const res = createQuestionSchema.safeParse(invalidMarks);
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0]?.message).toMatch(/Marks must be at least 1/);
      }
    });
  });

  describe('Options and correctAnswer validation', () => {
    it('rejects when correctAnswer does not match any option ID', () => {
      const mismatch = { ...baseValidPayload, correctAnswer: 'E' };
      const res = createQuestionSchema.safeParse(mismatch);
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0]?.message).toBe(
          'correctAnswer must match one of the provided options.'
        );
      }
    });

    it('rejects when fewer than 2 options are provided', () => {
      const singleOption = {
        ...baseValidPayload,
        options: [{ id: 'A', text: 'UDP' }],
        correctAnswer: 'A'
      };
      const res = createQuestionSchema.safeParse(singleOption);
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0]?.message).toBe('At least two options are required.');
      }
    });

    it('rejects when more than 6 options are provided', () => {
      const sevenOptions = {
        ...baseValidPayload,
        options: [
          { id: 'A', text: '1' },
          { id: 'B', text: '2' },
          { id: 'C', text: '3' },
          { id: 'D', text: '4' },
          { id: 'E', text: '5' },
          { id: 'F', text: '6' },
          { id: 'G', text: '7' }
        ],
        correctAnswer: 'A'
      };
      const res = createQuestionSchema.safeParse(sevenOptions);
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0]?.message).toBe('A maximum of 6 options is allowed.');
      }
    });

    it('rejects duplicate option IDs', () => {
      const duplicateIds = {
        ...baseValidPayload,
        options: [
          { id: 'A', text: 'First' },
          { id: 'A', text: 'Second' }
        ],
        correctAnswer: 'A'
      };
      const res = createQuestionSchema.safeParse(duplicateIds);
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0]?.message).toBe('Option IDs must be unique.');
      }
    });

    it('rejects option with missing or blank text', () => {
      const blankOptionText = {
        ...baseValidPayload,
        options: [
          { id: 'A', text: 'Valid' },
          { id: 'B', text: '   ' }
        ],
        correctAnswer: 'A'
      };
      const res = createQuestionSchema.safeParse(blankOptionText);
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0]?.message).toBe('Option text is required.');
      }
    });
  });

  describe('Unexpected fields and middleware behavior', () => {
    it('rejects unrecognized extra fields in request body', () => {
      const extraField = {
        ...baseValidPayload,
        maliciousRole: 'admin',
        injectedScript: '<script>'
      };
      const res = createQuestionSchema.safeParse(extraField);
      expect(res.success).toBe(false);
    });

    it('middleware throws AppError with 400 status and message on failure', () => {
      const middleware = validateQuestionBody(createQuestionSchema);
      const req = { body: { ...baseValidPayload, correctAnswer: 'Z' } } as Request;
      const res = {} as Response;
      const next = vi.fn();

      expect(() => middleware(req, res, next)).toThrowError(AppError);
      try {
        middleware(req, res, next);
      } catch (err) {
        const appErr = err as AppError;
        expect(appErr.status).toBe(400);
        expect(appErr.code).toBe('VALIDATION_ERROR');
        expect(appErr.message).toBe('correctAnswer must match one of the provided options.');
      }
    });

    it('middleware attaches parsed data and proceeds when valid', () => {
      const middleware = validateQuestionBody(createQuestionSchema);
      const req = { body: { ...baseValidPayload } } as Request;
      const res = {} as Response;
      const next = vi.fn();

      middleware(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
      expect(req.body).toEqual(baseValidPayload);
    });
  });
});
