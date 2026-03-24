"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
	Field,
	FieldGroup,
	FieldLabel,
	FieldDescription,
	FieldError,
} from "@/components/ui/field"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"
import { Trash2, RotateCcw } from "lucide-react"

interface RoleFormProps {
	organizationId: string
	role?: {
		id: string
		name: string
		description: string | null
		permissions: Record<string, Record<string, boolean>>
		isDefaultRole: boolean
	}
	onSuccess?: () => void
}

interface PermissionState {
	[key: string]: {
		create: boolean
		read: boolean
		update: boolean
		delete: boolean
	}
}

const DEFAULT_PERMISSIONS: PermissionState = {
	books: { create: true, read: true, update: true, delete: false },
	files: { create: true, read: true, update: true, delete: false },
	backups: { create: false, read: true, update: false, delete: false },
	members: { create: false, read: true, update: false, delete: false },
	roles: { create: false, read: true, update: false, delete: false },
	settings: { create: false, read: true, update: false, delete: false },
}

const RESOURCE_LABELS: Record<string, string> = {
	books: "Books",
	files: "Files",
	backups: "Backups",
	members: "Members",
	roles: "Roles",
	settings: "Settings",
}

const ACTION_LABELS: Record<string, string> = {
	create: "Create",
	read: "Read",
	update: "Update",
	delete: "Delete",
}

export function RoleForm({ organizationId, role, onSuccess }: RoleFormProps) {
	const router = useRouter()
	const [name, setName] = useState(role?.name || "")
	const [description, setDescription] = useState(role?.description || "")
	const [permissions, setPermissions] = useState<PermissionState>(() => {
		const initial = { ...DEFAULT_PERMISSIONS };
		if (role?.permissions) {
			Object.entries(role.permissions).forEach(([resource, actions]) => {
				initial[resource] = {
					...initial[resource],
					...(actions as any),
				};
			});
		}
		return initial;
	});
	const [saving, setSaving] = useState(false)

	const togglePermission = (resource: string, action: string) => {
		setPermissions((prev) => {
			const resourcePermissions = prev[resource] || { create: false, read: false, update: false, delete: false };
			return {
				...prev,
				[resource]: {
					...resourcePermissions,
					[action]: !resourcePermissions[action as keyof typeof resourcePermissions],
				},
			};
		});
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!name.trim()) {
			toast.error("Role name is required")
			return
		}

		setSaving(true)

		try {
			const url = role
				? `/api/authorization/org-roles/${role.id}`
				: "/api/authorization/org-roles"

			const response = await fetch(url, {
				method: role ? "PATCH" : "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					organizationId,
					name: name.trim(),
					description: description.trim() || null,
					permissions,
				}),
			})

			if (!response.ok) {
				const error = await response.json()
				throw new Error(error.error || "Failed to save role")
			}

			toast.success(role ? "Role updated successfully" : "Role created successfully")
			onSuccess?.()
			if (!role) {
				router.push(`/settings/roles`)
			}
		} catch (error) {
			console.error("Error saving role:", error)
			toast.error(error instanceof Error ? error.message : "Failed to save role")
		} finally {
			setSaving(false)
		}
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			<FieldGroup>
				<Field>
					<FieldLabel>Role Name</FieldLabel>
					<Input
						value={name}
						onChange={(e) => setName(e.target.value)}
						placeholder="e.g., Content Editor"
						disabled={saving || role?.isDefaultRole}
						required
					/>
					<FieldDescription>
						A descriptive name for this role
						{role?.isDefaultRole && " (Default role name cannot be changed)"}
					</FieldDescription>
				</Field>

				<Field>
					<FieldLabel>Description</FieldLabel>
					<Textarea
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						placeholder="Describe what this role can do..."
						rows={3}
						disabled={saving}
					/>
					<FieldDescription>Optional description of this role</FieldDescription>
				</Field>
			</FieldGroup>

			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<h3 className="text-sm font-medium">Permissions</h3>
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={() => setPermissions(DEFAULT_PERMISSIONS)}
						disabled={saving}
						className="h-8 text-xs text-muted-foreground hover:text-foreground"
					>
						<RotateCcw className="mr-2 h-3 w-3" />
						Reset to Default
					</Button>
				</div>

				<div className="border rounded-lg overflow-hidden">
					<Table>
						<TableHeader>
							<TableRow className="bg-muted/50">
								<TableHead className="w-[200px]">Resource</TableHead>
								<TableHead>Permissions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{Object.entries(RESOURCE_LABELS).map(([resource, label]) => (
								<TableRow key={resource} className="hover:bg-transparent border-b">
									<TableCell className="font-medium align-top py-4">{label}</TableCell>
									<TableCell className="py-4">
										<div className="flex flex-wrap gap-2">
											{Object.entries(ACTION_LABELS).map(([action, actionLabel]) => {
												// Skip invalid combinations
												const isInvalid = (resource === "settings" && (action === "create" || action === "delete")) ||
																 (resource === "members" && action === "create");

												if (isInvalid) return null;

												const isChecked = permissions[resource]?.[action as keyof typeof permissions[typeof resource]];

												return (
													<label
														key={action}
														className={`
															flex items-center gap-2 px-3 py-1.5 rounded-md border cursor-pointer
															transition-all text-xs font-medium select-none
															${isChecked
																? "bg-primary text-primary-foreground border-primary shadow-sm"
																: "bg-background hover:bg-muted border-input text-muted-foreground hover:text-foreground"
															}
														`}
													>
														<input
															type="checkbox"
															checked={isChecked}
															onChange={() => togglePermission(resource, action)}
															className="sr-only"
															disabled={saving}
														/>
														<span>{actionLabel}</span>
													</label>
												);
											})}
										</div>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			</div>

			<div className="flex items-center gap-3">
				<Button type="submit" disabled={saving}>
					{saving ? (
						<>
							<Spinner className="mr-2 size-4" />
							Saving...
						</>
					) : (
						role ? "Update Role" : "Create Role"
					)}
				</Button>
				<Button
					type="button"
					variant="outline"
					onClick={() => router.back()}
					disabled={saving}
				>
					Cancel
				</Button>
			</div>
		</form>
	)
}
