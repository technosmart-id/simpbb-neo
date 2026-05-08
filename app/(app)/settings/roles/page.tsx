/**
 * Roles Management Page
 *
 * Casbin-first architecture:
 * - Organization roles only (no global tab)
 * - Permissions stored in Casbin, org_roles table only has metadata
 * - Uses member_roles junction table for assignments
 */

import { Suspense } from "react";
import { db } from "@/lib/db";
import { orgRoles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { RoleList } from "@/components/authorization/role-list";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

async function getRoles(organizationId: string) {
	return await db.query.orgRoles.findMany({
		where: eq(orgRoles.organizationId, organizationId),
		orderBy: (orgRoles, { asc }) => [asc(orgRoles.name)],
	});
}

export default async function RolesPage({
	searchParams,
}: {
	searchParams: Promise<{ tab?: string }>;
}) {
	const session = await auth.api.getSession({
		headers: await import("next/headers").then((m) => m.headers()),
	});

	if (!session?.user) {
		return redirect("/sign-in");
	}

	// Get active organization
	const activeOrgId = session.session?.activeOrganizationId;

	if (!activeOrgId) {
		return redirect("/new-org");
	}

	// Fetch roles
	const roles = await getRoles(activeOrgId);

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Roles</h1>
					<p className="text-muted-foreground">
						Manage granular roles and their permissions for your organization.
					</p>
				</div>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Role List</CardTitle>
					<CardDescription>
						Granular organization roles mapping specific permissions across modules.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Suspense fallback={<div>Loading roles...</div>}>
						<RoleList
							initialRoles={roles}
							organizationId={activeOrgId}
							userId={session.user.id}
						/>
					</Suspense>
				</CardContent>
			</Card>
		</div>
	);
}
