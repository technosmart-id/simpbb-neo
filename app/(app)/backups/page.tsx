'use client'

import * as React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useORPC } from '@/lib/orpc/react'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { BackupActions, type BackupItem } from "@/components/backups/backup-actions"
import { BackupCreateDialog } from "@/components/backups/backup-create-dialog"
import {
	Plus,
	Loader2,
	Archive,
	HardDrive,
	Clock,
	CheckCircle2,
	XCircle,
	Calendar,
	Info,
} from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"

// Type assertions for ORPC query results
type BackupsListResult = { rows: BackupItem[]; total: number }
type BackupConfigResult = {
	enabled: boolean
	retentionDays: number
	schedule: string
	runOnStart: boolean
	backupDir: string
}
type CreateBackupResult = { success: boolean; backupPath?: string; size?: number; duration?: number }
type DeleteBackupResult = { success: boolean }
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip"

const PAGE_SIZE = 20

type BackupRow = {
	name: string
	path: string
	size: number
	createdAt: Date
}

type BackupsListResponse = {
	rows: BackupRow[]
	total: number
}

type BackupConfig = {
	enabled: boolean
	retentionDays: number
	schedule: string
	runOnStart: boolean
	backupDir: string
}

type DeleteVariables = { filename: string }

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

function parseBackupFilename(filename: string): { date: Date; label: string } {
	// Format: backup-YYYY-MM-DD-HHMMSS.zip
	const match = filename.match(/backup-(\d{4})-(\d{2})-(\d{2})-(\d{6})\.zip/)
	if (match) {
		const [, year, month, day, time] = match
		const hours = time.substring(0, 2)
		const minutes = time.substring(2, 4)
		const seconds = time.substring(4, 6)
		const date = new Date(`${year}-${month}-${day}T${hours}:${minutes}:${seconds}`)
		return {
			date,
			label: `Backup from ${format(date, "MMM d, yyyy 'at' HH:mm")}`,
		}
	}
	return {
		date: new Date(),
		label: filename,
	}
}

function formatSchedule(schedule: string): string {
	// Parse cron format: minute hour day month weekday
	// Default: "0 2 * * *" = 2:00 AM daily
	const parts = schedule.split(" ")
	if (parts.length !== 5) return schedule

	const [minute, hour, day, month, weekday] = parts

	// Check for daily schedule
	if (day === "*" && month === "*" && weekday === "*") {
		const hourNum = parseInt(hour, 10)
		const minuteNum = parseInt(minute, 10)
		const formattedTime = format(
			new Date().setHours(hourNum, minuteNum, 0, 0),
			"h:mm a"
		)
		return `Daily at ${formattedTime}`
	}

	// Check for hourly schedule
	if (hour === "*" && day === "*" && month === "*" && weekday === "*") {
		return `Hourly at minute ${minute}`
	}

	// Check for weekly schedule
	if (day === "*" && month === "*" && weekday !== "*") {
		const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
		const weekdayName = weekdays[parseInt(weekday, 10)] ?? weekday
		return `Every ${weekdayName} at ${hour}:${minute}`
	}

	// Check for monthly schedule
	if (day !== "*" && month === "*" && weekday === "*") {
		return `Day ${day} of each month at ${hour}:${minute}`
	}

	return schedule
}

function AutoBackupStatus({ config }: { config: BackupConfig | undefined }) {
	if (!config) {
		return (
			<div className="flex items-center gap-2 text-sm text-muted-foreground">
				<Loader2 className="w-4 h-4 animate-spin" />
				Loading backup configuration...
			</div>
		)
	}

	return (
		<div className="flex items-center gap-4 flex-wrap">
			<div className="flex items-center gap-2">
				{config.enabled ? (
					<Badge className="gap-1.5 bg-green-500/10 text-green-600 dark:text-green-500 border-green-500/20">
						<CheckCircle2 className="w-3.5 h-3.5" />
						Auto Backup Enabled
					</Badge>
				) : (
					<Badge variant="destructive" className="gap-1.5">
						<XCircle className="w-3.5 h-3.5" />
						Auto Backup Disabled
					</Badge>
				)}
			</div>

			{config.enabled && (
				<>
					<div className="flex items-center gap-1.5 text-sm text-muted-foreground">
						<Clock className="w-4 h-4" />
						<span>{formatSchedule(config.schedule)}</span>
					</div>

					<div className="flex items-center gap-1.5 text-sm text-muted-foreground">
						<Calendar className="w-4 h-4" />
						<span>Retention: {config.retentionDays} days</span>
					</div>

					{config.runOnStart && (
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<div className="flex items-center gap-1.5 text-sm text-muted-foreground cursor-help">
										<Info className="w-4 h-4" />
										<span>Run on start</span>
									</div>
								</TooltipTrigger>
								<TooltipContent>
									<p>Backup runs automatically when the backup daemon starts</p>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					)}
				</>
			)}

			{!config.enabled && (
				<div className="flex items-center gap-1.5 text-sm text-muted-foreground">
					<Info className="w-4 h-4" />
					<span>Set <code className="bg-muted px-1.5 py-0.5 rounded text-xs">BACKUP_ENABLED=true</code> to enable</span>
				</div>
			)}
		</div>
	)
}

