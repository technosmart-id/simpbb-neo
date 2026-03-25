/**
 * Authorization Service - Casbin-First Architecture
 *
 * SINGLE SOURCE OF TRUTH: Casbin (casbin_rule table)
 *
 * This service provides a centralized authorization layer using Casbin for RBAC
 * with multi-organization support. All permission checks go through Casbin only.
 *
 * Architecture:
 * - org_roles table: Metadata only (name, description)
 * - member_roles table: Junction for role assignments
 * - casbin_rule table: ALL permissions and role groupings
 *
 * Supports:
 * - Organization-scoped roles (owner, user, custom roles)
 * - Global roles (global_admin, global_user) for users without organizations
 * - Multiple roles per member
 * - CRUD-based permissions stored in Casbin policies
 */

import { newEnforcer, Enforcer } from "casbin";
import { eq, and, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { member, memberRoles, orgRoles } from "@/lib/db/schema";
import { createDrizzleAdapter } from "@/lib/casbin/drizzle-adapter";
import { join } from "path";
import { ORG_ROLES, GLOBAL_ROLES, type GlobalRole } from "./authorization-constants";
import { getCasbinSyncService } from "./casbin-sync";

// Path to the Casbin model config file
const MODEL_PATH = join(process.cwd(), "lib/casbin/model.conf");

// Re-export types for API routes
export type { GlobalRole };

// Singleton enforcer
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
 * Authorization check result
 */
export type AuthzResult = {
	allowed: boolean;
	reason?: string;
};

/**
 * Get all Casbin roles for a member in an organization
 * Returns both system roles and custom roles
 */
async function getMemberCasbinRoles(memberId: string, orgId: string): Promise<string[]> {
	const assignments = await db
		.select({
			roleId: memberRoles.roleId,
			roleType: memberRoles.roleType,
		})
		.from(memberRoles)
		.where(eq(memberRoles.memberId, memberId));

	const casbinRoles: string[] = [];

	for (const assignment of assignments) {
		if (assignment.roleType === "system") {
			casbinRoles.push(assignment.roleId);
		} else {
			// Custom roles are prefixed with "custom:" in Casbin
			casbinRoles.push(`custom:${assignment.roleId}`);
		}
	}

	return casbinRoles;
}

/**
 * Main authorization service class
 */
export class AuthorizationService {
	/**
	 * Check if a user can perform an action on a resource within an organization
	 *
	 * This is the PRIMARY authorization method. All permission checks should go through this.
	 */
	async can(params: {
		userId: string;
		action: string;
		resource: string;
		organizationId: string | null | undefined;
	}): Promise<boolean> {
		const { userId, action, resource, organizationId } = params;

		// Handle global users (no organization)
		if (!organizationId) {
			return await this.canGlobal(userId, action, resource);
		}

		// Get user's membership in the organization
		const [membership] = await db
			.select({ id: member.id })
			.from(member)
			.where(
				and(
					eq(member.userId, userId),
					eq(member.organizationId, organizationId),
				),
			)
			.limit(1);

		if (!membership) {
			return false; // Not a member of the org
		}

		// Check if member has any roles assigned
		const [roleAssignment] = await db
			.select({ id: memberRoles.id })
			.from(memberRoles)
			.where(eq(memberRoles.memberId, membership.id))
			.limit(1);

		if (!roleAssignment) {
			return false; // No roles assigned
		}

		// Check permissions using member ID as subject
		// Casbin's g policy maps member:{memberId} -> role, and p policy maps role -> permissions
		const enforcer = await getEnforcer();
		const memberSubject = `member:${membership.id}`;

		// Direct check: Casbin will handle g(role) -> p(policy) matching via g2 (role inheritance)
		return await enforcer.enforce(memberSubject, resource, action, organizationId);
	}

	/**
	 * Check permissions for global users (no organization)
	 */
	async canGlobal(userId: string, action: string, resource: string): Promise<boolean> {
		const enforcer = await getEnforcer();

		// Get user's global role from Casbin g policies with empty domain
		const grouping = await enforcer.getNamedGroupingPolicy("g");

		let userGlobalRole: string | null = null;
		for (const g of grouping) {
			if (g[0] === userId && g[2] === "") {
				userGlobalRole = g[1] as string;
				break;
			}
		}

		if (!userGlobalRole) {
			return false;
		}

		// Check permissions for the global role
		const allowed = await enforcer.enforce(userGlobalRole, resource, action, "");
		if (allowed) {
			return true;
		}

		// Check inherited global roles via g2
		const roleGrouping = await enforcer.getNamedGroupingPolicy("g2");
		for (const g of roleGrouping) {
			if (g[2] === "" && g[0] === userGlobalRole) {
				const parentRole = g[1] as string;
				const inheritedAllowed = await enforcer.enforce(parentRole, resource, action, "");
				if (inheritedAllowed) {
					return true;
				}
			}
		}

		return false;
	}

	/**
	 * Get a user's global role
	 */
	async getGlobalRole(userId: string): Promise<string | null> {
		const enforcer = await getEnforcer();
		const grouping = await enforcer.getNamedGroupingPolicy("g");

		for (const g of grouping) {
			if (g[0] === userId && g[2] === "") {
				return g[1] as string;
			}
		}

		return null;
	}

	/**
	 * Assign a global role to a user
	 */
	async assignGlobalRole(userId: string, role: GlobalRole): Promise<void> {
		const enforcer = await getEnforcer();
		await this.removeGlobalRole(userId);
		await enforcer.addNamedGroupingPolicy("g", userId, role, "");
	}

	/**
	 * Remove a user's global role
	 */
	async removeGlobalRole(userId: string): Promise<void> {
		const enforcer = await getEnforcer();
		const grouping = await enforcer.getNamedGroupingPolicy("g");

		for (const g of grouping) {
			if (g[0] === userId && g[2] === "") {
				await enforcer.removeNamedGroupingPolicy("g", ...g);
			}
		}
	}

	/**
	 * Get all global users with their roles
	 */
	async getGlobalUsers(): Promise<Array<{ userId: string; role: string }>> {
		const enforcer = await getEnforcer();
		const grouping = await enforcer.getNamedGroupingPolicy("g");

		const globalUsers: Array<{ userId: string; role: string }> = [];
		for (const g of grouping) {
			if (g[2] === "") {
				globalUsers.push({
					userId: g[0] as string,
					role: g[1] as string,
				});
			}
		}

		return globalUsers;
	}

	/**
	 * Check if a user owns a specific resource (ABAC - Attribute-Based Access Control)
	 */
	async isResourceOwner(params: {
		userId: string;
		resourceType: string;
		resourceId: string | number;
		organizationId: string;
	}): Promise<boolean> {
		const { userId, resourceType, resourceId, organizationId } = params;

		// For books, check the createdById column
		if (resourceType === "books") {
			const { books } = await import("@/lib/db/schema");
			const [book] = await db
				.select({ createdById: books.createdById })
				.from(books)
				.where(
					and(
						eq(books.id, Number(resourceId)),
						eq(books.organizationId, organizationId),
					),
				)
				.limit(1);

			return book?.createdById === userId;
		}

		return false;
	}

	/**
	 * Get all roles assigned to a user in an organization
	 * Returns enriched role data with metadata
	 */
	async getUserRoles(
		userId: string,
		organizationId: string,
	): Promise<Array<{ id: string; roleId: string; roleType: string; name?: string }>> {
		const [membership] = await db
			.select({ id: member.id })
			.from(member)
			.where(
				and(
					eq(member.userId, userId),
					eq(member.organizationId, organizationId),
				),
			)
			.limit(1);

		if (!membership) {
			return [];
		}

		const assignments = await db
			.select({
				id: memberRoles.id,
				roleId: memberRoles.roleId,
				roleType: memberRoles.roleType,
			})
			.from(memberRoles)
			.where(eq(memberRoles.memberId, membership.id));

		const result = [];

		for (const assignment of assignments) {
			const roleData: any = {
				id: assignment.id,
				roleId: assignment.roleId,
				roleType: assignment.roleType,
			};

			if (assignment.roleType === "system") {
				roleData.name =
					assignment.roleId === ORG_ROLES.OWNER
						? "Owner"
						: assignment.roleId === ORG_ROLES.USER
							? "User"
							: assignment.roleId;
			} else {
				// Fetch custom role metadata
				const [customRole] = await db
					.select({ name: orgRoles.name })
					.from(orgRoles)
					.where(eq(orgRoles.id, assignment.roleId))
					.limit(1);

				if (customRole) {
					roleData.name = customRole.name;
				}
			}

			result.push(roleData);
		}

		return result;
	}

	/**
	 * Get custom role for a member
	 * Returns the first custom role assigned to the member
	 */
	async getMemberCustomRole(memberId: string): Promise<{
		id: string;
		name: string;
		slug: string;
	} | null> {
		const [assignment] = await db
			.select({
				roleId: memberRoles.roleId,
			})
			.from(memberRoles)
			.where(
				and(
					eq(memberRoles.memberId, memberId),
					eq(memberRoles.roleType, "custom"),
				),
			)
			.limit(1);

		if (!assignment) return null;

		const [role] = await db
			.select({
				id: orgRoles.id,
				name: orgRoles.name,
				slug: orgRoles.slug,
			})
			.from(orgRoles)
			.where(eq(orgRoles.id, assignment.roleId))
			.limit(1);

		if (!role) return null;

		return {
			id: role.id,
			name: role.name,
			slug: role.slug,
		};
	}

	/**
	 * Assign a role to a member in an organization (legacy enum-based)
	 * This now uses the junction table internally
	 */
	async assignRole(params: {
		userId: string;
		organizationId: string;
		role: string;
		assignedBy: string;
	}): Promise<void> {
		const { userId, organizationId, role, assignedBy } = params;

		const canAssign = await this.can({
			userId: assignedBy,
			action: "update",
			resource: "members",
			organizationId,
		});

		if (!canAssign) {
			throw new Error("You don't have permission to assign roles");
		}

		const [existingMember] = await db
			.select()
			.from(member)
			.where(
				and(
					eq(member.organizationId, organizationId),
					eq(member.userId, userId),
				),
			)
			.limit(1);

		if (!existingMember) {
			throw new Error("User is not a member of this organization");
		}

		// Import role assignment service
		const { assignRoleToMember: assignToMember } = await import("@/lib/services/role-assignment");
		const { getCasbinSyncService } = await import("@/lib/services/casbin-sync");

		// Check if already has this system role
		const [existing] = await db
			.select({ id: memberRoles.id })
			.from(memberRoles)
			.where(
				and(
					eq(memberRoles.memberId, existingMember.id),
					eq(memberRoles.roleId, role),
					eq(memberRoles.roleType, "system"),
				),
			)
			.limit(1);

		if (!existing) {
			await assignToMember({
				memberId: existingMember.id,
				roleId: role,
				roleType: "system",
				assignedBy,
			});
		}
	}

	/**
	 * Remove a role from a user (sets to default 'user' role)
	 */
	async removeRole(params: {
		userId: string;
		organizationId: string;
		removedBy: string;
	}): Promise<void> {
		const { userId, organizationId, removedBy } = params;

		const canRemove = await this.can({
			userId: removedBy,
			action: "update",
			resource: "members",
			organizationId,
		});

		if (!canRemove) {
			throw new Error("You don't have permission to remove roles");
		}

		const [existingMember] = await db
			.select()
			.from(member)
			.where(
				and(
					eq(member.userId, userId),
					eq(member.organizationId, organizationId),
				),
			)
			.limit(1);

		if (!existingMember) {
			throw new Error("User is not a member of this organization");
		}

		// Remove all system roles and assign 'user' role
		const { removeRoleFromMember, assignRoleToMember } = await import("@/lib/services/role-assignment");

		// Remove existing system roles
		const existingRoles = await db
			.select({ roleId: memberRoles.roleId })
			.from(memberRoles)
			.where(
				and(
					eq(memberRoles.memberId, existingMember.id),
					eq(memberRoles.roleType, "system"),
				),
			);

		for (const role of existingRoles) {
			await removeRoleFromMember({
				memberId: existingMember.id,
				roleId: role.roleId,
				roleType: "system",
			});
		}

		// Assign default 'user' role
		await assignRoleToMember({
			memberId: existingMember.id,
			roleId: ORG_ROLES.USER,
			roleType: "system",
			assignedBy: removedBy,
		});
	}

	/**
	 * Check authorization and throw if not allowed
	 */
	async requirePermission(params: {
		userId: string;
		action: string;
		resource: string;
		organizationId: string;
	}): Promise<void> {
		const allowed = await this.can(params);

		if (!allowed) {
			throw new AuthorizationError(
				`You don't have permission to ${params.action} ${params.resource}`,
			);
		}
	}

	/**
	 * Get all permissions for a user in an organization
	 */
	async getUserPermissions(params: {
		userId: string;
		organizationId: string;
	}): Promise<
		Array<{ resource: string; action: string; source: string }>
	> {
		const { userId, organizationId } = params;
		const enforcer = await getEnforcer();

		// Get member's roles
		const roles = await this.getUserRoles(userId, organizationId);

		const permissions: Array<{
			resource: string;
			action: string;
			source: string;
		}> = [];

		for (const role of roles) {
			const casbinRole = role.roleType === "system" ? role.roleId : `custom:${role.roleId}`;
			const policies = await enforcer.getFilteredPolicy(0, casbinRole, "", "", organizationId);

			for (const policy of policies) {
				if (policy[4] === "allow") {
					permissions.push({
						resource: policy[1] as string,
						action: policy[2] as string,
						source: `role:${role.roleId}`,
					});
				}
			}
		}

		return permissions;
	}

	/**
	 * Get all permissions for a global user
	 */
	async getGlobalUserPermissions(params: {
		userId: string;
	}): Promise<
		Array<{ resource: string; action: string; source: string }>
	> {
		const { userId } = params;
		const globalRole = await this.getGlobalRole(userId);

		if (!globalRole) {
			return [];
		}

		const enforcer = await getEnforcer();
		const permissions: Array<{
			resource: string;
			action: string;
			source: string;
		}> = [];

		const policies = await enforcer.getFilteredPolicy(0, globalRole, "", "", "");
		for (const policy of policies) {
			if (policy[4] === "allow") {
				permissions.push({
					resource: policy[1] as string,
					action: policy[2] as string,
					source: `global_role:${globalRole}`,
				});
			}
		}

		return permissions;
	}

	/**
	 * Create a custom policy for an organization
	 */
	async createPolicy(params: {
		organizationId: string;
		role: string;
		resource: string;
		action: string;
	}): Promise<void> {
		const enforcer = await getEnforcer();

		await enforcer.addPolicy(
			params.role,
			params.resource,
			params.action,
			"allow",
			params.organizationId,
		);
	}

	/**
	 * Remove a policy from an organization
	 */
	async removePolicy(params: {
		organizationId: string;
		role: string;
		resource: string;
		action: string;
	}): Promise<void> {
		const enforcer = await getEnforcer();

		await enforcer.removePolicy(
			params.role,
			params.resource,
			params.action,
			"allow",
			params.organizationId,
		);
	}

	/**
	 * Get all policies for an organization
	 */
	async getOrgPolicies(organizationId: string): Promise<
		Array<{
			id: string;
			role: string;
			resource: string;
			action: string;
			effect: string;
		}>
	> {
		const enforcer = await getEnforcer();
		const policies = await enforcer.getFilteredPolicy(3, organizationId);

		return policies.map((p, idx) => ({
			id: `${organizationId}-${idx}`,
			role: (p[0] ?? "") as string,
			resource: (p[1] ?? "") as string,
			action: (p[2] ?? "") as string,
			effect: (p[4] ?? "allow") as string,
		}));
	}

	/**
	 * Create a custom global policy
	 */
	async createGlobalPolicy(params: {
		role: GlobalRole;
		resource: string;
		action: string;
	}): Promise<void> {
		const enforcer = await getEnforcer();

		await enforcer.addPolicy(
			params.role,
			params.resource,
			params.action,
			"allow",
			"",
		);
	}

	/**
	 * Remove a global policy
	 */
	async removeGlobalPolicy(params: {
		role: GlobalRole;
		resource: string;
		action: string;
	}): Promise<void> {
		const enforcer = await getEnforcer();

		await enforcer.removePolicy(
			params.role,
			params.resource,
			params.action,
			"allow",
			"",
		);
	}

	/**
	 * Get all global policies
	 */
	async getGlobalPolicies(): Promise<
		Array<{
			id: string;
			role: string;
			resource: string;
			action: string;
			effect: string;
		}>
	> {
		const enforcer = await getEnforcer();
		const policies = await enforcer.getFilteredPolicy(3, "");

		return policies.map((p, idx) => ({
			id: `global-${idx}`,
			role: (p[0] ?? "") as string,
			resource: (p[1] ?? "") as string,
			action: (p[2] ?? "") as string,
			effect: (p[4] ?? "allow") as string,
		}));
	}
}

/**
 * Authorization error class
 */
export class AuthorizationError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "AuthorizationError";
	}
}

