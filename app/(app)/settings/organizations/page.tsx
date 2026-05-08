"use client"

import React, { useCallback, useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { authClient } from "@/lib/auth/client"
import { orpcClient } from "@/lib/orpc/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"
import {
	Building2,
	Plus,
	MoreHorizontal,
	Shield,
	UserCheck,
	Ban,
	UserX,
	UserCog,
	Eye,
	Key,
	Loader2,
	Users,
	Crown,
	Globe,
	Settings2,
	Clock,
} from "lucide-react"
import { toast } from "sonner"
import { UserSessionsDialog } from "@/components/auth/admin/user-sessions-dialog"

// Types
interface Organization {
	id: string
	name: string
	slug: string
	createdAt?: Date | string
	logo?: string | null
	autoJoin?: boolean
}

interface OrgMember {
	id: string
	role: string | null
	globalRole: string | null
	user?: {
		id?: string
		name: string
		email: string
	}
	organizationRoles: {
		id: string;
		roleId: string;
		roleType: "system" | "custom";
		roleName?: string;
	}[]
	createdAt?: Date | string
	banned?: boolean
}

const SYSTEM_ROLES = [
	{ id: "owner", name: "Owner" },
	{ id: "admin", name: "Admin" },
	{ id: "member", name: "Member" },
]

interface ListResponse {
	data?: {
		organizations: Organization[]
		activeOrganizationId?: string
	} | Organization[]
}

type OrgRole = "owner" | "admin" | "member"

// Better Auth organization client types
interface OrganizationClient {
	list: () => Promise<ListResponse>
	setActive: (opts: { organizationId: string }) => Promise<{ error?: { message?: string } } | { data: unknown }>
	create: (opts: { name: string; slug: string }) => Promise<{
		error?: { message?: string }
		data?: { id: string }
	}>
	update: (opts: { organizationId?: string; data: { name: string; slug: string } }) => Promise<{
		error?: { message?: string }
		data?: any
	}>
	listMembers: (opts: { organizationId: string }) => Promise<OrgMember[]>
	updateMemberRole: (opts: { organizationId: string; memberId: string; role: string }) => Promise<{ success: boolean }>
	addMember: (opts: { organizationId: string; email: string; role: string }) => Promise<{ success: boolean }>
	updateSettings: (opts: { organizationId: string; autoJoin: boolean }) => Promise<{ success: boolean }>
    removeMember: (opts: { organizationId: string; memberId: string }) => Promise<{ success: boolean }>
}

interface AdminClient {
	setUserPassword: (opts: { body: { userId: string; password: string } }) => Promise<{
		error?: { message?: string }
	}>
	impersonateUser: (opts: { body: { userId: string } }) => Promise<{
		error?: { message?: string }
	}>
}

type AuthClientWithOrg = typeof authClient & {
	organization: OrganizationClient
}

type AuthClientWithAdmin = typeof authClient & {
	admin: AdminClient
}

// Role badge colors
const getRoleBadgeVariant = (role: string): "default" | "secondary" | "outline" | "destructive" => {
	switch (role) {
		case "owner": return "default"
		case "admin": return "secondary"
		default: return "outline"
	}
}

const getRoleIcon = (role: string) => {
	switch (role) {
		case "owner": return Crown
		case "admin": return Shield
		default: return UserCheck
	}
}

export function OrganizationsSettingsPageContent() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const [organizations, setOrganizations] = useState<Organization[]>([])
	const [activeOrg, setActiveOrg] = useState<Organization | null>(null)
	const [loading, setLoading] = useState(true)
	const [members, setMembers] = useState<OrgMember[]>([])
	const [loadingMembers, setLoadingMembers] = useState(true)

	// Dialogs
	const [createDialogOpen, setCreateDialogOpen] = useState(false)
	const [editDialogOpen, setEditDialogOpen] = useState(false)
	const [showSessions, setShowSessions] = useState<string | null>(null)
	const [showDelete, setShowDelete] = useState<string | null>(null)
	const [showPassword, setShowPassword] = useState<string | null>(null)
	const [showAddMember, setShowAddMember] = useState(false)

	// Check if user needs to create first organization
	const showCreateFirst = searchParams.get("create") === "true"

	// Forms
	const [orgName, setOrgName] = useState("")
	const [orgSlug, setOrgSlug] = useState("")
	const [creating, setCreating] = useState(false)

	const [editOrgName, setEditOrgName] = useState("")
	const [editOrgSlug, setEditOrgSlug] = useState("")
	const [updatingOrg, setUpdatingOrg] = useState(false)

	const [newPassword, setNewPassword] = useState("")
	const [settingPassword, setSettingPassword] = useState(false)
	const [updatingRole, setUpdatingRole] = useState(false)
	const [newMemberEmail, setNewMemberEmail] = useState("")
	const [newMemberRole, setNewMemberRole] = useState<OrgRole>("member")
	const [addingMember, setAddingMember] = useState(false)
	const [updatingSettings, setUpdatingSettings] = useState(false)

	const fetchOrganizations = useCallback(async () => {
		try {
			setLoading(true)
			const client = orpcClient as unknown as {
				organizations: {
					list: () => Promise<{
						organizations: Organization[];
						activeOrganizationId: string | null
					}>
				}
			}
			const res = await client.organizations.list()

			if (res) {
				const orgList = res.organizations || []
				setOrganizations(orgList)

				const activeId = res.activeOrganizationId || orgList[0]?.id
				const active = activeId ? orgList.find((o: Organization) => o.id === activeId) || orgList[0] || null : orgList[0] || null
				setActiveOrg(active)
			} else {
				setOrganizations([])
				setActiveOrg(null)
			}
		} catch (err: unknown) {
			const error = err as Error
			toast.error(error.message || "Failed to fetch organizations")
		} finally {
			setLoading(false)
		}
	}, [])

	const fetchMembers = useCallback(async () => {
		if (!activeOrg) return
		setLoadingMembers(true)
		try {
			const client = orpcClient as unknown as {
				organizations: {
					listMembers: (opts: { organizationId: string }) => Promise<OrgMember[]>
				}
			}
			const res = await client.organizations.listMembers({ organizationId: activeOrg.id })
			if (res) {
				setMembers(res)
			}
		} catch {
			toast.error("Failed to fetch members")
		} finally {
			setLoadingMembers(false)
		}
	}, [activeOrg])

	useEffect(() => {
		void fetchOrganizations()
	}, [fetchOrganizations])

	useEffect(() => {
		void fetchMembers()
	}, [fetchMembers])

	// Auto-open create dialog if user has no orgs and ?create=true is set
	useEffect(() => {
		if (showCreateFirst && !loading && organizations.length === 0 && !createDialogOpen) {
			setCreateDialogOpen(true)
		}
	}, [showCreateFirst, loading, organizations.length, createDialogOpen])

	const switchOrganization = async (orgId: string) => {
		try {
			const orgClient = (authClient as AuthClientWithOrg).organization
			const res = await orgClient.setActive({ organizationId: orgId })
			if (res.error) {
				toast.error(res.error.message || "Failed to switch organization")
				return
			}
			const org = organizations.find((o) => o.id === orgId)
			if (org) setActiveOrg(org)
			router.refresh()
		} catch {
			toast.error("Failed to switch organization")
		}
	}

	const createOrganization = async () => {
		if (!orgName.trim() || !orgSlug.trim()) {
			toast.error("Please fill in all fields")
			return
		}

		setCreating(true)
		try {
			const orgClient = (authClient as AuthClientWithOrg).organization
			const res = await orgClient.create({ name: orgName, slug: orgSlug })
			if (res.error) {
				toast.error(res.error.message || "Failed to create organization")
				setCreating(false)
				return
			}

			toast.success("Organization created!")
			setCreateDialogOpen(false)
			setOrgName("")
			setOrgSlug("")

			if (showCreateFirst) {
				if (res.data?.id) {
					await switchOrganization(res.data.id)
				}
				router.push("/dashboard")
			} else {
				await fetchOrganizations()
			}
		} catch {
			toast.error("Failed to create organization")
		} finally {
			setCreating(false)
		}
	}

	const openEditDialog = (org: Organization) => {
		setEditOrgName(org.name)
		setEditOrgSlug(org.slug)
		setEditDialogOpen(true)
	}

	const updateOrganization = async () => {
		if (!editOrgName || !editOrgSlug || !activeOrg) return
		setUpdatingOrg(true)
		try {
			const orgClient = (authClient as AuthClientWithOrg).organization
			const res = await orgClient.update({
				organizationId: activeOrg.id,
				data: { name: editOrgName, slug: editOrgSlug }
			})

			if (res.error) {
				toast.error(res.error.message || "Failed to update organization")
			} else {
				toast.success("Organization updated")
				setEditDialogOpen(false)
				void fetchOrganizations()
			}
		} catch {
			toast.error("Failed to update organization")
		} finally {
			setUpdatingOrg(false)
		}
	}

	const removeMember = async (memberId: string) => {
		if (!activeOrg) return
		try {
			const client = orpcClient as { 
				organizations: { 
					removeMember: (opts: { organizationId: string; memberId: string }) => Promise<{ success: boolean }> 
				} 
			}
			const res = await client.organizations.removeMember({ 
				organizationId: activeOrg.id,
				memberId 
			})
			if (res.success) {
				toast.success("Member removed")
				setShowDelete(null)
				await fetchMembers()
			}
		} catch (err: unknown) {
			const error = err as Error
			toast.error(error.message || "Failed to remove member")
		}
	}

	const updateMemberRole = async (memberId: string, role: string) => {
		if (!activeOrg) return
		setUpdatingRole(true)
		try {
			const client = orpcClient as { 
				organizations: { 
					updateMemberRole: (opts: { organizationId: string; memberId: string; role: string }) => Promise<{ success: boolean }> 
				} 
			}
			const res = await client.organizations.updateMemberRole({
				organizationId: activeOrg.id,
				memberId,
				role
			})
			if (res.success) {
				toast.success("Role updated")
				await fetchMembers()
			}
		} catch (err: unknown) {
			const error = err as Error
			toast.error(error.message || "Failed to update role")
		} finally {
			setUpdatingRole(false)
		}
	}

	const setUserPassword = async (userId: string) => {
		if (!newPassword || newPassword.length < 8) {
			toast.error("Password must be at least 8 characters")
			return
		}
		setSettingPassword(true)
		try {
			const adminClient = (authClient as AuthClientWithAdmin).admin
			const res = await adminClient.setUserPassword({ body: { userId, password: newPassword } })
			if (res.error) {
				toast.error(res.error.message || "Failed to set password")
			} else {
				toast.success("Password updated")
				setShowPassword(null)
				setNewPassword("")
			}
		} catch {
			toast.error("Failed to set password")
		} finally {
			setSettingPassword(false)
		}
	}

	const impersonateUser = async (userId: string) => {
		try {
			const adminClient = (authClient as AuthClientWithAdmin).admin
			const res = await adminClient.impersonateUser({ body: { userId } })
			if (res.error) {
				toast.error(res.error.message || "Failed to impersonate user")
			} else {
				toast.success("Impersonating user")
				router.push("/dashboard")
			}
		} catch {
			toast.error("Failed to impersonate user")
		}
	}

	const addMember = async () => {
		if (!newMemberEmail || !activeOrg) return
		setAddingMember(true)
		try {
			const client = orpcClient as { 
				organizations: { 
					addMember: (opts: { organizationId: string; email: string; role: string }) => Promise<{ success: boolean }> 
				} 
			}
			const res = await client.organizations.addMember({
				organizationId: activeOrg.id,
				email: newMemberEmail,
				role: newMemberRole
			})
			if (res.success) {
				toast.success("Member added successfully")
				setShowAddMember(false)
				setNewMemberEmail("")
				await fetchMembers()
			}
		} catch (err: unknown) {
			const error = err as Error
			toast.error(error.message || "Failed to add member")
		} finally {
			setAddingMember(false)
		}
	}

	const toggleAutoJoin = async (enabled: boolean) => {
		if (!activeOrg) return
		setUpdatingSettings(true)
		try {
			const client = orpcClient as { 
				organizations: { 
					updateSettings: (opts: { organizationId: string; autoJoin: boolean }) => Promise<{ success: boolean }> 
				} 
			}
			const res = await client.organizations.updateSettings({
				organizationId: activeOrg.id,
				autoJoin: enabled
			})
			if (res.success) {
				toast.success(`Auto-join ${enabled ? "enabled" : "disabled"}`)
				setActiveOrg({ ...activeOrg, autoJoin: enabled })
				// Update in organizations list too
				setOrganizations(prev => prev.map(o => o.id === activeOrg.id ? { ...o, autoJoin: enabled } : o))
			}
		} catch (err: unknown) {
			const error = err as Error
			toast.error(error.message || "Failed to update settings")
		} finally {
			setUpdatingSettings(false)
		}
	}

	const getInitials = (name: string) => {
		return name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "U"
	}

	// Consolidated return
	return (
		<div className="flex flex-col gap-6">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-6">
				<div className="space-y-1">
					<h1 className="text-2xl font-bold tracking-tight">Organization Settings</h1>
					<p className="text-muted-foreground text-sm font-medium italic opacity-80">
						{activeOrg ? `Manage settings for ${activeOrg.name}` : "Configure your organizations and teams"}
					</p>
				</div>

				<div className="flex items-center gap-2">
					<Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
						<DialogTrigger asChild>
							<Button className="h-10 px-6 font-bold rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95 group">
								<Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
								New Organization
							</Button>
						</DialogTrigger>
						<DialogContent className="sm:max-w-md rounded-2xl border-border/50 shadow-2xl">
							<DialogHeader>
								<DialogTitle className="text-xl font-bold">Create Organization</DialogTitle>
								<DialogDescription className="text-xs">
									Create a new organization to start collaborating with your team.
								</DialogDescription>
							</DialogHeader>
							<div className="space-y-5 py-6">
								<div className="space-y-2">
									<Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Organization Name</Label>
									<Input 
										placeholder="e.g. My Awesome Team" 
										value={orgName}
										onChange={(e) => setOrgName(e.target.value)}
										className="h-11 text-sm rounded-xl bg-muted/30 border-transparent focus:bg-background transition-all"
									/>
								</div>
								<div className="space-y-2">
									<Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Slug (Unique identifier)</Label>
									<div className="relative">
										<Input 
											placeholder="my-awesome-team" 
											value={orgSlug}
											onChange={(e) => setOrgSlug(e.target.value)}
											className="h-11 text-sm rounded-xl bg-muted/30 border-transparent focus:bg-background transition-all pl-10"
										/>
										<Globe className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground/60" />
									</div>
								</div>
							</div>
							<DialogFooter className="bg-muted/30 -mx-6 -mb-6 p-4 mt-2 border-t border-border/40">
								<Button variant="ghost" onClick={() => setCreateDialogOpen(false)} className="rounded-xl font-medium text-sm">Cancel</Button>
								<Button onClick={createOrganization} disabled={creating || !orgName || !orgSlug} className="px-8 h-10 rounded-xl font-bold shadow-lg shadow-primary/20">
									{creating ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
									Create Organization
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</div>
			</div>

			{loading ? (
				<div className="grid gap-6">
					<Skeleton className="h-[200px] w-full" />
					<div className="space-y-4">
						<Skeleton className="h-12 w-full" />
						<Skeleton className="h-12 w-full" />
						<Skeleton className="h-12 w-full" />
					</div>
				</div>
			) : organizations.length === 0 ? (
				<div className="flex flex-col items-center justify-center py-20 border border-dashed rounded-lg">
					<div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
						<Building2 className="h-6 w-6 text-muted-foreground" />
					</div>
					<h3 className="text-lg font-semibold">No Organizations Yet</h3>
					<p className="text-sm text-muted-foreground mt-1 max-w-xs text-center">
						Create your first organization to start managing members and settings.
					</p>
					<Button 
						variant="outline" 
						className="mt-6"
						onClick={() => setCreateDialogOpen(true)}
					>
						<Plus className="h-4 w-4 mr-2" />
						Create First Organization
					</Button>
				</div>
			) : activeOrg ? (
				<div className="space-y-6">
					{/* Organization Info Card */}
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0">
							<div className="flex items-center gap-4">
								<div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
									<Building2 className="h-5 w-5 text-muted-foreground" />
								</div>
								<div>
									<CardTitle className="text-lg">{activeOrg.name}</CardTitle>
									<CardDescription>Active Workspace</CardDescription>
								</div>
							</div>
							<div className="flex items-center gap-2">
								<Button variant="outline" size="sm" onClick={() => openEditDialog(activeOrg)}>
									<Settings2 className="h-4 w-4 mr-2" />
									Settings
								</Button>
								
								<Dialog open={showAddMember} onOpenChange={setShowAddMember}>
									<DialogTrigger asChild>
										<Button size="sm">
											<Plus className="h-4 w-4 mr-2" />
											Add Member
										</Button>
									</DialogTrigger>
									<DialogContent>
										<DialogHeader>
											<DialogTitle>Invite to {activeOrg.name}</DialogTitle>
											<DialogDescription>
												Add a new member to your organization.
											</DialogDescription>
										</DialogHeader>
										<div className="grid gap-4 py-4">
											<div className="grid gap-2">
												<Label htmlFor="email">Email Address</Label>
												<Input
													id="email"
													placeholder="user@example.com"
													value={newMemberEmail}
													onChange={(e) => setNewMemberEmail(e.target.value)}
												/>
											</div>
											<div className="grid gap-2">
												<Label htmlFor="role">Role</Label>
												<Select value={newMemberRole} onValueChange={(v) => setNewMemberRole(v as OrgRole)}>
													<SelectTrigger id="role">
														<SelectValue placeholder="Select a role" />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="member">Member</SelectItem>
														<SelectItem value="admin">Admin</SelectItem>
														<SelectItem value="owner">Owner</SelectItem>
													</SelectContent>
												</Select>
											</div>
										</div>
										<DialogFooter>
											<Button variant="outline" onClick={() => setShowAddMember(false)}>Cancel</Button>
											<Button onClick={addMember} disabled={addingMember || !newMemberEmail}>
												{addingMember ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
												Invite Member
											</Button>
										</DialogFooter>
									</DialogContent>
								</Dialog>
							</div>
						</CardHeader>
						<CardContent>
							<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 border-t">
								<div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
									<div className="flex items-center gap-2">
										<Globe className="h-4 w-4" />
										<span>{activeOrg.slug}</span>
									</div>
									<div className="flex items-center gap-2">
										<Users className="h-4 w-4" />
										<span>{members.length} Members</span>
									</div>
									<div className="flex items-center gap-2">
										<Clock className="h-4 w-4" />
										<span>Joined {activeOrg.createdAt ? new Date(activeOrg.createdAt).toLocaleDateString() : "N/A"}</span>
									</div>
								</div>

								<div className="flex items-center gap-2">
									<Label htmlFor={`autojoin-${activeOrg.id}`} className="text-sm cursor-pointer">
										Auto Join New Members
									</Label>
									<Checkbox
										id={`autojoin-${activeOrg.id}`}
										checked={activeOrg.autoJoin}
										onCheckedChange={(checked) => toggleAutoJoin(!!checked)}
										disabled={updatingSettings}
									/>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Members Table */}
					<Card>
						<CardHeader>
							<div className="flex items-center justify-between">
								<div>
									<CardTitle className="text-lg">Members</CardTitle>
									<CardDescription>Manage organization members and their roles</CardDescription>
								</div>
								<Badge variant="secondary">
									{members.length} Total
								</Badge>
							</div>
						</CardHeader>
						<CardContent className="p-0">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>User</TableHead>
										<TableHead>Role</TableHead>
										<TableHead>Joined</TableHead>
										<TableHead className="text-right">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{loadingMembers ? (
										Array.from({ length: 3 }).map((_, i) => (
											<TableRow key={i}>
												<TableCell><Skeleton className="h-10 w-full" /></TableCell>
												<TableCell><Skeleton className="h-6 w-20" /></TableCell>
												<TableCell><Skeleton className="h-6 w-24" /></TableCell>
												<TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
											</TableRow>
										))
									) : members.length === 0 ? (
										<TableRow>
											<TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
												No members found.
											</TableCell>
										</TableRow>
									) : (
										members.map((member) => (
											<TableRow key={member.id}>
												<TableCell>
													<div className="flex items-center gap-3">
														<Avatar className="h-8 w-8">
															<AvatarFallback className="text-xs">
																{member.user?.name?.substring(0, 2).toUpperCase()}
															</AvatarFallback>
														</Avatar>
														<div className="flex flex-col">
															<span className="text-sm font-medium">{member.user?.name}</span>
															<span className="text-xs text-muted-foreground">{member.user?.email}</span>
														</div>
													</div>
												</TableCell>
												<TableCell>
													<Badge variant={getRoleBadgeVariant(member.role || "member")} className="capitalize">
														{member.role || "member"}
													</Badge>
												</TableCell>
												<TableCell className="text-sm text-muted-foreground">
													{new Date(member.createdAt!).toLocaleDateString()}
												</TableCell>
												<TableCell className="text-right">
													<DropdownMenu>
														<DropdownMenuTrigger asChild>
															<Button variant="ghost" size="icon">
																<MoreHorizontal className="h-4 w-4" />
															</Button>
														</DropdownMenuTrigger>
														<DropdownMenuContent align="end">
															<DropdownMenuItem onClick={() => setShowSessions(member.user?.id || null)}>
																<Eye className="mr-2 h-4 w-4" />
																View Sessions
															</DropdownMenuItem>
															<DropdownMenuItem onClick={() => void impersonateUser(member.user?.id || "")}>
																<UserCog className="mr-2 h-4 w-4" />
																Impersonate
															</DropdownMenuItem>
															<DropdownMenuSeparator />
															<DropdownMenuItem onClick={() => void updateMemberRole(member.id, "admin")}>
																Grant Admin
															</DropdownMenuItem>
															<DropdownMenuItem onClick={() => void updateMemberRole(member.id, "member")}>
																Set as Member
															</DropdownMenuItem>
															<DropdownMenuSeparator />
															<DropdownMenuItem
																className="text-destructive"
																onClick={() => setShowDelete(member.id)}
															>
																<UserX className="mr-2 h-4 w-4" />
																Remove
															</DropdownMenuItem>
														</DropdownMenuContent>
													</DropdownMenu>
												</TableCell>
											</TableRow>
										))
									)}
								</TableBody>
							</Table>
						</CardContent>
					</Card>
				</div>
			) : (
				<div className="flex flex-col items-center justify-center h-48 border border-dashed rounded-lg text-muted-foreground italic">
					No active organization selected
				</div>
			)}

			{/* Edit Organization Dialog */}
			<Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Organization Settings</DialogTitle>
						<DialogDescription>
							Update the name and slug for this organization.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="edit-name">Organization Name</Label>
							<Input
								id="edit-name"
								placeholder="Organization Name"
								value={editOrgName}
								onChange={(e) => setEditOrgName(e.target.value)}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="edit-slug">Slug</Label>
							<Input
								id="edit-slug"
								placeholder="organization-slug"
								value={editOrgSlug}
								onChange={(e) => setEditOrgSlug(e.target.value)}
								pattern="[a-z0-9-]+"
							/>
							<p className="text-xs text-muted-foreground">
								Lowercase letters, numbers, and hyphens only
							</p>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
						<Button onClick={updateOrganization} disabled={updatingOrg}>
							{updatingOrg ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
							Save Changes
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<AlertDialog open={!!showDelete} onOpenChange={(open) => setShowDelete(open ? showDelete : null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Remove Member?</AlertDialogTitle>
						<AlertDialogDescription>
							This will remove the user from the organization.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => showDelete && void removeMember(showDelete)}
							className="bg-destructive hover:bg-destructive/90"
						>
							Remove
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<Dialog open={!!showPassword} onOpenChange={(open) => setShowPassword(open ? showPassword : null)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Security Override</DialogTitle>
						<DialogDescription>
							Set a temporary password for the user.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="new-password">Secure Password</Label>
							<Input
								id="new-password"
								type="password"
								value={newPassword}
								onChange={(e) => setNewPassword(e.target.value)}
								minLength={8}
								placeholder="Must be 8+ characters"
							/>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setShowPassword(null)}>Cancel</Button>
						<Button
							onClick={() => showPassword && void setUserPassword(showPassword)}
							disabled={settingPassword}
						>
							{settingPassword ? (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							) : null}
							Apply Reset
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{showSessions && (
				<UserSessionsDialog
					user={{ id: showSessions, name: "", email: "" }}
					open={!!showSessions}
					onOpenChange={(open) => setShowSessions(open ? showSessions : null)}
					onRefresh={() => void fetchMembers()}
				/>
			)}
		</div>
	)
}

export default function OrganizationsSettingsPage() {
	return (
		<Suspense fallback={
			<div className="grid gap-6">
				<Skeleton className="h-[200px] w-full" />
				<div className="space-y-4">
					<Skeleton className="h-12 w-full" />
					<Skeleton className="h-12 w-full" />
					<Skeleton className="h-12 w-full" />
				</div>
			</div>
		}>
			<OrganizationsSettingsPageContent />
		</Suspense>
	)
}
