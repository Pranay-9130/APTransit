import { SetMetadata } from "@nestjs/common";

export const AUDIT_ACTION_KEY = "auditAction";

/**
 * Writes an audit row (docs/12 action name) after the route succeeds. See AuditInterceptor.
 * For before and after snapshots call AuditService.log in the service instead.
 */
export const Audit = (action: string) => SetMetadata(AUDIT_ACTION_KEY, action);
