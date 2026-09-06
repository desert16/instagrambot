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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AutomationsService } from './automations.service.js';
import { JwtAuthGuard, WorkspaceGuard } from '../common/guards.js';
import { CurrentWorkspace } from '../common/decorators.js';

@UseGuards(JwtAuthGuard, WorkspaceGuard)
@Controller('api/automations')
export class AutomationsController {
  constructor(private automationsService: AutomationsService) {}

  @Get()
  async list(
    @CurrentWorkspace() workspaceId: string,
    @Query('instagramAccountId') instagramAccountId?: string
  ) {
    return this.automationsService.listAutomations(workspaceId, instagramAccountId);
  }

  @Post()
  async create(
    @CurrentWorkspace() workspaceId: string,
    @Body() body: { name: string; instagramAccountId?: string; rules?: any[] }
  ) {
    return this.automationsService.createAutomation(workspaceId, body);
  }

  @Patch(':id/toggle')
  async toggle(
    @CurrentWorkspace() workspaceId: string,
    @Param('id') id: string,
    @Body('isActive') isActive: boolean
  ) {
    return this.automationsService.toggleAutomation(workspaceId, id, isActive);
  }

  @Delete(':id')
  async delete(
    @CurrentWorkspace() workspaceId: string,
    @Param('id') id: string
  ) {
    return this.automationsService.deleteAutomation(workspaceId, id);
  }

  @Post('test')
  @HttpCode(HttpStatus.OK)
  async simulate(
    @CurrentWorkspace() workspaceId: string,
    @Body('message') message: string
  ) {
    return this.automationsService.simulateTest(workspaceId, message);
  }
}
