import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsInt, IsBoolean } from 'class-validator'

export class PaginatedResponseDto<T> {
  @ApiProperty({ description: 'List of matching items for the current page' })
  @IsArray()
  items!: T[]

  @ApiProperty({ description: 'Current 1-indexed page number' })
  @IsInt()
  page!: number

  @ApiProperty({ description: 'Limit of items per page' })
  @IsInt()
  limit!: number

  @ApiProperty({ description: 'Total count of records matching query parameters' })
  @IsInt()
  total!: number

  @ApiProperty({ description: 'Indicates if a next page of records exists' })
  @IsBoolean()
  hasNext!: boolean
}
