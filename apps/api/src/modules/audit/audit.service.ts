import type { Role } from "@aptransit/shared";
import { Injectable, Logger } from "@nestjs/common";
import type { Prisma } from "../../generated/prisma/client";
import { PrismaService } from "../../prisma/prisma.service";

export interface LogAuditParams {
  action: string;
  entityType: string;
  entityId: string;
  before?: unknown;
  after?: unknown;
  actorUserId?: string | null;
  actorRole?: Role | null;
  ip?: string | null;
  userAgent?: string | null;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async log(params: LogAuditParams): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          action: params.action,
          entityType: params.entityType,
          entityId: params.entityId,
          before: params.before as Prisma.InputJsonValue | undefined,
          after: params.after as Prisma.InputJsonValue | undefined,
          actorUserId: params.actorUserId ?? null,
          actorRole: params.actorRole ?? null,
          ip: params.ip ?? null,
          userAgent: params.userAgent ?? null,
        },
      });
    } catch (err) {
      // Audit log failures should never crash the user request, but must be logged
      this.logger.error("Failed to write audit log", err);
    }
  }
}
