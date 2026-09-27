import { Injectable } from "@nestjs/common";
import { ThrottlerGuard, type ThrottlerLimitDetail } from "@nestjs/throttler";
import type { ExecutionContext } from "@nestjs/common";
import type { Request } from "express";
import type { AuthenticatedUser } from "../auth/auth.types";
import { AppError } from "../errors/app-error";

/**
 * Global rate limit (docs/12). Runs after JwtAuthGuard, so logged in callers are counted per user
 * and everyone else per IP. Tighter limits per route: @Throttle({ default: { limit, ttl } }).
 */
@Injectable()
export class AppThrottlerGuard extends ThrottlerGuard {
  protected override async getTracker(req: Request & { user?: AuthenticatedUser }): Promise<string> {
    return req.user?.id ? `user:${req.user.id}` : `ip:${req.ip ?? "unknown"}`;
  }

  protected override async throwThrottlingException(
    _context: ExecutionContext,
    detail: ThrottlerLimitDetail,
  ): Promise<void> {
    throw new AppError("RATE_LIMITED", "Too many requests. Wait a moment and try again.", {
      retryAfter: detail.timeToBlockExpire,
    });
  }
}
