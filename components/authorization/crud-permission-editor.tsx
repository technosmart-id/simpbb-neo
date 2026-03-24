"use client"

import { Check, X } from "lucide-react"
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
import { PERMISSION_RESOURCES, RESOURCES } from "@/lib/services/authorization-constants"

interface CrudPermissions {
	[key: string]: {
		create?: boolean
		read?: boolean
		update?: boolean
		delete?: boolean
	}
}

interface PermissionEditorProps {
	permissions: CrudPermissions
	onChange: (permissions: CrudPermissions) => void
	readonly?: boolean
}

export function CrudPermissionEditor({ permissions, onChange, readonly = false }: PermissionEditorProps) {
	const togglePermission = (resource: string, action: string) => {
		if (readonly) return

		const resourcePerms = permissions[resource] || {}
		const currentValue = resourcePerms[action] || false

		onChange({
			...permissions,
			[resource]: {
				...resourcePerms,
				[action]: !currentValue,
			},
		})
	}

	const setAll = (resource: string, value: boolean) => {
		if (readonly) return

		const resourceConfig = PERMISSION_RESOURCES[resource as keyof typeof PERMISSION_RESOURCES]
		const newPerms: Record<string, boolean> = {}

		for (const action of resourceConfig.actions) {
			newPerms[action] = value
		}

		onChange({
			...permissions,
			[resource]: newPerms,
		})
	}

	const getAvailableActions = (resource: string): string[] => {
		const resourceConfig = PERMISSION_RESOURCES[resource as keyof typeof PERMISSION_RESOURCES]
		return resourceConfig?.actions || ["create", "read", "update", "delete"]
	}

	const getActionLabel = (action: string): string => {
		return action.charAt(0).toUpperCase() + action.slice(1)
	}

	const getPermissionValue = (resource: string, action: string): boolean => {
		return permissions[resource]?.[action] || false
	}

	return (
		<div className="border rounded-lg overflow-hidden">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className="w-[200px]">Resource</TableHead>
						<TableHead className="text-center">Create</TableHead>
						<TableHead className="text-center">Read</TableHead>
						<TableHead className="text-center">Update</TableHead>
						<TableHead className="text-center">Delete</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{Object.entries(PERMISSION_RESOURCES).map(([key, config]) => {
						const actions = getAvailableActions(key)

						return (
							<TableRow key={key}>
								<TableCell>
									<div>
										<div className="font-medium">{config.label}</div>
										<div className="text-xs text-muted-foreground">{config.description}</div>
									</div>
								</TableCell>
								{(["create", "read", "update", "delete"] as const).map((action) => {
									// Skip actions not available for this resource
									if (!actions.includes(action)) {
										return (
											<TableCell key={action} className="text-center">
												<span className="text-muted-foreground/30 text-xs">—</span>
											</TableCell>
										)
									}

									const hasPermission = getPermissionValue(key, action)

									return (
										<TableCell key={action} className="text-center">
											{readonly ? (
												hasPermission ? (
													<Check className="h-4 w-4 text-green-600 mx-auto" />
												) : (
													<X className="h-4 w-4 text-muted-foreground mx-auto" />
												)
											) : (
												<button
													type="button"
													onClick={() => togglePermission(key, action)}
													className={`
														w-10 h-10 rounded-md flex items-center justify-center mx-auto
														transition-colors
														${hasPermission
															? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
															: "bg-muted text-muted-foreground hover:bg-muted/80"
														}
													`}
												>
													{hasPermission ? (
														<Check className="h-4 w-4" />
													) : (
														<X className="h-4 w-4" />
													)}
												</button>
											)}
										</TableCell>
									)
								})}
							</TableRow>
						)
					})}
				</TableBody>
			</Table>

			{!readonly && (
				<div className="p-3 bg-muted/50 border-t flex items-center justify-between text-sm">
					<span className="text-muted-foreground">Click to toggle permissions</span>
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() => {
							const allTrue: CrudPermissions = {}
							for (const [key, config] of Object.entries(PERMISSION_RESOURCES)) {
								const perms: Record<string, boolean> = {}
								for (const action of config.actions) {
									perms[action] = true
								}
								allTrue[key] = perms
							}
							onChange(allTrue)
						}}
					>
						Grant All
					</Button>
				</div>
			)}
		</div>
	)
}

/**
 * Read-only permission viewer component
 */
interface PermissionViewerProps {
	permissions: CrudPermissions
}

export function PermissionViewer({ permissions }: PermissionViewerProps) {
	return (
		<CrudPermissionEditor
			permissions={permissions}
			onChange={() => {}}
			readonly
		/>
	)
}

/**
 * Compact permission badge display
 */
export function PermissionBadge({ permissions, resource }: { permissions: CrudPermissions; resource: string }) {
	const resourcePerms = permissions[resource] || {}
	const permittedActions = Object.entries(resourcePerms)
		.filter(([_, value]) => value === true)
		.map(([action]) => action)

	if (permittedActions.length === 0) {
		return <Badge variant="outline">No Access</Badge>
	}

	if (permittedActions.length === 4 && permittedActions.includes("read") && permittedActions.includes("write")) {
		return <Badge>Full Access</Badge>
	}

	return (
		<Badge variant="secondary">
			{permittedActions.map((a) => a[0].toUpperCase()).join(" ")}
		</Badge>
	)
}
