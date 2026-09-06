import { Module } from '@nestjs/common';
import { QueueService } from './queue.service.js';
import { WebhookProcessor } from './webhook.processor.js';
import { AIResponseProcessor } from './ai-response.processor.js';
import { PrismaService } from '../common/prisma.service.js';
import { RedisService } from '../common/redis.service.js';
import { InboxGateway } from '../inbox/inbox.gateway.js';

@Module({
  providers: [
    QueueService,
    WebhookProcessor,
    AIResponseProcessor,
    PrismaService,
    RedisService,
    InboxGateway,
  ],
  exports: [QueueService, InboxGateway],
})
export class QueueModule {}
