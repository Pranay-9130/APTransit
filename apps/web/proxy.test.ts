import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { config, needsLogin, PROTECTED_PREFIXES, proxy } from "./proxy";

const req = (path: string, cookie?: string) =>
  new NextRequest(new URL(path, "http://localhost:3000"), { headers: cookie ? { cookie } : {} });

describe("proxy route guard (docs/08, D-016)", () => {
  it("knows which routes need login", () => {
    expect(needsLogin("/account")).toBe(true);
    expect(needsLogin("/tickets/abc")).toBe(true);
    expect(needsLogin("/ops")).toBe(true);
    expect(needsLogin("/")).toBe(false);
    expect(needsLogin("/search")).toBe(false);
    expect(needsLogin("/timetable/route/x")).toBe(false);
    expect(needsLogin("/opsx")).toBe(false);
  });

  it("redirects to /login with next when the session marker is missing", () => {
    const res = proxy(req("/tickets/t1?tab=qr"));
    expect(res.status).toBe(307);
    const location = new URL(res.headers.get("location")!);
    expect(location.pathname).toBe("/login");
    expect(location.searchParams.get("next")).toBe("/tickets/t1?tab=qr");
  });

  it("lets the request through with the marker", () => {
    const res = proxy(req("/account", "apt_session=1"));
    expect(res.headers.get("location")).toBeNull();
    expect(res.headers.get("x-middleware-next")).toBe("1");
  });

  it("ignores apt_rt, which pages never receive (Path=/api/v1/auth)", () => {
    expect(proxy(req("/account", "apt_rt=abc")).status).toBe(307);
  });

  it("has a matcher entry for every protected prefix", () => {
    expect(config.matcher).toEqual(PROTECTED_PREFIXES.map((p) => `${p}/:path*`));
  });
});
