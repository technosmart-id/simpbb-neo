'use client'

import * as React from 'react'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Pencil, Trash2, ExternalLink } from "lucide-react"
import { useRouter } from "next/navigation"

interface CustomOrgRole {
	id: string
	name: string
	slug: string
	description: string | null
	isDefaultRole: boolean
	memberCount: number
}

interface RoleActionsProps {
	role: CustomOrgRole
	onDelete: (id: string) => void
	isDeleting?: boolean
}

export function RoleActions({ role, onDelete, isDeleting }: RoleActionsProps) {
	const [showDeleteDialog, setShowDeleteDialog] = React.useState(false)
	const router = useRouter()

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" size="icon" className="size-8">
						<MoreHorizontal size={14} />
						<span className="sr-only">Open menu</span>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuLabel>Actions</DropdownMenuLabel>
					<DropdownMenuItem onClick={() => router.push(`/settings/roles/${role.id}`)}>
						<ExternalLink size={14} className="mr-2" />
						View Details
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => router.push(`/settings/roles/${role.id}/edit`)}>
						<Pencil size={14} className="mr-2" />
						Edit
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						variant="destructive"
						onClick={() => setShowDeleteDialog(true)}
						disabled={role.isDefaultRole}
					>
						<Trash2 size={14} className="mr-2" />
						{role.isDefaultRole ? 'Cannot Delete Default' : 'Delete'}
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This will permanently delete the role <strong>{role.name}</strong>.
							This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							variant="destructive"
							onClick={() => {
								onDelete(role.id)
								setShowDeleteDialog(false)
							}}
							disabled={isDeleting}
						>
							{isDeleting ? 'Deleting...' : 'Delete'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	)
}
