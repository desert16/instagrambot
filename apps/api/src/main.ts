import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { WsAdapter } from '@nestjs/platform-ws';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module.js';
import { config } from '@instagrambot/config';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    // Preserve raw body for Meta Webhook HMAC-SHA256 signature verification
    rawBody: true,
  });

  // Enable graceful shutdown
  app.enableShutdownHooks();

  // Helmet Security Headers
  app.use(
    helmet({
      contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
      crossOriginEmbedderPolicy: false,
    })
  );

  // Cookie Parser
  app.use(cookieParser(config.COOKIE_SECRET));

  // CORS Configuration
  app.enableCors({
    origin: [config.FRONTEND_URL, 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-workspace-id', 'x-request-id'],
  });

  // WebSocket Adapter (Native WebSockets)
  app.useWebSocketAdapter(new WsAdapter(app));

  // Raw body parser middleware for express
  app.use(
    json({
      verify: (req: any, _res, buf) => {
        req.rawBody = buf;
      },
      limit: '10mb',
    })
  );
  app.use(urlencoded({ extended: true, limit: '10mb' }));

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    })
  );

  // Swagger / OpenAPI Setup
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Instagram AI Bot SaaS — API Documentation')
    .setDescription('Production-ready Meta Instagram Graph API & AI Bot Omnichannel Platform')
    .setVersion('1.0')
    .addBearerAuth()
    .addCookieAuth('accessToken')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  const port = config.PORT || 4000;
  await app.listen(port, '0.0.0.0');

  logger.log(`🚀 API Server running at http://localhost:${port}`);
  logger.log(`📚 OpenAPI / Swagger docs available at http://localhost:${port}/docs`);
  logger.log(`🔌 WebSocket Gateway listening at ws://localhost:${port}/ws`);
}

bootstrap().catch((err) => {
  console.error('Fatal bootstrap error:', err);
  process.exit(1);
});
