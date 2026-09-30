import { MeDto } from "@aptransit/shared";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api, ApiError, errorKey, refreshAccessToken, setUnauthenticatedHandler } from "./api";
import { sessionStore } from "./session";

const ME = {
  id: "u1",
  name: "Ravi",
  email: "citizen@aptransit.test",
  phone: null,
  preferredLocale: "en",
  roles: [{ role: "CITIZEN" }],
};

function json(status: number, body: unknown, headers: Record<string, string> = {}) {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...headers },
  });
}

const errorBody = (code: string, details?: unknown) => ({
  error: { code, message: code, details, requestId: "req_1" },
});

describe("api()", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  let onUnauth: ReturnType<typeof vi.fn<() => void>>;

  beforeEach(() => {
    sessionStore.reset();
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    onUnauth = vi.fn<() => void>();
    setUnauthenticatedHandler(onUnauth);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("calls the same origin base path with the access token and validates the Dto", async () => {
    sessionStore.setAccessToken("t1");
    fetchMock.mockResolvedValueOnce(json(200, ME));
    const me = await api("/me", { schema: MeDto });
    expect(me.email).toBe("citizen@aptransit.test");
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("/api/v1/me");
    expect(init.headers.Authorization).toBe("Bearer t1");
    expect(init.credentials).toBe("same-origin");
  });

  it("builds the query string and skips undefined values", async () => {
    fetchMock.mockResolvedValueOnce(json(200, []));
    await api("/places/search", { query: { q: "కర్నూ", limit: 10, after: undefined } });
    expect(fetchMock.mock.calls[0]![0]).toBe(`/api/v1/places/search?q=${encodeURIComponent("కర్నూ")}&limit=10`);
  });

  it("parses the docs/06 error shape into ApiError, with Retry-After", async () => {
    fetchMock.mockResolvedValueOnce(json(429, errorBody("RATE_LIMITED", { retryAfter: 40 }), { "retry-after": "42" }));
    const error = await api("/auth/otp/request", { method: "POST", body: {} }).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ code: "RATE_LIMITED", status: 429, requestId: "req_1", retryAfterSec: 42 });
  });

  it("falls back to details.retryAfter without the header", async () => {
    fetchMock.mockResolvedValueOnce(json(429, errorBody("RATE_LIMITED", { retryAfter: 40 })));
    const error = (await api("/x").catch((e: unknown) => e)) as ApiError;
    expect(error.retryAfterSec).toBe(40);
  });

  it("reports a response that breaks the contract as BAD_RESPONSE", async () => {
    fetchMock.mockResolvedValueOnce(json(200, { id: 1 }));
    await expect(api("/me", { schema: MeDto })).rejects.toMatchObject({ code: "BAD_RESPONSE" });
  });

  it("reports a failed connection as NETWORK", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    await expect(api("/districts")).rejects.toMatchObject({ code: "NETWORK", status: 0 });
  });

  it("returns undefined for 204", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));
    await expect(api("/auth/logout", { method: "POST" })).resolves.toBeUndefined();
  });

  it("on 401 refreshes once, then retries once with the new token", async () => {
    sessionStore.setAccessToken("old");
    fetchMock
      .mockResolvedValueOnce(json(401, errorBody("UNAUTHENTICATED")))
      .mockResolvedValueOnce(json(200, { accessToken: "new" }))
      .mockResolvedValueOnce(json(200, ME));
    await expect(api("/me", { schema: MeDto })).resolves.toMatchObject({ id: "u1" });
    expect(fetchMock.mock.calls.map((c) => c[0])).toEqual(["/api/v1/me", "/api/v1/auth/refresh", "/api/v1/me"]);
    expect(fetchMock.mock.calls[2]![1].headers.Authorization).toBe("Bearer new");
    expect(sessionStore.get()).toEqual({ accessToken: "new", status: "authenticated" });
    expect(onUnauth).not.toHaveBeenCalled();
  });

  it("parallel 401s share one refresh (single flight)", async () => {
    sessionStore.setAccessToken("old");
    let refreshCalls = 0;
    fetchMock.mockImplementation(async (url: string, init: RequestInit) => {
      if (url === "/api/v1/auth/refresh") {
        refreshCalls++;
        await new Promise((r) => setTimeout(r, 10));
        return json(200, { accessToken: "new" });
      }
      const auth = (init.headers as Record<string, string>).Authorization;
      return auth === "Bearer new" ? json(200, ME) : json(401, errorBody("UNAUTHENTICATED"));
    });
    const results = await Promise.all([
      api("/me", { schema: MeDto }),
      api("/me", { schema: MeDto }),
      api("/me", { schema: MeDto }),
    ]);
    expect(results).toHaveLength(3);
    expect(refreshCalls).toBe(1);
  });

  it("clears the session and calls the login redirect when refresh fails", async () => {
    sessionStore.setAccessToken("old");
    fetchMock
      .mockResolvedValueOnce(json(401, errorBody("UNAUTHENTICATED")))
      .mockResolvedValueOnce(json(401, errorBody("UNAUTHENTICATED")));
    await expect(api("/me", { schema: MeDto })).rejects.toMatchObject({ code: "UNAUTHENTICATED" });
    expect(sessionStore.get().status).toBe("anonymous");
    expect(onUnauth).toHaveBeenCalledTimes(1);
  });

  it("does not redirect for public data when asked not to", async () => {
    fetchMock
      .mockResolvedValueOnce(json(401, errorBody("UNAUTHENTICATED")))
      .mockResolvedValueOnce(json(401, errorBody("UNAUTHENTICATED")));
    await expect(api("/places/search", { redirectOn401: false })).rejects.toBeInstanceOf(ApiError);
    expect(onUnauth).not.toHaveBeenCalled();
  });

  it("never refreshes for auth endpoints", async () => {
    fetchMock.mockResolvedValueOnce(json(401, errorBody("UNAUTHENTICATED")));
    await expect(api("/auth/logout", { method: "POST" })).rejects.toMatchObject({ status: 401 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("serialises refreshes across tabs with a Web Lock (D-012)", async () => {
    const request = vi.fn(async (_name: string, cb: () => Promise<unknown>) => cb());
    vi.stubGlobal("navigator", { locks: { request } });
    fetchMock.mockResolvedValueOnce(json(200, { accessToken: "t2" }));
    await expect(refreshAccessToken()).resolves.toBe("t2");
    expect(request).toHaveBeenCalledWith("apt-refresh", expect.any(Function));
  });
});

describe("errorKey", () => {
  const known = (k: string) => ["errors.OTP_INVALID", "errors.NETWORK", "errors.INTERNAL"].includes(k);

  it("maps known codes, NETWORK, and falls back to INTERNAL", () => {
    expect(errorKey(new ApiError("OTP_INVALID", 422, "x"), known)).toBe("errors.OTP_INVALID");
    expect(errorKey(new ApiError("NETWORK", 0, "x"), known)).toBe("errors.NETWORK");
    expect(errorKey(new ApiError("SOMETHING_NEW", 422, "x"), known)).toBe("errors.INTERNAL");
    expect(errorKey(new Error("boom"), known)).toBe("errors.INTERNAL");
  });
});
