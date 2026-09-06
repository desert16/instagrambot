import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service.js';

@Injectable()
export class KnowledgeBaseService {
  constructor(private prisma: PrismaService) {}

  async list(workspaceId: string, instagramAccountId?: string) {
    return this.prisma.knowledgeBase.findMany({
      where: {
        workspaceId,
        ...(instagramAccountId ? { instagramAccountId } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(workspaceId: string, data: { title: string; content: string; tags?: string[]; instagramAccountId?: string }) {
    return this.prisma.knowledgeBase.create({
      data: {
        workspaceId,
        instagramAccountId: data.instagramAccountId || null,
        title: data.title,
        content: data.content,
        tags: data.tags || [],
      },
    });
  }

  async update(id: string, data: { title?: string; content?: string; tags?: string[]; isActive?: boolean }) {
    return this.prisma.knowledgeBase.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.knowledgeBase.delete({
      where: { id },
    });
  }
}
