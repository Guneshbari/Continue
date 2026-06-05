import { IsString, IsOptional, IsInt, Min, Max, MinLength } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'

export class SearchQueryDto {
  @ApiProperty({ description: 'Search query (min 2 characters)' })
  @IsString()
  @MinLength(2)
  q!: string

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1
}

export class SearchSuggestionsQueryDto {
  @ApiProperty({ description: 'Autocomplete search query (min 2 characters)' })
  @IsString()
  @MinLength(2)
  q!: string

  @ApiPropertyOptional({ default: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  limit = 5
}
