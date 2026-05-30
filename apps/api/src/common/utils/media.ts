export interface MediaVariantDTO {
  role: 'COVER_SM' | 'COVER_MD' | 'COVER_LG' | 'BACKDROP_HERO' | 'GALLERY_HD' | 'THUMBNAIL_BLUR' | 'AVATAR_SM' | 'AVATAR_MD' | 'LOGO_TRANSPARENT'
  url: string
  width: number | null
  height: number | null
  format: string
  blurPlaceholder: string | null
}

export interface CanonicalMediaDTO {
  rawUrl: string
  optimized: boolean
  variants: MediaVariantDTO[]
  heroScore?: number | null
  isPrimaryHeroCandidate?: boolean
}

export interface PrismaMediaVariant {
  role: string
  url: string
  width: number | null
  height: number | null
  format: string
  blurPlaceholder: string | null
}

export interface PrismaMediaAsset {
  rawUrl: string
  optimized: boolean
  variants: PrismaMediaVariant[]
}

/**
 * Maps a Prisma MediaAsset relation (including its variants) to the canonical DTO.
 */
export function mapMediaAsset(asset: PrismaMediaAsset | null | undefined): CanonicalMediaDTO | null {
  if (!asset) return null
  return {
    rawUrl: asset.rawUrl,
    optimized: asset.optimized,
    variants: (asset.variants ?? []).map((v) => ({
      role: v.role as MediaVariantDTO['role'],
      url: v.url,
      width: v.width,
      height: v.height,
      format: v.format,
      blurPlaceholder: v.blurPlaceholder,
    })),
  }
}

/**
 * Resolves a specific role variant URL or falls back to raw URL / default.
 */
export function getVariantUrl(
  asset: PrismaMediaAsset | null | undefined,
  role: string,
  fallback: string | null = null,
): string | null {
  if (!asset) return fallback
  const variant = (asset.variants ?? []).find((v) => v.role === role)
  return variant ? variant.url : asset.rawUrl
}

