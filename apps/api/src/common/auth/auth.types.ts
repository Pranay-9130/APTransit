import type { Role } from "@aptransit/shared";

export interface AuthenticatedUserRole {
  role: Role;
  depotId?: string | null;
  districtId?: string | null;
}

export interface AuthenticatedUser {
  id: string;
  roles: AuthenticatedUserRole[];
}
