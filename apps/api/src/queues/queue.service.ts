import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import { config } from '@instagrambot/config';
import {
  QUEUE_INSTAGRAM_WEBHOOK,
  QUEUE_AI_RESPONSE,
  QUEUE_NOTIFICATIONS,
  QUEUE_AUTOMATIONS,
} from './queue.constants.js';

@Injectable()
export class QueueService implements OnModuleInit, OnModuleDestroy {
  private logger = new Logger('QueueService');
  private queues: Map<string, Queue> = new Map();

  onModuleInit() {
    const redisConnection = {
      host: config.REDIS_HOST,
      port: config.REDIS_PORT,
      password: config.REDIS_PASSWORD,
    };

    const queueNames = [
      QUEUE_INSTAGRAM_WEBHOOK,
      QUEUE_AI_RESPONSE,
      QUEUE_NOTIFICATIONS,
      QUEUE_AUTOMATIONS,
    ];

    for (const name of queueNames) {
      const queue = new Queue(name, {
        connection: redisConnection,
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: 100,
          removeOnFail: 500,
        },
      });
      this.queues.set(name, queue);
    }

    this.logger.log('BullMQ Queues initialized');
  }

  async onModuleDestroy() {
    for (const queue of this.queues.values()) {
      await queue.close();
    }
  }

  public getQueue(name: string): Queue | undefined {
    return this.queues.get(name);
  }

  public async addWebhookJob(payload: any) {
    const queue = this.getQueue(QUEUE_INSTAGRAM_WEBHOOK);
    if (queue) {
      return queue.add('process_webhook', payload);
    }
  }

  public async addAIResponseJob(payload: any, delayMs = 3000) {
    const queue = this.getQueue(QUEUE_AI_RESPONSE);
    if (queue) {
      return queue.add('generate_ai_response', payload, {
        delay: delayMs, // Debounce delay
      });
    }
  }
}
