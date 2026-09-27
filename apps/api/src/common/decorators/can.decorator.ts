import type { Permission } from "@aptransit/shared";
import { SetMetadata } from "@nestjs/common";

export const PERMISSION_KEY = "permission";

/** Attaches required permission to a route. Checked by JwtAuthGuard. */
export const Can = (permission: Permission) => SetMetadata(PERMISSION_KEY, permission);
