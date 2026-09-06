import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service.js';
import { Role } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class WorkspacesService {
  constructor(private prisma: PrismaService) {}

  async listUserWorkspaces(userId: string) {
    const memberships = await this.prisma.workspaceMember.findMany({
      where: { userId },
      include: {
        workspace: {
          include: {
            instagramAccounts: {
              select: {
                id: true,
                username: true,
                name: true,
                profilePictureUrl: true,
                status: true,
                messagingReady: true,
                webhookReady: true,
                aiReady: true,
              },
            },
            _count: {
              select: {
                conversations: true,
                members: true,
              },
            },
          },
        },
      },
    });

    return memberships.map((m) => ({
      ...m.workspace,
      userRole: m.role,
    }));
  }

  async createWorkspace(userId: string, name: string) {
    const slug = `${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${crypto.randomBytes(3).toString('hex')}`;

    return this.prisma.$transaction(async (tx) => {
      const workspace = await tx.workspace.create({
        data: {
          name,
          slug,
          ownerId: userId,
          subscription: {
            create: {
              plan: 'STARTER',
              status: 'ACTIVE',
            },
          },
          members: {
            create: {
              userId,
              role: Role.OWNER,
            },
          },
        },
      });

      return workspace;
    });
  }

  async getWorkspaceDetails(workspaceId: string, userId: string) {
    const membership = await this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: { workspaceId, userId },
      },
      include: {
        workspace: {
          include: {
            members: {
              include: {
                user: {
                  select: { id: true, email: true, name: true, avatarUrl: true },
                },
              },
            },
            instagramAccounts: true,
            subscription: true,
          },
        },
      },
    });

    if (!membership) {
      throw new NotFoundException('Çalışma alanı bulunamadı veya erişim yetkiniz yok.');
    }

    return {
      ...membership.workspace,
      currentRole: membership.role,
    };
  }
}
