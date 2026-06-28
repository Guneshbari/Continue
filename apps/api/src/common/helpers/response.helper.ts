/**
 * Centralized API response formatters.
 * Use these in controllers instead of returning raw data.
 *
 * All responses follow the shared ApiResponse<T> contract from @continue/types:
 *   { data, meta? }
 *
 * The TransformInterceptor wraps bare objects in { data } automatically,
 * but using these helpers explicitly is preferred for clarity and type-safety.
 */

export interface PaginatedMeta {
  nextCursor: string | null
  total?: number
}

/** Standard single-resource or list response */
export function ok<T>(data: T): { data: T } {
  return { data }
}

/** Paginated list response */
export function paginated<T>(data: T[], meta: PaginatedMeta): { data: T[]; meta: PaginatedMeta } {
  return { data, meta }
}

/** Created resource response (use with 201) */
export function created<T>(data: T): { data: T } {
  return { data }
}
