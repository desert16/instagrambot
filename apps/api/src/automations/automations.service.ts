import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service.js';

@Injectable()
export class AutomationsService {
  constructor(private prisma: PrismaService) {}

  async listAutomations(workspaceId: string, instagramAccountId?: string) {
    return this.prisma.automation.findMany({
      where: {
        workspaceId,
        ...(instagramAccountId ? { instagramAccountId } : {}),
      },
      include: {
        rules: true,
        _count: {
          select: { executions: true },
        },
      },
      orderBy: { priority: 'asc' },
    });
  }

  async createAutomation(workspaceId: string, data: { name: string; instagramAccountId?: string; rules?: any[] }) {
    return this.prisma.automation.create({
      data: {
        workspaceId,
        instagramAccountId: data.instagramAccountId || null,
        name: data.name,
        rules: {
          create: data.rules?.map((r) => ({
            trigger: r.trigger || 'MESSAGE_RECEIVED',
            conditions: r.conditions || [],
            actions: r.actions || [],
          })) || [],
        },
      },
      include: { rules: true },
    });
  }

  async toggleAutomation(workspaceId: string, id: string, isActive: boolean) {
    return this.prisma.automation.update({
      where: { id },
      data: { isActive },
    });
  }

  async deleteAutomation(workspaceId: string, id: string) {
    return this.prisma.automation.delete({
      where: { id },
    });
  }

  /**
   * Simulation / Dry-run test: tests a sample customer message against active automations
   */
  async simulateTest(workspaceId: string, testMessage: string) {
    const automations = await this.prisma.automation.findMany({
      where: { workspaceId, isActive: true },
      include: { rules: true },
    });

    const triggeredActions = [];

    for (const auto of automations) {
      for (const rule of auto.rules) {
        const conditions = (rule.conditions as any[]) || [];
        let matched = true;

        for (const cond of conditions) {
          if (cond.field === 'message_text' && cond.operator === 'contains') {
            if (!testMessage.toLowerCase().includes(String(cond.value).toLowerCase())) {
              matched = false;
              break;
            }
          }
        }

        if (matched) {
          triggeredActions.push({
            automationName: auto.name,
            ruleId: rule.id,
            actions: rule.actions,
          });
        }
      }
    }

    return {
      testMessage,
      matchesFound: triggeredActions.length > 0,
      matchedAutomations: triggeredActions,
    };
  }
}
