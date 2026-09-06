import { Module } from '@nestjs/common';
import { InboxService } from './inbox.service.js';
import { InboxController } from './inbox.controller.js';
import { InboxGateway } from './inbox.gateway.js';
import { PrismaService } from '../common/prisma.service.js';

@Module({
  controllers: [InboxController],
  providers: [InboxService, InboxGateway, PrismaService],
  exports: [InboxService, InboxGateway],
})
export class InboxModule {}
