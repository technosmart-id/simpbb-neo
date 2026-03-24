import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getAuthorizationService } from "@/lib/services/authorization"
import { db } from "@/lib/db"
import { member } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"

/**
 * GET /api/authorization/permissions?orgId=xxx
 * GET /api/authorization/permissions?global=true
 *
 * Get all permissions for an organization or global permissions
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
	const global = searchParams.get("global")

	// Handle global permissions
	if (global === "true") {
		try {
			const authService = getAuthorizationService()
			const permissions = await authService.getGlobalPolicies()
			return NextResponse.json({ permissions })
		} catch (error) {
			console.error("Error fetching global permissions:", error)
			return NextResponse.json({ error: "Failed to fetch permissions" }, { status: 500 })
		}
	}

	if (!orgId) {
		return NextResponse.json({ error: "Organization ID required" }, { status: 400 })
	}

	// Verify user is a member of this org
	const [membership] = await db
		.select()
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

	// Check if user has permission to read permissions
	const authService = getAuthorizationService()
	const canRead = await authService.can({
		userId: session.user.id,
		action: "read",
		resource: "roles",
		organizationId: orgId,
	})

	if (!canRead) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 })
	}

	try {
		const permissions = await authService.getOrgPolicies(orgId)
		return NextResponse.json({ permissions })
	} catch (error) {
		console.error("Error fetching permissions:", error)
		return NextResponse.json({ error: "Failed to fetch permissions" }, { status: 500 })
	}
}

/**
 * POST /api/authorization/permissions
 *
 * Create a new permission policy (org or global)
 */
export async function POST(request: NextRequest) {
	const session = await auth.api.getSession({
		headers: request.headers,
	})

	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
	}

	const { searchParams } = new URL(request.url)
	const global = searchParams.get("global")

	const body = await request.json()
	const { organizationId, role, resource, action } = body

	if (!role || !resource || !action) {
		return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
	}

	const authService = getAuthorizationService()

	// Handle global policies
	if (global === "true") {
		try {
			await authService.createGlobalPolicy({ role, resource, action })
			return NextResponse.json({ success: true })
		} catch (error) {
			console.error("Error creating global permission:", error)
			return NextResponse.json({ error: "Failed to create permission" }, { status: 500 })
		}
	}

	if (!organizationId) {
		return NextResponse.json({ error: "Organization ID required" }, { status: 400 })
	}

	// Verify user is a member and has admin privileges
	const canUpdate = await authService.can({
		userId: session.user.id,
		action: "update",
		resource: "roles",
		organizationId,
	})

	if (!canUpdate) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 })
	}

	try {
		await authService.createPolicy({ organizationId, role, resource, action })
		return NextResponse.json({ success: true })
	} catch (error) {
		console.error("Error creating permission:", error)
		return NextResponse.json({ error: "Failed to create permission" }, { status: 500 })
	}
}

/**
 * DELETE /api/authorization/permissions
 *
 * Remove a permission policy (org or global)
 */
export async function DELETE(request: NextRequest) {
	const session = await auth.api.getSession({
		headers: request.headers,
	})

	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
	}

	const { searchParams } = new URL(request.url)
	const global = searchParams.get("global")

	const body = await request.json()
	const { organizationId, role, resource, action } = body

	if (!role || !resource || !action) {
		return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
	}

	const authService = getAuthorizationService()

	// Handle global policies
	if (global === "true") {
		try {
			await authService.removeGlobalPolicy({ role, resource, action })
			return NextResponse.json({ success: true })
		} catch (error) {
			console.error("Error removing global permission:", error)
			return NextResponse.json({ error: "Failed to remove permission" }, { status: 500 })
		}
	}

	if (!organizationId) {
		return NextResponse.json({ error: "Organization ID required" }, { status: 400 })
	}

	// Verify user is a member and has admin privileges
	const canUpdate = await authService.can({
		userId: session.user.id,
		action: "update",
		resource: "roles",
		organizationId,
	})

	if (!canUpdate) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 })
	}

	try {
		await authService.removePolicy({ organizationId, role, resource, action })
		return NextResponse.json({ success: true })
	} catch (error) {
		console.error("Error removing permission:", error)
		return NextResponse.json({ error: "Failed to remove permission" }, { status: 500 })
	}
}
