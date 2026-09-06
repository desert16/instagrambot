import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service.js';
import { MessageDirection, MessageSender, ConversationStatus } from '@prisma/client';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats(workspaceId: string, instagramAccountId?: string) {
    const whereAccount = instagramAccountId ? { instagramAccountId } : {};

    // 1. Conversations Count & Statuses
    const [totalConversations, openConversations, pendingConversations, resolvedConversations] =
      await Promise.all([
        this.prisma.conversation.count({
          where: { workspaceId, ...whereAccount },
        }),
        this.prisma.conversation.count({
          where: { workspaceId, status: ConversationStatus.OPEN, ...whereAccount },
        }),
        this.prisma.conversation.count({
          where: { workspaceId, status: ConversationStatus.PENDING, ...whereAccount },
        }),
        this.prisma.conversation.count({
          where: { workspaceId, status: ConversationStatus.RESOLVED, ...whereAccount },
        }),
      ]);

    // 2. Messages by Sender
    const [totalMessages, inboundMessages, aiMessages, agentMessages] = await Promise.all([
      this.prisma.message.count({
        where: { conversation: { workspaceId, ...whereAccount } },
      }),
      this.prisma.message.count({
        where: {
          direction: MessageDirection.INBOUND,
          conversation: { workspaceId, ...whereAccount },
        },
      }),
      this.prisma.message.count({
        where: {
          direction: MessageDirection.OUTBOUND,
          senderType: MessageSender.AI,
          conversation: { workspaceId, ...whereAccount },
        },
      }),
      this.prisma.message.count({
        where: {
          direction: MessageDirection.OUTBOUND,
          senderType: MessageSender.AGENT,
          conversation: { workspaceId, ...whereAccount },
        },
      }),
    ]);

    // 3. Instagram Accounts Summary
    const accounts = await this.prisma.instagramAccount.findMany({
      where: { workspaceId },
      select: {
        id: true,
        username: true,
        status: true,
        messagingReady: true,
        webhookReady: true,
        aiReady: true,
        aiSettings: { select: { enabled: true, provider: true, model: true } },
      },
    });

    // 4. Calculations
    const aiResolutionRate =
      totalConversations > 0
        ? Math.round(((totalConversations - pendingConversations) / totalConversations) * 100)
        : 100;

    const humanHandoffRate =
      totalConversations > 0
        ? Math.round((pendingConversations / totalConversations) * 100)
        : 0;

    return {
      overview: {
        totalConversations,
        openConversations,
        pendingConversations,
        resolvedConversations,
        totalMessages,
        inboundMessages,
        aiMessages,
        agentMessages,
        aiResolutionRate,
        humanHandoffRate,
      },
      accounts,
    };
  }
}
