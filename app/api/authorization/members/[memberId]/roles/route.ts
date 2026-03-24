/**
 * Member Roles API
 *
 * GET    /api/authorization/members/[memberId]/roles - List member's roles
 * POST   /api/authorization/members/[memberId]/roles - Assign role to member
 * DELETE /api/authorization/members/[memberId]/roles/[roleId] - Remove role from member
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { member } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getAuthorizationService } from "@/lib/services/authorization";
import {
	getMemberRoles,
	assignRoleToMember,
	removeRoleFromMember,
} from "@/lib/services/role-assignment";
import { auth } from "@/lib/auth";

/**
 * GET /api/authorization/members/[memberId]/roles
 * List all roles assigned to a member
 */
export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ memberId: string }> },
) {
	try {
		const session = await auth.api.getSession({
			headers: req.headers,
		});

		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { memberId } = await params;

		// Get the member to verify org access
		const [memberData] = await db
			.select({
				id: member.id,
				organizationId: member.organizationId,
			})
			.from(member)
			.where(eq(member.id, memberId))
			.limit(1);

		if (!memberData) {
			return NextResponse.json({ error: "Member not found" }, { status: 404 });
		}

		// Check if user has permission to read roles in this org
		const authService = getAuthorizationService();
		const canRead = await authService.can({
			userId: session.user.id,
			action: "read",
			resource: "members",
			organizationId: memberData.organizationId,
		});

		if (!canRead) {
			return NextResponse.json(
				{ error: "You don't have permission to view member roles" },
				{ status: 403 },
			);
		}

		// Get member roles
		const roles = await getMemberRoles(memberId);

		return NextResponse.json({
			memberId,
			roles,
		});
	} catch (error) {
		console.error("Error fetching member roles:", error);
		return NextResponse.json(
			{ error: "Failed to fetch member roles" },
			{ status: 500 },
		);
	}
}

/**
 * POST /api/authorization/members/[memberId]/roles
 * Assign a role to a member
 *
 * Body:
 * {
 *   "roleId": string,
 *   "roleType": "system" | "custom"
 * }
 */
export async function POST(
	req: NextRequest,
	{ params }: { params: Promise<{ memberId: string }> },
) {
	try {
		const session = await auth.api.getSession({
			headers: req.headers,
		});

		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { memberId } = await params;
		const body = await req.json();

		const { roleId, roleType } = body as {
			roleId?: string;
			roleType?: "system" | "custom";
		};

		if (!roleId || !roleType) {
			return NextResponse.json(
				{ error: "Missing required fields: roleId, roleType" },
				{ status: 400 },
			);
		}

		if (roleType !== "system" && roleType !== "custom") {
			return NextResponse.json(
				{ error: "roleType must be 'system' or 'custom'" },
				{ status: 400 },
			);
		}

		// Get the member to verify org access
		const [memberData] = await db
			.select({
				id: member.id,
				organizationId: member.organizationId,
			})
			.from(member)
			.where(eq(member.id, memberId))
			.limit(1);

		if (!memberData) {
			return NextResponse.json({ error: "Member not found" }, { status: 404 });
		}

		// Check if user has permission to assign roles
		const authService = getAuthorizationService();
		const canAssign = await authService.can({
			userId: session.user.id,
			action: "update",
			resource: "members",
			organizationId: memberData.organizationId,
		});

		if (!canAssign) {
			return NextResponse.json(
				{ error: "You don't have permission to assign roles" },
				{ status: 403 },
			);
		}

		// Assign the role
		const result = await assignRoleToMember({
			memberId,
			roleId,
			roleType,
			assignedBy: session.user.id,
		});

		return NextResponse.json({
			success: true,
			role: result,
		});
	} catch (error: any) {
		console.error("Error assigning role:", error);

		if (error.message === "Member already has this system role" ||
			error.message === "Member already has this custom role" ||
			error.message.includes("already has")) {
			return NextResponse.json(
				{ error: "Member already has this role" },
				{ status: 409 },
			);
		}

		return NextResponse.json(
			{ error: "Failed to assign role" },
			{ status: 500 },
		);
	}
}

/**
 * DELETE /api/authorization/members/[memberId]/roles?roleId=X&roleType=Y
 * Remove a role from a member
 *
 * Query params:
 * - roleId: The role ID to remove
 * - roleType: "system" or "custom"
 */
export async function DELETE(
	req: NextRequest,
	{ params }: { params: Promise<{ memberId: string }> },
) {
	try {
		const session = await auth.api.getSession({
			headers: req.headers,
		});

		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { memberId } = await params;
		const { searchParams } = new URL(req.url);
		const roleId = searchParams.get("roleId");
		const roleType = searchParams.get("roleType") as "system" | "custom" | null;

		if (!roleId || !roleType) {
			return NextResponse.json(
				{ error: "Missing required query params: roleId, roleType" },
				{ status: 400 },
			);
		}

		if (roleType !== "system" && roleType !== "custom") {
			return NextResponse.json(
				{ error: "roleType must be 'system' or 'custom'" },
				{ status: 400 },
			);
		}

		// Get the member to verify org access
		const [memberData] = await db
			.select({
				id: member.id,
				organizationId: member.organizationId,
			})
			.from(member)
			.where(eq(member.id, memberId))
			.limit(1);

		if (!memberData) {
			return NextResponse.json({ error: "Member not found" }, { status: 404 });
		}

		// Check if user has permission to remove roles
		const authService = getAuthorizationService();
		const canRemove = await authService.can({
			userId: session.user.id,
			action: "update",
			resource: "members",
			organizationId: memberData.organizationId,
		});

		if (!canRemove) {
			return NextResponse.json(
				{ error: "You don't have permission to remove roles" },
				{ status: 403 },
			);
		}

		// Remove the role
		await removeRoleFromMember({
			memberId,
			roleId,
			roleType,
		});

		return NextResponse.json({
			success: true,
		});
	} catch (error) {
		console.error("Error removing role:", error);
		return NextResponse.json(
			{ error: "Failed to remove role" },
			{ status: 500 },
		);
	}
}
