"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { ImagePlus, X, CheckCircle2, Image as ImageIcon } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface ImageUploadProps {
	multiple?: boolean
	onUploadSuccess?: (paths: string[]) => void
	defaultValue?: string | string[]
}

export function ImageUpload({
	multiple = false,
	onUploadSuccess,
	defaultValue,
}: ImageUploadProps) {
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

		// Filter for images only
		const imageFiles = Array.from(selectedFiles).filter((f: File) => f.type.startsWith("image/"))
		if (imageFiles.length === 0) {
			toast.error("Please select only image files")
			return
		}

		setIsUploading(true)
		setProgress(10)

		const formData = new FormData()
		for (const file of imageFiles) {
			formData.append("files", file)
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
				const updatedFiles = [...files, ...newFiles]
				setFiles(updatedFiles)
				onUploadSuccess?.(updatedFiles.map((f: { path: string }) => f.path))
			} else {
				setFiles(newFiles)
				onUploadSuccess?.(newFiles.map((f: { path: string }) => f.path))
			}

		} catch (error) {
			console.error("Upload error:", error)
			toast.error("Failed to upload images")
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
			<div className="flex flex-wrap gap-3">
				{files.map((file, i) => (
					<div
						key={i}
						className="group relative size-20 sm:size-24 lg:size-[100px] rounded-lg border bg-muted overflow-hidden animate-in zoom-in-95"
					>
						<img
							src={`/api/files/${file.path}`}
							alt={file.name}
							className="h-full w-full object-cover transition-transform group-hover:scale-105"
						/>
						<div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
							<Button
								variant="destructive"
								size="icon"
								className="h-8 w-8 rounded-full"
								onClick={() => removeFile(i)}
							>
								<X className="w-4 h-4" />
							</Button>
						</div>
						<div className="absolute bottom-1 right-1">
							<CheckCircle2 className="w-4 h-4 text-green-500 bg-white rounded-full" />
						</div>
					</div>
				))}

				{(!files.length || multiple) && (
					<button
						type="button"
						disabled={isUploading}
						onClick={() => fileInputRef.current?.click()}
						className={cn(
							"size-20 sm:size-24 lg:size-[100px] rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-2 hover:bg-accent/50 transition-colors disabled:opacity-50",
							isUploading && "cursor-not-allowed"
						)}
					>
						<ImagePlus className="w-8 h-8 text-muted-foreground" />
						<span className="text-xs font-medium text-muted-foreground">
							{isUploading ? "Uploading..." : "Add Image"}
						</span>
					</button>
				)}
			</div>

			{isUploading && (
				<div className="space-y-1">
					<Progress value={progress} className="h-1" />
				</div>
			)}

			<Input
				type="file"
				multiple={multiple}
				accept="image/*"
				className="hidden"
				ref={fileInputRef}
				onChange={handleUpload}
				disabled={isUploading}
			/>
		</div>
	)
}
