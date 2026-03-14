"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { FileIcon, UploadCloud, X, FileText, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface FileUploadProps {
	multiple?: boolean
	accept?: string
	onUploadSuccess?: (paths: string[]) => void
	defaultValue?: string | string[]
}

export function FileUpload({
	multiple = false,
	accept,
	onUploadSuccess,
	defaultValue,
}: FileUploadProps) {
	const [isUploading, setIsUploading] = React.useState(false)
	
	const initialFiles = React.useMemo(() => {
		if (!defaultValue) return []
		const paths = Array.isArray(defaultValue) ? defaultValue : [defaultValue]
		return paths.map(p => ({
			name: p.split('/').pop() || p,
			size: 0,
			path: p
		}))
	}, [defaultValue])

	const [files, setFiles] = React.useState<{ name: string; size: number; path: string }[]>(initialFiles)

	React.useEffect(() => {
		setFiles(initialFiles)
	}, [initialFiles])

	const [progress, setProgress] = React.useState(0)
	const fileInputRef = React.useRef<HTMLInputElement>(null)

	const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFiles = e.target.files
		if (!selectedFiles || selectedFiles.length === 0) return

		setIsUploading(true)
		setProgress(10)

		const formData = new FormData()
		for (let i = 0; i < selectedFiles.length; i++) {
			formData.append("files", selectedFiles[i])
		}

		try {
			setProgress(30)
			const response = await fetch("/api/upload", {
				method: "POST",
				body: formData,
			})

			if (!response.ok) throw new Error("Upload failed")

			const data = (await response.json()) as { name: string; size: number; path: string }[]
			setProgress(100)
			
			const newFiles = data.map((d) => ({
				name: d.name,
				size: d.size,
				path: d.path,
			}))

			if (multiple) {
				setFiles((prev) => [...prev, ...newFiles])
				onUploadSuccess?.([...files.map((f) => f.path), ...newFiles.map((f) => f.path)])
			} else {
				setFiles(newFiles)
				onUploadSuccess?.(newFiles.map((f) => f.path))
			}

		} catch (error) {
			console.error("Upload error:", error)
			toast.error("Failed to upload files")
		} finally {
			setTimeout(() => {
				setIsUploading(false)
				setProgress(0)
			}, 500)
		}
	}

	const removeFile = (index: number) => {
		const newFiles = [...files]
		newFiles.splice(index, 1)
		setFiles(newFiles)
		onUploadSuccess?.(newFiles.map(f => f.path))
	}

	return (
		<div className="space-y-4">
			<div
				className={cn(
					"relative w-full h-20 sm:h-24 lg:h-[100px] border-2 border-dashed rounded-lg transition-colors hover:bg-accent/50 cursor-pointer flex flex-col items-center justify-center gap-1",
					isUploading && "opacity-50 cursor-not-allowed"
				)}
				onClick={() => !isUploading && fileInputRef.current?.click()}
			>
				<Input
					type="file"
					multiple={multiple}
					accept={accept}
					className="hidden"
					ref={fileInputRef}
					onChange={handleUpload}
					disabled={isUploading}
				/>
				<UploadCloud className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
				<p className="text-xs font-medium text-center px-1">Click to upload or drag and drop</p>
			</div>

			{isUploading && (
				<div className="space-y-2">
					<div className="flex justify-between text-xs">
						<span>Uploading...</span>
						<span>{progress}%</span>
					</div>
					<Progress value={progress} className="h-1" />
				</div>
			)}

			{files.length > 0 && (
				<div className="space-y-2">
					{files.map((file, i) => (
						<div
							key={i}
							className="flex items-center gap-3 p-3 border rounded-md bg-card animate-in fade-in slide-in-from-bottom-1"
						>
							<FileText className="w-5 h-5 text-primary shrink-0" />
							<div className="flex-1 min-w-0">
								<p className="text-sm font-medium truncate">{file.name}</p>
								<p className="text-xs text-muted-foreground">
									{(file.size / 1024).toFixed(2)} KB
								</p>
							</div>
							<CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8 text-muted-foreground hover:text-destructive"
								onClick={(e) => {
									e.stopPropagation()
									removeFile(i)
								}}
							>
								<X className="w-4 h-4" />
							</Button>
						</div>
					))}
				</div>
			)}
		</div>
	)
}
