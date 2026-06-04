import { Injectable } from '@nestjs/common'
import { getVariantUrl } from '../../common/utils/media'
import type { CoverManifestDto, BackdropManifestDto, ScreenshotDto } from './dto/media-manifest.dto'
import type { GameSummaryDto, GameTaxonomyDto } from './dto/game-summary.dto'
import type { GameDetailDto, GameRatingDto, GameMetadataDto } from './dto/game-detail.dto'
import type { ShelfDto } from './dto/shelf.dto'

@Injectable()
export class GameMapper {
  toCoverManifest(coverAsset: any): CoverManifestDto | null {
    if (!coverAsset) return null

    const sm = getVariantUrl(coverAsset, 'COVER_SM')
    const md = getVariantUrl(coverAsset, 'COVER_MD')
    const lg = getVariantUrl(coverAsset, 'COVER_LG')

    return {
      sm: sm || null,
      md: md || null,
      lg: lg || null,
    }
  }

  toBackdropManifest(backdropAsset: any): BackdropManifestDto | null {
    if (!backdropAsset) return null

    const hero = getVariantUrl(backdropAsset, 'BACKDROP_HERO')

    return {
      hero: hero || null,
    }
  }

  toScreenshotDto(screenshot: any): ScreenshotDto | null {
    if (!screenshot || !screenshot.asset) return null

    const asset = screenshot.asset
    const url = getVariantUrl(asset, 'GALLERY_HD') || asset.rawUrl

    return {
      id: asset.id,
      url,
      heroScore: screenshot.heroScore,
      isPrimaryHeroCandidate: screenshot.isPrimaryHeroCandidate || false,
    }
  }

  toSummaryDto(game: any): GameSummaryDto {
    if (!game) throw new Error('Cannot map empty game to summary')

    const genres: GameTaxonomyDto[] = (game.genres ?? [])
      .map((g: any) => g.genre)
      .filter(Boolean)
      .map((g: any) => ({ id: g.id, slug: g.slug, name: g.name }))

    const platforms: GameTaxonomyDto[] = (game.platforms ?? [])
      .map((p: any) => p.platform)
      .filter(Boolean)
      .map((p: any) => ({ id: p.id, slug: p.slug, name: p.name }))

    return {
      id: game.id,
      slug: game.slug,
      title: game.title,
      releaseDate: game.releaseDate ? game.releaseDate.toISOString() : null,
      averageRating: game.avgRating,
      cover: this.toCoverManifest(game.cover),
      genres,
      platforms,
    }
  }

  toDetailDto(game: any): GameDetailDto {
    if (!game) throw new Error('Cannot map empty game to detail')

    const genres: GameTaxonomyDto[] = (game.genres ?? [])
      .map((g: any) => g.genre)
      .filter(Boolean)
      .map((g: any) => ({ id: g.id, slug: g.slug, name: g.name }))

    const platforms: GameTaxonomyDto[] = (game.platforms ?? [])
      .map((p: any) => p.platform)
      .filter(Boolean)
      .map((p: any) => ({ id: p.id, slug: p.slug, name: p.name }))

    const cover = this.toCoverManifest(game.cover)
    const backdrop = this.toBackdropManifest(game.backdrop)

    const screenshots: ScreenshotDto[] = (game.screenshots ?? [])
      .map((s: any) => this.toScreenshotDto(s))
      .filter(Boolean) as ScreenshotDto[]

    const rating: GameRatingDto = {
      averageRating: game.avgRating,
      ratingCount: game.ratingCount || 0,
      externalRating: game.igdbRating,
      externalRatingCount: game.igdbRatingCount,
    }

    const developers = (game.developers ?? [])
      .map((d: any) => d.developer?.name)
      .filter(Boolean)
    const developer = developers[0] || null

    const publishers = (game.publishers ?? [])
      .map((p: any) => p.publisher?.name)
      .filter(Boolean)
    const publisher = publishers[0] || null

    const themes = (game.themes ?? [])
      .map((t: any) => t.theme?.name)
      .filter(Boolean)

    const tags = (game.tags ?? [])
      .map((t: any) => t.tag?.name)
      .filter(Boolean)

    const metadata: GameMetadataDto = {
      status: game.status || null,
      developer,
      publisher,
      developers,
      publishers,
      themes,
      tags,
      franchise: game.franchise?.name || null,
    }

    return {
      id: game.id,
      slug: game.slug,
      title: game.title,
      summary: game.summary || null,
      storyline: game.storyline || null,
      releaseDate: game.releaseDate ? game.releaseDate.toISOString() : null,
      genres,
      platforms,
      cover,
      backdrop,
      screenshots,
      rating,
      metadata,
    }
  }

  toShelfDto(id: string, title: string, games: any[]): ShelfDto {
    return {
      id,
      title,
      items: (games ?? []).map(g => this.toSummaryDto(g)),
    }
  }
}
