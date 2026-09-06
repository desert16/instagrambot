import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../common/prisma.service.js';
import { QueueService } from '../queues/queue.service.js';
import { InstagramWebhookService } from '@instagrambot/meta';

@Injectable()
export class WebhooksService {
  private logger = new Logger('WebhooksService');

  constructor(
    private prisma: PrismaService,
    private queueService: QueueService
  ) {}

  verifyChallenge(mode: string, verifyToken: string, challenge: string): string {
    const result = InstagramWebhookService.verifyWebhookChallenge(mode, verifyToken, challenge);
    if (!result.isValid || !result.challenge) {
      throw new UnauthorizedException('Webhook doğrulama tokenı geçersiz.');
    }
    return result.challenge;
  }

  async handleIncomingEvent(rawBody: Buffer | string, signature: string, payload: any) {
    // 1. Verify cryptographic HMAC-SHA256 signature
    const isValidSignature = InstagramWebhookService.validateWebhookSignature(rawBody, signature);
    if (!isValidSignature && process.env.NODE_ENV === 'production') {
      this.logger.error('Invalid Meta Webhook Signature');
      throw new UnauthorizedException('Geçersiz webhook imzası.');
    }

    // 2. Generate unique hash for this payload (Idempotency & Replay Attack Protection)
    const payloadString = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8');
    const payloadHash = crypto.createHash('sha256').update(payloadString).digest('hex');

    // Extract first message ID or fallback to hash for uniqueness
    const externalEventId = payload?.entry?.[0]?.messaging?.[0]?.message?.mid || payloadHash;

    const existingEvent = await this.prisma.webhookEvent.findUnique({
      where: { externalEventId },
    });

    if (existingEvent) {
      this.logger.log(`Duplicate webhook event detected (${externalEventId}), skipping processing`);
      return { status: 'duplicate' };
    }

    // 3. Persist Event to database for tracking and resilience
    await this.prisma.webhookEvent.create({
      data: {
        externalEventId,
        eventType: payload.object || 'instagram',
        payloadHash,
        payload: payload,
        status: 'PENDING',
      },
    });

    // 4. Send to BullMQ background queue for asynchronous processing (Fast HTTP response)
    await this.queueService.addWebhookJob(payload);

    return { status: 'queued' };
  }
}
