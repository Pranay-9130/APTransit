import type { Redis } from "ioredis";

// INCR plus PEXPIRE in one atomic command (one Upstash command per hit). Re-arms the TTL if it
// was ever lost, so a key can never block a caller forever.
const WINDOW_SCRIPT = `
local hits = redis.call("INCR", KEYS[1])
local ttl = redis.call("PTTL", KEYS[1])
if ttl < 0 then
  redis.call("PEXPIRE", KEYS[1], ARGV[1])
  ttl = tonumber(ARGV[1])
end
return { hits, ttl }
`;

export interface WindowHit {
  hits: number;
  /** Milliseconds until the window resets. */
  ttlMs: number;
}

/** Statuses where a command would only wait for a reconnect. Fail open instead of stalling requests. */
const UNUSABLE = new Set(["reconnecting", "close", "end"]);

/**
 * Counts one hit in a fixed window. Returns null when Redis is unreachable so callers can
 * fail open (Redis is never the record, docs/13).
 */
export async function hitWindow(client: Redis, key: string, windowMs: number): Promise<WindowHit | null> {
  if (UNUSABLE.has(client.status)) return null;
  try {
    const [hits, ttlMs] = (await client.eval(WINDOW_SCRIPT, 1, key, String(windowMs))) as [number, number];
    return { hits, ttlMs };
  } catch {
    return null;
  }
}
