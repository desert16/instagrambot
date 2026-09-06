import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service.js';
import { InboxGateway } from './inbox.gateway.js';
import { InstagramMessagingService, decryptToken } from '@instagrambot/meta';
import { ConversationStatus, MessageDirection, MessageSender, MessageStatus } from '@prisma/client';

@Injectable()
export class InboxService {
  constructor(
    private prisma: PrismaService,
    private inboxGateway: InboxGateway
  ) {}

  async listConversations(
    workspaceId: string,
    query: {
      status?: ConversationStatus;
      search?: string;
      instagramAccountId?: string;
      assignedAgentId?: string;
      cursor?: string;
      limit?: number;
    }
  ) {
    const limit = query.limit ? Math.min(query.limit, 50) : 20;

    const where: any = {
      workspaceId,
      ...(query.status ? { status: query.status } : {}),
      ...(query.instagramAccountId ? { instagramAccountId: query.instagramAccountId } : {}),
      ...(query.assignedAgentId ? { assignedAgentId: query.assignedAgentId } : {}),
      ...(query.search
        ? {
            OR: [
              { contact: { username: { contains: query.search, mode: 'insensitive' } } },
              { contact: { name: { contains: query.search, mode: 'insensitive' } } },
              { messages: { some: { text: { contains: query.search, mode: 'insensitive' } } } },
            ],
          }
        : {}),
    };

    const conversations = await this.prisma.conversation.findMany({
      where,
      take: limit + 1,
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
      orderBy: { lastMessageAt: 'desc' },
      include: {
        contact: true,
        instagramAccount: {
          select: { id: true, username: true, name: true, profilePictureUrl: true },
        },
        assignedAgent: {
          select: { id: true, name: true, email: true },
        },
        tags: {
          include: { tag: true },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    let nextCursor: string | undefined = undefined;
    if (conversations.length > limit) {
      const nextItem = conversations.pop();
      nextCursor = nextItem?.id;
    }

    return {
      items: conversations.map((c) => ({
        ...c,
        lastMessage: c.messages[0] || null,
        tags: c.tags.map((t) => t.tag),
      })),
      nextCursor,
      hasMore: !!nextCursor,
    };
  }

  async getConversation(workspaceId: string, conversationId: string) {
    const conversation = await this.prisma.conversation.findFirst({
      where: { id: conversationId, workspaceId },
      include: {
        contact: true,
        instagramAccount: {
          select: { id: true, username: true, name: true, profilePictureUrl: true },
        },
        assignedAgent: {
          select: { id: true, name: true, email: true },
        },
        tags: {
          include: { tag: true },
        },
        notes: {
          include: {
            author: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException('Konuşma bulunamadı.');
    }

    return {
      ...conversation,
      tags: conversation.tags.map((t) => t.tag),
    };
  }

  async getMessages(conversationId: string, cursor?: string, limit = 30) {
    const safeLimit = Math.min(limit, 100);

    const messages = await this.prisma.message.findMany({
      where: { conversationId },
      take: safeLimit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'desc' },
    });

    let nextCursor: string | undefined = undefined;
    if (messages.length > safeLimit) {
      const nextItem = messages.pop();
      nextCursor = nextItem?.id;
    }

    // Return in chronological order
    return {
      items: messages.reverse(),
      nextCursor,
      hasMore: !!nextCursor,
    };
  }

  async sendAgentMessage(
    workspaceId: string,
    conversationId: string,
    userId: string,
    text: string,
    mediaUrl?: string
  ) {
    const conversation = await this.prisma.conversation.findFirst({
      where: { id: conversationId, workspaceId },
      include: {
        contact: true,
        instagramAccount: {
          include: { credential: true },
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException('Konuşma bulunamadı.');
    }

    const account = conversation.instagramAccount;
    if (!account.credential) {
      throw new BadRequestException('Bu Instagram hesabının erişim anahtarı bulunamadı.');
    }

    const decryptedToken = decryptToken(account.credential.encryptedAccessToken);

    // 1. Send via Meta Official Graph API
    const metaResponse = await InstagramMessagingService.sendMessage({
      pageOrAccountId: account.externalAccountId,
      recipientId: conversation.contact.externalUserId,
      text,
      mediaUrl,
      accessToken: decryptedToken,
    });

    // 2. Persist to DB inside transaction & update unread / last message
    const message = await this.prisma.$transaction(async (tx) => {
      const msg = await tx.message.create({
        data: {
          conversationId: conversation.id,
          externalMessageId: metaResponse.message_id,
          direction: MessageDirection.OUTBOUND,
          senderType: MessageSender.AGENT,
          text,
          mediaUrl,
          status: MessageStatus.SENT,
        },
      });

      await tx.conversation.update({
        where: { id: conversation.id },
        data: {
          lastMessageAt: new Date(),
          unreadCount: 0, // Agent replied, so marked read
        },
      });

      return msg;
    });

    // 3. Broadcast to Realtime WebSocket clients
    this.inboxGateway.broadcastToWorkspace(workspaceId, 'message.created', {
      workspaceId,
      conversationId: conversation.id,
      message,
    });

    return message;
  }

  async updateStatus(workspaceId: string, conversationId: string, status: ConversationStatus) {
    const updated = await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { status },
    });

    this.inboxGateway.broadcastToWorkspace(workspaceId, 'conversation.updated', {
      conversationId,
      status,
    });

    return updated;
  }

  async toggleAI(workspaceId: string, conversationId: string, enabled: boolean) {
    const updated = await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { aiEnabled: enabled },
    });

    this.inboxGateway.broadcastToWorkspace(workspaceId, 'conversation.updated', {
      conversationId,
      aiEnabled: enabled,
    });

    return updated;
  }

  async assignAgent(workspaceId: string, conversationId: string, agentId: string | null) {
    const updated = await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { assignedAgentId: agentId },
      include: { assignedAgent: { select: { id: true, name: true, email: true } } },
    });

    this.inboxGateway.broadcastToWorkspace(workspaceId, 'conversation.updated', {
      conversationId,
      assignedAgentId: agentId,
      assignedAgent: updated.assignedAgent,
    });

    return updated;
  }

  async addNote(conversationId: string, authorId: string, content: string) {
    return this.prisma.conversationNote.create({
      data: {
        conversationId,
        authorId,
        content,
      },
      include: {
        author: { select: { id: true, name: true } },
      },
    });
  }
}
