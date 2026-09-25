import { describe, expect, it } from "vitest";
import { AppError } from "../errors/app-error";
import { ScopeService } from "./scope.service";

describe("ScopeService", () => {
  const scopeService = new ScopeService();

  const kurnoolDepotManager = {
    id: "usr_dmg_kurnool",
    roles: [{ role: "DEPOT_MANAGER" as const, depotId: "depot_kurnool", districtId: "dist_kurnool" }],
  };

  const kurnoolDistrictOfficer = {
    id: "usr_dof_kurnool",
    roles: [{ role: "DISTRICT_OFFICER" as const, districtId: "dist_kurnool" }],
  };

  const superAdmin = {
    id: "usr_super_admin",
    roles: [{ role: "SUPER_ADMIN" as const }],
  };

  const citizen = {
    id: "usr_citizen",
    roles: [{ role: "CITIZEN" as const }],
  };

  it("allows depot manager access to their own depot", () => {
    expect(() => scopeService.assertDepotAccess(kurnoolDepotManager, "depot_kurnool")).not.toThrow();
  });

  it("throws 403 FORBIDDEN when depot manager accesses another depot (Nandyal)", () => {
    try {
      scopeService.assertDepotAccess(kurnoolDepotManager, "depot_nandyal");
      expect.unreachable("should have thrown FORBIDDEN");
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).code).toBe("FORBIDDEN");
    }
  });

  it("allows district officer access to their district", () => {
    expect(() => scopeService.assertDistrictAccess(kurnoolDistrictOfficer, "dist_kurnool")).not.toThrow();
  });

  it("throws 403 FORBIDDEN when district officer accesses another district", () => {
    expect(() => scopeService.assertDistrictAccess(kurnoolDistrictOfficer, "dist_nandyal")).toThrow(AppError);
  });

  it("allows super admin access across any depot and district", () => {
    expect(() => scopeService.assertDepotAccess(superAdmin, "depot_nandyal")).not.toThrow();
    expect(() => scopeService.assertDistrictAccess(superAdmin, "dist_nandyal")).not.toThrow();
  });

  it("denies citizen access to depot operations", () => {
    expect(() => scopeService.assertDepotAccess(citizen, "depot_kurnool")).toThrow(AppError);
  });
});
