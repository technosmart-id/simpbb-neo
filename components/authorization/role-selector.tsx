"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { Shield, Crown, User } from "lucide-react"
import { ORG_ROLES } from "@/lib/services/authorization-constants"

interface RoleSelectorProps {
	userId: string
	userName: string
	currentRole: string
	customRoleId?: string | null
	organizationId: string
	onRoleChange?: (newRole: string, newCustomRoleId?: string | null) => void
}

interface CustomRole {
	id: string
	name: string
	slug: string
	isDefaultRole: boolean
}

const SYSTEM_ROLES = [
	{ value: ORG_ROLES.OWNER, label: "Owner", description: "Full access to all resources", icon: Crown },
	{ value: ORG_ROLES.USER, label: "User", description: "Default member with configurable permissions", icon: User },
]

const ROLE_COLORS: Record<string, "default" | "secondary" | "outline"> = {
	[ORG_ROLES.OWNER]: "default",
	[ORG_ROLES.USER]: "outline",
}

export function RoleSelector({
	userId,
	userName,
	currentRole,
	customRoleId,
	organizationId,
	onRoleChange,
}: RoleSelectorProps) {
	const [role, setRole] = useState(currentRole)
	const [selectedCustomRoleId, setSelectedCustomRoleId] = useState(customRoleId)
	const [customRoles, setCustomRoles] = useState<CustomRole[]>([])
	const [loading, setLoading] = useState(false)
	const [fetchingRoles, setFetchingRoles] = useState(true)
	const [open, setOpen] = useState(false)

	// Fetch custom roles for this organization
	useEffect(() => {
		const fetchCustomRoles = async () => {
			try {
				const res = await fetch(`/api/authorization/org-roles?orgId=${organizationId}`)
				if (res.ok) {
					const data = await res.json()
					setCustomRoles(data.roles || [])
				}
			} catch (error) {
				console.error("Error fetching custom roles:", error)
			} finally {
				setFetchingRoles(false)
			}
		}
		fetchCustomRoles()
	}, [organizationId])

	const handleRoleChange = async (value: string) => {
		if (value === role && value !== "custom") return

		setLoading(true)

		try {
			if (value === "custom") {
				// For custom roles, we need a customRoleId
				return
			}

			// Update the member's role enum and clear custom role
			const response = await fetch("/api/authorization/roles", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					userId,
					organizationId,
					role: value,
				}),
			})

			if (!response.ok) {
				const error = await response.json()
				throw new Error(error.message || "Failed to update role")
			}

			setRole(value)
			setSelectedCustomRoleId(null)
			onRoleChange?.(value, null)
			toast.success(`Role updated to ${value}`)
		} catch (error) {
			console.error("Error updating role:", error)
			toast.error(error instanceof Error ? error.message : "Failed to update role")
		} finally {
			setLoading(false)
			setOpen(false)
		}
	}

	const handleCustomRoleSelect = async (customRoleId: string) => {
		if (customRoleId === selectedCustomRoleId) return

		setLoading(true)

		try {
			// Get the member ID first
			const memberRes = await fetch(`/api/authorization/members?orgId=${organizationId}`)
			if (!memberRes.ok) {
				throw new Error("Failed to fetch member info")
			}
			const memberData = await memberRes.json()

			// Assign custom role using the member ID
			const response = await fetch(`/api/authorization/members/${userId}/role`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					customRoleId,
				}),
			})

			if (!response.ok) {
				const error = await response.json()
				throw new Error(error.error || "Failed to update role")
			}

			setSelectedCustomRoleId(customRoleId)
			setRole(ORG_ROLES.USER) // Custom roles use user as base
			onRoleChange?.(ORG_ROLES.USER, customRoleId)
			toast.success("Custom role assigned")
		} catch (error) {
			console.error("Error updating role:", error)
			toast.error(error instanceof Error ? error.message : "Failed to update role")
		} finally {
			setLoading(false)
			setOpen(false)
		}
	}

	// Find the custom role object
	const selectedCustomRole = customRoles.find((r) => r.id === selectedCustomRoleId)

	return (
		<div className="flex items-center gap-2">
			<Select
				open={open}
				onOpenChange={setOpen}
				value={selectedCustomRoleId || role}
				onValueChange={(value) => {
					if (value.startsWith("custom:")) {
						handleCustomRoleSelect(value.replace("custom:", ""))
					} else {
						handleRoleChange(value)
					}
				}}
				disabled={loading || fetchingRoles}
			>
				<SelectTrigger className="w-[200px]">
					{loading || fetchingRoles ? (
						<div className="flex items-center gap-2">
							<Spinner className="size-4" />
							<span>{fetchingRoles ? "Loading..." : "Updating..."}</span>
						</div>
					) : selectedCustomRole ? (
						<div className="flex items-center gap-2">
							<Shield className="h-4 w-4 text-purple-600" />
							<span>{selectedCustomRole.name}</span>
						</div>
					) : (
						<SelectValue />
					)}
				</SelectTrigger>
				<SelectContent>
					{/* System Roles */}
					{SYSTEM_ROLES.map((r) => (
						<SelectItem key={r.value} value={r.value}>
							<div className="flex items-center gap-2">
								<r.icon className="h-4 w-4" />
								<div>
									<div className="font-medium">{r.label}</div>
									<div className="text-xs text-muted-foreground">{r.description}</div>
								</div>
							</div>
						</SelectItem>
					))}

					{customRoles.length > 0 && (
						<>
							<div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
								Custom Roles
							</div>
							{customRoles.map((customRole) => (
								<SelectItem key={customRole.id} value={`custom:${customRole.id}`}>
									<div className="flex items-center gap-2">
										<Shield className="h-4 w-4 text-purple-600" />
										<div>
											<div className="font-medium flex items-center gap-2">
												{customRole.name}
												{customRole.isDefaultRole && (
													<Badge variant="outline" className="text-xs py-0">Default</Badge>
												)}
											</div>
										</div>
									</div>
								</SelectItem>
							))}
						</>
					)}
				</SelectContent>
			</Select>
		</div>
	)
}

// Inline version for tables
export function RoleBadge({ role, customRoleName }: { role: string; customRoleName?: string | null }) {
	if (customRoleName) {
		return (
			<Badge variant="secondary" className="gap-1.5">
				<Shield className="h-3 w-3" />
				{customRoleName}
			</Badge>
		)
	}

	const systemRole = SYSTEM_ROLES.find((r) => r.value === role)
	if (!systemRole) {
		return <Badge variant="outline">{role}</Badge>
	}

	return (
		<Badge variant={ROLE_COLORS[role] || "outline"}>
			<systemRole.icon className="h-3 w-3 mr-1" />
			{systemRole.label}
		</Badge>
	)
}
