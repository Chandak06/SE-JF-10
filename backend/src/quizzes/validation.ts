import type { RequestHandler } from 'express';
import { z } from 'zod';
import { AppError } from '../errors.js';

export const objectIdSchema = z
  .string()
  .trim()
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid question ID format.');

export const createQuizSchema = z
  .strictObject({
    title: z
      .string()
      .trim()
      .min(1, 'Title is required.')
      .max(150, 'Title must not exceed 150 characters.'),
    subject: z
      .string()
      .trim()
      .min(1, 'Subject is required.')
      .max(100, 'Subject must not exceed 100 characters.'),
    questionIds: z
      .array(objectIdSchema)
      .min(1, 'At least one question must be selected.')
  })
  .superRefine((data, ctx) => {
    if (new Set(data.questionIds).size !== data.questionIds.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Question IDs must be unique.',
        path: ['questionIds']
      });
    }
  });

export type CreateQuizInput = z.infer<typeof createQuizSchema>;

export function validateQuizBody(schema: z.ZodType): RequestHandler {
  return (req, _res, next) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      const message =
        firstIssue?.message ??
        'Request contains missing, invalid, or unexpected fields.';
      throw new AppError(400, 'VALIDATION_ERROR', message);
    }
    req.body = parsed.data;
    next();
  };
}
