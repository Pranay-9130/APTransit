import { describe, expect, it } from "vitest";
import { TtlCache } from "./ttl-cache";

describe("TtlCache", () => {
  it("returns a value until it expires", () => {
    let now = 1_000;
    const cache = new TtlCache<string>(60_000, 10, () => now);
    cache.set("a", "one");
    now += 59_999;
    expect(cache.get("a")).toBe("one");
    now += 1;
    expect(cache.get("a")).toBeUndefined();
  });

  it("drops the oldest entry when full", () => {
    const cache = new TtlCache<number>(60_000, 2);
    cache.set("a", 1);
    cache.set("b", 2);
    cache.set("c", 3);
    expect(cache.get("a")).toBeUndefined();
    expect(cache.get("b")).toBe(2);
    expect(cache.get("c")).toBe(3);
  });

  it("loads once and serves the cached value after", async () => {
    const cache = new TtlCache<number>(60_000);
    let calls = 0;
    const load = async () => ++calls;
    expect(await cache.getOrLoad("k", load)).toBe(1);
    expect(await cache.getOrLoad("k", load)).toBe(1);
    expect(calls).toBe(1);
  });
});
