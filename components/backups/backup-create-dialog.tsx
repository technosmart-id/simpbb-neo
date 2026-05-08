'use client'

import * as React from 'react'
import { useMutation } from '@tanstack/react-query'
import { useORPC } from '@/lib/orpc/react'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, Archive, CheckCircle2, XCircle } from "lucide-react"

interface BackupCreateDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	onSuccess: () => void
}

export function BackupCreateDialog({ open, onOpenChange, onSuccess }: BackupCreateDialogProps) {
	const orpc = useORPC()

	const createMutation = useMutation(orpc.backups.create.mutationOptions({
		onSuccess: (data: any) => {
			onSuccess()
			onOpenChange(false)
		},
		onError: (error: Error) => {
			console.error('Backup creation failed:', error)
		}
	})) as any

	const handleCreate = () => {
		createMutation.mutate({})
	}

	React.useEffect(() => {
		if (open && !createMutation.isPending) {
			createMutation.reset()
		}
	}, [open])

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Archive className="w-5 h-5" />
						Create Backup
					</DialogTitle>
					<DialogDescription>
						Create a new backup of your database and uploaded files.
					</DialogDescription>
				</DialogHeader>

				<div className="py-6">
					{createMutation.isPending ? (
						<div className="flex flex-col items-center gap-4 py-4">
							<Loader2 className="w-12 h-12 animate-spin text-primary" />
							<div className="text-center space-y-1">
								<p className="font-medium">Creating backup...</p>
								<p className="text-sm text-muted-foreground">
									This may take a moment depending on data size.
								</p>
							</div>
						</div>
					) : createMutation.data ? (
						<div className="flex flex-col items-center gap-4 py-4">
							<CheckCircle2 className="w-12 h-12 text-green-500" />
							<div className="text-center space-y-1">
								<p className="font-medium">Backup created successfully!</p>
								<p className="text-sm text-muted-foreground">
									Size: {formatBytes((createMutation.data as any)?.size ?? 0)} •{" "}
									Duration: {Math.round(((createMutation.data as any)?.duration ?? 0) / 1000)}s
								</p>
							</div>
						</div>
					) : createMutation.error ? (
						<div className="flex flex-col items-center gap-4 py-4">
							<XCircle className="w-12 h-12 text-destructive" />
							<div className="text-center space-y-1">
								<p className="font-medium">Backup failed</p>
								<p className="text-sm text-muted-foreground">
									{createMutation.error.message}
								</p>
							</div>
						</div>
					) : (
						<div className="flex flex-col items-center gap-4 py-4">
							<Archive className="w-12 h-12 text-muted-foreground" />
							<div className="text-center space-y-1">
								<p className="font-medium">Ready to create backup</p>
								<p className="text-sm text-muted-foreground">
									The backup will include your database and all uploaded files.
								</p>
							</div>
						</div>
					)}
				</div>

				<div className="flex justify-end gap-3">
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={createMutation.isPending}
					>
						{createMutation.data ? 'Close' : 'Cancel'}
					</Button>
					{!createMutation.data && !createMutation.error && (
						<Button
							onClick={handleCreate}
							disabled={createMutation.isPending}
						>
							{createMutation.isPending ? (
								<>
									<Loader2 className="w-4 h-4 mr-2 animate-spin" />
									Creating...
								</>
							) : (
								<>
									<Archive className="w-4 h-4 mr-2" />
									Create Backup
								</>
							)}
						</Button>
					)}
					{createMutation.error && (
						<Button onClick={handleCreate} disabled={createMutation.isPending}>
							{createMutation.isPending ? (
								<>
									<Loader2 className="w-4 h-4 mr-2 animate-spin" />
									Retrying...
								</>
							) : (
								'Try Again'
							)}
						</Button>
					)}
				</div>
			</DialogContent>
		</Dialog>
	)
}

function formatBytes(bytes: number): string {
	const units = ["B", "KB", "MB", "GB"]
	let size = bytes
	let unitIndex = 0

	while (size >= 1024 && unitIndex < units.length - 1) {
		size /= 1024
		unitIndex++
	}

	return `${size.toFixed(2)} ${units[unitIndex]}`
}
