import { z } from 'zod'

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    API_PORT: z.coerce.number().int().min(1).max(65535).default(3001),
    DATABASE_URL: z.string().url(),
    REDIS_URL: z.string().url().optional(),
    JWT_SECRET: z.string().min(16),
    JWT_REFRESH_SECRET: z.string().min(16),
    JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
    JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
    CORS_ORIGINS: z.string().default('http://localhost:3000'),
    AUTO_SEED_DATABASE: z.enum(['true', 'false']).default('false'),
    ENABLE_FIXTURE_MODE: z.enum(['true', 'false']).default('false'),
    FIXTURE_SCENARIO: z
      .enum(['minimal', 'realistic', 'stress_test', 'broken_metadata'])
      .default('realistic'),
    TWITCH_CLIENT_ID: z.string().optional(),
    TWITCH_CLIENT_SECRET: z.string().optional(),
    IGDB_OFFLINE_MODE: z.enum(['true', 'false']).default('false'),
    DISCOVERY_TRENDING_RECENCY_DECAY: z.coerce.number().default(1.5),
    DISCOVERY_TOP_RATED_MIN_REVIEWS: z.coerce.number().int().min(0).default(1),
    DISCOVERY_HIDDEN_GEMS_MAX_REVIEWS: z.coerce.number().int().min(0).default(10),
    DISCOVERY_SHELF_DEFAULT_LIMIT: z.coerce.number().int().min(1).default(12),
    FIREBASE_PROJECT_ID: z.string().min(1),
    FIREBASE_CLIENT_EMAIL: z.string().email(),
    FIREBASE_PRIVATE_KEY: z.string().min(1),
  })
  .superRefine((env, ctx) => {
    if (env.NODE_ENV !== 'production') return

    const unsafeSecrets = new Set([
      'change-me-in-production',
      'change-me-in-production-refresh',
      'replace-with-at-least-32-random-characters',
      'replace-with-another-32-random-characters',
    ])

    if (unsafeSecrets.has(env.JWT_SECRET)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['JWT_SECRET'],
        message: 'JWT_SECRET must be changed in production',
      })
    }

    if (unsafeSecrets.has(env.JWT_REFRESH_SECRET)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['JWT_REFRESH_SECRET'],
        message: 'JWT_REFRESH_SECRET must be changed in production',
      })
    }
  })

export function validateEnv(config: Record<string, unknown>) {
  const parsed = envSchema.safeParse(config)
  if (!parsed.success) {
    throw new Error(parsed.error.message)
  }
  return parsed.data
}
