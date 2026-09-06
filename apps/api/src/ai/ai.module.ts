import { Module } from '@nestjs/common';
import { AISettingsService } from './ai.service.js';
import { AIController } from './ai.controller.js';
import { PrismaService } from '../common/prisma.service.js';

@Module({
  controllers: [AIController],
  providers: [AISettingsService, PrismaService],
  exports: [AISettingsService],
})
export class AIModule {}
