import type { ErrorRequestHandler, RequestHandler } from 'express';

export class AppError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
  }
}

export const unauthorized = () => new AppError(401, 'UNAUTHENTICATED', 'Authentication required.');
export const invalidCredentials = () => new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password.');
export const notFound: RequestHandler = (_req, _res, next) => {
  next(new AppError(404, 'NOT_FOUND', 'Resource not found.'));
};

export type SafeLogger = (event: { requestId?: string; code: string; status: number }) => void;

export function errorHandler(logger: SafeLogger = () => {}): ErrorRequestHandler {
  return (error: unknown, req, res, next) => {
    if (res.headersSent) return next(error);
    let safe = new AppError(500, 'INTERNAL_ERROR', 'An unexpected error occurred.');
    if (error instanceof AppError) safe = error;
    else if (error && typeof error === 'object') {
      if ('type' in error && error.type === 'entity.parse.failed') {
        safe = new AppError(400, 'INVALID_JSON', 'Request body must be valid JSON.');
      } else if ('type' in error && error.type === 'entity.too.large') {
        safe = new AppError(413, 'PAYLOAD_TOO_LARGE', 'Request body exceeds the allowed size.');
      } else if ('code' in error && error.code === 11000) {
        safe = new AppError(409, 'CONFLICT', 'An account with those details already exists.');
      }
    }
    // No URL/query, body, headers, error stack or DB message reaches the log.
    if (safe.status >= 500) logger({ requestId: req.requestId, code: safe.code, status: safe.status });
    res.status(safe.status).json({ error: { code: safe.code, message: safe.message }, requestId: req.requestId });
  };
}
