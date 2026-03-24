"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { useRouter } from "next/navigation"

interface Permission {
	id: string
	role: string
	resource: string
	action: string
	effect: string
}

interface PermissionTableProps {
	organizationId: string
}

// Available resources and actions for the UI
const RESOURCES = ["books", "files", "backups", "members", "roles"] as const
const ACTIONS = ["read", "create", "update", "delete", "*"] as const

// Role colors for badges
const ROLE_COLORS: Record<string, "default" | "secondary" | "outline"> = {
	owner: "default",
	admin: "secondary",
	member: "outline",
	viewer: "outline",
}

export function PermissionTable({ organizationId }: PermissionTableProps) {
	const router = useRouter()
	const [permissions, setPermissions] = useState<Permission[]>([])
	const [loading, setLoading] = useState(true)
	const [updating, setUpdating] = useState<string | null>(null)

	// Fetch permissions
	const fetchPermissions = async () => {
		setLoading(true)
		try {
			const response = await fetch(`/api/authorization/permissions?orgId=${organizationId}`)
			if (!response.ok) throw new Error("Failed to fetch permissions")

			const data = await response.json()
			setPermissions(data.permissions || [])
		} catch (error) {
			console.error("Error fetching permissions:", error)
			toast.error("Failed to load permissions")
		} finally {
			setLoading(false)
		}
	}

	// Toggle a permission
	const togglePermission = async (permission: Permission, enabled: boolean) => {
		setUpdating(permission.id)
		try {
			if (enabled) {
				await fetch("/api/authorization/permissions", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						organizationId,
						role: permission.role,
						resource: permission.resource,
						action: permission.action,
					}),
				})
			} else {
				await fetch("/api/authorization/permissions", {
					method: "DELETE",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						organizationId,
						role: permission.role,
						resource: permission.resource,
						action: permission.action,
					}),
				})
			}

			// Refresh permissions
			await fetchPermissions()
			toast.success(enabled ? "Permission granted" : "Permission revoked")
		} catch (error) {
			console.error("Error updating permission:", error)
			toast.error("Failed to update permission")
		} finally {
			setUpdating(null)
		}
	}

	// Check if a specific permission exists
	const hasPermission = (role: string, resource: string, action: string): boolean => {
		return permissions.some(
			(p) => p.role === role && p.resource === resource && p.action === action && p.effect === "allow"
		)
	}

	useEffect(() => {
		fetchPermissions()
	}, [organizationId])

	if (loading) {
		return (
			<div className="flex items-center justify-center p-8">
				<Spinner className="size-6" />
			</div>
		)
	}

	return (
		<div className="space-y-4">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Role</TableHead>
						<TableHead>Resource</TableHead>
						<TableHead>Action</TableHead>
						<TableHead>Status</TableHead>
						<TableHead className="text-right">Toggle</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{(["owner", "admin", "member", "viewer"] as const).flatMap((role) =>
						RESOURCES.flatMap((resource) =>
							ACTIONS.map((action) => {
								const permissionId = `${role}-${resource}-${action}`
								const enabled = hasPermission(role, resource, action)
								const isUpdating = updating === permissionId

								return (
									<TableRow key={`${role}-${resource}-${action}`}>
										<TableCell>
											{action === "*" ? (
												<Badge variant={ROLE_COLORS[role]}>{role}</Badge>
											) : (
												<span className="text-muted-foreground">{role}</span>
											)}
										</TableCell>
										<TableCell className={action === "*" ? "font-medium" : ""}>
											{action === "*" ? resource : <span className="text-muted-foreground">{resource}</span>}
										</TableCell>
										<TableCell className={action === "*" ? "font-medium" : ""}>
											{action === "*" ? <Badge variant="outline">{action}</Badge> : action}
										</TableCell>
										<TableCell>
											{enabled ? (
												<Badge variant="default">Allowed</Badge>
											) : (
												<Badge variant="outline">Denied</Badge>
											)}
										</TableCell>
										<TableCell className="text-right">
											{role === "owner" && action === "*" && resource === "books" ? (
												<Switch checked={true} disabled />
											) : (
												<Switch
													checked={enabled}
													onCheckedChange={(checked) => togglePermission({
														id: permissionId,
														role,
														resource,
														action,
														effect: "allow",
													}, checked)}
													disabled={isUpdating}
												/>
											)}
										</TableCell>
									</TableRow>
								)
							})
						)
					)}
				</TableBody>
			</Table>

			<div className="flex items-center justify-between text-sm text-muted-foreground">
				<p>Showing permissions for {RESOURCES.length} resources across 4 roles</p>
				<Button variant="outline" size="sm" onClick={fetchPermissions}>
					Refresh
				</Button>
			</div>
		</div>
	)
}
