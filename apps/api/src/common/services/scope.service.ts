import type { Role } from "@aptransit/shared";
import { Injectable } from "@nestjs/common";
import type { AuthenticatedUser } from "../auth/auth.types";
import { AppError } from "../errors/app-error";

const STATEWIDE_ROLES: ReadonlySet<Role> = new Set([
  "SUPER_ADMIN",
  "STATE_ADMIN",
  "TRANSPORT_OFFICER",
]);

@Injectable()
export class ScopeService {
  /**
   * Asserts that the authenticated user has access to the specified depot.
   * Throws FORBIDDEN if the user does not have depot or statewide permissions.
   */
  assertDepotAccess(user: AuthenticatedUser, depotId: string): void {
    if (!user || !user.roles || user.roles.length === 0) {
      throw new AppError("FORBIDDEN", "Forbidden: depot access denied");
    }

    for (const userRole of user.roles) {
      if (STATEWIDE_ROLES.has(userRole.role)) {
        return;
      }
      if (userRole.depotId === depotId) {
        return;
      }
    }

    throw new AppError("FORBIDDEN", "Forbidden: depot access denied");
  }

  /**
   * Asserts that the authenticated user has access to the specified district.
   * Throws FORBIDDEN if the user does not have district or statewide permissions.
   */
  assertDistrictAccess(user: AuthenticatedUser, districtId: string): void {
    if (!user || !user.roles || user.roles.length === 0) {
      throw new AppError("FORBIDDEN", "Forbidden: district access denied");
    }

    for (const userRole of user.roles) {
      if (STATEWIDE_ROLES.has(userRole.role)) {
        return;
      }
      if (userRole.districtId === districtId) {
        return;
      }
    }

    throw new AppError("FORBIDDEN", "Forbidden: district access denied");
  }
}
