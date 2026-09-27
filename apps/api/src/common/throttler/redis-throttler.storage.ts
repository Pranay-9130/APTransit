import type { ThrottlerStorage } from "@nestjs/throttler";
import type { RedisService } from "../../redis/redis.service";
import { hitWindow } from "../services/redis-window";

type ThrottlerStorageRecord = Awaited<ReturnType<ThrottlerStorage["increment"]>>;

/** Fixed window storage for @nestjs/throttler, shared by every API instance through Redis. */
export class RedisThrottlerStorage implements ThrottlerStorage {
  constructor(private readonly redis: RedisService) {}

  async increment(
    key: string,
    ttl: number,
    limit: number,
    _blockDuration: number,
    throttlerName: string,
  ): Promise<ThrottlerStorageRecord> {
    const hit = await hitWindow(this.redis.client, `ratelimit:${throttlerName}:${key}`, ttl);
    // Redis unreachable: fail open, never block traffic on a cache outage.
    const hits = hit?.hits ?? 1;
    const seconds = Math.max(1, Math.ceil((hit?.ttlMs ?? ttl) / 1000));
    const isBlocked = hits > limit;
    return {
      totalHits: hits,
      timeToExpire: seconds,
      isBlocked,
      timeToBlockExpire: isBlocked ? seconds : 0,
    };
  }
}
