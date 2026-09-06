import {
  Controller,
  Get,
  Post,
  Query,
  Param,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { InstagramService } from './instagram.service.js';
import { JwtAuthGuard, WorkspaceGuard } from '../common/guards.js';
import { CurrentUser, CurrentWorkspace, Public } from '../common/decorators.js';
import { config } from '@instagrambot/config';

@Controller('api/integrations/instagram')
export class InstagramController {
  constructor(private instagramService: InstagramService) {}

  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @Get('connect')
  async connect(
    @CurrentWorkspace() workspaceId: string,
    @CurrentUser('id') userId: string
  ) {
    const url = await this.instagramService.generateConnectUrl(workspaceId, userId);
    return { url };
  }

  @Public()
  @Get('callback')
  async callback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error: string,
    @Query('error_description') errorDescription: string,
    @Res() res: Response
  ) {
    const frontendUrl = config.FRONTEND_URL.replace(/\/+$/, '');

    // If user cancelled authorization in Meta dialog
    if (error || !code) {
      console.warn(`[InstagramController] OAuth cancelled or error: ${error} - ${errorDescription}`);
      return res.redirect(`${frontendUrl}/settings/instagram?status=cancelled`);
    }

    try {
      await this.instagramService.handleCallback(code, state);
      return res.redirect(`${frontendUrl}/settings/instagram?status=success`);
    } catch (err: any) {
      console.error('[InstagramController] OAuth callback error:', err.message);
      const encodedMsg = encodeURIComponent(err.message || 'Yetkilendirme sırasında hata oluştu');
      return res.redirect(`${frontendUrl}/settings/instagram?status=error&message=${encodedMsg}`);
    }
  }

  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @Get('accounts')
  async listAccounts(@CurrentWorkspace() workspaceId: string) {
    return this.instagramService.getAccounts(workspaceId);
  }

  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @Post(':id/test')
  @HttpCode(HttpStatus.OK)
  async testConnection(
    @Param('id') accountId: string,
    @CurrentWorkspace() workspaceId: string
  ) {
    return this.instagramService.testConnection(workspaceId, accountId);
  }

  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @Post(':id/disconnect')
  @HttpCode(HttpStatus.OK)
  async disconnect(
    @Param('id') accountId: string,
    @CurrentWorkspace() workspaceId: string,
    @CurrentUser('id') userId: string
  ) {
    return this.instagramService.disconnectAccount(workspaceId, accountId, userId);
  }
}
