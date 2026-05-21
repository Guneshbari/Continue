import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, UseGuards, Request, HttpCode, HttpStatus,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { ListsService } from './lists.service'
import { CreateListDto, UpdateListDto, AddListItemDto } from './dto/list.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUser, type AuthUser } from '../auth/decorators/current-user.decorator'
import { Public } from '../auth/decorators/public.decorator'

@ApiTags('lists')
@UseGuards(JwtAuthGuard)
@Controller()
export class ListsController {
  constructor(private readonly listsService: ListsService) {}

  // ─── My lists ───────────────────────────────────────────────────────────────

  @Post('lists')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new list' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateListDto) {
    return this.listsService.create(user.id, dto)
  }

  // ─── User lists (public route) ───────────────────────────────────────────────

  @Public()
  @Get('users/:username/lists')
  @ApiOperation({ summary: "Get user's lists" })
  findByUser(
    @Param('username') username: string,
    @Request() req: { user?: AuthUser },
  ) {
    return this.listsService.findByUser(username, req.user?.id)
  }

  @Public()
  @Get('users/:username/lists/:slug')
  @ApiOperation({ summary: 'Get a specific list' })
  findOne(
    @Param('username') username: string,
    @Param('slug') slug: string,
    @Request() req: { user?: AuthUser },
  ) {
    return this.listsService.findOne(username, slug, req.user?.id)
  }

  @Patch('lists/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a list' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateListDto,
  ) {
    return this.listsService.update(id, user.id, dto)
  }

  @Delete('lists/:id')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a list' })
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.listsService.remove(id, user.id)
  }

  // ─── List items ─────────────────────────────────────────────────────────────

  @Post('lists/:id/items')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add game to list' })
  addItem(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: AddListItemDto,
  ) {
    return this.listsService.addItem(id, user.id, dto)
  }

  @Delete('lists/:id/items/:gameId')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove game from list' })
  removeItem(
    @Param('id') id: string,
    @Param('gameId') gameId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.listsService.removeItem(id, user.id, gameId)
  }
}
