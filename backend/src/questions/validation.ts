import type { RequestHandler } from 'express';
import { z } from 'zod';
import { AppError } from '../errors.js';

export const optionInputSchema = z.strictObject({
  id: z.string().trim().min(1, 'Option id is required.'),
  text: z.string().trim().min(1, 'Option text is required.').max(500)
});

export const createQuestionSchema = z
  .strictObject({
    questionText: z
      .string()
      .trim()
      .min(1, 'Question text is required.')
      .max(2000, 'Question text must not exceed 2000 characters.'),
    options: z
      .array(optionInputSchema)
      .min(2, 'At least two options are required.')
      .max(6, 'A maximum of 6 options is allowed.'),
    correctAnswer: z
      .string()
      .trim()
      .min(1, 'Correct answer is required.'),
    subject: z
      .string()
      .trim()
      .min(1, 'Subject is required.')
      .max(100, 'Subject must not exceed 100 characters.'),
    topic: z
      .string()
      .trim()
      .min(1, 'Topic is required.')
      .max(100, 'Topic must not exceed 100 characters.'),
    difficulty: z.enum(['Easy', 'Medium', 'Hard'], {
      message: 'Difficulty must be Easy, Medium, or Hard.'
    }),
    marks: z
      .number()
      .int('Marks must be an integer.')
      .min(1, 'Marks must be at least 1.')
      .default(1)
  })
  .superRefine((data, ctx) => {
    const ids = data.options.map((opt) => opt.id);
    if (new Set(ids).size !== ids.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Option IDs must be unique.',
        path: ['options']
      });
    }

    if (!ids.includes(data.correctAnswer)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'correctAnswer must match one of the provided options.',
        path: ['correctAnswer']
      });
    }
  });

export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;

export function validateQuestionBody(schema: z.ZodType): RequestHandler {
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
