import { IsString, IsOptional, MaxLength } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class UpdateUserDto {
  @ApiPropertyOptional({ description: "User's public display name", maxLength: 64 })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  displayName?: string

  @ApiPropertyOptional({ description: "User's biography", maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string

  @ApiPropertyOptional({ description: "URL pointing to the user's avatar image", maxLength: 2000 })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  avatarUrl?: string
}
