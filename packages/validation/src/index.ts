import { z } from 'zod'

// ─── Auth ────────────────────────────────────────────────────────────────────

export const registerSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(32)
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username: letters, numbers, _ and - only'),
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .max(128)
    .regex(/[A-Z]/, 'Password needs uppercase')
    .regex(/[0-9]/, 'Password needs number'),
})
export type RegisterInput = z.infer<typeof registerSchema>

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})
export type LoginInput = z.infer<typeof loginSchema>

// ─── Review ──────────────────────────────────────────────────────────────────

export const createReviewSchema = z.object({
  gameId: z.string().cuid(),
  title: z.string().max(200).optional(),
  body: z.string().min(10).max(10000),
})
export type CreateReviewInput = z.infer<typeof createReviewSchema>

export const updateReviewSchema = createReviewSchema.partial().omit({ gameId: true })
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>

// ─── Rating ──────────────────────────────────────────────────────────────────

export const createRatingSchema = z.object({
  gameId: z.string().cuid(),
  score: z.number().int().min(1).max(10),
})
export type CreateRatingInput = z.infer<typeof createRatingSchema>

// ─── List ────────────────────────────────────────────────────────────────────

export const createListSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  visibility: z.enum(['PUBLIC', 'PRIVATE', 'UNLISTED']).default('PUBLIC'),
})
export type CreateListInput = z.infer<typeof createListSchema>

// ─── Search ──────────────────────────────────────────────────────────────────

export const searchQuerySchema = z.object({
  q: z.string().min(1).max(200),
  genre: z.string().optional(),
  platform: z.string().optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
})
export type SearchQuery = z.infer<typeof searchQuerySchema>

// ─── User Profile ────────────────────────────────────────────────────────────

export const updateProfileSchema = z.object({
  displayName: z.string().max(64).optional(),
  bio: z.string().max(500).optional(),
})
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
