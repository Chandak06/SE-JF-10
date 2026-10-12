import type { RequestHandler } from 'express';
import { z } from 'zod';
import { AppError } from '../errors.js';
import { isValidPassword } from '../security/password.js';

export const emailSchema = z.string().trim().toLowerCase().pipe(z.email().max(254));
export const passwordSchema = z.string().refine(isValidPassword);
export const registerSchema = z.strictObject({
  name: z.string().trim().min(1).max(100).regex(/^[^<>\x00-\x1f\x7f]+$/),
  email: emailSchema,
  password: passwordSchema
});
export const loginSchema = z.strictObject({ email: emailSchema, password: passwordSchema });

export function validateBody(schema: z.ZodType): RequestHandler {
  return (req, _res, next) => {
    const parsed = schema.safeParse(req.body);
    // Do not reflect untrusted values or entire Zod errors into the response.
    if (!parsed.success) throw new AppError(400, 'VALIDATION_ERROR', 'Request contains missing, invalid, or unexpected fields.');
    req.body = parsed.data;
    next();
  };
}
