"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth/client"
import { orpcClient } from "@/lib/orpc/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Check, Crown, Shield, UserCheck, Settings2, ShieldCheck, Loader2 } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

const SYSTEM_ROLES = [
	{ 
		id: "owner", 
		name: "Owner",
		icon: Crown,
		description: "Full administrative access. Can perform all actions and delete the organization."
	},
	{ 
		id: "admin", 
		name: "Admin",
		icon: Shield,
		description: "Can manage members, roles, billing, and all settings except deleting the organization."
	},
	{ 
		id: "member", 
		name: "Member",
		icon: UserCheck,
		description: "Standard access based on the granular Custom Roles assigned below."
	},
]

export default function MemberRolesPage({ params }: { params: Promise<{ id: string }> }) {
	const router = useRouter()
	const { id: memberId } = use(params)
	
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [activeOrgId, setActiveOrgId] = useState<string | null>(null)
	
	const [member, setMember] = useState<{
		id: string;
		user?: { name?: string | null; email: string };
		organizationRoles?: { roleId: string; roleType: "system" | "custom" }[];
	} | null>(null)
	const [availableCustomRoles, setAvailableCustomRoles] = useState<{
		id: string;
		name: string;
		description?: string | null;
		permissions?: Record<string, Record<string, boolean>>;
	}[]>([])
	const [stagedRoles, setStagedRoles] = useState<{roleId: string, roleType: "system" | "custom"}[]>([])

	useEffect(() => {
		const loadData = async () => {
			try {
				const session = await authClient.getSession()
				const orgId = session.data?.session?.activeOrganizationId
				if (!orgId) {
					router.push("/settings/organizations")
					return
				}
				setActiveOrgId(orgId)

				// Fetch member details
				const client = orpcClient as unknown as {
					organizations: {
						listMembers: (opts: { organizationId: string }) => Promise<any[]>;
						listAvailableRoles: (opts: { organizationId: string }) => Promise<any[]>;
						manageMemberRoles: (opts: { organizationId: string; memberId: string; roles: any[] }) => Promise<{ success: boolean }>;
					}
				}
				const members = await client.organizations.listMembers({ organizationId: orgId })
				const targetMember = members?.find((m: any) => m.id === memberId)
				
				if (!targetMember) {
					toast.error("Member not found")
					router.push("/settings/organizations")
					return
				}
				setMember(targetMember)
				setStagedRoles(targetMember.organizationRoles?.map((r: any) => ({ roleId: r.roleId, roleType: r.roleType })) || [])

				// Fetch custom roles with permissions
				const roles = await client.organizations.listAvailableRoles({ organizationId: orgId })
				setAvailableCustomRoles(roles || [])
			} catch (err) {
				toast.error("Failed to load member data")
				console.error(err)
			} finally {
				setLoading(false)
			}
		}
		
		void loadData()
	}, [memberId, router])

	const toggleRole = (roleId: string, roleType: "system" | "custom", checked: boolean) => {
		setStagedRoles((current) => {
			if (checked) {
				return [...current.filter((r) => !(r.roleId === roleId && r.roleType === roleType)), { roleId, roleType }]
			} else {
				return current.filter((r) => !(r.roleId === roleId && r.roleType === roleType))
			}
		})
	}

	const handleSave = async () => {
		if (!activeOrgId) return
		
		setSaving(true)
		try {
			const client = orpcClient as unknown as {
				organizations: {
					manageMemberRoles: (opts: { organizationId: string; memberId: string; roles: any[] }) => Promise<{ success: boolean }>;
				}
			}
			await client.organizations.manageMemberRoles({
				organizationId: activeOrgId,
				memberId,
				roles: stagedRoles,
			})
			toast.success("Member roles updated successfully")
			router.push("/settings/organizations")
		} catch (error: any) {
			toast.error(error.message || "Failed to update roles")
		} finally {
			setSaving(false)
		}
	}

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		)
	}

	if (!member) return null

	return (
		<div className="space-y-6 pb-20">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Button variant="ghost" size="sm" asChild>
						<Link href="/settings/organizations">
							<ArrowLeft className="mr-2 h-4 w-4" />
							Back to Organizations
						</Link>
					</Button>
				</div>
			</div>

			<div className="flex flex-col gap-2">
					<h1 className="text-3xl font-bold tracking-tight">Manage Roles</h1>
				<p className="text-muted-foreground">
					Configuring roles for <span className="font-semibold text-foreground">{member.user?.name || member.user?.email || memberId}</span>
				</p>
			</div>

			<Card>
				<CardHeader>
					<div className="flex items-center gap-2">
						<ShieldCheck className="h-5 w-5 text-primary" />
						<CardTitle>Base Roles</CardTitle>
					</div>
					<CardDescription>
						These structural roles define the member's foundational authority within the organization.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
						{SYSTEM_ROLES.map((role) => {
							const Icon = role.icon
							const isChecked = stagedRoles.some((r) => r.roleId === role.id && r.roleType === "system")
							
							return (
								<div
									key={role.id}
									className={`
										relative flex rounded-lg border p-4 shadow-sm transition-colors
										${isChecked ? "border-primary bg-primary/5" : "hover:bg-muted/50"}
									`}
								>
									<div className="flex w-full items-start justify-between">
										<div className="flex items-start gap-4">
											<div className={`mt-1 p-2 rounded-md ${isChecked ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
												<Icon className="h-4 w-4" />
											</div>
											<div className="flex flex-col gap-1">
												<label htmlFor={`system-${role.id}`} className="font-medium cursor-pointer">{role.name}</label>
												<span className="text-xs text-muted-foreground line-clamp-2">
													{role.description}
												</span>
											</div>
										</div>
										<Checkbox
											id={`system-${role.id}`}
											className="mt-1 sr-only sm:not-sr-only"
											checked={isChecked}
											onCheckedChange={(c) => toggleRole(role.id, "system", c === true)}
										/>
									</div>
								</div>
							)
						})}
					</div>
				</CardContent>
			</Card>

			{availableCustomRoles.length > 0 && (
				<Card>
					<CardHeader>
						<div className="flex items-center gap-2">
							<Settings2 className="h-5 w-5 text-primary" />
							<CardTitle>Granular Roles</CardTitle>
						</div>
						<CardDescription>
							These custom roles grant specific resource permissions configured in your Authorization system.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						{availableCustomRoles.map((role) => {
							const isChecked = stagedRoles.some((r) => r.roleId === role.id && r.roleType === "custom")
							
							return (
								<div 
									key={role.id} 
									className={`
										rounded-lg border transition-colors overflow-hidden
										${isChecked ? "border-primary ring-1 ring-primary/20" : ""}
									`}
								>
									<div className="flex items-start p-4 hover:bg-muted/50">
										<div className="flex flex-1 items-start gap-3">
											<Checkbox
												id={`custom-${role.id}`}
												className="mt-1"
												checked={isChecked}
												onCheckedChange={(c) => toggleRole(role.id, "custom", c === true)}
											/>
											<div className="flex flex-col gap-1 w-full">
												<label htmlFor={`custom-${role.id}`} className="font-medium text-base cursor-pointer">{role.name}</label>
												
												{role.description && (
													<div className="text-sm text-muted-foreground">{role.description}</div>
												)}
												
												{role.permissions && (
													<div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
														{Object.entries(role.permissions).map(([resource, actions]: [string, any]) => {
															const hasAnyPermission = Object.values(actions).some(Boolean)
															if (!hasAnyPermission) return null
															
															return (
																<div key={resource} className="rounded-md bg-muted/40 p-3 text-sm">
																	<div className="font-medium mb-2 capitalize">{resource}</div>
																	<div className="flex flex-wrap gap-1.5">
																		{Object.entries(actions).map(([action, allowed]) => {
																			if (!allowed) return null
																			return (
																				<Badge key={action} variant="secondary" className="text-[10px] px-1.5 py-0 rounded-sm">
																					{action}
																				</Badge>
																			)
																		})}
																	</div>
																</div>
															)
														})}
													</div>
												)}
											</div>
										</div>
									</div>
								</div>
							)
						})}
					</CardContent>
				</Card>
			)}

			<div className="flex justify-end gap-3 sticky bottom-6 bg-background/80 backdrop-blur-sm p-4 border rounded-xl shadow-lg">
				<Button variant="outline" onClick={() => router.back()} disabled={saving}>
					Cancel
				</Button>
				<Button onClick={handleSave} disabled={saving}>
					{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
					{saving ? "Saving..." : "Save Assigned Roles"}
				</Button>
			</div>
		</div>
	)
}
