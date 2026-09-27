import { Injectable, Logger } from "@nestjs/common";
import type { Response } from "express";
import { RedisService } from "../../redis/redis.service";
import { AppError } from "../errors/app-error";

@Injectable()
export class RateLimitService {
  private readonly logger = new Logger(RateLimitService.name);

  constructor(private readonly redis: RedisService) {}

  private async checkLimit(
    key: string,
    limit: number,
    windowSec: number,
  ): Promise<{ allowed: boolean; retryAfter: number }> {
    try {
      const count = await this.redis.client.incr(key);
      if (count === 1) {
        await this.redis.client.expire(key, windowSec);
      }
      let ttl = await this.redis.client.ttl(key);
      if (ttl < 0) ttl = windowSec;

      if (count > limit) {
        return { allowed: false, retryAfter: ttl };
      }
      return { allowed: true, retryAfter: 0 };
    } catch {
      // If Redis is unreachable, do not block user requests
      return { allowed: true, retryAfter: 0 };
    }
  }

  async assertOtpRequestLimit(target: string, ip: string, res?: Response): Promise<void> {
    // 3 per target per 10 min
    const targetCheck = await this.checkLimit(`ratelimit:otp:req:target:${target}`, 3, 600);
    if (!targetCheck.allowed) {
      if (res) res.setHeader("Retry-After", String(targetCheck.retryAfter));
      throw new AppError("RATE_LIMITED", "Too many attempts for this target. Wait a minute and try again.", {
        retryAfter: targetCheck.retryAfter,
      });
    }

    // 10 per IP per hour
    const ipCheck = await this.checkLimit(`ratelimit:otp:req:ip:${ip}`, 10, 3600);
    if (!ipCheck.allowed) {
      if (res) res.setHeader("Retry-After", String(ipCheck.retryAfter));
      throw new AppError("RATE_LIMITED", "Too many attempts from this IP. Wait a minute and try again.", {
        retryAfter: ipCheck.retryAfter,
      });
    }
  }

  async assertOtpVerifyLimit(target: string, res?: Response): Promise<void> {
    // 5 per target per 10 min
    const check = await this.checkLimit(`ratelimit:otp:verify:target:${target}`, 5, 600);
    if (!check.allowed) {
      if (res) res.setHeader("Retry-After", String(check.retryAfter));
      throw new AppError("RATE_LIMITED", "Too many verification attempts. Wait a minute and try again.", {
        retryAfter: check.retryAfter,
      });
    }
  }

  async assertRefreshLimit(userId: string, res?: Response): Promise<void> {
    // 30 per user per hour
    const check = await this.checkLimit(`ratelimit:auth:refresh:${userId}`, 30, 3600);
    if (!check.allowed) {
      if (res) res.setHeader("Retry-After", String(check.retryAfter));
      throw new AppError("RATE_LIMITED", "Too many refresh attempts. Wait a minute and try again.", {
        retryAfter: check.retryAfter,
      });
    }
  }
}
