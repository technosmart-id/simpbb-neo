/**
 * Casbin Sync Service
 *
 * Syncs org_roles metadata changes to Casbin policies.
 * Casbin is the single source of truth for all permissions.
 *
 * This service handles:
 * - Creating/deleting policies when custom roles are created/deleted
 * - Updating policies when role permissions change
 * - Assigning/removing role groupings in Casbin when members are assigned/removed
 */

import { newEnforcer, Enforcer } from "casbin";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { orgRoles } from "@/lib/db/schema";
import { createDrizzleAdapter } from "@/lib/casbin/drizzle-adapter";
import { join } from "path";
import type { CrudPermissions } from "@/lib/db/schema/org-roles";

// Path to the Casbin model config file
const MODEL_PATH = join(process.cwd(), "lib/casbin/model.conf");

let enforcerInstance: Enforcer | null = null;

/**
 * Get or create the Casbin enforcer singleton
 */
async function getEnforcer(): Promise<Enforcer> {
	if (!enforcerInstance) {
		const adapter = createDrizzleAdapter();
		enforcerInstance = await newEnforcer(MODEL_PATH, adapter);
	}
	return enforcerInstance;
}

/**
 * Permission map structure for syncing to Casbin
 */
export interface PermissionMap {
	[resource: string]: {
		create?: boolean;
		read?: boolean;
		update?: boolean;
		delete?: boolean;
		[action: string]: boolean | undefined;
	};
}

/**
 * Convert PermissionMap to Casbin policies
 */
function permissionsToPolicies(
	roleId: string,
	permissions: PermissionMap,
	orgId: string,
): Array<[string, string, string, string, string]> {
	const policies: Array<[string, string, string, string, string]> = [];

	for (const [resource, actions] of Object.entries(permissions)) {
		for (const [action, allowed] of Object.entries(actions)) {
			if (allowed) {
				// Custom role IDs are prefixed with "custom:" in Casbin
				const casbinRoleId = `custom:${roleId}`;
				policies.push([casbinRoleId, resource, action, orgId, "allow"]);
			}
		}
	}

	return policies;
}

/**
 * Clear all policies for a custom role
 */
async function clearRolePolicies(roleId: string, orgId: string): Promise<void> {
	const enforcer = await getEnforcer();
	const casbinRoleId = `custom:${roleId}`;

	// Remove all policies for this role in this domain
	const policies = await enforcer.getFilteredPolicy(0, casbinRoleId, "", "", orgId);
	for (const policy of policies) {
		await enforcer.removePolicy(...policy);
	}

	// Remove all role assignments (g policies) for this custom role
	const groupings = await enforcer.getFilteredNamedGroupingPolicy("g", 1, casbinRoleId, "", orgId);
	for (const grouping of groupings) {
		await enforcer.removeNamedGroupingPolicy("g", ...grouping);
	}
}

/**
 * Casbin Sync Service
 */
export class CasbinSyncService {
	/**
	 * Create permissions for a new custom role in Casbin
	 */
	async createRolePermissions(
		roleId: string,
		permissions: PermissionMap,
		orgId: string,
	): Promise<void> {
		const enforcer = await getEnforcer();
		const policies = permissionsToPolicies(roleId, permissions, orgId);

		for (const policy of policies) {
			await enforcer.addPolicy(...policy);
		}
	}

	/**
	 * Update permissions for an existing custom role
	 * Removes all old policies and adds new ones
	 */
	async updateRolePermissions(
		roleId: string,
		permissions: PermissionMap,
		orgId: string,
	): Promise<void> {
		// Clear existing policies
		await clearRolePolicies(roleId, orgId);

		// Add new policies
		await this.createRolePermissions(roleId, permissions, orgId);
	}

	/**
	 * Delete all permissions for a custom role
	 */
	async deleteRolePermissions(roleId: string, orgId: string): Promise<void> {
		await clearRolePolicies(roleId, orgId);
	}

	/**
	 * Assign a role to a member in Casbin
	 *
	 * For system roles (owner, user):
	 *   g, member:{memberId}, owner, {orgId}
	 *
	 * For custom roles:
	 *   g, member:{memberId}, custom:{roleId}, {orgId}
	 */
	async assignRoleToMember(
		memberId: string,
		roleId: string,
		roleType: "system" | "custom",
		orgId: string,
	): Promise<void> {
		const enforcer = await getEnforcer();
		const subject = `member:${memberId}`;
		const casbinRole = roleType === "system" ? roleId : `custom:${roleId}`;

		await enforcer.addNamedGroupingPolicy("g", subject, casbinRole, orgId);
	}

	/**
	 * Remove a role from a member in Casbin
	 */
	async removeRoleFromMember(
		memberId: string,
		roleId: string,
		roleType: "system" | "custom",
		orgId: string,
	): Promise<void> {
		const enforcer = await getEnforcer();
		const subject = `member:${memberId}`;
		const casbinRole = roleType === "system" ? roleId : `custom:${roleId}`;

		await enforcer.removeNamedGroupingPolicy("g", subject, casbinRole, orgId);
	}

