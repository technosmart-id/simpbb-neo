import test, { describe, it } from "node:test";
import assert from "node:assert";
import { hasPermission, getPermittedModules } from "./permissions.ts";

describe("Permissions", () => {
  describe("hasPermission", () => {
    it("should return true for ADMIN for any module and operation (except sppt)", () => {
      assert.strictEqual(hasPermission("ADMIN", "dashboard", "read"), true);
      assert.strictEqual(hasPermission("admin", "pengguna", "write"), true);
      assert.strictEqual(hasPermission("Admin", "log", "delete"), true);
    });

    it("should return false for modules not in definitions (e.g. sppt is missing for ADMIN)", () => {
      // @ts-ignore
      assert.strictEqual(hasPermission("ADMIN", "sppt", "read"), false);
    });

    it("should return true for specific role permissions", () => {
      // OPERATOR_DATA has read/write on spop
      assert.strictEqual(hasPermission("OPERATOR_DATA", "spop", "read"), true);
      assert.strictEqual(hasPermission("OPERATOR_DATA", "spop", "write"), true);

      // PETUGAS_LAPANGAN has read/write on spop
      assert.strictEqual(hasPermission("PETUGAS_LAPANGAN", "spop", "read"), true);
      assert.strictEqual(hasPermission("PETUGAS_LAPANGAN", "spop", "write"), true);
    });

    it("should return false for permissions not granted to a role", () => {
      // OPERATOR_DATA doesn't have access to pengguna
      assert.strictEqual(hasPermission("OPERATOR_DATA", "pengguna", "read"), false);

      // PETUGAS_LAPANGAN doesn't have access to pembayaran
      assert.strictEqual(hasPermission("PETUGAS_LAPANGAN", "pembayaran", "read"), false);
    });

    it("should handle case-insensitivity for role names", () => {
      assert.strictEqual(hasPermission("operator_data", "spop", "read"), true);
      assert.strictEqual(hasPermission("Operator_Data", "spop", "read"), true);
    });

    it("should return false for invalid roles, modules, or operations", () => {
      // @ts-ignore - testing invalid input
      assert.strictEqual(hasPermission("NON_EXISTENT_ROLE", "dashboard", "read"), false);

      // @ts-ignore - testing invalid input
      assert.strictEqual(hasPermission("ADMIN", "non_existent_module", "read"), false);

      // @ts-ignore - testing invalid input
      assert.strictEqual(hasPermission("ADMIN", "dashboard", "non_existent_operation"), false);
    });
  });

  describe("getPermittedModules", () => {
    it("should return modules with read permission for ADMIN", () => {
      const modules = getPermittedModules("ADMIN");
      assert.ok(modules.includes("dashboard"));
      assert.ok(modules.includes("pengguna"));
      // modules not in definitions should not be included
      assert.strictEqual(modules.includes("sppt" as any), false);
      assert.ok(modules.length > 10);
    });

    it("should return only modules with read permission for a role", () => {
      const modules = getPermittedModules("PETUGAS_LAPANGAN");
      assert.ok(modules.includes("spop"));
      assert.ok(modules.includes("dashboard"));
      assert.strictEqual(modules.includes("pembayaran"), false);
      assert.strictEqual(modules.includes("pengguna"), false);
    });

    it("should handle case-insensitivity", () => {
      const modules = getPermittedModules("admin");
      assert.ok(modules.length > 0);
    });

    it("should return an empty array for invalid roles", () => {
      const modules = getPermittedModules("NON_EXISTENT_ROLE");
      assert.strictEqual(modules.length, 0);
    });
  });
});
