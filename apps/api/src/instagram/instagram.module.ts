import { Module } from '@nestjs/common';
import { InstagramService } from './instagram.service.js';
import { InstagramController } from './instagram.controller.js';
import { PrismaService } from '../common/prisma.service.js';
import { RedisService } from '../common/redis.service.js';

@Module({
  controllers: [InstagramController],
  providers: [InstagramService, PrismaService, RedisService],
  exports: [InstagramService],
})
export class InstagramModule {}
