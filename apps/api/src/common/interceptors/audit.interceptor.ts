import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";
import { mergeMap, type Observable } from "rxjs";
import { AuditService, auditActorFromRequest } from "../../modules/audit/audit.service";
import type { AuthenticatedUser } from "../auth/auth.types";
import { AUDIT_ACTION_KEY } from "../decorators/audit.decorator";

/**
 * Writes one audit row after a route marked with @Audit(action) succeeds. The entity type is the
 * action prefix ("booking.create" gives "booking"); the id comes from the response or :id param.
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly audit: AuditService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const action = this.reflector.get<string | undefined>(AUDIT_ACTION_KEY, context.getHandler());
    if (!action || context.getType() !== "http") return next.handle();

    const req = context.switchToHttp().getRequest<Request & { user?: AuthenticatedUser }>();
    return next.handle().pipe(
      mergeMap(async (result: unknown) => {
        const responseId =
          typeof result === "object" && result !== null && "id" in result ? String(result.id) : undefined;
        const paramId = typeof req.params?.id === "string" ? req.params.id : undefined;
        await this.audit.log({
          action,
          entityType: action.split(".")[0] ?? action,
          entityId: responseId ?? paramId ?? "unknown",
          ...auditActorFromRequest(req),
        });
        return result;
      }),
    );
  }
}