// Singleton instance
let authServiceInstance: AuthorizationService | null = null;

export function getAuthorizationService(): AuthorizationService {
	if (!authServiceInstance) {
		authServiceInstance = new AuthorizationService();
	}
	return authServiceInstance;
}

/**
 * Convenience function to check authorization
 */
export async function can(params: {
	userId: string;
	action: string;
	resource: string;
	organizationId: string;
}): Promise<boolean> {
	const service = getAuthorizationService();
	return service.can(params);
}

/**
 * Convenience function to require authorization (throws if not allowed)
 */
export async function requirePermission(params: {
	userId: string;
	action: string;
	resource: string;
	organizationId: string;
}): Promise<void> {
	const service = getAuthorizationService();
	await service.requirePermission(params);
}

/**
 * Initialize default policies for an organization
 * Re-exported from CasbinSyncService for backward compatibility
 */
export async function initializeOrgPolicies(orgId: string): Promise<void> {
	const casbinSync = getCasbinSyncService();
	await casbinSync.initializeOrgPolicies(orgId);
}

/**
 * Initialize global policies for users without organizations
 * Re-exported from CasbinSyncService for backward compatibility
 */
export async function initializeGlobalPolicies(): Promise<void> {
	const casbinSync = getCasbinSyncService();
	await casbinSync.initializeGlobalPolicies();
}
