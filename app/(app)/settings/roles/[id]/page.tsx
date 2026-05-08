"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth/client"
import { ArrowLeft, Shield, Trash2, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { RoleForm } from "@/components/authorization/role-form"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

interface RoleData {
	id: string
	organizationId: string
	name: string
	slug: string
	description: string | null
	isDefaultRole: boolean
	permissions: Record<string, Record<string, boolean>>
	memberCount: number
	createdAt: string
	updatedAt: string
}

interface RolePageProps {
	params: Promise<{ id: string }>
}

export default function RoleDetailPage({ params }: RolePageProps) {
	const router = useRouter()
	const [roleId, setRoleId] = useState<string | null>(null)
	const [role, setRole] = useState<RoleData | null>(null)
	const [loading, setLoading] = useState(true)
	const [isOwner, setIsOwner] = useState(false)
	const [deleting, setDeleting] = useState(false)

	useEffect(() => {
		const fetchData = async () => {
			const { id } = await params
			setRoleId(id)

			try {
				// Check auth and org
				const session = await authClient.getSession()
				const activeOrganizationId = session.data?.session?.activeOrganizationId ?? null

				if (!activeOrganizationId) {
					router.push("/settings/roles")
					return
				}

				// Check if user is owner
				const memberRes = await fetch(`/api/authorization/members?orgId=${activeOrganizationId}`)
				if (memberRes.ok) {
					const data = await memberRes.json()
					setIsOwner(data.role === "owner")
				}

				// Fetch role
				const roleRes = await fetch(`/api/authorization/org-roles/${id}`)
				if (!roleRes.ok) {
					if (roleRes.status === 404) {
						toast.error("Role not found")
					}
					router.push("/settings/roles")
					return
				}

				const roleData = await roleRes.json()
				setRole(roleData.role)
			} catch (error) {
				console.error("Error fetching role:", error)
				router.push("/settings/roles")
			} finally {
				setLoading(false)
			}
		}
		fetchData()
	}, [params, router])

	const handleDelete = async () => {
		if (!role) return
		if (!confirm(`Are you sure you want to delete "${role.name}"? This action cannot be undone.`)) {
			return
		}

		setDeleting(true)

		try {
			const res = await fetch(`/api/authorization/org-roles/${role.id}`, {
				method: "DELETE",
			})

			if (!res.ok) {
				const error = await res.json()
				throw new Error(error.error || "Failed to delete role")
			}

			toast.success("Role deleted successfully")
			router.push("/settings/roles")
		} catch (error) {
			console.error("Error deleting role:", error)
			toast.error(error instanceof Error ? error.message : "Failed to delete role")
		} finally {
			setDeleting(false)
		}
	}

	if (loading) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="text-muted-foreground">Loading...</div>
			</div>
		)
	}

	if (!role) {
		return (
			<div className="text-center py-8">
				<p className="text-muted-foreground">Role not found</p>
			</div>
		)
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Button variant="ghost" size="sm" asChild>
						<Link href="/settings/roles">
							<ArrowLeft className="mr-2 h-4 w-4" />
							Back to Roles
						</Link>
					</Button>
				</div>
				{isOwner && !role.isDefaultRole && (
					<Button
						variant="destructive"
						size="sm"
						onClick={handleDelete}
						disabled={deleting}
					>
						<Trash2 className="mr-2 h-4 w-4" />
						{deleting ? "Deleting..." : "Delete Role"}
					</Button>
				)}
			</div>

			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<div className="p-2 rounded-lg bg-muted">
						<Shield className="h-5 w-5" />
					</div>
					<div>
						<div className="flex items-center gap-2">
							<h1 className="text-lg font-semibold">{role.name}</h1>
							{role.isDefaultRole && <Badge variant="secondary">Default Role</Badge>}
						</div>
						<div className="flex items-center gap-3 text-sm text-muted-foreground">
							<span className="flex items-center gap-1">
								<Users className="h-3 w-3" />
								{role.memberCount} member{role.memberCount !== 1 ? "s" : ""}
							</span>
							<span>•</span>
							<span>Created {new Date(role.createdAt).toLocaleDateString()}</span>
						</div>
					</div>
				</div>
			</div>

			<div className="border rounded-lg p-6">
				<RoleForm
					organizationId={role.organizationId}
					role={role}
					onSuccess={() => {
						// Refresh role data
						fetch(`/api/authorization/org-roles/${role.id}`)
							.then((res) => res.json())
							.then((data) => setRole(data.role))
					}}
				/>
			</div>
		</div>
	)
}
