import { Module } from '@nestjs/common';
import { KnowledgeBaseService } from './knowledge-base.service.js';
import { KnowledgeBaseController } from './knowledge-base.controller.js';
import { PrismaService } from '../common/prisma.service.js';

@Module({
  controllers: [KnowledgeBaseController],
  providers: [KnowledgeBaseService, PrismaService],
  exports: [KnowledgeBaseService],
})
export class KnowledgeBaseModule {}
