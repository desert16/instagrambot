import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Worker, Job } from 'bullmq';
import { config } from '@instagrambot/config';
import { PrismaService } from '../common/prisma.service.js';
import { RedisService } from '../common/redis.service.js';
import { InboxGateway } from '../inbox/inbox.gateway.js';
import { QUEUE_AI_RESPONSE } from './queue.constants.js';
import { aiEngine, AIConversationContext } from '@instagrambot/ai';
import { InstagramMessagingService, decryptToken } from '@instagrambot/meta';
import { MessageDirection, MessageSender, MessageStatus, ConversationStatus } from '@prisma/client';

@Injectable()
export class AIResponseProcessor implements OnModuleInit, OnModuleDestroy {
  private logger = new Logger('AIResponseProcessor');
  private worker: Worker;

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private inboxGateway: InboxGateway
  ) {}

  onModuleInit() {
    this.worker = new Worker(
      QUEUE_AI_RESPONSE,
      async (job: Job) => {
        await this.handleAIJob(job.data);
      },
      {
        connection: {
          host: config.REDIS_HOST,
          port: config.REDIS_PORT,
          password: config.REDIS_PASSWORD,
        },
        concurrency: 3,
      }
    );

    this.worker.on('failed', (job, err) => {
      this.logger.error(`AI job ${job?.id} failed: ${err.message}`);
    });
  }

  async onModuleDestroy() {
    await this.worker?.close();
  }

  private async handleAIJob(data: {
    conversationId: string;
    workspaceId: string;
    instagramAccountId: string;
  }) {
    const { conversationId } = data;

    // 1. Acquire distributed lock for this conversation (prevent race conditions & duplicate replies)
    const releaseLock = await this.redis.acquireLock(`conv_ai:${conversationId}`, 15000);
    if (!releaseLock) {
      this.logger.warn(`AI is already processing conversation ${conversationId}, skipping duplicate job`);
      return;
    }

    try {
      // 2. Fetch Conversation, Contact, Account, Credential, and AI Settings
      const conversation = await this.prisma.conversation.findUnique({
        where: { id: conversationId },
        include: {
          contact: true,
          instagramAccount: {
            include: {
              credential: true,
              aiSettings: true,
            },
          },
          messages: {
            orderBy: { createdAt: 'asc' },
            take: 12,
          },
        },
      });

      if (!conversation || !conversation.aiEnabled) {
        return;
      }

      const account = conversation.instagramAccount;
      const settings = account?.aiSettings;

      if (!account || !account.credential || !settings || !settings.enabled) {
        return;
      }

      // Check if the latest message was already answered by AI or human
      const lastMsg = conversation.messages[conversation.messages.length - 1];
      if (!lastMsg || lastMsg.direction === MessageDirection.OUTBOUND) {
        return;
      }

      // 3. Load Knowledge Base Snippets
      const kbDocs = await this.prisma.knowledgeBase.findMany({
        where: {
          workspaceId: conversation.workspaceId,
          isActive: true,
          OR: [{ instagramAccountId: null }, { instagramAccountId: account.id }],
        },
        select: { title: true, content: true },
        take: 6,
      });

      // 4. Build AI Context
      const context: AIConversationContext = {
        conversationId,
        workspaceId: conversation.workspaceId,
        instagramAccountId: account.id,
        accountUsername: account.username,
        customerUsername: conversation.contact.username || undefined,
        customerName: conversation.contact.name || undefined,
        settings: {
          enabled: settings.enabled,
          provider: (settings.provider as any) || 'gemini',
          model: settings.model,
          systemPrompt: settings.systemPrompt,
          temperature: settings.temperature,
          maxTokens: settings.maxTokens,
          language: settings.language,
          fallbackMessage: settings.fallbackMessage,
          confidenceThreshold: settings.confidenceThreshold,
          handoffKeywords: settings.handoffKeywords,
          businessHoursOnly: settings.businessHoursOnly,
          autoReplyDelay: settings.autoReplyDelay,
          humanHandoffEnabled: settings.humanHandoffEnabled,
        },
        recentMessages: conversation.messages.map((m) => ({
          role: m.senderType === MessageSender.CUSTOMER ? 'user' : 'assistant',
          content: m.text || '',
        })),
        knowledgeBaseSnippets: kbDocs,
        isBusinessHours: true,
      };

      // 5. Send Typing Indicator to Meta
      const decryptedToken = decryptToken(account.credential.encryptedAccessToken);
      await InstagramMessagingService.sendAction(
        account.externalAccountId,
        conversation.contact.externalUserId,
        'typing_on',
        decryptedToken
      );

      // 6. Generate AI Response
      const result = await aiEngine.processConversation(context);

      if (!result.text) {
        return;
      }

      // 7. Handle Human Handoff if needed
      if (result.shouldHandoff) {
        await this.prisma.conversation.update({
          where: { id: conversation.id },
          data: {
            aiEnabled: false,
            status: ConversationStatus.PENDING,
          },
        });

        // Notify agents via WebSocket
        this.inboxGateway.broadcastToWorkspace(conversation.workspaceId, 'conversation.updated', {
          conversationId: conversation.id,
          aiEnabled: false,
          status: ConversationStatus.PENDING,
          handoffReason: result.handoffReason,
        });
      }

      // 8. Send Response via Meta Official Graph API
      const sendRes = await InstagramMessagingService.sendMessage({
        pageOrAccountId: account.externalAccountId,
        recipientId: conversation.contact.externalUserId,
        text: result.text,
        accessToken: decryptedToken,
      });

      // 9. Persist Outbound AI Message
      const savedMessage = await this.prisma.message.create({
        data: {
          conversationId: conversation.id,
          externalMessageId: sendRes.message_id,
          direction: MessageDirection.OUTBOUND,
          senderType: MessageSender.AI,
          text: result.text,
          status: MessageStatus.SENT,
          metadata: {
            provider: result.provider,
            model: result.model,
            latencyMs: result.latencyMs,
            confidence: result.confidence,
          },
        },
      });

      // 10. Broadcast Outbound Message to WebSocket
      this.inboxGateway.broadcastToWorkspace(conversation.workspaceId, 'message.created', {
        workspaceId: conversation.workspaceId,
        conversationId: conversation.id,
        message: savedMessage,
      });
    } catch (err: any) {
      this.logger.error(`Failed to execute AI reply for ${conversationId}: ${err.message}`, err.stack);
    } finally {
      await releaseLock();
    }
  }
}
