import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { member, orgRoles } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"
import { getAuthorizationService } from "@/lib/services/authorization"

interface RouteContext {
	params: Promise<{ memberId: string }>
}

/**
 * PATCH /api/authorization/members/[memberId]/role
 *
 * Assign a custom role to a member
 * Body: { customRoleId: string | null }
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
	const session = await auth.api.getSession({
		headers: request.headers,
	})

	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
	}

	const { memberId } = await context.params
	const body = await request.json()
	const { customRoleId } = body

	// Get the member first
	const [targetMember] = await db
		.select({
			id: member.id,
			organizationId: member.organizationId,
			userId: member.userId,
			role: member.role,
			customRoleId: member.customRoleId,
		})
		.from(member)
		.where(eq(member.id, memberId))
		.limit(1)

	if (!targetMember) {
		return NextResponse.json({ error: "Member not found" }, { status: 404 })
	}

	// Don't allow users to change their own role
	if (targetMember.userId === session.user.id) {
		return NextResponse.json({ error: "Cannot change your own role" }, { status: 400 })
	}

	const authService = getAuthorizationService()

	// Verify the requester has permission
	const canUpdate = await authService.can({
		userId: session.user.id,
		action: "update",
		resource: "members",
		organizationId: targetMember.organizationId,
	})

	if (!canUpdate) {
		return NextResponse.json({ error: "You don't have permission to update roles" }, { status: 403 })
	}

	// If customRoleId is provided, verify it belongs to the same organization
	if (customRoleId) {
		const [role] = await db
			.select({ organizationId: orgRoles.organizationId })
			.from(orgRoles)
			.where(eq(orgRoles.id, customRoleId))
			.limit(1)

		if (!role || role.organizationId !== targetMember.organizationId) {
			return NextResponse.json({ error: "Invalid custom role" }, { status: 400 })
		}
	}

	try {
		// Update member's custom role
		await db
			.update(member)
			.set({ customRoleId: customRoleId || null })
			.where(eq(member.id, memberId))

		// Fetch updated member
		const [updatedMember] = await db
			.select()
			.from(member)
			.where(eq(member.id, memberId))
			.limit(1)

		return NextResponse.json({ member: updatedMember })
	} catch (error) {
		console.error("Error updating member role:", error)
		return NextResponse.json({ error: "Failed to update role" }, { status: 500 })
	}
}

/**
 * GET /api/authorization/members/[memberId]/role
 *
 * Get a member's current role (including custom role details)
 */
export async function GET(request: NextRequest, context: RouteContext) {
	const session = await auth.api.getSession({
		headers: request.headers,
	})

	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
	}

	const { memberId } = await context.params

	try {
		const [memberData] = await db
			.select({
				id: member.id,
				role: member.role,
				customRoleId: member.customRoleId,
				organizationId: member.organizationId,
			})
			.from(member)
			.where(eq(member.id, memberId))
			.limit(1)

		if (!memberData) {
			return NextResponse.json({ error: "Member not found" }, { status: 404 })
		}

		// Verify requester has permission to view
		const authService = getAuthorizationService()
		const canRead = await authService.can({
			userId: session.user.id,
			action: "read",
			resource: "members",
			organizationId: memberData.organizationId,
		})

		if (!canRead) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 })
		}

		let customRole = null
		if (memberData.customRoleId) {
			const [role] = await db
				.select({
					id: orgRoles.id,
					name: orgRoles.name,
					slug: orgRoles.slug,
					description: orgRoles.description,
					isDefaultRole: orgRoles.isDefaultRole,
					permissions: orgRoles.permissions,
				})
				.from(orgRoles)
				.where(eq(orgRoles.id, memberData.customRoleId))
				.limit(1)

			if (role) {
				customRole = {
					...role,
					permissions: JSON.parse(role.permissions),
				}
			}
		}

		return NextResponse.json({
			role: memberData.role,
			customRoleId: memberData.customRoleId,
			customRole,
		})
	} catch (error) {
		console.error("Error fetching member role:", error)
		return NextResponse.json({ error: "Failed to fetch role" }, { status: 500 })
	}
}
