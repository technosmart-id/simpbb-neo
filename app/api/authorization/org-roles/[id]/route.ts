import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { member, orgRoles, user, memberRoles } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"
import { getCasbinSyncService } from "@/lib/services/casbin-sync"

/**
 * Generate a URL-friendly slug from a role name
 */
function generateSlug(name: string): string {
	return name
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, "")
		.replace(/[\s_-]+/g, "-")
		.replace(/^-+|-+$/g, "")
}

interface RouteContext {
	params: Promise<{ id: string }>
}

/**
 * GET /api/authorization/org-roles/[id]
 *
 * Get a specific role by ID with permissions from Casbin
 */
export async function GET(request: NextRequest, context: RouteContext) {
	const session = await auth.api.getSession({
		headers: request.headers,
	})

	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
	}

	const { id } = await context.params

	try {
		const [role] = await db
			.select({
				id: orgRoles.id,
				organizationId: orgRoles.organizationId,
				name: orgRoles.name,
				slug: orgRoles.slug,
				description: orgRoles.description,
				isDefaultRole: orgRoles.isDefaultRole,
				createdAt: orgRoles.createdAt,
				updatedAt: orgRoles.updatedAt,
				createdBy: orgRoles.createdBy,
				createdByName: user.name,
				createdByEmail: user.email,
			})
			.from(orgRoles)
			.leftJoin(user, eq(orgRoles.createdBy, user.id))
			.where(eq(orgRoles.id, id))
			.limit(1)

		if (!role) {
			return NextResponse.json({ error: "Role not found" }, { status: 404 })
		}

		// Verify user is a member of the org
		const [membership] = await db
			.select({ role: member.role })
			.from(member)
			.where(
				and(
					eq(member.organizationId, role.organizationId),
					eq(member.userId, session.user.id),
				),
			)
			.limit(1)

		if (!membership) {
			return NextResponse.json({ error: "Not a member of this organization" }, { status: 403 })
		}

		// Get permissions from Casbin
		const casbinSync = getCasbinSyncService()
		const permissions = await casbinSync.getRolePolicies(role.id, role.organizationId)

		// Count members with this role using junction table
		const [memberCountResult] = await db
			.select({ count: memberRoles.id })
			.from(memberRoles)
			.where(
				and(
					eq(memberRoles.roleId, id),
					eq(memberRoles.roleType, "custom")
				)
			)

		return NextResponse.json({
			role: {
				...role,
				memberCount: memberCountResult?.count || 0,
				permissions,
			},
		})
	} catch (error) {
		console.error("Error fetching role:", error)
		return NextResponse.json({ error: "Failed to fetch role" }, { status: 500 })
	}
}

/**
 * PATCH /api/authorization/org-roles/[id]
 *
 * Update a custom role (name, description, permissions)
 * Permissions are synced to Casbin
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
	const session = await auth.api.getSession({
		headers: request.headers,
	})

	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
	}

	const { id } = await context.params
	const body = await request.json()
	const { name, description, permissions } = body

	// Get the role first
	const [existingRole] = await db
		.select()
		.from(orgRoles)
		.where(eq(orgRoles.id, id))
		.limit(1)

	if (!existingRole) {
		return NextResponse.json({ error: "Role not found" }, { status: 404 })
	}

	// Verify user is an owner of the org
	const [membership] = await db
		.select({ role: member.role })
		.from(member)
		.where(
			and(
				eq(member.organizationId, existingRole.organizationId),
				eq(member.userId, session.user.id),
			),
		)
		.limit(1)

	if (!membership || membership.role !== "owner") {
		return NextResponse.json({ error: "Only owners can update roles" }, { status: 403 })
	}

	// Cannot modify system default role name
	if (existingRole.isDefaultRole && name && name !== existingRole.name) {
		return NextResponse.json({ error: "Cannot rename default User role" }, { status: 400 })
	}

	// If name is changing, check for slug conflicts
	if (name && name !== existingRole.name) {
		const newSlug = generateSlug(name)
		const [slugConflict] = await db
			.select({ id: orgRoles.id })
			.from(orgRoles)
			.where(
				and(
					eq(orgRoles.organizationId, existingRole.organizationId),
					eq(orgRoles.slug, newSlug),
				),
			)
			.limit(1)

		if (slugConflict && slugConflict.id !== id) {
			return NextResponse.json({ error: "A role with this name already exists" }, { status: 400 })
		}
	}

	try {
		const updateData: Record<string, unknown> = {
			updatedAt: new Date(),
		}

		if (name) {
			updateData.name = name
			updateData.slug = generateSlug(name)
		}
		if (description !== undefined) {
			updateData.description = description
		}

		// Update role metadata
		await db
			.update(orgRoles)
			.set(updateData)
			.where(eq(orgRoles.id, id))

		// Sync permissions to Casbin if provided
		if (permissions) {
			const casbinSync = getCasbinSyncService()
			await casbinSync.updateRolePermissions(id, permissions, existingRole.organizationId)
		}

		// Fetch the updated role
		const [updatedRole] = await db
			.select()
			.from(orgRoles)
			.where(eq(orgRoles.id, id))
			.limit(1)

		// Get updated permissions from Casbin
		const casbinSync = getCasbinSyncService()
		const updatedPermissions = await casbinSync.getRolePolicies(id, existingRole.organizationId)

		return NextResponse.json({
			role: {
				...updatedRole,
				permissions: updatedPermissions,
			}
		})
	} catch (error) {
		console.error("Error updating role:", error)
		return NextResponse.json({ error: "Failed to update role" }, { status: 500 })
	}
}

/**
 * DELETE /api/authorization/org-roles/[id]
 *
 * Delete a custom role
 * Cannot delete the default User role
 * Also removes Casbin policies and member_roles assignments
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
	const session = await auth.api.getSession({
		headers: request.headers,
	})

	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
	}

	const { id } = await context.params

	// Get the role first
	const [existingRole] = await db
		.select()
		.from(orgRoles)
		.where(eq(orgRoles.id, id))
		.limit(1)

	if (!existingRole) {
		return NextResponse.json({ error: "Role not found" }, { status: 404 })
	}

	// Verify user is an owner of the org
	const [membership] = await db
		.select({ role: member.role })
		.from(member)
		.where(
			and(
				eq(member.organizationId, existingRole.organizationId),
				eq(member.userId, session.user.id),
			),
		)
		.limit(1)

	if (!membership || membership.role !== "owner") {
		return NextResponse.json({ error: "Only owners can delete roles" }, { status: 403 })
	}

	// Cannot delete the default User role
	if (existingRole.isDefaultRole) {
		return NextResponse.json({ error: "Cannot delete default User role" }, { status: 400 })
	}

	// Check if any members have this role assigned (using junction table)
	const [membersWithRole] = await db
		.select({ count: memberRoles.id })
		.from(memberRoles)
		.where(
			and(
				eq(memberRoles.roleId, id),
				eq(memberRoles.roleType, "custom")
			)
		)
		.limit(1)

	if (membersWithRole && membersWithRole.count > 0) {
		return NextResponse.json({
			error: `Cannot delete role assigned to ${membersWithRole.count} member(s)`,
		}, { status: 400 })
	}

	try {
		// Delete Casbin policies first
		const casbinSync = getCasbinSyncService()
		await casbinSync.deleteRolePermissions(id, existingRole.organizationId)

		// Delete role metadata
		await db.delete(orgRoles).where(eq(orgRoles.id, id))

		return NextResponse.json({ success: true })
	} catch (error) {
		console.error("Error deleting role:", error)
		return NextResponse.json({ error: "Failed to delete role" }, { status: 500 })
	}
}
