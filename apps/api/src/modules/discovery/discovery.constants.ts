export const MEDIA_ASSET_SELECT = {
  variants: {
    select: {
      role: true,
      url: true,
      width: true,
      height: true,
      blurPlaceholder: true,
    },
  },
} as const

export const GAME_SUMMARY_SELECT = {
  id: true,
  slug: true,
  title: true,
  cover: { select: MEDIA_ASSET_SELECT },
  releaseDate: true,
  avgRating: true,
  ratingCount: true,
  genres: { select: { genre: { select: { id: true, slug: true, name: true } } } },
  platforms: { select: { platform: { select: { id: true, slug: true, name: true } } } },
} as const
