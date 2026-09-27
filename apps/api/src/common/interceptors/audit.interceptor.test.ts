import type { CallHandler, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { firstValueFrom, of } from "rxjs";
import { describe, expect, it } from "vitest";
import type { AuditService, LogAuditParams } from "../../modules/audit/audit.service";
import { Audit } from "../decorators/audit.decorator";
import { AuditInterceptor } from "./audit.interceptor";

class Handlers {
  @Audit("ticket.cancel")
  cancel(): void {}

  plain(): void {}
}

function context(handler: () => void, req: Record<string, unknown>): ExecutionContext {
  return {
    getType: () => "http",
    getHandler: () => handler,
    switchToHttp: () => ({ getRequest: () => req }),
  } as unknown as ExecutionContext;
}

function setup() {
  const rows: LogAuditParams[] = [];
  const audit = { log: async (p: LogAuditParams) => void rows.push(p) } as unknown as AuditService;
  return { rows, interceptor: new AuditInterceptor(new Reflector(), audit) };
}

const req = {
  user: { id: "usr_1", roles: [{ role: "CITIZEN" }] },
  ip: "10.0.0.1",
  headers: { "user-agent": "vitest" },
  params: { id: "tkt_9" },
};

describe("AuditInterceptor", () => {
  it("writes one row with actor, ip, user agent and entity after success", async () => {
    const { rows, interceptor } = setup();
    const next: CallHandler = { handle: () => of({ status: "CANCELLED" }) };
    const result = await firstValueFrom(interceptor.intercept(context(Handlers.prototype.cancel, req), next));

    expect(result).toEqual({ status: "CANCELLED" });
    expect(rows).toEqual([
      {
        action: "ticket.cancel",
        entityType: "ticket",
        entityId: "tkt_9",
        actorUserId: "usr_1",
        actorRole: "CITIZEN",
        ip: "10.0.0.1",
        userAgent: "vitest",
      },
    ]);
  });

  it("prefers the id of the returned entity", async () => {
    const { rows, interceptor } = setup();
    const next: CallHandler = { handle: () => of({ id: "tkt_new" }) };
    await firstValueFrom(interceptor.intercept(context(Handlers.prototype.cancel, req), next));
    expect(rows[0]?.entityId).toBe("tkt_new");
  });

  it("does nothing for routes without @Audit", async () => {
    const { rows, interceptor } = setup();
    const next: CallHandler = { handle: () => of("ok") };
    await firstValueFrom(interceptor.intercept(context(Handlers.prototype.plain, req), next));
    expect(rows).toHaveLength(0);
  });
});
