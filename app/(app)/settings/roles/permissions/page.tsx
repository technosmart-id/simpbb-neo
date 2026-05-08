"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { authClient } from "@/lib/auth/client"
import { toast } from "sonner"
import { Crown, Shield, ShieldAlert, User, Eye, ArrowLeft, Loader2, Lock, Building2, Globe, Check } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ORG_ROLES, GLOBAL_ROLES, RESOURCES, ACTIONS, type OrgRole, type GlobalRole, ORG_ROLE_INFO, GLOBAL_ROLE_INFO } from "@/lib/services/authorization-constants"

const ROLE_CONFIG = {
	org: {
		[ORG_ROLES.OWNER]: { icon: Crown, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10" },
		[ORG_ROLES.USER]: { icon: User, color: "text-green-600 dark:text-green-400", bg: "bg-green-500/10" },
	},
	global: {
		[GLOBAL_ROLES.GLOBAL_ADMIN]: { icon: Crown, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10" },
		[GLOBAL_ROLES.GLOBAL_MODERATOR]: { icon: Shield, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10" },
		[GLOBAL_ROLES.GLOBAL_USER]: { icon: User, color: "text-green-600 dark:text-green-400", bg: "bg-green-500/10" },
	},
} as const

const RESOURCE_LABELS: Record<string, string> = {
	[RESOURCES.BOOKS]: "Books",
	[RESOURCES.FILES]: "Files",
	[RESOURCES.BACKUPS]: "Backups",
	[RESOURCES.MEMBERS]: "Members",
	[RESOURCES.ROLES]: "Roles",
	[RESOURCES.SETTINGS]: "Settings",
}

const ACTION_LABELS: Record<string, string> = {
	[ACTIONS.CREATE]: "Create",
	[ACTIONS.READ]: "View",
	[ACTIONS.UPDATE]: "Edit",
	[ACTIONS.DELETE]: "Delete",
}

const ALL_RESOURCES = Object.values(RESOURCES) as Array<string>
const ALL_ACTIONS = [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE]

type PermissionMatrix = Record<string, Record<string, boolean>>
type Scope = "org" | "global"
type RoleKey = OrgRole | GlobalRole

function PermissionsPageContent() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const roleParam = searchParams.get("role")
	const scopeParam = searchParams.get("scope") as Scope | null

	const [activeOrgId, setActiveOrgId] = useState<string | null>(null)
	const [loading, setLoading] = useState(true)
	const [loadingPermissions, setLoadingPermissions] = useState(false)
	const [saving, setSaving] = useState<Set<string>>(new Set())
	const [canEdit, setCanEdit] = useState(false)

	const [selectedScope, setSelectedScope] = useState<Scope>(scopeParam || "org")
	const [selectedRole, setSelectedRole] = useState<RoleKey>((roleParam as RoleKey) || ORG_ROLES.USER)
	const [permissions, setPermissions] = useState<PermissionMatrix>({})

	useEffect(() => {
		const fetchData = async () => {
			try {
				const session = await authClient.getSession()
				const sessionData = session.data as { activeOrganizationId?: string | null } | null

				if (sessionData?.activeOrganizationId) {
					setActiveOrgId(sessionData.activeOrganizationId)
					const memberRes = await fetch(`/api/authorization/members?orgId=${sessionData.activeOrganizationId}`)
					if (memberRes.ok) {
						const data = await memberRes.json()
						const userRole = data.role as OrgRole
						setCanEdit(userRole === ORG_ROLES.OWNER)
					}
				}
			} finally {
				setLoading(false)
			}
		}
		fetchData()
	}, [])

	const fetchPermissions = useCallback(async () => {
		if (selectedScope === "org" && !activeOrgId) return

		setLoadingPermissions(true)
		try {
			const url = selectedScope === "org"
				? `/api/authorization/permissions?orgId=${activeOrgId}`
				: `/api/authorization/permissions?global=true`

			const res = await fetch(url)
			if (res.ok) {
				const data = await res.json()
				const policies = data.permissions || []
				const matrix: PermissionMatrix = {}

				for (const policy of policies) {
					if (policy.role === selectedRole) {
						if (!matrix[policy.resource]) matrix[policy.resource] = {}
						matrix[policy.resource][policy.action] = policy.effect === "allow"
					}
				}
				setPermissions(matrix)
			}
		} catch {
			toast.error("Failed to load permissions")
		} finally {
			setLoadingPermissions(false)
		}
	}, [selectedScope, selectedRole, activeOrgId])

	useEffect(() => { fetchPermissions() }, [fetchPermissions])

	const updateSelection = (scope: Scope, role: RoleKey) => {
		setSelectedScope(scope)
		setSelectedRole(role)
		router.push(`/settings/roles/permissions?role=${role}&scope=${scope}`)
	}

	const togglePermission = async (resource: string, action: string) => {
		if (selectedScope === "org" && !canEdit) {
			toast.error("Only Owners and Admins can modify permissions")
			return
		}

		const isFullAccessRole = (selectedScope === "org" && selectedRole === ORG_ROLES.OWNER) ||
			(selectedScope === "global" && selectedRole === GLOBAL_ROLES.GLOBAL_ADMIN)

		if (isFullAccessRole) {
			toast.error("This role has full access by default")
			return
		}

		const key = `${resource}-${action}`
		setSaving((prev) => new Set(prev).add(key))

		const newAllowed = !permissions[resource]?.[action]

		try {
			const url = selectedScope === "org"
				? "/api/authorization/permissions"
				: "/api/authorization/permissions?global=true"

			const res = await fetch(url, {
				method: newAllowed ? "POST" : "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ organizationId: activeOrgId, role: selectedRole, resource, action }),
			})

			if (!res.ok) {
				const error = await res.json()
				toast.error(error.error || "Failed to update permission")
				return
			}

			setPermissions((prev) => ({
				...prev,
				[resource]: { ...prev[resource], [action]: newAllowed },
			}))

			toast.success(newAllowed ? "Permission granted" : "Permission removed")
		} catch {
			toast.error("Failed to update permission")
		} finally {
			setSaving((prev) => {
				const next = new Set(prev)
				next.delete(key)
				return next
			})
		}
	}

	const isAllowed = (resource: string, action: string): boolean => {
		if (permissions["*"]?.[ACTIONS.ALL]) return true
		if (permissions["*"]?.[action]) return true
		if (permissions[resource]?.[ACTIONS.ALL]) return true
		return permissions[resource]?.[action] || false
	}

	const isOrgScope = selectedScope === "org"
	const roleInfo = isOrgScope ? ORG_ROLE_INFO[selectedRole as OrgRole] : GLOBAL_ROLE_INFO[selectedRole as GlobalRole]
	const roleConfig = isOrgScope ? ROLE_CONFIG.org[selectedRole as OrgRole] : ROLE_CONFIG.global[selectedRole as GlobalRole]
	const RoleIcon = roleConfig.icon

	const isFullAccessRole = (isOrgScope && selectedRole === ORG_ROLES.OWNER) ||
		(!isOrgScope && selectedRole === GLOBAL_ROLES.GLOBAL_ADMIN)

	if (loading) {
		return <div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
	}

	return (
		<div className="space-y-4">
			{/* Header */}
			<div className="flex items-center gap-3">
				<Button variant="ghost" size="sm" className="h-8 px-2" asChild>
					<Link href="/settings/roles">
						<ArrowLeft className="h-4 w-4 mr-1" />
						Back
					</Link>
				</Button>
				<div className="flex-1">
					<h1 className="text-lg font-semibold">Role Permissions</h1>
					<p className="text-sm text-muted-foreground">Configure access for <strong>{roleInfo.label}</strong></p>
				</div>
			</div>

			{/* Role Selector Card */}
			<Card>
				<CardContent className="p-4">
					<div className="flex items-center gap-4">
						<div className={`p-2 rounded-md ${roleConfig.bg}`}>
							<RoleIcon className={`h-5 w-5 ${roleConfig.color}`} />
						</div>
						<div className="flex items-center gap-3 flex-1">
							<Select value={selectedScope} onValueChange={(v) => updateSelection(v as Scope, selectedRole)}>
								<SelectTrigger className="w-32 h-9">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="org"><Building2 className="h-3.5 w-3.5 mr-2 inline" />Organization</SelectItem>
									<SelectItem value="global"><Globe className="h-3.5 w-3.5 mr-2 inline" />Global</SelectItem>
								</SelectContent>
							</Select>
							<Select value={selectedRole} onValueChange={(v) => updateSelection(selectedScope, v as RoleKey)}>
								<SelectTrigger className="w-40 h-9">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{isOrgScope ? (
										<>
											<SelectItem value={ORG_ROLES.OWNER}>{ORG_ROLE_INFO[ORG_ROLES.OWNER].label}</SelectItem>
											<SelectItem value={ORG_ROLES.USER}>{ORG_ROLE_INFO[ORG_ROLES.USER].label}</SelectItem>
										</>
									) : (
										<>
											<SelectItem value={GLOBAL_ROLES.GLOBAL_ADMIN}>{GLOBAL_ROLE_INFO[GLOBAL_ROLES.GLOBAL_ADMIN].label}</SelectItem>
											<SelectItem value={GLOBAL_ROLES.GLOBAL_USER}>{GLOBAL_ROLE_INFO[GLOBAL_ROLES.GLOBAL_USER].label}</SelectItem>
										</>
									)}
								</SelectContent>
							</Select>
						</div>
						{(isFullAccessRole || (isOrgScope && !canEdit)) && (
							<Badge variant="secondary" className="gap-1.5">
								<Lock className="h-3 w-3" />
								{isFullAccessRole ? "Full Access" : "Read Only"}
							</Badge>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Permission Matrix */}
			{loadingPermissions ? (
				<Card><CardContent className="p-12 flex justify-center"><Loader2 className="h-6 w-6 animate-spin" /></CardContent></Card>
			) : (
				<Card>
					<div className="p-3 border-b bg-muted/30">
						<div className="flex items-center justify-between">
							<span className="text-sm font-medium">Permission Matrix</span>
							{isFullAccessRole && (
								<span className="text-xs text-muted-foreground flex items-center gap-1">
									<Check className="h-3.5 w-3.5 text-green-500" />
									All permissions granted by default
								</span>
							)}
						</div>
					</div>
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead>
								<tr className="border-b bg-muted/20">
									<th className="text-left p-3 font-medium text-sm">Resource</th>
									{ALL_ACTIONS.map((action) => (
										<th key={action} className="p-3 font-medium text-center text-sm min-w-[70px]">
											{ACTION_LABELS[action]}
										</th>
									))}
								</tr>
							</thead>
							<tbody>
								{ALL_RESOURCES.map((resource) => (
									<tr key={resource} className="border-b last:border-b-0">
										<td className="p-3 font-medium text-sm">{RESOURCE_LABELS[resource] || resource}</td>
										{ALL_ACTIONS.map((action) => {
											const allowed = isAllowed(resource, action)
											const savingState = saving.has(`${resource}-${action}`)

											return (
												<td key={action} className="p-3">
													<div className="flex justify-center">
														<Switch
															checked={allowed}
															onCheckedChange={() => togglePermission(resource, action)}
															disabled={isFullAccessRole || (isOrgScope && !canEdit) || savingState}
															className="data-[state=checked]:bg-primary"
														/>
														{savingState && <Loader2 className="h-4 w-4 animate-spin ml-2 text-muted-foreground" />}
													</div>
												</td>
											)
										})}
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</Card>
			)}
		</div>
	)
}

function PermissionsPageWrapper() {
	return (
		<Suspense fallback={<div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>}>
			<PermissionsPageContent />
		</Suspense>
	)
}

export default PermissionsPageWrapper
