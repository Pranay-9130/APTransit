import { SetMetadata } from "@nestjs/common";

export const AUDIT_ACTION_KEY = "auditAction";

/** Attaches audit action to a route. */
export const Audit = (action: string) => SetMetadata(AUDIT_ACTION_KEY, action);
