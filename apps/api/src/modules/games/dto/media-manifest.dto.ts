import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsString, IsOptional, IsBoolean, IsNumber, IsUrl } from 'class-validator'

export class CoverManifestDto {
  @ApiPropertyOptional({ description: 'Small sized cover thumbnail URL' })
  @IsOptional()
  @IsUrl()
  sm?: string | null

  @ApiPropertyOptional({ description: 'Medium sized cover image URL' })
  @IsOptional()
  @IsUrl()
  md?: string | null

  @ApiPropertyOptional({ description: 'Large sized cover image URL' })
  @IsOptional()
  @IsUrl()
  lg?: string | null
}

export class BackdropManifestDto {
  @ApiPropertyOptional({ description: 'Hero backdrop banner image URL' })
  @IsOptional()
  @IsUrl()
  hero?: string | null
}

export class ScreenshotDto {
  @ApiProperty({ description: 'Media asset unique ID' })
  @IsString()
  id!: string

  @ApiProperty({ description: 'Screenshot display URL (optimized gallery HD variant)' })
  @IsUrl()
  url!: string

  @ApiPropertyOptional({ description: 'Backdrop banner overlay capability score' })
  @IsOptional()
  @IsNumber()
  heroScore?: number | null

  @ApiProperty({ description: 'Indicates if screenshot is selected as primary hero backdrop banner' })
  @IsBoolean()
  isPrimaryHeroCandidate!: boolean
}
