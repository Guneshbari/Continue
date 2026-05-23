import { Module } from '@nestjs/common'
import { ReviewsService } from './reviews.service'
import { ReviewsController } from './reviews.controller'
import { FeaturedReviewsController } from './featured-reviews.controller'
import { PrismaModule } from '../../common/prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [ReviewsController, FeaturedReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
