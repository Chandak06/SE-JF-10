
import { z } from 'zod';

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ID.');

const responseSchema = z.strictObject({
  questionId: objectIdSchema,
  selectedOptionId: z.string().trim().min(1).max(50)
});

export const attemptSubmissionSchema = z
  .strictObject({
    quizId: objectIdSchema,
    responses: z.array(responseSchema).max(500)
  })
  .superRefine((data, ctx) => {
    const seen = new Set<string>();

    data.responses.forEach((response, index) => {
      const id = response.questionId.toLowerCase();

      if (seen.has(id)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Duplicate question response.',
          path: ['responses', index, 'questionId']
        });
      }

      seen.add(id);
    });
  });

export type AttemptSubmissionInput =
  z.infer<typeof attemptSubmissionSchema>;
