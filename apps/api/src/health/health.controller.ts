import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from '../common/prisma.service.js';
import { RedisService } from '../common/redis.service.js';
import { config } from '@instagrambot/config';
import { Public } from '../common/decorators.js';

@Public()
@Controller('health')
export class HealthController {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService
  ) {}

  @Get()
  checkLive() {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('live')
  live() {
    return { status: 'alive' };
  }

  @Get('ready')
  async checkReady(@Res() res: Response) {
    const checks: Record<string, { status: 'healthy' | 'unhealthy'; error?: string }> = {};

    // 1. Database Check
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      checks.database = { status: 'healthy' };
    } catch (err) {
      checks.database = { status: 'unhealthy', error: (err as Error).message };
    }

    // 2. Redis Check
    try {
      const pong = await this.redis.getClient().ping();
      checks.redis = pong === 'PONG' ? { status: 'healthy' } : { status: 'unhealthy' };
    } catch (err) {
      checks.redis = { status: 'unhealthy', error: (err as Error).message };
    }

    // 3. Meta API Configuration Check
    checks.meta = {
      status: config.META_APP_ID && config.META_APP_SECRET ? 'healthy' : 'unhealthy',
    };

    // 4. AI Provider Configuration Check
    checks.ai = {
      status: config.GEMINI_API_KEY || config.OPENAI_API_KEY ? 'healthy' : 'unhealthy',
    };

    const isAllHealthy = Object.values(checks).every((c) => c.status === 'healthy');

    return res
      .status(isAllHealthy ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE)
      .json({
        status: isAllHealthy ? 'ready' : 'degraded',
        checks,
        timestamp: new Date().toISOString(),
      });
  }
}