export default function BackupsPage() {
	const orpc = useORPC()
	const queryClient = useQueryClient()

	const [page, setPage] = React.useState(1)
	const [showCreateDialog, setShowCreateDialog] = React.useState(false)

	const configQuery = useQuery(orpc.backups.getConfig.queryOptions())

	const listQuery = useQuery(orpc.backups.list.queryOptions({
		input: {
			limit: PAGE_SIZE,
			offset: (page - 1) * PAGE_SIZE,
		}
	}))

	const backups = (listQuery.data as BackupsListResult | undefined)?.rows ?? []
	const total = (listQuery.data as BackupsListResult | undefined)?.total ?? 0
	const totalPages = Math.ceil(total / PAGE_SIZE)
	const isLoading = listQuery.isLoading

	const deleteMutation = useMutation(orpc.backups.delete.mutationOptions({
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: orpc.backups.key() })
			toast.success('Backup deleted successfully')
		},
		onError: (error: Error) => {
			toast.error('Failed to delete backup: ' + error.message)
		}
	})) as any

	const handleDelete = (filename: string) => {
		(deleteMutation as any).mutate({ filename })
	}

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div className="space-y-1">
					<h1 className="text-2xl font-bold tracking-tight">Backups</h1>
					<p className="text-muted-foreground">
						Manage database and file backups. Create, download, or delete backups.
					</p>
				</div>
				<Button onClick={() => setShowCreateDialog(true)}>
					<Plus className="w-4 h-4 mr-2" />
					Create Backup
				</Button>
			</div>

			{/* Auto Backup Status Card */}
			<div className="rounded-md border bg-card p-4">
				<div className="flex items-center justify-between">
					<div className="space-y-1">
						<h3 className="text-sm font-medium">Automatic Backup Configuration</h3>
						<AutoBackupStatus config={configQuery.data as BackupConfigResult | undefined} />
					</div>
				</div>
			</div>

			<div className="rounded-md border bg-card overflow-hidden flex flex-col">
				<div className="flex-1 overflow-auto">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Name</TableHead>
								<TableHead>Size</TableHead>
								<TableHead>Created At</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{isLoading ? (
								<TableRow>
									<TableCell colSpan={4} className="h-56 text-center">
										<div className="flex items-center justify-center gap-2">
											<Loader2 className="animate-spin" size={24} />
											<span>Loading backups...</span>
										</div>
									</TableCell>
								</TableRow>
							) : backups.length === 0 ? (
								<TableRow>
									<TableCell colSpan={4} className="h-56 text-center text-muted-foreground">
										<div className="flex flex-col items-center justify-center gap-3">
											<HardDrive size={48} className="opacity-10" />
											<p className="font-medium">No backups found.</p>
											<p className="text-sm">Create your first backup to get started!</p>
											<Button
												variant="outline"
												size="sm"
												onClick={() => setShowCreateDialog(true)}
												className="mt-2"
											>
												<Archive className="w-4 h-4 mr-2" />
												Create Backup
											</Button>
										</div>
									</TableCell>
								</TableRow>
							) : (
								backups.map((backup: BackupItem) => {
									const { label } = parseBackupFilename(backup.name)
									return (
										<TableRow key={backup.name}>
											<TableCell>
												<div className="flex items-center gap-2">
													<Archive className="w-4 h-4 text-muted-foreground" />
													<span className="font-medium">{label}</span>
												</div>
												<span className="text-xs text-muted-foreground ml-6">
													{backup.name}
												</span>
											</TableCell>
											<TableCell>
												<code className="text-sm bg-muted px-2 py-1 rounded">
													{formatBytes(backup.size)}
												</code>
											</TableCell>
											<TableCell className="text-sm text-muted-foreground">
												{format(new Date(backup.createdAt), "MMM d, yyyy HH:mm")}
											</TableCell>
											<TableCell className="text-right">
												<BackupActions
													backup={backup}
													onDelete={handleDelete}
													isDeleting={
														deleteMutation.isPending &&
														(deleteMutation.variables as DeleteVariables)?.filename === backup.name
													}
												/>
											</TableCell>
										</TableRow>
									)
								})
							)}
						</TableBody>
					</Table>
				</div>

				{totalPages > 1 && (
					<div className="border-t p-4 flex items-center justify-between">
						<p className="text-sm text-muted-foreground">
							Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, total)} of {total} backups
						</p>
						<div className="flex items-center gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={() => setPage(p => Math.max(1, p - 1))}
								disabled={page <= 1}
							>
								Previous
							</Button>
							<span className="text-sm">
								Page {page} of {totalPages}
							</span>
							<Button
								variant="outline"
								size="sm"
								onClick={() => setPage(p => Math.min(totalPages, p + 1))}
								disabled={page >= totalPages}
							>
								Next
							</Button>
						</div>
					</div>
				)}
			</div>

			<BackupCreateDialog
				open={showCreateDialog}
				onOpenChange={setShowCreateDialog}
				onSuccess={() => {
					queryClient.invalidateQueries({ queryKey: orpc.backups.key() })
					toast.success('Backup created successfully')
				}}
			/>
		</div>
	)
}
