"use client";

import { useCallback, useEffect, useState } from "react";
import { authClient } from "@/lib/auth/client";
import { OrgMembers } from "@/components/auth";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Field,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Building2, Plus } from "lucide-react";
import { toast } from "sonner";

interface Organization {
	id: string;
	name: string;
	slug: string;
	createdAt: Date;
	logo?: string | null;
	metadata?: Record<string, unknown>;
}

export default function OrganizationsSettingsPage() {
	const [organizations, setOrganizations] = useState<Organization[]>([]);
	const [activeOrg, setActiveOrg] = useState<Organization | null>(null);
	const [loading, setLoading] = useState(true);
	const [createOpen, setCreateOpen] = useState(false);
	const [orgName, setOrgName] = useState("");
	const [orgSlug, setOrgSlug] = useState("");
	const [creating, setCreating] = useState(false);

	const fetchOrganizations = useCallback(async () => {
		const res = await authClient.organization.list();
		if (res.data) {
			const orgs = res.data as Organization[];
			setOrganizations(orgs);
			// Use first organization as active, or null if none exist
			setActiveOrg(orgs.length > 0 ? orgs[0] : null);
		}
		setLoading(false);
	}, []);

	useEffect(() => {
		fetchOrganizations();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const createOrganization = async () => {
		setCreating(true);
		const res = await authClient.organization.create({
			name: orgName,
			slug: orgSlug,
		});

		if (res.error) {
			toast.error(res.error.message || "Failed to create organization");
		} else {
			toast.success("Organization created!");
			setCreateOpen(false);
			setOrgName("");
			setOrgSlug("");
			fetchOrganizations();
		}
		setCreating(false);
	};

	return (
		<div className="space-y-6">
			{/* Page Header with Action */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">Organizations</h1>
					<p className="text-muted-foreground">Manage your teams and collaborate with others</p>
				</div>
				<Dialog open={createOpen} onOpenChange={setCreateOpen}>
					<DialogTrigger asChild>
						<Button>
							<Plus className="mr-2 h-4 w-4" />
							New Organization
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Create Organization</DialogTitle>
							<DialogDescription>
								Create a new organization for your team
							</DialogDescription>
						</DialogHeader>
						<FieldGroup>
							<Field>
								<FieldLabel>Name</FieldLabel>
								<Input
									placeholder="Acme Corp"
									value={orgName}
									onChange={(e) => setOrgName(e.target.value)}
									required
								/>
							</Field>
							<Field>
								<FieldLabel>Slug</FieldLabel>
								<Input
									placeholder="acme-corp"
									value={orgSlug}
									onChange={(e) => setOrgSlug(e.target.value)}
									required
									pattern="[a-z0-9-]+"
								/>
							</Field>
							<Button onClick={createOrganization} disabled={creating}>
								{creating ? "Creating..." : "Create"}
							</Button>
						</FieldGroup>
					</DialogContent>
				</Dialog>
			</div>

			{/* Organizations List */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Building2 className="h-5 w-5" />
						Your Organizations
					</CardTitle>
					<CardDescription>
						{organizations.length} organization{organizations.length !== 1 ? "s" : ""}
					</CardDescription>
				</CardHeader>
				<CardContent>
					{loading ? (
						<p className="text-sm text-muted-foreground">Loading...</p>
					) : (
						<div className="space-y-3">
							{organizations.map((org) => (
								<div
									key={org.id}
									className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
								>
									<div>
										<div className="font-medium">{org.name}</div>
										<div className="text-sm text-muted-foreground">@{org.slug}</div>
									</div>
									{activeOrg?.id === org.id && (
										<span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
											Active
										</span>
									)}
								</div>
							))}
							{organizations.length === 0 && (
								<p className="text-sm text-muted-foreground text-center py-8">
									No organizations yet. Create one to get started.
								</p>
							)}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Organization Members */}
			{activeOrg && <OrgMembers key={activeOrg.id} organizationId={activeOrg.id} />}
		</div>
	);
}
