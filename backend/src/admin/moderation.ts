import { Router } from 'express';
import { z } from 'zod';
import { AppError } from '../errors.js';
import { requireRole } from '../middleware/auth.js';
import { validateBody } from '../middleware/validation.js';

export interface ModerationItem { id: string; title: string; subject?: string; difficulty?: string }
export interface ModerationFilterOptions { subjects: string[]; difficulties: string[] }
export interface ModerationFilters { subject?: string; difficulty?: string }
/** Feature owners implement removal and exclusion from their own read/attempt paths. */
export interface ModerationResource {
  list(limit: number, filters: ModerationFilters): Promise<ModerationItem[]>;
  filterOptions(): Promise<ModerationFilterOptions>;
  remove(id: string, administratorId: string): Promise<boolean>;
  removeAll(administratorId: string): Promise<number>;
}
export type ModerationResources = Partial<Record<'materials' | 'questions' | 'quizzes', ModerationResource>>;
export const objectId = z.string().regex(/^[a-fA-F0-9]{24}$/);

export function createModerationRouter(resources: ModerationResources) {
  const router = Router();
  router.use(requireRole('admin'));
  router.get('/resources', (_req, res) => { res.json({ resources: Object.keys(resources).filter(key => resources[key as keyof ModerationResources]) }); });
  for (const kind of ['materials', 'questions', 'quizzes'] as const) {
    const resource = resources[kind];
    if (!resource) {
      router.all(['/' + kind, '/' + kind + '/:id'], () => {
        throw new AppError(503, 'MODULE_UNAVAILABLE', 'This content module is not integrated yet.');
      });
      continue;
    }
    router.get('/' + kind, async (req, res) => {
      const filterText = z.string().trim().min(1).max(100).regex(/^[^<>\x00-\x1f\x7f]*$/).optional();
      const parsed = z.strictObject({
        limit: z.coerce.number().int().min(1).max(50).default(50),
        subject: filterText,
        difficulty: z.enum(['Easy', 'Medium', 'Hard']).optional()
      }).safeParse(req.query);
      if (!parsed.success) throw new AppError(400, 'INVALID_QUERY', 'Use valid moderation filters and a limit between 1 and 50.');
      if (parsed.data.difficulty && kind !== 'questions') {
        throw new AppError(400, 'INVALID_QUERY', 'Difficulty filtering is available for questions only.');
      }
      const [items, filters] = await Promise.all([
        resource.list(parsed.data.limit, { subject: parsed.data.subject, difficulty: parsed.data.difficulty }),
        resource.filterOptions()
      ]);
      res.json({ items, filters });
    });
    router.delete('/' + kind, validateBody(z.strictObject({ confirmed: z.literal(true) })), async (req, res) => {
      const removedCount = await resource.removeAll(req.user!.id);
      res.json({ removedCount });
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
