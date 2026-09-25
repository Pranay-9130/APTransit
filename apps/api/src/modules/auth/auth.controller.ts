import {
  type AuthRefreshResponse,
  type AuthVerifyResponse,
  type MeDto,
  OtpRequestInput,
  type OtpRequestResponse,
  OtpVerifyInput,
  UpdateMeInput,
} from "@aptransit/shared";
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
  Res,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Request, Response } from "express";
import type { AuthenticatedUser } from "../../common/auth/auth.types";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Public } from "../../common/decorators/public.decorator";
import { AppError } from "../../common/errors/app-error";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import type { Env } from "../../config/env";
import { AuthService } from "./auth.service";

function getRefreshTokenFromReq(req: Request): string | undefined {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return undefined;
  const match = cookieHeader.match(/(?:^|;\s*)apt_rt=([^;]+)/);
  return match?.[1] ? decodeURIComponent(match[1]) : undefined;
}

function setRefreshTokenCookie(res: Response, token: string, isProd: boolean) {
  res.cookie("apt_rt", token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/api/v1/auth",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
}

function clearRefreshTokenCookie(res: Response) {
  res.clearCookie("apt_rt", {
    path: "/api/v1/auth",
  });
}

@Controller()
export class AuthController {
  private readonly isProd: boolean;

  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService<Env, true>,
  ) {
    this.isProd = this.config.get("APP_ENV", { infer: true }) === "production";
  }

  @Public()
  @Post("auth/otp/request")
  @HttpCode(HttpStatus.ACCEPTED)
  async requestOtp(
    @Body(new ZodValidationPipe(OtpRequestInput)) body: OtpRequestInput,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<OtpRequestResponse> {
    const ip = req.ip ?? "127.0.0.1";
    return this.authService.requestOtp(body, ip, res);
  }

  @Public()
  @Post("auth/otp/verify")
  @HttpCode(HttpStatus.OK)
  async verifyOtp(
    @Body(new ZodValidationPipe(OtpVerifyInput)) body: OtpVerifyInput,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthVerifyResponse> {
    const ip = req.ip ?? "127.0.0.1";
    const userAgent = req.headers["user-agent"];
    const result = await this.authService.verifyOtp(body, ip, userAgent, res);

    setRefreshTokenCookie(res, result.refreshToken, this.isProd);

    return {
      accessToken: result.accessToken,
      user: result.user,
    };
  }

  @Public()
  @Post("auth/refresh")
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthRefreshResponse> {
    const rawToken = getRefreshTokenFromReq(req);
    if (!rawToken) {
      throw new AppError("UNAUTHENTICATED", "No refresh token provided");
    }

    const ip = req.ip;
    const userAgent = req.headers["user-agent"];
    const result = await this.authService.refresh(rawToken, ip, userAgent, res);

    setRefreshTokenCookie(res, result.newRefreshToken, this.isProd);

    return {
      accessToken: result.accessToken,
    };
  }

  @Public()
  @Post("auth/logout")
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<void> {
    const rawToken = getRefreshTokenFromReq(req);
    const ip = req.ip;
    const userAgent = req.headers["user-agent"];

    await this.authService.logout(rawToken, user, ip, userAgent);
    clearRefreshTokenCookie(res);
  }

  @Get("me")
  async getMe(@CurrentUser() user: AuthenticatedUser): Promise<MeDto> {
    if (!user) {
      throw new AppError("UNAUTHENTICATED", "Authentication required");
    }
    return this.authService.getMe(user.id);
  }

  @Patch("me")
  async updateMe(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(UpdateMeInput)) body: UpdateMeInput,
  ): Promise<MeDto> {
    if (!user) {
      throw new AppError("UNAUTHENTICATED", "Authentication required");
    }
    return this.authService.updateMe(user.id, body);
  }
}
