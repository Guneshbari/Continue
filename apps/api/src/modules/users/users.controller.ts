import { Controller, Get, Param, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger'
import { UsersService } from './users.service'
import { Public } from '../auth/decorators/public.decorator'

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly svc: UsersService) {}

  @Get(':username')
  @Public()
  @ApiOperation({ summary: 'Get public user profile' })
  profile(@Param('username') username: string) {
    return this.svc.findByUsername(username)
  }

  @Get(':username/reviews')
  @Public()
  @ApiOperation({ summary: 'Get user reviews' })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'cursor', required: false })
  reviews(
    @Param('username') username: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('cursor') cursor?: string,
  ) {
    return this.svc.findReviews(username, limit, cursor)
  }

  @Get(':username/ratings')
  @Public()
  @ApiOperation({ summary: 'Get user ratings' })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'cursor', required: false })
  ratings(
    @Param('username') username: string,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('cursor') cursor?: string,
  ) {
    return this.svc.findRatings(username, limit, cursor)
  }
}
