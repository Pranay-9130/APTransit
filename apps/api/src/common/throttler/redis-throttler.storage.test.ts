import { describe, expect, it } from "vitest";
import type { RedisService } from "../../redis/redis.service";
import { RedisThrottlerStorage } from "./redis-throttler.storage";

function fakeRedis(client: Record<string, unknown>): RedisService {
  return { client } as unknown as RedisService;
}

describe("RedisThrottlerStorage", () => {
  it("counts hits in one window and blocks above the limit", async () => {
    const counts = new Map<string, number>();
    const storage = new RedisThrottlerStorage(
      fakeRedis({
        status: "ready",
        eval: async (_s: string, _n: number, key: string) => {
          counts.set(key, (counts.get(key) ?? 0) + 1);
          return [counts.get(key), 42_500];
        },
      }),
    );

    const first = await storage.increment("k", 60_000, 2, 0, "default");
    expect(first).toEqual({ totalHits: 1, timeToExpire: 43, isBlocked: false, timeToBlockExpire: 0 });
    await storage.increment("k", 60_000, 2, 0, "default");
    const third = await storage.increment("k", 60_000, 2, 0, "default");
    expect(third.isBlocked).toBe(true);
    expect(third.timeToBlockExpire).toBe(43);
    expect([...counts.keys()]).toEqual(["ratelimit:default:k"]);
  });

  it("fails open without waiting when Redis is reconnecting", async () => {
    let called = false;
    const storage = new RedisThrottlerStorage(
      fakeRedis({
        status: "reconnecting",
        eval: async () => {
          called = true;
          return [999, 1];
        },
      }),
    );
    const record = await storage.increment("k", 60_000, 1, 0, "default");
    expect(record.isBlocked).toBe(false);
    expect(called).toBe(false);
  });

  it("fails open when the command errors", async () => {
    const storage = new RedisThrottlerStorage(
      fakeRedis({
        status: "ready",
        eval: async () => {
          throw new Error("ECONNRESET");
        },
      }),
    );
    const record = await storage.increment("k", 60_000, 1, 0, "default");
    expect(record.isBlocked).toBe(false);
  });
});
