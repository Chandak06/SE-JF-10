import { randomUUID } from 'node:crypto';
import express, { type Router } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import type { Config } from './config.js';
import { AppError, errorHandler, notFound, type SafeLogger } from './errors.js';
import type { AuthService } from './security/auth-service.js';
import { createAuthRouter } from './routes/auth.js';
import { requireAuth, requireRole } from './middleware/auth.js';

export interface FeatureRouters {
  materials?: Router;
  questions?: Router;
  attempts?: Router;
}

export function createApp({ config, auth, features = {}, databaseReady = () => true, logger, authLimit }: {
  config: Config; auth?: AuthService; features?: FeatureRouters;
  databaseReady?: () => boolean; logger?: SafeLogger; authLimit?: number;
}) {
  if (!auth && Object.keys(features).length) throw new Error('Feature routes require authentication.');
  const app = express();
  app.disable('x-powered-by');
  if (config.TRUST_PROXY) app.set('trust proxy', config.TRUST_PROXY.split(',').map((value) => value.trim()));
  app.use((req, res, next) => {
    req.requestId = randomUUID();
    res.set('X-Request-Id', req.requestId);
    next();
  });
  app.use(helmet());
  app.use(cors({ origin: config.CLIENT_ORIGIN, methods: ['GET', 'POST', 'DELETE', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization'] }));
  app.use('/api', (req, _res, next) => {
    if (config.NODE_ENV === 'production' && !req.secure) throw new AppError(400, 'HTTPS_REQUIRED', 'Use HTTPS for API requests.');
    next();
  });
  app.use(express.json({ limit: '16kb' }));
  app.get('/health', (_req, res) => { res.json({ status: 'ok' }); });
  app.get('/ready', (_req, res) => {
    const ready = databaseReady();
    res.status(ready ? 200 : 503).json({ status: ready ? 'ready' : 'unavailable' });
  });
  if (auth) {
    app.use('/api/auth', createAuthRouter(auth, authLimit));
    app.use('/api', (_req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
    if (features.materials) app.use('/api/materials', requireAuth(auth), features.materials);
    // Sprint 1 question management is administrator-only, including filtering.
    if (features.questions) app.use('/api/questions', requireAuth(auth), requireRole('admin'), features.questions);
    if (features.attempts) app.use('/api/attempts', requireAuth(auth), requireRole('student'), features.attempts);
  }
  app.use(notFound);
  app.use(errorHandler(logger));
  return app;
}
