import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { member, orgRoles, user, memberRoles } from "@/lib/db/schema"
import { eq, and, desc, or } from "drizzle-orm"
import { getCasbinSyncService } from "@/lib/services/casbin-sync"
import { DEFAULT_USER_PERMISSIONS } from "@/lib/services/authorization-constants"

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

/**
 * GET /api/authorization/org-roles?orgId=xxx
 *
 * List all roles for an organization
 * Requires owner role
 */
export async function GET(request: NextRequest) {
	const session = await auth.api.getSession({
		headers: request.headers,
	})

	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
	}

	const { searchParams } = new URL(request.url)
	const orgId = searchParams.get("orgId")

	if (!orgId) {
		return NextResponse.json({ error: "Organization ID required" }, { status: 400 })
	}

	// Verify user is a member
	const [membership] = await db
		.select({ role: member.role, id: member.id })
		.from(member)
		.where(
			and(
				eq(member.organizationId, orgId),
				eq(member.userId, session.user.id),
			),
		)
		.limit(1)

	if (!membership) {
		return NextResponse.json({ error: "Not a member of this organization" }, { status: 403 })
	}

	// For now, only owners can view roles
	const authService = (await import("@/lib/services/authorization")).getAuthorizationService()
	const canViewRoles = await authService.can({
		userId: session.user.id,
		action: "read",
		resource: "roles",
		organizationId: orgId,
	})

	if (!canViewRoles) {
		return NextResponse.json({ error: "You don't have permission to view roles" }, { status: 403 })
	}

	try {
		// Get all custom roles for this org (no permissions column)
		const roles = await db
			.select({
				id: orgRoles.id,
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
			.where(eq(orgRoles.organizationId, orgId))
			.orderBy(desc(orgRoles.createdAt))

		// Count members with each custom role using the junction table
		const roleIds = roles.map((r) => r.id)
		const memberCounts = roleIds.length > 0
			? await db
				.select({ roleId: memberRoles.roleId })
				.from(memberRoles)
				.where(
					and(
						eq(memberRoles.roleType, "custom"),
						or(...roleIds.map(id => eq(memberRoles.roleId, id)))
					)
				)
			: []

		// Create a map of role ID to member count
		const countMap: Record<string, number> = {}
		for (const mc of memberCounts) {
			countMap[mc.roleId] = (countMap[mc.roleId] || 0) + 1
		}

		// Fetch permissions from Casbin for each role
		const casbinSync = getCasbinSyncService()
		const rolesWithCounts = await Promise.all(roles.map(async (role) => {
			// Get permissions from Casbin
			const permissions = await casbinSync.getRolePolicies(role.id, orgId)

			return {
				...role,
				memberCount: countMap[role.id] || 0,
				permissions,
			}
		}))

		return NextResponse.json({ roles: rolesWithCounts })
	} catch (error) {
		console.error("Error fetching roles:", error)
		return NextResponse.json({ error: "Failed to fetch roles" }, { status: 500 })
	}
}

/**
 * POST /api/authorization/org-roles
 *
 * Create a new custom role for an organization
 * Requires owner role
 * Permissions are synced to Casbin
 */
export async function POST(request: NextRequest) {
	const session = await auth.api.getSession({
		headers: request.headers,
	})

	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
	}

	const body = await request.json()
	const { organizationId, name, description, permissions, isDefaultRole } = body

	if (!organizationId || !name) {
		return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
	}

	// Verify user is an owner of the org
	const [membership] = await db
		.select({ role: member.role, id: member.id })
		.from(member)
		.where(
			and(
				eq(member.organizationId, organizationId),
				eq(member.userId, session.user.id),
			),
		)
		.limit(1)

	if (!membership || membership.role !== "owner") {
		return NextResponse.json({ error: "Only owners can create roles" }, { status: 403 })
	}

	// Generate slug from name
	const slug = generateSlug(name)

	// Check if a role with this slug already exists
	const [existing] = await db
		.select({ id: orgRoles.id })
		.from(orgRoles)
		.where(
			and(
				eq(orgRoles.organizationId, organizationId),
				eq(orgRoles.slug, slug),
			),
		)
		.limit(1)

	if (existing) {
		return NextResponse.json({ error: "A role with this name already exists" }, { status: 400 })
	}

	// Validate permissions structure
	const validatedPermissions = permissions || DEFAULT_USER_PERMISSIONS

	try {
		const roleId = crypto.randomUUID()

		// Create role metadata (no permissions column)
		await db.insert(orgRoles).values({
			id: roleId,
			organizationId,
			name,
			slug,
			description: description || null,
			isDefaultRole: isDefaultRole || false,
			// No permissions column - Casbin is source of truth
			createdAt: new Date(),
			updatedAt: new Date(),
			createdBy: session.user.id,
		})

		// Sync permissions to Casbin
		const casbinSync = getCasbinSyncService()
		await casbinSync.createRolePermissions(roleId, validatedPermissions, organizationId)

		// Fetch the created role
		const [createdRole] = await db
			.select()
			.from(orgRoles)
			.where(eq(orgRoles.id, roleId))
			.limit(1)

		return NextResponse.json({
			role: {
				...createdRole,
				permissions: validatedPermissions,
			}
		}, { status: 201 })
	} catch (error) {
		console.error("Error creating role:", error)
		return NextResponse.json({ error: "Failed to create role" }, { status: 500 })
	}
}
