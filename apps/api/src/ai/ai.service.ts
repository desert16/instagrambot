import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service.js';

@Injectable()
export class AISettingsService {
  constructor(private prisma: PrismaService) {}

  async getSettings(workspaceId: string, instagramAccountId: string) {
    let settings = await this.prisma.aISettings.findUnique({
      where: { instagramAccountId },
    });

    if (!settings) {
      settings = await this.prisma.aISettings.create({
        data: {
          workspaceId,
          instagramAccountId,
          enabled: false,
          provider: 'gemini',
          model: 'gemini-1.5-flash',
          systemPrompt: 'Sen kurumsal ve profesyonel bir Instagram müşteri temsilcisisin. Doğal, samimi ve Türkçe yanıtlar ver.',
        },
      });
    }

    return settings;
  }

  async updateSettings(workspaceId: string, instagramAccountId: string, updateDto: any) {
    return this.prisma.aISettings.upsert({
      where: { instagramAccountId },
      update: {
        ...updateDto,
        updatedAt: new Date(),
      },
      create: {
        workspaceId,
        instagramAccountId,
        ...updateDto,
      },
    });
  }
}
