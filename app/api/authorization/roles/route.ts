import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getAuthorizationService } from "@/lib/services/authorization"
import { db } from "@/lib/db"
import { member, user } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"

/**
 * PATCH /api/authorization/roles
 *
 * Update a user's role in an organization
 */
export async function PATCH(request: NextRequest) {
	const session = await auth.api.getSession({
		headers: request.headers,
	})

	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
	}

	const body = await request.json()
	const { userId, organizationId, role } = body

	if (!userId || !organizationId || !role) {
		return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
	}

	// Valid roles
	const validRoles = ["owner", "admin", "member", "viewer"]
	if (!validRoles.includes(role)) {
		return NextResponse.json({ error: "Invalid role" }, { status: 400 })
	}

	// Verify the requester has permission to update roles
	const authService = getAuthorizationService()
	const canUpdate = await authService.can({
		userId: session.user.id,
		action: "update",
		resource: "members",
		organizationId,
	})

	if (!canUpdate) {
		return NextResponse.json({ error: "You don't have permission to update roles" }, { status: 403 })
	}

	// Verify target user is a member of the org
	const [targetMember] = await db
		.select()
		.from(member)
		.where(
			and(
				eq(member.organizationId, organizationId),
				eq(member.userId, userId),
			),
		)
		.limit(1)

	if (!targetMember) {
		return NextResponse.json({ error: "User is not a member of this organization" }, { status: 404 })
	}

	// Don't allow users to change their own role (prevents lockouts)
	if (userId === session.user.id) {
		return NextResponse.json({ error: "Cannot change your own role" }, { status: 400 })
	}

	// Check if the target is an owner - only owners can change owner roles
	if (targetMember.role === "owner" || role === "owner") {
		const requesterRoles = await authService.getUserRoles(session.user.id, organizationId)
			if (!requesterRoles.some((r) => r.roleId === "owner" && r.roleType === "system")) {
			return NextResponse.json({ error: "Only owners can assign or remove the owner role" }, { status: 403 })
		}
	}

	try {
		await authService.assignRole({
			userId,
			organizationId,
			role,
			assignedBy: session.user.id,
		})

		// Get updated member info
		const [updatedMember] = await db
			.select({
				id: member.id,
				role: member.role,
				user: {
					id: user.id,
					name: user.name,
					email: user.email,
					image: user.image,
				},
			})
			.from(member)
			.innerJoin(user, eq(member.userId, user.id))
			.where(eq(member.id, targetMember.id))
			.limit(1)

		return NextResponse.json({ member: updatedMember })
	} catch (error) {
		console.error("Error updating role:", error)
		return NextResponse.json({ error: "Failed to update role" }, { status: 500 })
	}
}

/**
 * GET /api/authorization/roles?userId=xxx&orgId=xxx
 *
 * Get a user's roles in an organization
 */
export async function GET(request: NextRequest) {
	const session = await auth.api.getSession({
		headers: request.headers,
	})

	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
	}

	const { searchParams } = new URL(request.url)
	const userId = searchParams.get("userId") || session.user.id
	const orgId = searchParams.get("orgId")

	if (!orgId) {
		return NextResponse.json({ error: "Organization ID required" }, { status: 400 })
	}

	// Users can only see their own roles unless they're an admin
	if (userId !== session.user.id) {
		const authService = getAuthorizationService()
		const canRead = await authService.can({
			userId: session.user.id,
			action: "read",
			resource: "members",
			organizationId: orgId,
		})

		if (!canRead) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 })
		}
	}

	try {
		const authService = getAuthorizationService()
		const roles = await authService.getUserRoles(userId, orgId)

		// Get full member info
		const [memberInfo] = await db
			.select({
				id: member.id,
				role: member.role,
				createdAt: member.createdAt,
			})
			.from(member)
			.where(
				and(
					eq(member.organizationId, orgId),
					eq(member.userId, userId),
				),
			)
			.limit(1)

		return NextResponse.json({
			roles,
			member: memberInfo || null,
		})
	} catch (error) {
		console.error("Error fetching roles:", error)
		return NextResponse.json({ error: "Failed to fetch roles" }, { status: 500 })
	}
}
