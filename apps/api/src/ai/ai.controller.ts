import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { AISettingsService } from './ai.service.js';
import { JwtAuthGuard, WorkspaceGuard } from '../common/guards.js';
import { CurrentWorkspace } from '../common/decorators.js';

@UseGuards(JwtAuthGuard, WorkspaceGuard)
@Controller('api/ai')
export class AIController {
  constructor(private aiService: AISettingsService) {}

  @Get('settings/:accountId')
  async getSettings(
    @CurrentWorkspace() workspaceId: string,
    @Param('accountId') accountId: string
  ) {
    return this.aiService.getSettings(workspaceId, accountId);
  }

  @Patch('settings/:accountId')
  async updateSettings(
    @CurrentWorkspace() workspaceId: string,
    @Param('accountId') accountId: string,
    @Body() body: any
  ) {
    return this.aiService.updateSettings(workspaceId, accountId, body);
  }
}
