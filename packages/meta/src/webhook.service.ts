import * as crypto from 'crypto';
import { config } from '@instagrambot/config';
import { metaApiClient } from './meta-api-client.js';

export class InstagramWebhookService {
  /**
   * Verifies the initial GET subscription challenge sent by Meta Webhook system
   */
  public static verifyWebhookChallenge(
    mode: string | undefined,
    verifyToken: string | undefined,
    challenge: string | undefined
  ): { isValid: boolean; challenge?: string } {
    const expectedToken = config.META_WEBHOOK_VERIFY_TOKEN;

    if (mode === 'subscribe' && verifyToken === expectedToken && challenge) {
      return { isValid: true, challenge };
    }

    return { isValid: false };
  }

  /**
   * Verifies the cryptographical HMAC-SHA256 signature (X-Hub-Signature-256)
   * sent in the header of each incoming Meta Webhook event.
   */
  public static validateWebhookSignature(
    rawBody: Buffer | string,
    signatureHeader: string | undefined
  ): boolean {
    if (!signatureHeader || !signatureHeader.startsWith('sha256=')) {
      return false;
    }

    const appSecret = config.META_APP_SECRET;
    if (!appSecret) {
      console.error('❌ [InstagramWebhookService] META_APP_SECRET is not configured');
      return false;
    }

    const receivedSignature = signatureHeader.substring(7); // strip 'sha256='
    const hmac = crypto.createHmac('sha256', appSecret);

    const bodyBuffer = Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(rawBody, 'utf8');
    const expectedSignature = hmac.update(bodyBuffer).digest('hex');

    try {
      return crypto.timingSafeEqual(
        Buffer.from(receivedSignature, 'utf8'),
        Buffer.from(expectedSignature, 'utf8')
      );
    } catch {
      return false;
    }
  }

  /**
   * Automatically subscribes the Facebook page / Instagram account to webhook events (messages, postbacks)
   */
  public static async subscribePageToApp(pageId: string, pageAccessToken: string): Promise<{ success: boolean }> {
    try {
      const response = await metaApiClient.post<{ success: boolean }>(
        `${pageId}/subscribed_apps`,
        {
          subscribed_fields: ['messages', 'messaging_postbacks', 'messaging_optins', 'message_reads', 'message_deliveries'],
        },
        pageAccessToken
      );

      return { success: response.success === true };
    } catch (error) {
      console.warn(`[InstagramWebhookService] Failed to subscribe page ${pageId} to webhooks:`, (error as Error).message);
      return { success: false };
    }
  }
}
