import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service.js';
import { AnalyticsController } from './analytics.controller.js';
import { PrismaService } from '../common/prisma.service.js';

@Module({
  controllers: [AnalyticsController],
  providers: [AnalyticsService, PrismaService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
