import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Request,
  HttpCode,
  HttpStatus,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger'
import { ListsService } from './lists.service'
import type {
  CreateListDto,
  UpdateListDto,
  AddListItemDto,
  ReorderListItemsDto,
} from './dto/list.dto'
import { CurrentUser, type AuthUser } from '../auth/decorators/current-user.decorator'
import { Public } from '../auth/decorators/public.decorator'

@ApiTags('lists')
@Controller({ version: '1' })
export class ListsController {
  constructor(private readonly listsService: ListsService) {}

  // ─── Discovery (homepage) ────────────────────────────────────────────────────

  @Public()
  @Get('lists/discovery')
  @ApiOperation({
    summary: 'Public list discovery for homepage — top public lists with cover mosaics',
  })
  @ApiQuery({ name: 'limit', required: false, example: 3 })
  findDiscovery(@Query('limit', new DefaultValuePipe(3), ParseIntPipe) limit: number) {
    return this.listsService.findPublicDiscovery(Math.min(limit, 12))
  }

  // ─── My lists ───────────────────────────────────────────────────────────────

  @Post('lists')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new list' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateListDto) {
    return this.listsService.create(user.id, dto)
  }

  // ─── Global lists (new route) ───────────────────────────────────────────────

  @Public()
  @Get('lists/:slug')
  @ApiOperation({ summary: 'Get list globally by slug' })
  findBySlug(@Param('slug') slug: string, @Request() req: { user?: AuthUser }) {
    return this.listsService.findBySlug(slug, req.user?.id)
  }

  // ─── User lists (public route) ───────────────────────────────────────────────

  @Public()
  @Get('users/:username/lists')
  @ApiOperation({ summary: "Get user's lists" })
  findByUser(
    @Param('username') username: string,
    @Request() req: { user?: AuthUser },
    @Query('gameId') gameId?: string,
  ) {
    return this.listsService.findByUser(username, req.user?.id, gameId)
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
  update(@Param('id') id: string, @CurrentUser() user: AuthUser, @Body() dto: UpdateListDto) {
    return this.listsService.update(id, user.id, dto)
  }

  @Patch('lists/:id/reorder')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reorder list items' })
  reorder(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: ReorderListItemsDto,
  ) {
    return this.listsService.reorderItems(id, user.id, dto)
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
  addItem(@Param('id') id: string, @CurrentUser() user: AuthUser, @Body() dto: AddListItemDto) {
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
