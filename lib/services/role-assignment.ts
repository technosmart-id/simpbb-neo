/**
 * Role Assignment Service
 *
 * Manages role assignments for members.
 * Handles the junction table between members and roles.
 *
 * This is the business logic layer on top of the database operations.
 */

import { eq, and, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { member, memberRoles, orgRoles } from "@/lib/db/schema";
import { ORG_ROLES } from "@/lib/services/authorization-constants";
import {
	getCasbinSyncService,
	type PermissionMap,
} from "@/lib/services/casbin-sync";
import type { RoleAssignment, EnrichedMemberRole } from "@/lib/db/schema/member-roles";

/**
 * Role assignment result
 */
export interface RoleAssignmentResult {
	id: string;
	memberId: string;
	roleId: string;
	roleType: "system" | "custom";
	createdAt: Date;
}

/**
 * Enriched role assignment with metadata
 */
export interface RoleWithMetadata extends RoleAssignmentResult {
	roleName?: string;
	roleSlug?: string;
	customRoleDescription?: string;
}

/**
 * Get all roles assigned to a member
 */
export async function getMemberRoles(
	memberId: string,
): Promise<RoleWithMetadata[]> {
	const assignments = await db
		.select({
			id: memberRoles.id,
			memberId: memberRoles.memberId,
			roleId: memberRoles.roleId,
			roleType: memberRoles.roleType,
			createdAt: memberRoles.createdAt,
		})
		.from(memberRoles)
		.where(eq(memberRoles.memberId, memberId));

	const result: RoleWithMetadata[] = [];

	for (const assignment of assignments) {
		const enriched: RoleWithMetadata = {
			...assignment,
		};

		if (assignment.roleType === "system") {
			// System roles use predefined names
			enriched.roleName =
				assignment.roleId === ORG_ROLES.OWNER
					? "Owner"
					: assignment.roleId === ORG_ROLES.USER
						? "User"
						: assignment.roleId;
		} else {
			// Custom roles - fetch metadata
			const [customRole] = await db
				.select({
					name: orgRoles.name,
					slug: orgRoles.slug,
					description: orgRoles.description,
				})
				.from(orgRoles)
				.where(eq(orgRoles.id, assignment.roleId))
				.limit(1);

			if (customRole) {
				enriched.roleName = customRole.name;
				enriched.roleSlug = customRole.slug;
				enriched.customRoleDescription = customRole.description || undefined;
			}
		}

		result.push(enriched);
	}

	return result;
}

/**
 * Get all role assignments for a member's organization
 */
export async function getOrgMembersWithRoles(
	organizationId: string,
): Promise<Array<{ memberId: string; userId: string; roles: RoleWithMetadata[] }>> {
	// Get all members in the org
	const members = await db
		.select({
			id: member.id,
			userId: member.userId,
		})
		.from(member)
		.where(eq(member.organizationId, organizationId));

	const result = [];

	for (const m of members) {
		const roles = await getMemberRoles(m.id);
		result.push({
			memberId: m.id,
			userId: m.userId,
			roles,
		});
	}

	return result;
}

/**
 * Assign a role to a member
 *
 * @throws Error if member already has this role
 */
export async function assignRoleToMember(params: {
	memberId: string;
	roleId: string;
	roleType: "system" | "custom";
	assignedBy: string;
}): Promise<RoleAssignmentResult> {
	const { memberId, roleId, roleType, assignedBy } = params;

	// Verify member exists and get orgId
	const [memberData] = await db
		.select({
			id: member.id,
			organizationId: member.organizationId,
			userId: member.userId,
		})
		.from(member)
		.where(eq(member.id, memberId))
		.limit(1);

	if (!memberData) {
		throw new Error("Member not found");
	}

	// For custom roles, verify the role belongs to the same org
	if (roleType === "custom") {
		const [customRole] = await db
			.select({
				id: orgRoles.id,
				organizationId: orgRoles.organizationId,
			})
			.from(orgRoles)
			.where(eq(orgRoles.id, roleId))
			.limit(1);

		if (!customRole || customRole.organizationId !== memberData.organizationId) {
			throw new Error("Custom role not found or doesn't belong to this organization");
		}
	}

	// Check if already assigned
	const [existing] = await db
		.select({ id: memberRoles.id })
		.from(memberRoles)
		.where(
			and(
				eq(memberRoles.memberId, memberId),
				eq(memberRoles.roleId, roleId),
				eq(memberRoles.roleType, roleType),
			),
		)
		.limit(1);

	if (existing) {
		throw new Error(`Member already has this ${roleType} role`);
	}

	// Insert into junction table
	const [assignment] = await db
		.insert(memberRoles)
		.values({
			id: crypto.randomUUID(),
			memberId,
			roleId,
			roleType,
			createdBy: assignedBy,
		})
		.returning();

	// Sync to Casbin
	const casbinSync = getCasbinSyncService();
	await casbinSync.assignRoleToMember(
		memberId,
		roleId,
		roleType,
		memberData.organizationId,
	);

	return {
		id: assignment.id,
		memberId: assignment.memberId,
		roleId: assignment.roleId,
		roleType: assignment.roleType as "system" | "custom",
		createdAt: assignment.createdAt,
	};
}

/**
 * Remove a role from a member
 */
export async function removeRoleFromMember(params: {
	memberId: string;
	roleId: string;
	roleType: "system" | "custom";
}): Promise<void> {
	const { memberId, roleId, roleType } = params;

	// Get member's orgId for Casbin sync
	const [memberData] = await db
		.select({
			organizationId: member.organizationId,
		})
		.from(member)
		.where(eq(member.id, memberId))
		.limit(1);

	if (!memberData) {
		throw new Error("Member not found");
	}

	// Delete from junction table
	await db
		.delete(memberRoles)
		.where(
			and(
				eq(memberRoles.memberId, memberId),
				eq(memberRoles.roleId, roleId),
				eq(memberRoles.roleType, roleType),
			),
		);

	// Sync to Casbin
	const casbinSync = getCasbinSyncService();
	await casbinSync.removeRoleFromMember(
		memberId,
		roleId,
		roleType,
		memberData.organizationId,
	);
}

/**
 * Remove all roles from a member
 */
export async function removeAllRolesFromMember(memberId: string): Promise<void> {
	const assignments = await db
		.select({
			roleId: memberRoles.roleId,
			roleType: memberRoles.roleType,
		})
		.from(memberRoles)
		.where(eq(memberRoles.memberId, memberId));

	// Get member's orgId
	const [memberData] = await db
		.select({
			organizationId: member.organizationId,
		})
		.from(member)
		.where(eq(member.id, memberId))
		.limit(1);

	if (!memberData) {
		throw new Error("Member not found");
	}

	const casbinSync = getCasbinSyncService();

	// Remove each assignment
	for (const assignment of assignments) {
		await db
			.delete(memberRoles)
			.where(
				and(
					eq(memberRoles.memberId, memberId),
					eq(memberRoles.roleId, assignment.roleId),
					eq(memberRoles.roleType, assignment.roleType),
				),
			);

		await casbinSync.removeRoleFromMember(
			memberId,
			assignment.roleId,
			assignment.roleType as "system" | "custom",
			memberData.organizationId,
		);
	}
}

/**
 * Check if a member has a specific role
 */
export async function memberHasRole(
	memberId: string,
	roleId: string,
	roleType?: "system" | "custom",
): Promise<boolean> {
	const conditions = [eq(memberRoles.memberId, memberId), eq(memberRoles.roleId, roleId)];

	if (roleType) {
		conditions.push(eq(memberRoles.roleType, roleType));
	}

	const [assignment] = await db
		.select({ id: memberRoles.id })
		.from(memberRoles)
		.where(and(...conditions))
		.limit(1);

	return !!assignment;
}

/**
 * Migrate existing member roles to the junction table
 * Called during migration to populate member_roles from member table
 */
export async function migrateMemberRoles(): Promise<void> {
	// Get all members with their legacy role assignments
	const members = await db
		.select({
			id: member.id,
			role: member.role,
			customRoleId: member.customRoleId,
			userId: member.userId,
			createdAt: member.createdAt,
		})
		.from(member);

	const casbinSync = getCasbinSyncService();

	for (const m of members) {
		// Always add the system role
		const systemRoleId = m.role || ORG_ROLES.USER;
		const hasSystemRole = await memberHasRole(m.id, systemRoleId, "system");

		if (!hasSystemRole) {
			await db.insert(memberRoles).values({
				id: crypto.randomUUID(),
				memberId: m.id,
				roleId: systemRoleId,
				roleType: "system",
				createdBy: m.userId, // Use their own user ID as creator
				createdAt: m.createdAt,
			});

			// Also sync to Casbin - need orgId
			const [memberData] = await db
				.select({ organizationId: member.organizationId })
				.from(member)
				.where(eq(member.id, m.id))
				.limit(1);

			if (memberData) {
				await casbinSync.assignRoleToMember(
					m.id,
					systemRoleId,
					"system",
					memberData.organizationId,
				);
			}
		}

		// Add custom role if exists
		if (m.customRoleId) {
			const hasCustomRole = await memberHasRole(m.id, m.customRoleId, "custom");

			if (!hasCustomRole) {
				await db.insert(memberRoles).values({
					id: crypto.randomUUID(),
					memberId: m.id,
					roleId: m.customRoleId,
					roleType: "custom",
					createdBy: m.userId,
					createdAt: m.createdAt,
				});

				const [memberData] = await db
					.select({ organizationId: member.organizationId })
					.from(member)
					.where(eq(member.id, m.id))
					.limit(1);

				if (memberData) {
					await casbinSync.assignRoleToMember(
						m.id,
						m.customRoleId,
						"custom",
						memberData.organizationId,
					);
				}
			}
		}
	}
}

/**
 * Set roles for a member (replaces all existing roles)
 */
export async function setMemberRoles(params: {
	memberId: string;
	roles: Array<{ roleId: string; roleType: "system" | "custom" }>;
	assignedBy: string;
}): Promise<void> {
	const { memberId, roles, assignedBy } = params;

	// Get member's orgId
	const [memberData] = await db
		.select({
			organizationId: member.organizationId,
		})
		.from(member)
		.where(eq(member.id, memberId))
		.limit(1);

	if (!memberData) {
		throw new Error("Member not found");
	}

	// Remove all existing roles
	await removeAllRolesFromMember(memberId);

	// Add new roles
	for (const role of roles) {
		await assignRoleToMember({
			memberId,
			roleId: role.roleId,
			roleType: role.roleType,
			assignedBy,
		});
	}
}
