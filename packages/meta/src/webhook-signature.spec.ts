import { describe, it, expect } from 'vitest';
import * as crypto from 'crypto';
import { InstagramWebhookService } from '../src/webhook.service.js';
import { config } from '@instagrambot/config';

describe('InstagramWebhookService (HMAC-SHA256 Signature)', () => {
  it('should validate a legitimately signed webhook payload', () => {
    const rawPayload = JSON.stringify({
      object: 'instagram',
      entry: [{ id: '17841400000000001', time: Date.now() }],
    });

    const appSecret = config.META_APP_SECRET;
    const hmac = crypto.createHmac('sha256', appSecret);
    const validSignature = `sha256=${hmac.update(rawPayload).digest('hex')}`;

    const isValid = InstagramWebhookService.validateWebhookSignature(rawPayload, validSignature);
    expect(isValid).toBe(true);
  });

  it('should reject tampered payload or incorrect signature', () => {
    const rawPayload = '{"object":"instagram"}';
    const fakeSignature = 'sha256=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

    const isValid = InstagramWebhookService.validateWebhookSignature(rawPayload, fakeSignature);
    expect(isValid).toBe(false);
  });

  it('should reject missing or malformed signature header', () => {
    const rawPayload = '{"object":"instagram"}';
    expect(InstagramWebhookService.validateWebhookSignature(rawPayload, undefined)).toBe(false);
    expect(InstagramWebhookService.validateWebhookSignature(rawPayload, 'invalid_header')).toBe(false);
  });
});
