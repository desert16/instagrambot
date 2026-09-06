import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { PrismaService } from './common/prisma.service.js';
import { RedisService } from './common/redis.service.js';
import { AllExceptionsFilter } from './common/all-exceptions.filter.js';
import { TransformInterceptor } from './common/transform.interceptor.js';

import { AuthModule } from './auth/auth.module.js';
import { WorkspacesModule } from './workspaces/workspaces.module.js';
import { InstagramModule } from './instagram/instagram.module.js';
import { WebhooksModule } from './webhooks/webhooks.module.js';
import { InboxModule } from './inbox/inbox.module.js';
import { QueueModule } from './queues/queue.module.js';
import { AIModule } from './ai/ai.module.js';
import { AutomationsModule } from './automations/automations.module.js';
import { KnowledgeBaseModule } from './knowledge-base/knowledge-base.module.js';
import { AnalyticsModule } from './analytics/analytics.module.js';
import { HealthModule } from './health/health.module.js';

@Module({
  imports: [
    AuthModule,
    WorkspacesModule,
    InstagramModule,
    WebhooksModule,
    InboxModule,
    QueueModule,
    AIModule,
    AutomationsModule,
    KnowledgeBaseModule,
    AnalyticsModule,
    HealthModule,
  ],
  providers: [
    PrismaService,
    RedisService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {}
