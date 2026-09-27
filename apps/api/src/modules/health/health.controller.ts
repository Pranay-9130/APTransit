import type { HealthDto } from "@aptransit/shared";
import { Controller, Get, Header, Res } from "@nestjs/common";
import { SkipThrottle } from "@nestjs/throttler";
import type { Response } from "express";
import { Public } from "../../common/decorators/public.decorator";
import { HealthService } from "./health.service";

@Controller("health")
export class HealthController {
  constructor(private readonly health: HealthService) {}

  /** 200 when db and redis answer, 503 otherwise (Render and uptime monitors read the status code). */
  @Public()
  @SkipThrottle()
  @Get()
  @Header("Cache-Control", "no-store")
  async get(@Res({ passthrough: true }) res: Response): Promise<HealthDto> {
    const report = await this.health.check();
    if (report.status !== "ok") res.status(503);
    return report;
  }
}
