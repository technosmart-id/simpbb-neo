import fs from "fs/promises"
import path from "path"
import crypto from "crypto"

const UPLOAD_ROOT = path.join(process.cwd(), "uploads")
const TEMP_DIR = path.join(UPLOAD_ROOT, "temp")
const STORE_DIR = path.join(UPLOAD_ROOT, "files")

export interface FileMetadata {
	path: string
	name: string
	size: number
	mimeType: string
	createdAt: Date
	isDirectory: boolean
}

export interface StorageStats {
	totalSize: number
	fileCount: number
	limit?: number // Optional limit in bytes
}

/**
 * Storage Service
 * Handles file storage with provider abstraction (Local vs S3 ready).
 */
export const StorageService = {
	get provider() {
		return process.env.STORAGE_PROVIDER || "local"
	},

	async init() {
		if (this.provider === "local") {
			await fs.mkdir(TEMP_DIR, { recursive: true })
			await fs.mkdir(STORE_DIR, { recursive: true })
		}
		// S3 initialization would happen here if needed
	},

	async saveTemp(file: File): Promise<FileMetadata> {
		await this.init()
		const id = crypto.randomUUID()
		const ext = path.extname(file.name)
		const fileName = `${id}${ext}`
		const relativePath = `temp/${fileName}`
		const stats = {
			path: relativePath,
			name: file.name,
			size: file.size,
			mimeType: file.type,
			createdAt: new Date(),
			isDirectory: false,
		}

		if (this.provider === "local") {
			const filePath = path.join(UPLOAD_ROOT, relativePath)
			const buffer = Buffer.from(await file.arrayBuffer())
			await fs.writeFile(filePath, buffer)
		} else {
			// S3 implementation would go here
			console.log("S3 saveTemp triggered (placeholder)")
		}

		return stats
	},

	async moveToUploads(tempPaths: string[]): Promise<string[]> {
		await this.init()
		const movedPaths: string[] = []

		for (const tempPath of tempPaths) {
			const fileName = path.basename(tempPath)
			const sourceRelative = `temp/${fileName}`
			const destRelative = `files/${fileName}`

			if (this.provider === "local") {
				const source = path.join(UPLOAD_ROOT, sourceRelative)
				const destination = path.join(UPLOAD_ROOT, destRelative)

				try {
					const sourceExists = await fs.access(source).then(() => true).catch(() => false)
					if (sourceExists) {
						await fs.rename(source, destination)
						movedPaths.push(destRelative)
					} else {
						// Source doesn't exist, check if it's already in destination (idempotency)
						const destExists = await fs.access(destination).then(() => true).catch(() => false)
						if (destExists) {
							movedPaths.push(destRelative)
						} else {
							console.error(`Source file not found in temp nor files: ${tempPath}`)
						}
					}
				} catch (error) {
					console.error(`Failed to move file ${tempPath}:`, error)
				}
			} else {
				// S3 move logic
				console.log("S3 moveToUploads triggered (placeholder)")
			}
		}

		return movedPaths
	},

	async listFiles(relativePath: string = ""): Promise<FileMetadata[]> {
		await this.init()
		const results: FileMetadata[] = []
		const targetDir = this.validatePath(relativePath)

		if (this.provider === "local") {
			try {
				const files = await fs.readdir(targetDir)
				for (const fileName of files) {
					const filePath = path.join(targetDir, fileName)
					const stats = await fs.stat(filePath)
					const isDirectory = stats.isDirectory()
					
					// Normalize relative path for frontend (using forward slashes)
					const itemRelativePath = path.join(relativePath, fileName).replace(/\\/g, "/")
					
					results.push({
						path: itemRelativePath,
						name: fileName,
						size: stats.size,
						mimeType: isDirectory ? "directory" : this.getContentType(fileName),
						createdAt: stats.birthtime,
						isDirectory,
					})
				}
			} catch (error) {
				console.error(`Failed to list directory ${relativePath}:`, error)
			}
		} else {
			// S3 list logic
		}

		// Sort: Folders first, then by date
		return results.sort((a, b) => {
			if (a.isDirectory && !b.isDirectory) return -1
			if (!a.isDirectory && b.isDirectory) return 1
			return b.createdAt.getTime() - a.createdAt.getTime()
		})
	},

	async createFolder(parentPath: string, folderName: string) {
		await this.init()
		const newFolderPath = this.validatePath(path.join(parentPath, folderName))
		
		if (this.provider === "local") {
			try {
				await fs.mkdir(newFolderPath, { recursive: true })
			} catch (error) {
				console.error(`Failed to create folder ${folderName} in ${parentPath}:`, error)
				throw error
			}
		} else {
			// S3 folder logic (S3 doesn't really have folders, but we can simulate with keys)
		}
	},

	async deleteFile(relativePath: string) {
		await this.init()
		if (this.provider === "local") {
			const fullPath = this.validatePath(relativePath)
			try {
				const stats = await fs.stat(fullPath)
				if (stats.isDirectory()) {
					await fs.rm(fullPath, { recursive: true, force: true })
				} else {
					await fs.unlink(fullPath)
				}
			} catch (error) {
				console.error(`Failed to delete ${relativePath}:`, error)
				throw error
			}
		} else {
			// S3 delete logic
		}
	},

	async getStorageStats(): Promise<StorageStats> {
		const calculateSize = async (dir: string): Promise<{ size: number; count: number }> => {
			let size = 0
			let count = 0
			try {
				const items = await fs.readdir(dir)
				for (const item of items) {
					const itemPath = path.join(dir, item)
					const stats = await fs.stat(itemPath)
					if (stats.isDirectory()) {
						const sub = await calculateSize(itemPath)
						size += sub.size
						count += sub.count
					} else {
						size += stats.size
						count += 1
					}
				}
			} catch (e) {}
			return { size, count }
		}

		const { size, count } = await calculateSize(UPLOAD_ROOT)
		return {
			totalSize: size,
			fileCount: count,
			limit: 100 * 1024 * 1024 * 1024 // 100GB limit
		}
	},

	async cleanupTemp() {
		if (this.provider !== "local") return // Cleanup logic differs for S3 (Lifecycle rules)

		await this.init()
		const files = await fs.readdir(TEMP_DIR)
		const now = Date.now()
		const MS_IN_24_HOURS = 24 * 60 * 60 * 1000

		for (const file of files) {
			const filePath = path.join(TEMP_DIR, file)
			const stats = await fs.stat(filePath)

			if (now - stats.mtimeMs > MS_IN_24_HOURS) {
				try {
					await fs.unlink(filePath)
				} catch (error) {
					console.error(`Failed to delete old temp file ${file}:`, error)
				}
			}
		}
	},

	validatePath(relativePath: string): string {
		const normalizedPath = relativePath.replace(/\\/g, "/")
		const resolvedPath = path.resolve(UPLOAD_ROOT, normalizedPath)
		// Ensure the resolved path is within UPLOAD_ROOT and doesn't just start with the same prefix
		const relative = path.relative(UPLOAD_ROOT, resolvedPath)
		if (relative.startsWith("..") || path.isAbsolute(relative)) {
			throw new Error("Invalid path: path traversal detected")
		}
		return resolvedPath
	},

	getDiskPath(relativePath: string) {
		return this.validatePath(relativePath)
	},

	getContentType(fileName: string): string {
		const ext = fileName.split(".").pop()?.toLowerCase()
		const map: Record<string, string> = {
			js: "application/javascript",
			css: "text/css",
			html: "text/html",
			json: "application/json",
			png: "image/png",
			jpg: "image/jpeg",
			jpeg: "image/jpeg",
			gif: "image/gif",
			svg: "image/svg+xml",
			pdf: "application/pdf",
			txt: "text/plain",
			zip: "application/zip",
		}
		return (ext && map[ext]) || "application/octet-stream"
	},
}
