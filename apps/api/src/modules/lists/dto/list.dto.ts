import { IsString, IsOptional, IsEnum, MinLength, MaxLength } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateListDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  title!: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(400)
  description?: string

  @ApiPropertyOptional({ enum: ['PUBLIC', 'PRIVATE', 'UNLISTED'] })
  @IsOptional()
  @IsEnum(['PUBLIC', 'PRIVATE', 'UNLISTED'])
  visibility?: 'PUBLIC' | 'PRIVATE' | 'UNLISTED'
}

export class UpdateListDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  title?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(400)
  description?: string

  @ApiPropertyOptional({ enum: ['PUBLIC', 'PRIVATE', 'UNLISTED'] })
  @IsOptional()
  @IsEnum(['PUBLIC', 'PRIVATE', 'UNLISTED'])
  visibility?: 'PUBLIC' | 'PRIVATE' | 'UNLISTED'
}

export class AddListItemDto {
  @ApiProperty()
  @IsString()
  gameId!: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  note?: string
}
