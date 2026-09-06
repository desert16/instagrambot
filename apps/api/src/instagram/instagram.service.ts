import { Injectable, BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../common/prisma.service.js';
import { RedisService } from '../common/redis.service.js';
import {
  MetaOAuthService,
  InstagramAccountService,
  InstagramWebhookService,
  InstagramCapabilityService,
  encryptToken,
  decryptToken,
} from '@instagrambot/meta';
import { InstagramAccountStatus } from '@prisma/client';

@Injectable()
export class InstagramService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService
  ) {}

  /**
   * Generates single-use state and Meta OAuth authorization URL
   */
  async generateConnectUrl(workspaceId: string, userId: string): Promise<string> {
    const state = crypto.randomBytes(32).toString('hex');
    const statePayload = JSON.stringify({ workspaceId, userId, createdAt: Date.now() });

    // Store single-use state in Redis with 10-minute (600s) TTL
    await this.redis.set(`oauth_state:${state}`, statePayload, 600);

    return MetaOAuthService.getAuthorizationUrl(state);
  }

  /**
   * Handles Meta OAuth callback with single-use state verification & account discovery
   */
  async handleCallback(code: string, state: string) {
    if (!state || !code) {
      throw new BadRequestException('State veya authorization code eksik.');
    }

    // 1. Verify and atomically consume single-use state from Redis
    const stateKey = `oauth_state:${state}`;
    const stateDataRaw = await this.redis.get(stateKey);

    if (!stateDataRaw) {
      throw new UnauthorizedException('OAuth state geçersiz, süresi dolmuş veya daha önce kullanılmış.');
    }

    // Delete immediately (single-use protection)
    await this.redis.del(stateKey);

    const { workspaceId, userId } = JSON.parse(stateDataRaw);

    // 2. Exchange authorization code for short-lived token
    const shortTokenRes = await MetaOAuthService.exchangeCodeForToken(code);
    if (!shortTokenRes?.access_token) {
      throw new BadRequestException('Meta erişim tokenı alınamadı.');
    }

    // 3. Exchange short-lived token for 60-day long-lived token
    const longTokenRes = await MetaOAuthService.getLongLivedToken(shortTokenRes.access_token);
    const userAccessToken = longTokenRes.access_token || shortTokenRes.access_token;

    // 4. Discover connected Instagram Professional / Business accounts
    const discoveredAccounts = await InstagramAccountService.discoverAccounts(userAccessToken);

    if (discoveredAccounts.length === 0) {
      throw new BadRequestException(
        'Yetkilendirilen Facebook Sayfasına bağlı hiçbir Instagram Profesyonel (İşletme veya İçerik Üretici) hesabı bulunamadı. Lütfen Instagram hesabınızın Profesyonel hesap olduğundan ve bir Facebook sayfasına bağlı olduğundan emin olun.'
      );
    }

    const connectedAccounts = [];

    // 5. Persist accounts and encrypted credentials inside a database transaction
    for (const discovered of discoveredAccounts) {
      const encryptedToken = encryptToken(discovered.pageAccessToken);

      const savedAccount = await this.prisma.$transaction(async (tx) => {
        // Upsert InstagramAccount
        const account = await tx.instagramAccount.upsert({
          where: {
            workspaceId_externalAccountId: {
              workspaceId,
              externalAccountId: discovered.instagramAccountId,
            },
          },
          update: {
            username: discovered.username,
            name: discovered.name || discovered.pageName,
            profilePictureUrl: discovered.profilePictureUrl,
            status: InstagramAccountStatus.CONNECTED,
            lastValidatedAt: new Date(),
            messagingReady: true,
            webhookReady: true,
            aiReady: true,
            lastError: null,
          },
          create: {
            workspaceId,
            externalAccountId: discovered.instagramAccountId,
            username: discovered.username,
            name: discovered.name || discovered.pageName,
            profilePictureUrl: discovered.profilePictureUrl,
            accountType: 'BUSINESS',
            status: InstagramAccountStatus.CONNECTED,
            lastValidatedAt: new Date(),
            messagingReady: true,
            webhookReady: true,
            aiReady: true,
          },
        });

        // Upsert encrypted credential
        await tx.instagramCredential.upsert({
          where: { instagramAccountId: account.id },
          update: {
            encryptedAccessToken: encryptedToken,
            updatedAt: new Date(),
          },
          create: {
            instagramAccountId: account.id,
            encryptedAccessToken: encryptedToken,
          },
        });

        // Ensure default AI settings exist
        await tx.aISettings.upsert({
          where: { instagramAccountId: account.id },
          update: {},
          create: {
            workspaceId,
            instagramAccountId: account.id,
            enabled: false,
            provider: 'gemini',
            model: 'gemini-1.5-flash',
            systemPrompt: `Sen @${account.username} firmasının profesyonel Instagram müşteri temsilcisisin. Müşterilere güler yüzlü, kurumsal, kibar ve Türkçe cevaplar ver.`,
          },
        });

        // Audit Log
        await tx.auditLog.create({
          data: {
            workspaceId,
            userId,
            action: 'INSTAGRAM_CONNECTED',
            resourceType: 'InstagramAccount',
            resourceId: account.id,
            metadata: {
              username: account.username,
              externalAccountId: account.externalAccountId,
            },
          },
        });

        return account;
      });

      // 6. Subscribe Page to Meta Webhook Events
      await InstagramWebhookService.subscribePageToApp(discovered.pageId, discovered.pageAccessToken);

      connectedAccounts.push(savedAccount);
    }

    return {
      workspaceId,
      connectedAccounts,
    };
  }

  /**
   * Lists all accounts linked to a workspace
   */
  async getAccounts(workspaceId: string) {
    return this.prisma.instagramAccount.findMany({
      where: { workspaceId },
      include: {
        aiSettings: true,
        _count: {
          select: {
            conversations: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Tests connection capabilities
   */
  async testConnection(workspaceId: string, accountId: string) {
    const account = await this.prisma.instagramAccount.findFirst({
      where: { id: accountId, workspaceId },
      include: { credential: true },
    });

    if (!account || !account.credential) {
      throw new NotFoundException('Instagram hesabı veya erişim anahtarı bulunamadı.');
    }

    const decryptedToken = decryptToken(account.credential.encryptedAccessToken);
    const capabilities = await InstagramCapabilityService.evaluateCapabilities(
      account.externalAccountId,
      decryptedToken
    );

    await this.prisma.instagramAccount.update({
      where: { id: account.id },
      data: {
        messagingReady: capabilities.messagingReady,
        webhookReady: capabilities.webhookReady,
        aiReady: capabilities.aiReady,
        lastValidatedAt: new Date(),
        status: capabilities.accountConnected
          ? InstagramAccountStatus.CONNECTED
          : InstagramAccountStatus.PERMISSION_ERROR,
        lastError: capabilities.issues.length > 0 ? capabilities.issues.join(' | ') : null,
      },
    });

    return capabilities;
  }

  /**
   * Disconnects Instagram account safely
   */
  async disconnectAccount(workspaceId: string, accountId: string, userId: string) {
    const account = await this.prisma.instagramAccount.findFirst({
      where: { id: accountId, workspaceId },
      include: { credential: true },
    });

    if (!account) {
      throw new NotFoundException('Instagram hesabı bulunamadı.');
    }

    return this.prisma.$transaction(async (tx) => {
      // Delete credential
      if (account.credential) {
        await tx.instagramCredential.delete({
          where: { id: account.credential.id },
        });
      }

      // Update account status
      const updated = await tx.instagramAccount.update({
        where: { id: account.id },
        data: {
          status: InstagramAccountStatus.DISCONNECTED,
          messagingReady: false,
          webhookReady: false,
          aiReady: false,
        },
      });

      // Audit Log
      await tx.auditLog.create({
        data: {
          workspaceId,
          userId,
          action: 'INSTAGRAM_DISCONNECTED',
          resourceType: 'InstagramAccount',
          resourceId: account.id,
          metadata: { username: account.username },
        },
      });

      return updated;
    });
  }
}
