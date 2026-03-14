"use client"

import * as React from "react"
import { Progress } from "@/components/ui/progress"
import { HardDrive, FileText, Activity } from "lucide-react"

interface StorageInfoBarProps {
	totalSize: number
	fileCount: number
	limit?: number
	variant?: "default" | "minimal"
}

export function StorageInfoBar({
	totalSize,
	fileCount,
	limit = 100 * 1024 * 1024 * 1024,
	variant = "default"
}: StorageInfoBarProps) {
	const percentage = (totalSize / limit) * 100
	const formattedSize = formatBytes(totalSize)
	const formattedLimit = formatBytes(limit)

	if (variant === "minimal") {
		return (
			<div className="flex items-center gap-4 px-4 py-2 border rounded-xl bg-accent/20 animate-in fade-in slide-in-from-right-2 shadow-sm">
				<div className="flex flex-col gap-1.5 min-w-[180px]">
					<div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest">
						<span>{formattedSize} / {formattedLimit}</span>
						<span>{percentage.toFixed(2)}%</span>
					</div>
					<Progress value={percentage} className="h-1.5 rounded-full shadow-inner border-1 mt-1" />
				</div>
				<div className="h-8 w-px bg-border" />
				<div className="flex items-center gap-3">
					<div className="p-2 bg-primary/10 rounded-lg">
						<FileText className="w-4 h-4 text-primary" />
					</div>
					<div className="flex flex-col leading-tight">
						<span className="text-xs font-bold uppercase tracking-widest">Total Files</span>
						<span className="text-base font-black tabular-nums">{fileCount}</span>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-xl bg-card animate-in fade-in slide-in-from-top-2">
			{/* Stats Slider */}
			<div className="md:col-span-2 space-y-3">
				<div className="flex justify-between items-center text-sm font-medium">
					<div className="flex items-center gap-2">
						<HardDrive className="w-4 h-4 text-primary" />
						<span>Storage Usage</span>
					</div>
					<span className="text-muted-foreground">{formattedSize} / {formattedLimit} ({percentage.toFixed(1)}%)</span>
				</div>
				<Progress value={percentage} className="h-2 rounded-full shadow-inner" />
			</div>

			{/* Count Mini-Stat */}
			<div className="flex items-center gap-4 bg-accent/30 rounded-lg px-4 py-2">
				<div className="p-2 bg-primary/10 rounded-full">
					<FileText className="w-4 h-4 text-primary" />
				</div>
				<div className="flex flex-col">
					<span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Files</span>
					<span className="text-lg font-bold tabular-nums">{fileCount}</span>
				</div>
				<Activity className="ml-auto w-4 h-4 text-primary/30" />
			</div>
		</div>
	)
}

function formatBytes(bytes: number, decimals = 2) {
	if (bytes === 0) return "0 Bytes"
	const k = 1024
	const dm = decimals < 0 ? 0 : decimals
	const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
	const i = Math.floor(Math.log(bytes) / Math.log(k))
	return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
}
