import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { member } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"

/**
 * GET /api/authorization/members?orgId=xxx
 *
 * Get the current user's role in an organization
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

	try {
		const [membership] = await db
			.select({ role: member.role })
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

		return NextResponse.json({ role: membership.role })
	} catch (error) {
		console.error("Error fetching member role:", error)
		return NextResponse.json({ error: "Failed to fetch role" }, { status: 500 })
	}
}
