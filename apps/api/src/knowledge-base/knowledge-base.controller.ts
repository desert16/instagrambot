import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { KnowledgeBaseService } from './knowledge-base.service.js';
import { JwtAuthGuard, WorkspaceGuard } from '../common/guards.js';
import { CurrentWorkspace } from '../common/decorators.js';

@UseGuards(JwtAuthGuard, WorkspaceGuard)
@Controller('api/knowledge-base')
export class KnowledgeBaseController {
  constructor(private kbService: KnowledgeBaseService) {}

  @Get()
  async list(
    @CurrentWorkspace() workspaceId: string,
    @Query('instagramAccountId') instagramAccountId?: string
  ) {
    return this.kbService.list(workspaceId, instagramAccountId);
  }

  @Post()
  async create(
    @CurrentWorkspace() workspaceId: string,
    @Body() body: { title: string; content: string; tags?: string[]; instagramAccountId?: string }
  ) {
    return this.kbService.create(workspaceId, body);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: { title?: string; content?: string; tags?: string[]; isActive?: boolean }
  ) {
    return this.kbService.update(id, body);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.kbService.delete(id);
  }
}
