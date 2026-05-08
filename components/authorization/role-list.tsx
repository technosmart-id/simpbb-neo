"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Pencil, Trash2, Users, Shield } from "lucide-react"
import { toast } from "sonner"
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

interface Role {
	id: string
	name: string
	slug: string
	description: string | null
	isDefaultRole: boolean
	organizationId: string
	createdAt: Date
	updatedAt: Date
	createdBy: string
}

interface RoleListProps {
	initialRoles: Role[]
	organizationId: string
	userId: string
}

interface MemberCount {
	roleId: string
	count: number
}

export function RoleList({ initialRoles, organizationId, userId }: RoleListProps) {
	const router = useRouter()
	const [roles, setRoles] = useState<Role[]>(initialRoles)
	const [deleting, setDeleting] = useState<string | null>(null)
	const [deleteDialog, setDeleteDialog] = useState<string | null>(null)
	const [memberCounts, setMemberCounts] = useState<Record<string, number>>({})

	// Fetch member counts for each role
	const fetchMemberCounts = async () => {
		try {
			const counts: Record<string, number> = {}

			for (const role of roles) {
				// For custom roles, check member_roles junction table
				const response = await fetch(
					`/api/authorization/org-roles/${role.id}/members?count=true`
				)
				if (response.ok) {
					const data = await response.json()
					counts[role.id] = data.count || 0
				}
			}

			setMemberCounts(counts)
		} catch (error) {
			console.error("Error fetching member counts:", error)
		}
	}

	// Delete a role
	const deleteRole = async (roleId: string) => {
		setDeleting(roleId)
		try {
			const response = await fetch(`/api/authorization/org-roles/${roleId}`, {
				method: "DELETE",
			})

			if (!response.ok) {
				const error = await response.json()
				throw new Error(error.error || "Failed to delete role")
			}

			setRoles((prev) => prev.filter((r) => r.id !== roleId))
			toast.success("Role deleted successfully")
		} catch (error) {
			console.error("Error deleting role:", error)
			toast.error(error instanceof Error ? error.message : "Failed to delete role")
		} finally {
			setDeleting(null)
			setDeleteDialog(null)
		}
	}

	// Navigate to edit page
	const editRole = (roleId: string) => {
		router.push(`/settings/roles/${roleId}`)
	}

	// Navigate to create page
	const createRole = () => {
		router.push("/settings/roles/new")
	}

	// Load member counts on mount
	// (In a real app, this would be passed from the server or fetched via API)
	// For now, just show 0 or calculate differently

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<p className="text-sm text-muted-foreground">
					{roles.length} custom role{roles.length !== 1 ? "s" : ""}
				</p>
				<Button onClick={createRole}>Create Role</Button>
			</div>

			{roles.length === 0 ? (
				<div className="text-center py-12 border rounded-lg border-dashed">
					<Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
					<h3 className="font-medium mb-2">No custom roles yet</h3>
					<p className="text-sm text-muted-foreground mb-4">
						Create custom roles to manage permissions for your organization members.
					</p>
					<Button onClick={createRole}>Create Your First Role</Button>
				</div>
			) : (
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Name</TableHead>
							<TableHead>Description</TableHead>
							<TableHead>Members</TableHead>
							<TableHead>Status</TableHead>
							<TableHead className="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{roles.map((role) => (
							<TableRow key={role.id}>
								<TableCell className="font-medium">{role.name}</TableCell>
								<TableCell className="text-muted-foreground">
									{role.description || "-"}
								</TableCell>
								<TableCell>
									<div className="flex items-center gap-1 text-muted-foreground">
										<Users className="h-4 w-4" />
										<span>{memberCounts[role.id] ?? 0}</span>
									</div>
								</TableCell>
								<TableCell>
									{role.isDefaultRole ? (
										<Badge variant="secondary">Default</Badge>
									) : (
										<Badge variant="outline">Custom</Badge>
									)}
								</TableCell>
								<TableCell className="text-right">
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="ghost" size="icon" disabled={deleting === role.id}>
												{deleting === role.id ? (
													<Spinner className="h-4 w-4" />
												) : (
													<MoreHorizontal className="h-4 w-4" />
												)}
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuItem onClick={() => editRole(role.id)}>
												<Pencil className="h-4 w-4 mr-2" />
												Edit
											</DropdownMenuItem>
											{!role.isDefaultRole && (
												<DropdownMenuItem
													onClick={() => setDeleteDialog(role.id)}
													className="text-destructive focus:text-destructive"
												>
													<Trash2 className="h-4 w-4 mr-2" />
													Delete
												</DropdownMenuItem>
											)}
										</DropdownMenuContent>
									</DropdownMenu>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			)}

			<AlertDialog
				open={!!deleteDialog}
				onOpenChange={(open) => !open && setDeleteDialog(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Role</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete this role? This action cannot be undone.
							{memberCounts[deleteDialog || ""] > 0 && (
								<>
									<br />
									<br />
									<strong>
										{memberCounts[deleteDialog || ""]} member
										{memberCounts[deleteDialog || ""] !== 1 ? "s are" : " is"} assigned to this
										role. They will lose these permissions.
									</strong>
								</>
							)}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => deleteDialog && deleteRole(deleteDialog)}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	)
}
