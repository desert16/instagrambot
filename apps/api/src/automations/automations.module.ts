import { Module } from '@nestjs/common';
import { AutomationsService } from './automations.service.js';
import { AutomationsController } from './automations.controller.js';
import { PrismaService } from '../common/prisma.service.js';

@Module({
  controllers: [AutomationsController],
  providers: [AutomationsService, PrismaService],
  exports: [AutomationsService],
})
export class AutomationsModule {}
