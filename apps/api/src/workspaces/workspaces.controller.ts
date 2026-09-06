import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { WorkspacesService } from './workspaces.service.js';
import { JwtAuthGuard } from '../common/guards.js';
import { CurrentUser } from '../common/decorators.js';

@UseGuards(JwtAuthGuard)
@Controller('api/workspaces')
export class WorkspacesController {
  constructor(private workspacesService: WorkspacesService) {}

  @Get()
  async listWorkspaces(@CurrentUser('id') userId: string) {
    return this.workspacesService.listUserWorkspaces(userId);
  }

  @Post()
  async createWorkspace(
    @CurrentUser('id') userId: string,
    @Body() body: { name: string }
  ) {
    return this.workspacesService.createWorkspace(userId, body.name);
  }

  @Get(':id')
  async getWorkspace(
    @Param('id') workspaceId: string,
    @CurrentUser('id') userId: string
  ) {
    return this.workspacesService.getWorkspaceDetails(workspaceId, userId);
  }
}
