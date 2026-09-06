import { Module } from '@nestjs/common';
import { HealthController } from './health.controller.js';
import { PrismaService } from '../common/prisma.service.js';
import { RedisService } from '../common/redis.service.js';

@Module({
  controllers: [HealthController],
  providers: [PrismaService, RedisService],
})
export class HealthModule {}
