import { Router } from 'express';
import { z } from 'zod';
import { AppError } from '../errors.js';
import { requireRole } from '../middleware/auth.js';
import { validateBody } from '../middleware/validation.js';

export interface ModerationItem { id: string; title: string }
/** Feature owners implement removal and exclusion from their own read/attempt paths. */
export interface ModerationResource {
  list(limit: number): Promise<ModerationItem[]>;
  remove(id: string, administratorId: string): Promise<boolean>;
}
export type ModerationResources = Partial<Record<'materials' | 'questions' | 'quizzes', ModerationResource>>;
export const objectId = z.string().regex(/^[a-fA-F0-9]{24}$/);

export function createModerationRouter(resources: ModerationResources) {
  const router = Router();
  router.use(requireRole('admin'));
  router.get('/resources', (_req, res) => { res.json({ resources: Object.keys(resources).filter(key => resources[key as keyof ModerationResources]) }); });
  for (const kind of ['materials', 'questions', 'quizzes'] as const) {
    const resource = resources[kind];
    if (!resource) continue;
    router.get('/' + kind, async (req, res) => {
      const parsed = z.strictObject({ limit: z.coerce.number().int().min(1).max(50).default(25) }).safeParse(req.query);
      if (!parsed.success) throw new AppError(400, 'INVALID_QUERY', 'Use a limit between 1 and 50.');
      res.json({ items: await resource.list(parsed.data.limit) });
    });
    router.delete('/' + kind + '/:id', validateBody(z.strictObject({ confirmed: z.literal(true) })), async (req, res) => {
      const parsed = objectId.safeParse(req.params.id);
      if (!parsed.success) throw new AppError(400, 'INVALID_ID', 'A valid resource identifier is required.');
      if (!await resource.remove(parsed.data, req.user!.id)) throw new AppError(404, 'NOT_FOUND', 'Resource is unavailable or already removed.');
      res.sendStatus(204);
    });
  }
  return router;
}
