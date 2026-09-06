import {
  Controller,
  Get,
  Post,
  Query,
  Headers,
  Req,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { WebhooksService } from './webhooks.service.js';
import { Public } from '../common/decorators.js';

@Controller('webhooks/instagram')
export class WebhooksController {
  constructor(private webhooksService: WebhooksService) {}

  @Public()
  @Get()
  verifyChallenge(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: Response
  ) {
    const validChallenge = this.webhooksService.verifyChallenge(mode, token, challenge);
    // Meta requires raw string output of the challenge
    return res.status(HttpStatus.OK).send(validChallenge);
  }

  @Public()
  @Post()
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Headers('x-hub-signature-256') signature: string,
    @Req() req: Request & { rawBody?: Buffer }
  ) {
    const rawBody = req.rawBody || JSON.stringify(req.body);
    await this.webhooksService.handleIncomingEvent(rawBody, signature, req.body);
    return 'EVENT_RECEIVED';
  }
}
