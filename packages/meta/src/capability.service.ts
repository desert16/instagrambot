import { InstagramCapabilities } from '@instagrambot/types';
import { MetaOAuthService } from './oauth.service.js';
import { metaApiClient } from './meta-api-client.js';

export class InstagramCapabilityService {
  /**
   * Evaluates all capabilities for a linked Instagram account
   */
  public static async evaluateCapabilities(
    instagramAccountId: string,
    accessToken: string
  ): Promise<InstagramCapabilities> {
    const issues: string[] = [];
    let tokenValid = false;
    let permissionsValid = false;
    let messagingReady = false;
    let webhookReady = false;

    // 1. Validate Token & Scopes
    try {
      const debugInfo = await MetaOAuthService.debugToken(accessToken);
      if (debugInfo.is_valid) {
        tokenValid = true;
        const requiredScopes = ['instagram_basic', 'instagram_manage_messages'];
        const missingScopes = requiredScopes.filter((scope) => !debugInfo.scopes.includes(scope));

        if (missingScopes.length === 0) {
          permissionsValid = true;
        } else {
          issues.push(`Eksik izinler: ${missingScopes.join(', ')}`);
        }
      } else {
        issues.push('Instagram erişim tokenı geçersiz veya süresi dolmuş.');
      }
    } catch (err) {
      issues.push(`Token kontrolü başarısız: ${(err as Error).message}`);
    }

    // 2. Test Account Info & Messaging Readiness
    if (tokenValid) {
      try {
        const accountDetails = await metaApiClient.get(instagramAccountId, {
          fields: 'id,username',
        }, accessToken);

        if (accountDetails?.id) {
          messagingReady = permissionsValid;
        }
      } catch (err) {
        issues.push(`Hesap erişim testi başarısız: ${(err as Error).message}`);
      }
    }

    // 3. Webhook capability
    webhookReady = messagingReady;

    return {
      accountConnected: tokenValid,
      tokenValid,
      permissionsValid,
      messagingReady,
      webhookReady,
      aiReady: messagingReady,
      lastCheckedAt: new Date().toISOString(),
      issues,
    };
  }
}
