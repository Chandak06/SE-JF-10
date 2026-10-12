import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import type { AuthService } from '../security/auth-service.js';
import { requireAuth } from '../middleware/auth.js';
import { loginSchema, registerSchema, validateBody } from '../middleware/validation.js';

/** Shared integration adapter. Member 1 supplies AccountRepository and owns the User model/UI. */
export function createAuthRouter(auth: AuthService, limit = 20) {
  const router = Router();
  const limiter = rateLimit({
    windowMs: 15 * 60_000, limit, standardHeaders: 'draft-8', legacyHeaders: false,
    message: { error: { code: 'RATE_LIMITED', message: 'Too many attempts. Try again later.' } }
  });
  router.use((_req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
  router.post('/register', limiter, validateBody(registerSchema), async (req, res) => {
    res.status(201).json({ authenticatedUser: await auth.register(req.body) });
  });
  router.post('/login', limiter, validateBody(loginSchema), async (req, res) => {
    res.json(await auth.login(req.body.email, req.body.password));
  });
  router.get('/me', requireAuth(auth), (req, res) => { res.json({ authenticatedUser: req.user }); });
  router.post('/logout', requireAuth(auth), async (req, res) => {
    await auth.logout(req.authSession!.tokenHash);
    res.sendStatus(204);
  });
  return router;
}
