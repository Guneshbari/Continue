import {
  IsString,
  IsOptional,
  IsUrl,
  IsDateString,
  IsNumber,
  Min,
  Max,
  IsInt,
} from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'

export class CreateGameDto {
  @ApiProperty()
  @IsString()
  slug: string

  @ApiProperty()
  @IsString()
  title: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  coverUrl?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  bannerUrl?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  releaseDate?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  developer?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  publisher?: string
}

export class GamesQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  q?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  genre?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  platform?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sort?: 'trending' | 'top-rated' | 'new' | 'upcoming'

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cursor?: string

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit: number = 20
}
