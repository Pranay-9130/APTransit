import { randomBytes, randomInt, createHash, timingSafeEqual } from "node:crypto";
import {
  type AuthRefreshResponse,
  type AuthVerifyResponse,
  maskPhone,
  type MeDto,
  type OtpRequestInput,
  type OtpRequestResponse,
  type OtpVerifyInput,
  type Role,
  type UpdateMeInput,
  type UserRoleDto,
} from "@aptransit/shared";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Response } from "express";
import * as jose from "jose";
import type { AuthenticatedUser } from "../../common/auth/auth.types";
import { AppError } from "../../common/errors/app-error";
import { RateLimitService } from "../../common/services/rate-limit.service";
import type { Env } from "../../config/env";
import { PrismaService } from "../../prisma/prisma.service";
import { RedisService } from "../../redis/redis.service";
import { AuditService } from "../audit/audit.service";
import { EMAIL_PROVIDER, type EmailProvider } from "./email.provider";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly jwtSecret: Uint8Array;
  private readonly otpPepper: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly config: ConfigService<Env, true>,
    private readonly rateLimit: RateLimitService,
    private readonly audit: AuditService,
    @Inject(EMAIL_PROVIDER) private readonly emailProvider: EmailProvider,
  ) {
    this.jwtSecret = new TextEncoder().encode(this.config.get("JWT_SECRET", { infer: true }));
    this.otpPepper = this.config.get("OTP_PEPPER", { infer: true });
  }

  private hashOtpCode(code: string): string {
    return createHash("sha256")
      .update(code + this.otpPepper)
      .digest("hex");
  }

  private hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }

  private async generateAccessToken(
    userId: string,
    roles: { role: string; depotId?: string | null; districtId?: string | null }[],
  ): Promise<string> {
    return new jose.SignJWT({ roles })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(userId)
      .setIssuedAt()
      .setExpirationTime("15m")
      .sign(this.jwtSecret);
  }

  async requestOtp(
    input: OtpRequestInput,
    ip: string,
    res?: Response,
  ): Promise<OtpRequestResponse> {
    const target = input.channel === "EMAIL" ? input.target.toLowerCase() : input.target;

    // Check rate limits
    await this.rateLimit.assertOtpRequestLimit(target, ip, res);

    // Check 15-minute lock in Redis
    try {
      const isLocked = await this.redis.client.get(`otp:lock:${target}`);
      if (isLocked) {
        throw new AppError(
          "OTP_TOO_MANY_ATTEMPTS",
          "Too many invalid attempts. Try again in 15 minutes.",
        );
      }
    } catch (err) {
      if (err instanceof AppError) throw err;
      // Continue if Redis is unreachable
    }

    // Generate 6 digit code
    const code = String(randomInt(100000, 999999));
    const codeHash = this.hashOtpCode(code);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min

    await this.prisma.otpCode.create({
      data: {
        channel: input.channel,
        target,
        codeHash,
        expiresAt,
      },
    });

    if (input.channel === "EMAIL") {
      await this.emailProvider.sendEmail(
        target,
        "Your AP TransitOS login code",
        `Your login code is ${code}. It is valid for 5 minutes. Never share this code with anyone.`,
      );
    } else {
      this.logger.log(`[SMS Channel to ${target}] Code: ${code}`);
    }

    const appEnv = this.config.get("APP_ENV", { infer: true });
    const otpDevEcho = this.config.get("OTP_DEV_ECHO", { infer: true });
    const devCode = otpDevEcho && appEnv !== "production" ? code : undefined;

    return {
      expiresInSec: 300,
      resendInSec: 30,
      ...(devCode ? { devCode } : {}),
    };
  }

  async verifyOtp(
    input: OtpVerifyInput,
    ip: string,
    userAgent?: string,
    res?: Response,
  ): Promise<AuthVerifyResponse & { refreshToken: string }> {
    const target = input.channel === "EMAIL" ? input.target.toLowerCase() : input.target;

    // Check rate limit
    await this.rateLimit.assertOtpVerifyLimit(target, res);

    // Check lock
    try {
      const isLocked = await this.redis.client.get(`otp:lock:${target}`);
      if (isLocked) {
        throw new AppError(
          "OTP_TOO_MANY_ATTEMPTS",
          "Too many invalid attempts. Try again in 15 minutes.",
        );
      }
    } catch (err) {
      if (err instanceof AppError) throw err;
    }

    // Find latest active OTP code for this target
    const record = await this.prisma.otpCode.findFirst({
      where: {
        channel: input.channel,
        target,
        consumedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!record || record.expiresAt < new Date()) {
      throw new AppError("OTP_EXPIRED", "That code has expired. Send a new code.");
    }

    const candidateHash = this.hashOtpCode(input.code);
    const candidateBuf = Buffer.from(candidateHash, "hex");
    const storedBuf = Buffer.from(record.codeHash, "hex");

    const matches =
      candidateBuf.length === storedBuf.length &&
      timingSafeEqual(candidateBuf, storedBuf);

    if (!matches) {
      const newAttempts = record.attempts + 1;
      await this.prisma.otpCode.update({
        where: { id: record.id },
        data: { attempts: newAttempts },
      });

      if (newAttempts >= 5) {
        try {
          await this.redis.client.set(`otp:lock:${target}`, "1", "EX", 900);
        } catch {
          // Ignore redis failure
        }
        throw new AppError(
          "OTP_TOO_MANY_ATTEMPTS",
          "Too many invalid attempts. Try again in 15 minutes.",
        );
      }

      throw new AppError(
        "OTP_INVALID",
        "That code is not right. Check the latest code and try again.",
      );
    }

    // Mark consumed
    await this.prisma.otpCode.update({
      where: { id: record.id },
      data: { consumedAt: new Date() },
    });

    // Find or create user
    let user = await this.prisma.user.findFirst({
      where:
        input.channel === "EMAIL"
          ? { email: target }
          : { phone: target },
      include: {
        userRoles: true,
      },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          phone: input.channel === "PHONE" ? target : null,
          email: input.channel === "EMAIL" ? target : null,
          preferredLocale: "en",
          userRoles: {
            create: [
              {
                role: "CITIZEN",
              },
            ],
          },
        },
        include: {
          userRoles: true,
        },
      });
    } else if (user.userRoles.length === 0) {
      const newRole = await this.prisma.userRole.create({
        data: {
          userId: user.id,
          role: "CITIZEN",
        },
      });
      user.userRoles.push(newRole);
    }

    // Generate access token
    const rolesPayload = user.userRoles.map((r) => ({
      role: r.role,
      depotId: r.depotId,
      districtId: r.districtId,
    }));
    const accessToken = await this.generateAccessToken(user.id, rolesPayload);

    // Generate refresh token
    const rawRefreshToken = randomBytes(32).toString("hex");
    const tokenHash = this.hashToken(rawRefreshToken);
    const familyId = randomBytes(16).toString("hex");
    const refreshExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        familyId,
        expiresAt: refreshExpiresAt,
        userAgent,
      },
    });

    // Audit log
    const primaryRole = user.userRoles[0]?.role ?? "CITIZEN";
    await this.audit.log({
      action: "auth.login",
      entityType: "user",
      entityId: user.id,
      actorUserId: user.id,
      actorRole: primaryRole,
      ip,
      userAgent,
    });

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      user: this.formatMeDto(user),
    };
  }

  async refresh(
    rawRefreshToken: string,
    ip?: string,
    userAgent?: string,
    res?: Response,
  ): Promise<AuthRefreshResponse & { newRefreshToken: string }> {
    const tokenHash = this.hashToken(rawRefreshToken);
    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
    });

    if (!tokenRecord) {
      throw new AppError("UNAUTHENTICATED", "Invalid refresh token");
    }

    // Rate limit per user
    await this.rateLimit.assertRefreshLimit(tokenRecord.userId, res);

    // If revoked, reuse was detected
    if (tokenRecord.revokedAt !== null) {
      // Revoke whole family
      await this.prisma.refreshToken.updateMany({
        where: { familyId: tokenRecord.familyId },
        data: { revokedAt: new Date() },
      });

      await this.audit.log({
        action: "auth.refresh_reuse_detected",
        entityType: "refresh_token",
        entityId: tokenRecord.id,
        actorUserId: tokenRecord.userId,
        ip,
        userAgent,
      });

      throw new AppError("UNAUTHENTICATED", "Refresh token reuse detected");
    }

    if (tokenRecord.expiresAt < new Date()) {
      throw new AppError("UNAUTHENTICATED", "Refresh token expired");
    }

    const user = await this.prisma.user.findUnique({
      where: { id: tokenRecord.userId },
      include: { userRoles: true },
    });

    if (!user) {
      throw new AppError("UNAUTHENTICATED", "User not found");
    }

    // Rotate refresh token
    const newRawRefreshToken = randomBytes(32).toString("hex");
    const newTokenHash = this.hashToken(newRawRefreshToken);
    const refreshExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const newRecord = await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: newTokenHash,
        familyId: tokenRecord.familyId,
        expiresAt: refreshExpiresAt,
        userAgent,
      },
    });

    await this.prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: {
        revokedAt: new Date(),
        replacedById: newRecord.id,
      },
    });

    const rolesPayload = user.userRoles.map((r) => ({
      role: r.role,
      depotId: r.depotId,
      districtId: r.districtId,
    }));
    const accessToken = await this.generateAccessToken(user.id, rolesPayload);

    return {
      accessToken,
      newRefreshToken: newRawRefreshToken,
    };
  }

  async logout(
    rawRefreshToken?: string,
    user?: AuthenticatedUser,
    ip?: string,
    userAgent?: string,
  ): Promise<void> {
    if (rawRefreshToken) {
      const tokenHash = this.hashToken(rawRefreshToken);
      const tokenRecord = await this.prisma.refreshToken.findUnique({
        where: { tokenHash },
      });

      if (tokenRecord) {
        await this.prisma.refreshToken.updateMany({
          where: { familyId: tokenRecord.familyId },
          data: { revokedAt: new Date() },
        });

        await this.audit.log({
          action: "auth.logout",
          entityType: "user",
          entityId: tokenRecord.userId,
          actorUserId: tokenRecord.userId,
          ip,
          userAgent,
        });
        return;
      }
    }

    if (user) {
      await this.audit.log({
        action: "auth.logout",
        entityType: "user",
        entityId: user.id,
        actorUserId: user.id,
        ip,
        userAgent,
      });
    }
  }

  async getMe(userId: string): Promise<MeDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { userRoles: true },
    });

    if (!user) {
      throw new AppError("NOT_FOUND", "User not found");
    }

    return this.formatMeDto(user);
  }

  async updateMe(userId: string, input: UpdateMeInput): Promise<MeDto> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(input.name ? { name: input.name } : {}),
        ...(input.preferredLocale ? { preferredLocale: input.preferredLocale } : {}),
      },
      include: { userRoles: true },
    });

    return this.formatMeDto(user);
  }

  private formatMeDto(user: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    preferredLocale: string;
    userRoles: { role: string; depotId: string | null; districtId: string | null }[];
  }): MeDto {
    const roles: UserRoleDto[] = user.userRoles.map((r) => ({
      role: r.role as Role,
      depotId: r.depotId,
      districtId: r.districtId,
    }));

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone ? maskPhone(user.phone) : null,
      preferredLocale: user.preferredLocale,
      roles,
    };
  }
}
