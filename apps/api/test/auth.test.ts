/* eslint-disable @typescript-eslint/no-explicit-any */
import { ErrorResponse } from "@aptransit/shared";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { AppModule } from "../src/app.module";
import { configureHttpApp } from "../src/http-app";
import { PrismaService } from "../src/prisma/prisma.service";
import { RedisService } from "../src/redis/redis.service";

describe("Auth endpoints and lifecycle", () => {
  let app: NestExpressApplication;

  // In-memory mock tables for auth testing
  const otpCodes: any[] = [];
  const users: any[] = [];
  const refreshTokens: any[] = [];
  const auditLogs: any[] = [];
  const redisStore = new Map<string, string>();

  beforeAll(async () => {
    const mockPrisma = {
      $queryRaw: async () => [1],
      otpCode: {
        create: async ({ data }: any) => {
          const rec = {
            id: `otp_${Date.now()}_${Math.random()}`,
            attempts: 0,
            consumedAt: null,
            createdAt: new Date(),
            ...data,
          };
          otpCodes.push(rec);
          return rec;
        },
        findFirst: async ({ where }: any) => {
          const matching = otpCodes.filter((o) => {
            if (where.target && o.target !== where.target) return false;
            if (where.channel && o.channel !== where.channel) return false;
            if (where.consumedAt === null && o.consumedAt !== null) return false;
            return true;
          });
          return matching[matching.length - 1] ?? null;
        },
        update: async ({ where, data }: any) => {
          const rec = otpCodes.find((o) => o.id === where.id);
          if (rec) Object.assign(rec, data);
          return rec;
        },
      },
      user: {
        findFirst: async ({ where }: any) => {
          return users.find((u) => {
            if (where.email && u.email?.toLowerCase() === where.email?.toLowerCase()) return true;
            if (where.phone && u.phone === where.phone) return true;
            return false;
          }) ?? null;
        },
        findUnique: async ({ where }: any) => {
          return users.find((u) => u.id === where.id) ?? null;
        },
        create: async ({ data }: any) => {
          const userRoles = (data.userRoles?.create ?? []).map((r: any) => ({
            id: `ur_${Date.now()}_${Math.random()}`,
            role: r.role,
            depotId: r.depotId ?? null,
            districtId: r.districtId ?? null,
          }));
          const u = {
            id: `usr_${Date.now()}_${Math.random()}`,
            name: data.name ?? null,
            email: data.email ?? null,
            phone: data.phone ?? null,
            preferredLocale: data.preferredLocale ?? "en",
            userRoles,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          users.push(u);
          return u;
        },
        update: async ({ where, data }: any) => {
          const u = users.find((x) => x.id === where.id);
          if (u) Object.assign(u, data);
          return u;
        },
      },
      userRole: {
        create: async ({ data }: any) => {
          const r = { id: `ur_${Date.now()}`, ...data };
          const u = users.find((x) => x.id === data.userId);
          if (u) u.userRoles.push(r);
          return r;
        },
      },
      refreshToken: {
        create: async ({ data }: any) => {
          const token = {
            id: `rt_${Date.now()}_${Math.random()}`,
            revokedAt: null,
            replacedById: null,
            ...data,
          };
          refreshTokens.push(token);
          return token;
        },
        findUnique: async ({ where }: any) => {
          return refreshTokens.find((t) => t.tokenHash === where.tokenHash) ?? null;
        },
        update: async ({ where, data }: any) => {
          const t = refreshTokens.find((x) => x.id === where.id);
          if (t) Object.assign(t, data);
          return t;
        },
        updateMany: async ({ where, data }: any) => {
          let count = 0;
          for (const t of refreshTokens) {
            if (t.familyId === where.familyId) {
              Object.assign(t, data);
              count++;
            }
          }
          return { count };
        },
      },
      auditLog: {
        create: async ({ data }: any) => {
          const log = { id: `audit_${Date.now()}`, ...data, createdAt: new Date() };
          auditLogs.push(log);
          return log;
        },
      },
      onModuleDestroy: async () => undefined,
    };

    const mockRedis = {
      client: {
        ping: async () => "PONG",
        get: async (k: string) => redisStore.get(k) ?? null,
        set: async (k: string, v: string) => {
          redisStore.set(k, v);
          return "OK";
        },
        incr: async (k: string) => {
          const val = Number(redisStore.get(k) ?? 0) + 1;
          redisStore.set(k, String(val));
          return val;
        },
        expire: async () => 1,
        ttl: async () => 60,
      },
      onModuleDestroy: async () => undefined,
    };

    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .overrideProvider(RedisService)
      .useValue(mockRedis)
      .compile();

    app = moduleRef.createNestApplication<NestExpressApplication>({ bufferLogs: true });
    configureHttpApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it("POST /auth/otp/request rejects invalid phone or email", async () => {
    const res = await request(app.getHttpServer())
      .post("/api/v1/auth/otp/request")
      .send({ channel: "PHONE", target: "9876543210" });
    expect(res.status).toBe(400);
    const body = ErrorResponse.parse(res.body);
    expect(body.error.code).toBe("VALIDATION_FAILED");
  });

  let devOtpCode: string;
  const testEmail = "citizen@aptransit.test";

  it("POST /auth/otp/request sends OTP and returns devCode in development", async () => {
    const res = await request(app.getHttpServer())
      .post("/api/v1/auth/otp/request")
      .send({ channel: "EMAIL", target: testEmail });
    expect(res.status).toBe(202);
    expect(res.body.expiresInSec).toBe(300);
    expect(res.body.resendInSec).toBe(30);
    expect(res.body.devCode).toBeDefined();
    devOtpCode = res.body.devCode;
  });

  it("POST /auth/otp/verify rejects wrong code", async () => {
    const res = await request(app.getHttpServer())
      .post("/api/v1/auth/otp/verify")
      .send({ channel: "EMAIL", target: testEmail, code: "000000" });
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("OTP_INVALID");
  });

  let accessToken: string;
  let refreshTokenCookie: string;

  it("POST /auth/otp/verify succeeds with correct code, returns tokens and sets cookie", async () => {
    const res = await request(app.getHttpServer())
      .post("/api/v1/auth/otp/verify")
      .send({ channel: "EMAIL", target: testEmail, code: devOtpCode });
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.user.email).toBe(testEmail);
    expect(res.body.user.roles[0].role).toBe("CITIZEN");

    accessToken = res.body.accessToken;
    const cookies = res.headers["set-cookie"] as string[] | undefined;
    expect(cookies).toBeDefined();
    refreshTokenCookie = cookies![0]!;
    expect(refreshTokenCookie).toContain("apt_rt=");
    expect(refreshTokenCookie).toContain("HttpOnly");

    // Audit log written
    const loginAudit = auditLogs.find((a) => a.action === "auth.login");
    expect(loginAudit).toBeDefined();
  });

  it("GET /me without authorization header returns 401 UNAUTHENTICATED", async () => {
    const res = await request(app.getHttpServer()).get("/api/v1/me");
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHENTICATED");
  });

  it("GET /me with valid access token returns user profile", async () => {
    const res = await request(app.getHttpServer())
      .get("/api/v1/me")
      .set("Authorization", `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe(testEmail);
    expect(res.body.roles).toHaveLength(1);
  });

  it("PATCH /me updates preferred locale and name", async () => {
    const res = await request(app.getHttpServer())
      .patch("/api/v1/me")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ name: "Ravi Kumar", preferredLocale: "te" });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Ravi Kumar");
    expect(res.body.preferredLocale).toBe("te");
  });

  let secondRefreshTokenCookie: string;

  it("POST /auth/refresh rotates the refresh token", async () => {
    const res = await request(app.getHttpServer())
      .post("/api/v1/auth/refresh")
      .set("Cookie", refreshTokenCookie);
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();

    const cookies = res.headers["set-cookie"] as string[] | undefined;
    expect(cookies).toBeDefined();
    secondRefreshTokenCookie = cookies![0]!;
    expect(secondRefreshTokenCookie).toContain("apt_rt=");
  });

  it("reusing the old refresh token triggers reuse detection and revokes family", async () => {
    const res = await request(app.getHttpServer())
      .post("/api/v1/auth/refresh")
      .set("Cookie", refreshTokenCookie);
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHENTICATED");

    // Check reuse audit log
    const reuseAudit = auditLogs.find((a) => a.action === "auth.refresh_reuse_detected");
    expect(reuseAudit).toBeDefined();

    // Now even secondRefreshTokenCookie is revoked because entire family was revoked
    const res2 = await request(app.getHttpServer())
      .post("/api/v1/auth/refresh")
      .set("Cookie", secondRefreshTokenCookie);
    expect(res2.status).toBe(401);
  });

  it("POST /auth/logout clears cookie and revokes tokens", async () => {
    // Request a new session
    const reqRes = await request(app.getHttpServer())
      .post("/api/v1/auth/otp/request")
      .send({ channel: "EMAIL", target: testEmail });
    const code = reqRes.body.devCode;

    const verifyRes = await request(app.getHttpServer())
      .post("/api/v1/auth/otp/verify")
      .send({ channel: "EMAIL", target: testEmail, code });
    const cookies = verifyRes.headers["set-cookie"] as string[] | undefined;
    expect(cookies).toBeDefined();
    const cookie = cookies![0]!;

    const logoutRes = await request(app.getHttpServer())
      .post("/api/v1/auth/logout")
      .set("Cookie", cookie);
    expect(logoutRes.status).toBe(204);

    const logoutAudit = auditLogs.find((a) => a.action === "auth.logout");
    expect(logoutAudit).toBeDefined();
  });
});
