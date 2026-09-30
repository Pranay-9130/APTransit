import type { MeDto } from "@aptransit/shared";
import { describe, expect, it } from "vitest";
import { highestRole, roleHome, safeNextPath, sortedRoles } from "./roles";

const user = (...roles: MeDto["roles"][number]["role"][]) => ({ roles: roles.map((role) => ({ role })) });

describe("roles", () => {
  it("sends each role to its docs/08 home", () => {
    expect(roleHome(user("CITIZEN"))).toBe("/");
    expect(roleHome(user("CITIZEN", "DRIVER"))).toBe("/driver");
    expect(roleHome(user("CITIZEN", "CONDUCTOR"))).toBe("/conductor");
    expect(roleHome(user("CITIZEN", "DEPOT_MANAGER"))).toBe("/ops");
    expect(roleHome(user("CITIZEN", "TRANSPORT_OFFICER"))).toBe("/gov");
    expect(roleHome(user("CITIZEN", "DEPOT_STAFF", "STATE_ADMIN"))).toBe("/admin");
  });

  it("picks the highest role and always includes CITIZEN", () => {
    expect(highestRole(user("DRIVER", "DISTRICT_OFFICER"))).toBe("DISTRICT_OFFICER");
    expect(sortedRoles(user("DRIVER"))).toEqual(["DRIVER", "CITIZEN"]);
    expect(highestRole(user())).toBe("CITIZEN");
  });
});

describe("safeNextPath", () => {
  it.each(["/tickets", "/ops/buses?status=IDLE", "/account"])("keeps %s", (next) => {
    expect(safeNextPath(next)).toBe(next);
  });

  it.each([null, "", "tickets", "//evil.test", "/\\evil.test", "https://evil.test", "/login", "/login?next=/x", "/a\nb"])(
    "refuses %s",
    (next) => {
      expect(safeNextPath(next)).toBeNull();
    },
  );
});
