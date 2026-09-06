import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service.js';
import { JwtAuthGuard, WorkspaceGuard } from '../common/guards.js';
import { CurrentWorkspace } from '../common/decorators.js';

@UseGuards(JwtAuthGuard, WorkspaceGuard)
@Controller('api/analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('dashboard')
  async getDashboard(
    @CurrentWorkspace() workspaceId: string,
    @Query('instagramAccountId') instagramAccountId?: string
  ) {
    return this.analyticsService.getDashboardStats(workspaceId, instagramAccountId);
  }
}
