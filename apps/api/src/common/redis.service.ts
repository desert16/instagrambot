import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Redis } from 'ioredis';
import { config } from '@instagrambot/config';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;

  onModuleInit() {
    this.client = new Redis(config.REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      retryStrategy(times) {
        return Math.min(times * 100, 3000);
      },
    });

    this.client.on('error', (err) => {
      console.warn('⚠️ [RedisService] Redis connection error:', err.message);
    });
  }

  onModuleDestroy() {
    this.client.disconnect();
  }

  public getClient(): Redis {
    return this.client;
  }

  public async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  public async set(key: string, value: string, ttlSeconds?: number): Promise<'OK' | null> {
    if (ttlSeconds) {
      return this.client.set(key, value, 'EX', ttlSeconds);
    }
    return this.client.set(key, value);
  }

  public async del(key: string): Promise<number> {
    return this.client.del(key);
  }

  /**
   * Distributed Lock: Acquires an exclusive lock for a given resource
   * Returns a release function, or null if lock could not be acquired
   */
  public async acquireLock(resource: string, ttlMs = 5000): Promise<(() => Promise<void>) | null> {
    const lockKey = `lock:${resource}`;
    const lockValue = `${Date.now()}-${Math.random()}`;

    const acquired = await this.client.set(lockKey, lockValue, 'PX', ttlMs, 'NX');
    if (!acquired) {
      return null;
    }

    return async () => {
      // Release lock safely with Lua script to ensure we only release our own lock
      const luaScript = `
        if redis.call("get", KEYS[1]) == ARGV[1] then
          return redis.call("del", KEYS[1])
        else
          return 0
        end
      `;
      await this.client.eval(luaScript, 1, lockKey, lockValue);
    };
  }
}
