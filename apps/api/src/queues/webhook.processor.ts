import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Worker, Job } from 'bullmq';
import { config } from '@instagrambot/config';
import { PrismaService } from '../common/prisma.service.js';
import { QueueService } from './queue.service.js';
import { InboxGateway } from '../inbox/inbox.gateway.js';
import { QUEUE_INSTAGRAM_WEBHOOK } from './queue.constants.js';
import { MessageDirection, MessageSender, MessageStatus, ConversationStatus } from '@prisma/client';

@Injectable()
export class WebhookProcessor implements OnModuleInit, OnModuleDestroy {
  private logger = new Logger('WebhookProcessor');
  private worker: Worker;

  constructor(
    private prisma: PrismaService,
    private queueService: QueueService,
    private inboxGateway: InboxGateway
  ) {}

  onModuleInit() {
    this.worker = new Worker(
      QUEUE_INSTAGRAM_WEBHOOK,
      async (job: Job) => {
        await this.processWebhookEvent(job.data);
      },
      {
        connection: {
          host: config.REDIS_HOST,
          port: config.REDIS_PORT,
          password: config.REDIS_PASSWORD,
        },
        concurrency: 5,
      }
    );

    this.worker.on('failed', (job, err) => {
      this.logger.error(`Webhook job ${job?.id} failed: ${err.message}`);
    });
  }

  async onModuleDestroy() {
    await this.worker?.close();
  }

  private async processWebhookEvent(payload: any) {
    if (!payload?.entry || !Array.isArray(payload.entry)) {
      return;
    }

    for (const entry of payload.entry) {
      const messagingList = entry.messaging || [];

      for (const msgEvent of messagingList) {
        // We handle messages sent by customers (inbound)
        if (msgEvent.message && !msgEvent.message.is_echo) {
          await this.handleInboundMessage(msgEvent);
        }
      }
    }
  }

  private async handleInboundMessage(event: any) {
    const senderId = event.sender.id;
    const recipientId = event.recipient.id; // Instagram Account ID or Facebook Page ID
    const metaMessage = event.message;
    const externalMessageId = metaMessage.mid;
    const text = metaMessage.text || '';
    const attachments = metaMessage.attachments || [];
    const mediaUrl = attachments[0]?.payload?.url || null;

    // 1. Find Instagram Account
    const account = await this.prisma.instagramAccount.findFirst({
      where: {
        OR: [
          { externalAccountId: recipientId },
          { externalAccountId: event.recipient?.id },
        ],
      },
      include: {
        aiSettings: true,
      },
    });

    if (!account) {
      this.logger.warn(`No InstagramAccount found for recipient ID: ${recipientId}`);
      return;
    }

    // 2. Upsert Contact
    const contact = await this.prisma.contact.upsert({
      where: {
        instagramAccountId_externalUserId: {
          instagramAccountId: account.id,
          externalUserId: senderId,
        },
      },
      update: {
        updatedAt: new Date(),
      },
      create: {
        workspaceId: account.workspaceId,
        instagramAccountId: account.id,
        externalUserId: senderId,
        username: `user_${senderId.substring(0, 8)}`,
      },
    });

    // 3. Upsert Conversation & Save Message inside a Transaction
    const { conversation, message } = await this.prisma.$transaction(async (tx) => {
      let conv = await tx.conversation.findFirst({
        where: {
          workspaceId: account.workspaceId,
          instagramAccountId: account.id,
          contactId: contact.id,
        },
      });

      if (!conv) {
        conv = await tx.conversation.create({
          data: {
            workspaceId: account.workspaceId,
            instagramAccountId: account.id,
            contactId: contact.id,
            status: ConversationStatus.OPEN,
            aiEnabled: account.aiSettings?.enabled ?? true,
            unreadCount: 1,
            lastMessageAt: new Date(),
          },
        });
      } else {
        conv = await tx.conversation.update({
          where: { id: conv.id },
          data: {
            unreadCount: { increment: 1 },
            lastMessageAt: new Date(),
            status: conv.status === ConversationStatus.RESOLVED ? ConversationStatus.OPEN : conv.status,
          },
        });
      }

      const msg = await tx.message.create({
        data: {
          conversationId: conv.id,
          externalMessageId,
          direction: MessageDirection.INBOUND,
          senderType: MessageSender.CUSTOMER,
          text,
          mediaUrl,
          status: MessageStatus.DELIVERED,
        },
      });

      return { conversation: conv, message: msg };
    });

    // 4. Broadcast Realtime Message Event to WebSocket Clients
    this.inboxGateway.broadcastToWorkspace(account.workspaceId, 'message.created', {
      workspaceId: account.workspaceId,
      conversationId: conversation.id,
      message,
      contact,
    });

    // 5. Trigger AI Response if AI is enabled and not handed off to human
    if (conversation.aiEnabled && account.aiSettings?.enabled) {
      const debounceDelay = (account.aiSettings.autoReplyDelay || 3) * 1000;
      await this.queueService.addAIResponseJob(
        {
          conversationId: conversation.id,
          workspaceId: account.workspaceId,
          instagramAccountId: account.id,
        },
        debounceDelay
      );
    }
  }
}
