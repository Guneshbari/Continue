import { ApiProperty } from '@nestjs/swagger'

export class DiscoverMetadataItemDto {
  @ApiProperty()
  id!: string

  @ApiProperty()
  slug!: string

  @ApiProperty()
  name!: string

  @ApiProperty()
  count!: number
}

export class DiscoverMetadataYearDto {
  @ApiProperty()
  year!: number

  @ApiProperty()
  count!: number
}

export class DiscoverMetadataResponseDto {
  @ApiProperty({ type: [DiscoverMetadataItemDto] })
  genres!: DiscoverMetadataItemDto[]

  @ApiProperty({ type: [DiscoverMetadataItemDto] })
  platforms!: DiscoverMetadataItemDto[]

  @ApiProperty({ type: [DiscoverMetadataItemDto] })
  themes!: DiscoverMetadataItemDto[]

  @ApiProperty({ type: [DiscoverMetadataYearDto] })
  releaseYears!: DiscoverMetadataYearDto[]
}
