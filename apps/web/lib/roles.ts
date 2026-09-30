import type { MeDto, Role } from "@aptransit/shared";

// docs/08, "Roles and scope": home route after login, and "default is the highest role".

export const ROLE_HOME: Record<Role, string> = {
  CITIZEN: "/",
  DRIVER: "/driver",
  CONDUCTOR: "/conductor",
  DEPOT_STAFF: "/ops",
  DEPOT_MANAGER: "/ops",
  DISTRICT_OFFICER: "/gov",
  TRANSPORT_OFFICER: "/gov",
  STATE_ADMIN: "/admin",
  SUPER_ADMIN: "/admin",
};

/** Highest first, the order of the docs/08 roles table read bottom up. */
const ROLE_RANK: readonly Role[] = [
  "SUPER_ADMIN",
  "STATE_ADMIN",
  "TRANSPORT_OFFICER",
  "DISTRICT_OFFICER",
  "DEPOT_MANAGER",
  "DEPOT_STAFF",
  "CONDUCTOR",
  "DRIVER",
  "CITIZEN",
];

export function rolesOf(user: Pick<MeDto, "roles"> | null | undefined): Role[] {
  return [...new Set((user?.roles ?? []).map((r) => r.role))];
}

/** Distinct roles, highest first. Every user is at least a CITIZEN. */
export function sortedRoles(user: Pick<MeDto, "roles">): Role[] {
  const own = new Set(rolesOf(user));
  own.add("CITIZEN");
  return ROLE_RANK.filter((role) => own.has(role));
}

export function highestRole(user: Pick<MeDto, "roles">): Role {
  return sortedRoles(user)[0] ?? "CITIZEN";
}

export function roleHome(user: Pick<MeDto, "roles">): string {
  return ROLE_HOME[highestRole(user)];
}

/**
 * Only same site paths are allowed after login ("/tickets?x=1"), so `next` can never send
 * the user to another site ("//evil.test", "https://...", "/\evil.test").
 */
export function safeNextPath(next: string | null | undefined): string | null {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return null;
  if ([...next].some((c) => c.charCodeAt(0) < 32)) return null;
  if (next === "/login" || next.startsWith("/login?") || next.startsWith("/login/")) return null;
  return next;
}
