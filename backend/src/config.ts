import { z } from 'zod';

const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(5000),
  MONGODB_URI: z.string().regex(/^mongodb(?:\+srv)?:\/\/\S+$/),
  CLIENT_ORIGIN: z.url().refine((value) => {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) && url.origin === value;
  }).default('http://localhost:5173'),
  SESSION_TTL_MINUTES: z.coerce.number().int().min(1).max(1440).default(60),
  BCRYPT_ROUNDS: z.coerce.number().int().min(10).max(14).default(12),
  MAX_UPLOAD_BYTES: z.coerce.number().int().min(1024).max(25 * 1024 * 1024).default(10 * 1024 * 1024),
  TRUST_PROXY: z.string().default('')
}).superRefine((env, context) => {
  if (env.NODE_ENV === 'production' && !env.CLIENT_ORIGIN.startsWith('https://')) {
    context.addIssue({ code: 'custom', path: ['CLIENT_ORIGIN'], message: 'HTTPS required' });
  }
  if (['true', 'false', '0', '1', '*'].includes(env.TRUST_PROXY)) {
    context.addIssue({ code: 'custom', path: ['TRUST_PROXY'], message: 'Use trusted proxy addresses' });
  }
});

export type Config = z.infer<typeof environmentSchema>;

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const result = environmentSchema.safeParse(env);
  if (!result.success) {
    // Never print environment values: a MongoDB URI may contain credentials.
    const fields = [...new Set(result.error.issues.map((issue) => issue.path.join('.')))];
    throw new Error(`Invalid environment configuration: ${fields.join(', ')}`);
  }
  return result.data;
}
