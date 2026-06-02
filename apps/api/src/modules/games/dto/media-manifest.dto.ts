import { ApiPropertyOptional } from '@nestjs/swagger'

export class CoverManifestDto {
  @ApiPropertyOptional()
  sm!: string | null

  @ApiPropertyOptional()
  md!: string | null

  @ApiPropertyOptional()
  lg!: string | null

  @ApiPropertyOptional()
  blur!: string | null
}

export class BackdropManifestDto {
  @ApiPropertyOptional()
  hero!: string | null

  @ApiPropertyOptional()
  blur!: string | null
}

export class ScreenshotManifestDto {
  @ApiPropertyOptional()
  url!: string | null

  @ApiPropertyOptional()
  width!: number | null

  @ApiPropertyOptional()
  height!: number | null

  @ApiPropertyOptional()
  blur!: string | null
}
