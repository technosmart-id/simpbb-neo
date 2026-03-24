"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth/client"
import { ArrowLeft, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { RoleForm } from "@/components/authorization/role-form"

export default function NewRolePage() {
	const router = useRouter()
	const [organizationId, setOrganizationId] = useState<string | null>(null)
	const [loading, setLoading] = useState(true)
	const [isOwner, setIsOwner] = useState(false)

	useEffect(() => {
		const fetchData = async () => {
			try {
				const session = await authClient.getSession()
				const activeOrganizationId = session.data?.session?.activeOrganizationId ?? null

				if (!activeOrganizationId) {
					router.push("/settings/roles")
					return
				}

				setOrganizationId(activeOrganizationId)

				// Check if user is owner
				const memberRes = await fetch(`/api/authorization/members?orgId=${activeOrganizationId}`)
				if (memberRes.ok) {
					const data = await memberRes.json()
					setIsOwner(data.role === "owner")
				}

				if (session.data?.user) {
					const memberRes = await fetch(`/api/authorization/members?orgId=${activeOrganizationId}`)
					if (memberRes.ok) {
						const data = await memberRes.json()
						if (data.role !== "owner") {
							router.push("/settings/roles")
							return
						}
					}
				}
			} finally {
				setLoading(false)
			}
		}
		fetchData()
	}, [router])

	if (loading) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="text-muted-foreground">Loading...</div>
			</div>
		)
	}

	if (!organizationId) {
		return (
			<div className="text-center py-8">
				<p className="text-muted-foreground">No organization selected</p>
			</div>
		)
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-4">
				<Button variant="ghost" size="sm" asChild>
					<Link href="/settings/roles">
						<ArrowLeft className="mr-2 h-4 w-4" />
						Back to Roles
					</Link>
				</Button>
			</div>

			<div className="flex items-center gap-3">
				<div className="p-2 rounded-lg bg-muted">
					<Shield className="h-5 w-5" />
				</div>
				<div>
					<h1 className="text-lg font-semibold">Create Custom Role</h1>
					<p className="text-sm text-muted-foreground">
						Define a new role with specific permissions for your organization
					</p>
				</div>
			</div>

			<div className="border rounded-lg p-6">
				<RoleForm organizationId={organizationId} onSuccess={() => router.push("/settings/roles")} />
			</div>
		</div>
	)
}