	/**
	 * Assign a global role to a user (no organization context)
	 */
	async assignGlobalRole(userId: string, role: string): Promise<void> {
		const enforcer = await getEnforcer();
		await enforcer.addNamedGroupingPolicy("g", userId, role, "");
	}

	/**
	 * Remove a global role from a user
	 */
	async removeGlobalRole(userId: string): Promise<void> {
		const enforcer = await getEnforcer();
		const groupings = await enforcer.getFilteredNamedGroupingPolicy("g", 0, userId, "", "");

		for (const grouping of groupings) {
			await enforcer.removeNamedGroupingPolicy("g", ...grouping);
		}
	}

	/**
	 * Get all Casbin policies for a custom role
	 */
	async getRolePolicies(roleId: string, orgId: string): Promise<PermissionMap> {
		const enforcer = await getEnforcer();
		const casbinRoleId = `custom:${roleId}`;
		const policies = await enforcer.getFilteredPolicy(0, casbinRoleId, "", "", orgId);

		const permissions: PermissionMap = {};

		for (const policy of policies) {
			const resource = policy[1] as string;
			const action = policy[2] as string;

			if (!permissions[resource]) {
				permissions[resource] = {};
			}

			permissions[resource][action] = true;
		}

		return permissions;
	}

	/**
	 * Initialize system policies for a new organization
	 * Creates default policies for owner and user roles
	 */
	async initializeOrgPolicies(orgId: string): Promise<void> {
		const enforcer = await getEnforcer();

		// Owner: full access
		await enforcer.addPolicy("owner", "*", "*", orgId, "allow");

		// User: default limited permissions
		const defaultUserPermissions = [
			["user", "books", "create", orgId, "allow"],
			["user", "books", "read", orgId, "allow"],
			["user", "books", "update", orgId, "allow"],
			["user", "files", "read", orgId, "allow"],
			["user", "files", "create", orgId, "allow"],
		];

		for (const policy of defaultUserPermissions) {
			await enforcer.addPolicy(...policy);
		}

		// Role hierarchy: owner inherits user permissions (though owner has * anyway)
		await enforcer.addNamedGroupingPolicy("g", "owner", "user", orgId);
	}

	/**
	 * Initialize global policies for users without organizations
	 */
	async initializeGlobalPolicies(): Promise<void> {
		const enforcer = await getEnforcer();

		// Global admin: full system access
		await enforcer.addPolicy("global_admin", "*", "*", "", "allow");

		// Global user: standard permissions
		const globalUserPermissions = [
			["global_user", "books", "create", "", "allow"],
			["global_user", "books", "read", "", "allow"],
			["global_user", "books", "update", "", "allow"],
			["global_user", "books", "delete", "", "allow"],
			["global_user", "files", "create", "", "allow"],
			["global_user", "files", "read", "", "allow"],
			["global_user", "files", "update", "", "allow"],
			["global_user", "files", "delete", "", "allow"],
		];

		for (const policy of globalUserPermissions) {
			await enforcer.addPolicy(...policy);
		}

		// Global role hierarchy
		await enforcer.addNamedGroupingPolicy("g", "global_admin", "global_user", "");
	}

}

// Singleton instance
let casbinSyncInstance: CasbinSyncService | null = null;

export function getCasbinSyncService(): CasbinSyncService {
	if (!casbinSyncInstance) {
		casbinSyncInstance = new CasbinSyncService();
	}
	return casbinSyncInstance;
}

/**
 * Convenience function to create role permissions
 */
export async function createRolePermissions(
	roleId: string,
	permissions: PermissionMap,
	orgId: string,
): Promise<void> {
	const service = getCasbinSyncService();
	await service.createRolePermissions(roleId, permissions, orgId);
}

/**
 * Convenience function to update role permissions
 */
export async function updateRolePermissions(
	roleId: string,
	permissions: PermissionMap,
	orgId: string,
): Promise<void> {
	const service = getCasbinSyncService();
	await service.updateRolePermissions(roleId, permissions, orgId);
}

/**
 * Convenience function to delete role permissions
 */
export async function deleteRolePermissions(
	roleId: string,
	orgId: string,
): Promise<void> {
	const service = getCasbinSyncService();
	await service.deleteRolePermissions(roleId, orgId);
}

/**
 * Convenience function to assign role to member
 */
export async function assignRoleToMember(
	memberId: string,
	roleId: string,
	roleType: "system" | "custom",
	orgId: string,
): Promise<void> {
	const service = getCasbinSyncService();
	await service.assignRoleToMember(memberId, roleId, roleType, orgId);
}

/**
 * Convenience function to remove role from member
 */
export async function removeRoleFromMember(
	memberId: string,
	roleId: string,
	roleType: "system" | "custom",
	orgId: string,
): Promise<void> {
	const service = getCasbinSyncService();
	await service.removeRoleFromMember(memberId, roleId, roleType, orgId);
}
