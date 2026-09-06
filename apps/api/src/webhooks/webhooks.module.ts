import { Module } from '@nestjs/common';
import { WebhooksService } from './webhooks.service.js';
import { WebhooksController } from './webhooks.controller.js';
import { PrismaService } from '../common/prisma.service.js';
import { QueueModule } from '../queues/queue.module.js';

@Module({
  imports: [QueueModule],
  controllers: [WebhooksController],
  providers: [WebhooksService, PrismaService],
  exports: [WebhooksService],
})
export class WebhooksModule {}
