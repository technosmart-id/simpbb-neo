"use client"

import * as React from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useORPC } from "@/lib/orpc/react"
import { StorageInfoBar } from "@/components/examples/storage-info-bar"
import { type FileMetadata } from "@/lib/services/storage"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from "@/components/ui/table"
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
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
	FileIcon,
	ImageIcon,
	Trash2,
	Download,
	ExternalLink,
	RefreshCw,
	FileText,
	HardDrive,
	Box,
	FolderIcon,
	ChevronRight,
	Home,
	FolderPlus,
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

export default function FileManagerPage() {
	const orpc = useORPC()
	const queryClient = useQueryClient()

	const [currentPath, setCurrentPath] = React.useState("")
	const [deletePath, setDeletePath] = React.useState<string | null>(null)
	const [isCreateFolderOpen, setIsCreateFolderOpen] = React.useState(false)
	const [newFolderName, setNewFolderName] = React.useState("")

	// Correctly nested input for oRPC queryOptions
	const listQuery = useQuery(orpc.files.list.queryOptions({
		input: { path: currentPath }
	}))
	const statsQuery = useQuery(orpc.files.stats.queryOptions())

	const deleteMutation = useMutation(orpc.files.delete.mutationOptions({
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: orpc.files.key() })
			toast.success("Item deleted")
			setDeletePath(null)
		},
		onError: (error: Error) => {
			toast.error(`Delete failed: ${error.message}`)
		}
	}))

	const createFolderMutation = useMutation(orpc.files.createFolder.mutationOptions({
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: orpc.files.key() })
			toast.success("Folder created")
			setIsCreateFolderOpen(false)
			setNewFolderName("")
		},
		onError: (error: Error) => {
			toast.error(`Failed to create folder: ${error.message}`)
		}
	}))

	const isLoading = listQuery.isLoading || statsQuery.isLoading
	const items = listQuery.data ?? []
	const stats = statsQuery.data ?? { totalSize: 0, fileCount: 0, limit: 100 * 1024 * 1024 * 1024 }

	const handleRefresh = () => {
		listQuery.refetch()
		statsQuery.refetch()
	}

	const handleCreateFolder = (e: React.FormEvent) => {
		e.preventDefault()
		if (!newFolderName.trim()) return
		createFolderMutation.mutate({
			parentPath: currentPath,
			name: newFolderName.trim()
		})
	}

	// Breadcrumb Logic
	const breadcrumbs = React.useMemo(() => {
		const parts = currentPath.split("/").filter(Boolean)
		return parts.reduce((acc, part, i) => {
			const path = parts.slice(0, i + 1).join("/")
			acc.push({ name: part, path })
			return acc
		}, [] as { name: string; path: string }[])
	}, [currentPath])

	const navigateTo = (path: string) => {
		setCurrentPath(path)
	}

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div className="space-y-1">
					<h1 className="text-2xl font-bold tracking-tight">File Explorer</h1>
					<p className="text-muted-foreground">
						Explore and manage your application&apos;s `uploads/` directory.
					</p>
				</div>
				<div className="flex items-center gap-3">
					{!statsQuery.isLoading && statsQuery.data && (
						<StorageInfoBar 
							totalSize={statsQuery.data.totalSize} 
							fileCount={statsQuery.data.fileCount} 
							variant="minimal" 
						/>
					)}
				</div>
			</div>


			<nav className="flex items-center justify-between gap-1 text-sm bg-muted/40 p-1.5 rounded-lg border pl-4 pr-1.5 min-h-[44px]">
				<div className="flex items-center gap-1">
					<button
						onClick={() => navigateTo("")}
						className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors font-medium"
					>
						<Home size={16} />
						Root
					</button>
					{breadcrumbs.map((bc, i) => (
						<React.Fragment key={bc.path}>
							<ChevronRight size={14} className="text-muted-foreground/50" />
							<button
								onClick={() => navigateTo(bc.path)}
								className={`hover:text-primary transition-colors font-medium ${i === breadcrumbs.length - 1 ? "text-primary cursor-default font-bold" : ""
									}`}
							>
								{bc.name}
							</button>
						</React.Fragment>
					))}
				</div>

				<TooltipProvider>
					<div className="flex items-center gap-1">
						<Tooltip>
							<TooltipTrigger asChild>
								<Button 
									variant="ghost" 
									size="icon" 
									className="h-8 w-8 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10"
									onClick={() => setIsCreateFolderOpen(true)}
								>
									<FolderPlus size={18} />
								</Button>
							</TooltipTrigger>
							<TooltipContent>New Folder</TooltipContent>
						</Tooltip>

						<Tooltip>
							<TooltipTrigger asChild>
								<Button 
									variant="ghost" 
									size="icon" 
									className="h-8 w-8 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10"
									onClick={handleRefresh}
									disabled={listQuery.isLoading}
								>
									<RefreshCw size={18} className={cn(listQuery.isLoading && "animate-spin")} />
								</Button>
							</TooltipTrigger>
							<TooltipContent>Refresh</TooltipContent>
						</Tooltip>
					</div>
				</TooltipProvider>
			</nav>

			{/* File Table */}
			<div className="rounded-md border bg-card overflow-hidden shadow-sm">
				<Table>
					<TableHeader>
						<TableRow className="bg-muted/50">
							<TableHead className="w-[400px]">Name</TableHead>
							<TableHead>Type</TableHead>
							<TableHead>Size</TableHead>
							<TableHead>Created At</TableHead>
							<TableHead className="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{isLoading ? (
							<TableRow>
								<TableCell colSpan={5} className="h-56 text-center text-muted-foreground">
									<RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 opacity-20" />
									Loading items...
								</TableCell>
							</TableRow>
						) : items.length === 0 ? (
							<TableRow>
								<TableCell colSpan={5} className="h-56 text-center text-muted-foreground">
									<div className="flex flex-col items-center justify-center opacity-40">
										<Box className="w-12 h-12 mb-2" />
										<p>This directory is empty</p>
									</div>
								</TableCell>
							</TableRow>
						) : (
							(items as FileMetadata[]).map((item) => (
								<TableRow
									key={item.path}
									className={cn(
										"group hover:bg-muted/30 transition-colors",
										item.isDirectory && "cursor-pointer"
									)}
									onClick={() => item.isDirectory && navigateTo(item.path)}
								>
									<TableCell>
										<div className="flex items-center gap-3">
											{item.isDirectory ? (
												<div
													className="p-2 bg-primary/5 rounded-lg text-primary/80 group-hover:bg-primary/10 group-hover:text-primary transition-all shadow-sm border border-primary/10"
												>
													<FolderIcon size={20} fill="currentColor" fillOpacity={0.15} />
												</div>
											) : (
												<div className="p-2 bg-primary/5 rounded-lg text-primary/60 group-hover:text-primary transition-all">
													{item.mimeType.startsWith("image/") ? <ImageIcon size={20} /> : <FileText size={20} />}
												</div>
											)}
											<div className="flex flex-col min-w-0">
												<span
													className={cn(
														"font-medium truncate max-w-[300px]",
														item.isDirectory && "text-primary font-bold"
													)}
												>
													{item.name}
												</span>
												<span className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-wider">
													{item.isDirectory ? "Folder" : item.path.split('.').pop()}
												</span>
											</div>
										</div>
									</TableCell>
									<TableCell>
										<Badge
											variant="secondary"
											className={cn(
												"font-medium capitalize shadow-sm border px-2 py-0.5 transition-colors",
												getTypeStyles(item.isDirectory ? "directory" : item.mimeType)
											)}
										>
											{item.isDirectory ? "Directory" : (item.mimeType.split("/")[1] || "File")}
										</Badge>
									</TableCell>
									<TableCell className="tabular-nums text-muted-foreground text-xs">
										{item.isDirectory ? "—" : formatBytes(item.size)}
									</TableCell>
									<TableCell className="text-muted-foreground text-xs">
										{format(new Date(item.createdAt), "MMM d, yyyy HH:mm")}
									</TableCell>
									<TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
										<div className="flex items-center justify-end gap-1">
											{!item.isDirectory && (
												<Button variant="ghost" size="icon" asChild className="size-8">
													<a href={`/api/files/${item.path}`} target="_blank" rel="noopener noreferrer">
														<ExternalLink className="w-4 h-4" />
													</a>
												</Button>
											)}
											<Button
												variant="ghost"
												size="icon"
												className="size-8 text-destructive hover:bg-destructive/10"
												onClick={() => setDeletePath(item.path)}
												disabled={deleteMutation.isPending}
											>
												<Trash2 className="w-4 h-4" />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>

			{/* Create Folder Dialog */}
			<AlertDialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Create New Folder</AlertDialogTitle>
						<AlertDialogDescription>
							Enter a name for the new folder in <strong>/{currentPath || "root"}</strong>.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<form onSubmit={handleCreateFolder} className="py-4">
						<div className="space-y-2">
							<label htmlFor="folder-name" className="text-sm font-medium">Folder Name</label>
							<input
								id="folder-name"
								autoFocus
								className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
								placeholder="e.g. documents, invoices, backups"
								value={newFolderName}
								onChange={(e) => setNewFolderName(e.target.value)}
							/>
						</div>
					</form>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={() => setIsCreateFolderOpen(false)}>Cancel</AlertDialogCancel>
						<Button
							onClick={handleCreateFolder}
							disabled={createFolderMutation.isPending || !newFolderName.trim()}
						>
							{createFolderMutation.isPending ? "Creating..." : "Create Folder"}
						</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Delete Dialog */}
			<AlertDialog open={!!deletePath} onOpenChange={(open) => !open && setDeletePath(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This will permanently delete <strong>{deletePath?.split('/').pop()}</strong>.
							If it&apos;s a folder, all its contents will be removed. This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
						<AlertDialogAction
							variant="destructive"
							onClick={(e) => {
								e.preventDefault()
								if (deletePath) deleteMutation.mutate({ path: deletePath })
							}}
							disabled={deleteMutation.isPending}
						>
							{deleteMutation.isPending ? "Deleting..." : "Delete"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	)
}

function getTypeStyles(mimeType: string) {
	if (mimeType === "directory") {
		return "bg-primary/10 text-primary border-primary/20 dark:bg-primary/20 dark:text-primary-foreground/90 dark:border-primary/30"
	}
	if (mimeType.startsWith("image/")) {
		return "bg-blue-100/50 text-blue-700 border-blue-200/60 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20"
	}
	if (mimeType.includes("pdf") || mimeType.includes("document") || mimeType.includes("text")) {
		return "bg-emerald-100/50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
	}
	if (mimeType.includes("zip") || mimeType.includes("archive")) {
		return "bg-purple-100/50 text-purple-700 border-purple-200/60 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20"
	}
	return "bg-slate-100/50 text-slate-700 border-slate-200/60 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20"
}

function formatBytes(bytes: number, decimals = 2) {
	if (bytes === 0) return "0 Bytes"
	const k = 1024
	const dm = decimals < 0 ? 0 : decimals
	const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
	const i = Math.floor(Math.log(bytes) / Math.log(k))
	return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
}
