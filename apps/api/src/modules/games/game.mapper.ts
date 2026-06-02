import { Injectable } from '@nestjs/common'
import type {
  BackdropManifestDto,
  CoverManifestDto,
  GameDetailDto,
  GameSummaryDto,
  ScreenshotManifestDto,
  ShelfDto,
  TaxonomyDto,
} from './dto/games.dto'

type MediaRole =
  | 'COVER_SM'
  | 'COVER_MD'
  | 'COVER_LG'
  | 'BACKDROP_HERO'
  | 'GALLERY_HD'
  | 'THUMBNAIL_BLUR'

interface MediaVariantLike {
  role: string
  url: string
  width: number | null
  height: number | null
  blurPlaceholder: string | null
}

interface MediaAssetLike {
  variants?: MediaVariantLike[]
}

interface RelationLike<T> {
  genre?: T | null
  platform?: T | null
  developer?: T | null
  publisher?: T | null
  tag?: T | null
  theme?: T | null
}

@Injectable()
export class GameMapper {
  toSummaryDto(game: any): GameSummaryDto {
    return {
      id: game.id,
      slug: game.slug,
      title: game.title,
      releaseDate: this.toIsoDate(game.releaseDate),
      averageRating: game.avgRating ?? null,
      cover: this.toCoverManifest(game.cover),
    }
  }

  toDetailDto(game: any): GameDetailDto {
    return {
      ...this.toSummaryDto(game),
      summary: game.summary ?? game.description ?? null,
      genres: this.mapRelations(game.genres, 'genre'),
      platforms: this.mapRelations(game.platforms, 'platform'),
      backdrop: this.toBackdropManifest(game.backdrop),
      screenshots: (game.screenshots ?? [])
        .map((s: any) => this.toScreenshotManifest(s.asset))
        .filter((s: ScreenshotManifestDto | null): s is ScreenshotManifestDto => s !== null),
      rating: {
        average: game.avgRating ?? null,
        count: game.ratingCount ?? 0,
      },
      metadata: {
        developers: this.mapRelations(game.developers, 'developer'),
        publishers: this.mapRelations(game.publishers, 'publisher'),
        tags: this.mapRelations(game.tags, 'tag'),
        themes: this.mapRelations(game.themes, 'theme'),
        franchise: game.franchise ?? null,
        status: game.status ?? null,
      },
    }
  }

  toShelfDto(id: string, title: string, items: any[]): ShelfDto {
    return {
      id,
      title,
      items: items.map((item) => this.toSummaryDto(item)),
    }
  }

  private toCoverManifest(asset: MediaAssetLike | null | undefined): CoverManifestDto | null {
    if (!asset) return null
    return {
      sm: this.variantUrl(asset, 'COVER_SM'),
      md: this.variantUrl(asset, 'COVER_MD'),
      lg: this.variantUrl(asset, 'COVER_LG'),
      blur: this.variantBlur(asset),
    }
  }

  private toBackdropManifest(asset: MediaAssetLike | null | undefined): BackdropManifestDto | null {
    if (!asset) return null
    return {
      hero: this.variantUrl(asset, 'BACKDROP_HERO'),
      blur: this.variantBlur(asset),
    }
  }

  private toScreenshotManifest(asset: MediaAssetLike | null | undefined): ScreenshotManifestDto | null {
    if (!asset) return null
    const variant = this.variant(asset, 'GALLERY_HD')
    return {
      url: variant?.url ?? null,
      width: variant?.width ?? null,
      height: variant?.height ?? null,
      blur: variant?.blurPlaceholder ?? this.variantBlur(asset),
    }
  }

  private variant(asset: MediaAssetLike, role: MediaRole): MediaVariantLike | null {
    return asset.variants?.find((v) => v.role === role) ?? null
  }

  private variantUrl(asset: MediaAssetLike, role: MediaRole): string | null {
    return this.variant(asset, role)?.url ?? null
  }

  private variantBlur(asset: MediaAssetLike): string | null {
    return asset.variants?.find((v) => v.blurPlaceholder)?.blurPlaceholder ?? null
  }

  private mapRelations<T extends TaxonomyDto>(
    rows: RelationLike<T>[] | null | undefined,
    key: keyof RelationLike<T>,
  ): T[] {
    return (rows ?? [])
      .map((row) => row[key])
      .filter((value: T | null | undefined): value is T => Boolean(value))
  }

  private toIsoDate(value: Date | string | null | undefined): string | null {
    if (!value) return null
    return value instanceof Date ? value.toISOString() : value
  }
}
