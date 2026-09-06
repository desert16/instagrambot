import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { InboxService } from './inbox.service.js';
import { JwtAuthGuard, WorkspaceGuard } from '../common/guards.js';
import { CurrentUser, CurrentWorkspace } from '../common/decorators.js';
import { ConversationStatus } from '@prisma/client';

@UseGuards(JwtAuthGuard, WorkspaceGuard)
@Controller('api/inbox')
export class InboxController {
  constructor(private inboxService: InboxService) {}

  @Get('conversations')
  async listConversations(
    @CurrentWorkspace() workspaceId: string,
    @Query('status') status?: ConversationStatus,
    @Query('search') search?: string,
    @Query('instagramAccountId') instagramAccountId?: string,
    @Query('assignedAgentId') assignedAgentId?: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: number
  ) {
    return this.inboxService.listConversations(workspaceId, {
      status,
      search,
      instagramAccountId,
      assignedAgentId,
      cursor,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get('conversations/:id')
  async getConversation(
    @Param('id') conversationId: string,
    @CurrentWorkspace() workspaceId: string
  ) {
    return this.inboxService.getConversation(workspaceId, conversationId);
  }

  @Get('conversations/:id/messages')
  async getMessages(
    @Param('id') conversationId: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: number
  ) {
    return this.inboxService.getMessages(conversationId, cursor, limit ? Number(limit) : undefined);
  }

  @Post('conversations/:id/send')
  @HttpCode(HttpStatus.OK)
  async sendMessage(
    @Param('id') conversationId: string,
    @CurrentWorkspace() workspaceId: string,
    @CurrentUser('id') userId: string,
    @Body() body: { text: string; mediaUrl?: string }
  ) {
    return this.inboxService.sendAgentMessage(
      workspaceId,
      conversationId,
      userId,
      body.text,
      body.mediaUrl
    );
  }

  @Patch('conversations/:id/status')
  async updateStatus(
    @Param('id') conversationId: string,
    @CurrentWorkspace() workspaceId: string,
    @Body('status') status: ConversationStatus
  ) {
    return this.inboxService.updateStatus(workspaceId, conversationId, status);
  }

  @Patch('conversations/:id/ai')
  async toggleAI(
    @Param('id') conversationId: string,
    @CurrentWorkspace() workspaceId: string,
    @Body('enabled') enabled: boolean
  ) {
    return this.inboxService.toggleAI(workspaceId, conversationId, enabled);
  }

  @Patch('conversations/:id/assign')
  async assignAgent(
    @Param('id') conversationId: string,
    @CurrentWorkspace() workspaceId: string,
    @Body('agentId') agentId: string | null
  ) {
    return this.inboxService.assignAgent(workspaceId, conversationId, agentId);
  }

  @Post('conversations/:id/notes')
  async addNote(
    @Param('id') conversationId: string,
    @CurrentUser('id') userId: string,
    @Body('content') content: string
  ) {
    return this.inboxService.addNote(conversationId, userId, content);
  }
}
