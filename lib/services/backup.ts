import * as fs from "fs/promises"
import * as fsSync from "fs"
import * as path from "path"
import { spawn } from "child_process"
import archiver from "archiver"

/**
 * Backup Service
 *
 * Handles automated database and file backups with compression and retention policies.
 *
 * Because nothing says "I love my data" like a proper backup strategy.
 */

export interface DatabaseConnectionConfig {
	host: string
	port: number
	user: string
	password: string
	database: string
}

export interface BackupOptions {
	retentionDays?: number
	backupDir?: string
	onProgress?: (message: string) => void
}

export interface BackupResult {
	success: boolean
	backupPath?: string
	size?: number
	error?: string
	duration?: number // in ms
}

const DEFAULT_RETENTION_DAYS = 30
const DEFAULT_BACKUP_DIR = path.join(process.cwd(), "backups")
const UPLOADS_DIR = path.join(process.cwd(), "uploads")

/**
 * Parse DATABASE_URL into connection config.
 *
 * Expected format: mysql://user:password@host:port/database
 *
 * Fun fact: URL parsing is a minefield of edge cases.
 */
export function parseDatabaseUrl(url: string): DatabaseConnectionConfig {
	try {
		// Handle mysql:// prefix
		let connectionString = url
		if (connectionString.startsWith("mysql://")) {
			connectionString = connectionString.substring(8)
		}

		// Extract auth and host parts
		// Format: user:password@host:port/database
		const atPos = connectionString.indexOf("@")
		if (atPos === -1) {
			throw new Error("Invalid DATABASE_URL format: missing @ separator")
		}

		const authPart = connectionString.substring(0, atPos)
		const hostPart = connectionString.substring(atPos + 1)

		// Split user:password
		const colonPos = authPart.indexOf(":")
		if (colonPos === -1) {
			throw new Error("Invalid DATABASE_URL format: missing password separator")
		}

		const user = authPart.substring(0, colonPos)
		const password = authPart.substring(colonPos + 1)

		// Split host:port/database
		const slashPos = hostPart.indexOf("/")
		if (slashPos === -1) {
			throw new Error("Invalid DATABASE_URL format: missing database name")
		}

		const hostPortPart = hostPart.substring(0, slashPos)
		const database = hostPart.substring(slashPos + 1)

		// Split host:port
		const portColonPos = hostPortPart.indexOf(":")
		let host = hostPortPart
		let port = 3306 // MySQL default

		if (portColonPos !== -1) {
			host = hostPortPart.substring(0, portColonPos)
			port = parseInt(hostPortPart.substring(portColonPos + 1), 10)
		}

		return { host, port, user, password, database }
	} catch (error) {
		throw new Error(`Failed to parse DATABASE_URL: ${error instanceof Error ? error.message : String(error)}`)
	}
}

/**
 * Create a database dump using mysqldump.
 *
 * Note: Uses --no-create-db to avoid CREATE DATABASE syntax in the dump.
 * This allows restoring to any existing database.
 *
 * @param config - Database connection configuration
 * @param outputPath - Path where the SQL dump will be written
 * @param retries - Number of retry attempts (default: 3)
 */
export async function createDatabaseDump(
	config: DatabaseConnectionConfig,
	outputPath: string,
	retries: number = 3
): Promise<void> {
	let lastError: Error | null = null

	for (let attempt = 1; attempt <= retries; attempt++) {
		try {
			await executeWithRetry(config, outputPath, attempt)
			return
		} catch (error) {
			lastError = error as Error
			if (attempt < retries) {
				// Exponential backoff: 1s, 2s, 4s
				const backoffMs = Math.pow(2, attempt - 1) * 1000
				await new Promise((resolve) => setTimeout(resolve, backoffMs))
			}
		}
	}

	throw new Error(`Failed to create database dump after ${retries} attempts: ${lastError?.message}`)
}

/**
 * Execute mysqldump command.
 */
async function executeWithRetry(
	config: DatabaseConnectionConfig,
	outputPath: string,
	_attempt: number // eslint-disable-line @typescript-eslint/no-unused-vars
): Promise<void> {
	// Get mysqldump path from env or use Linux default
	const mysqldumpPath = process.env.MYSQLDUMP_PATH || "/usr/bin/mysqldump"

	// Build command as a single string for shell execution (needed for Windows paths with spaces)
	// Quote the path in case it contains spaces
	const quotedPath = `"${mysqldumpPath}"`
	const argsString = `-h${config.host} -P${config.port} -u${config.user} -p${config.password} --no-create-db --single-transaction --quick --lock-tables=false ${config.database}`
	const command = `${quotedPath} ${argsString}`

	return new Promise<void>((resolve, reject) => {
		const mysqldump = spawn(command, {
			stdio: ["ignore", "pipe", "pipe"],
			shell: true,
		})

		const writeStream = fsSync.createWriteStream(outputPath)
		let stderr = ""

		mysqldump.stdout?.pipe(writeStream)

		mysqldump.stderr?.on("data", (data) => {
			stderr += data.toString()
		})

		mysqldump.on("close", (code) => {
			writeStream.close()
			if (code === 0) {
				resolve()
			} else {
				reject(new Error(`mysqldump exited with code ${code}: ${stderr || "unknown error"}`))
			}
		})

		mysqldump.on("error", (err) => {
			writeStream.close()
			reject(new Error(`Failed to spawn mysqldump: ${err.message}`))
		})
	})
}

/**
 * Create a compressed ZIP backup containing database dump and uploads folder.
 *
 * The ZIP structure:
 * ```
 * backup-2026-03-19-020000.zip
 * ├── database/
 * │   └── dump.sql
 * └── uploads/
 *     ├── etrt/
 *     ├── files/
 *     └── temp/
 * ```
 */
export async function createBackupZip(
	dumpPath: string,
	uploadsDir: string,
	outputPath: string,
	onProgress?: (message: string) => void
): Promise<number> {
	return new Promise<number>((resolve, reject) => {
		// Create output directory if it doesn't exist
		const outputDir = path.dirname(outputPath)

		fs.mkdir(outputDir, { recursive: true })
			.then(() => {
				const output = fsSync.createWriteStream(outputPath)
				const archive = archiver("zip", {
					zlib: { level: 6 }, // Balance between speed and compression
				})

				output.on("close", () => {
					// archive.pointer() returns the total bytes written
					resolve(archive.pointer())
				})

				archive.on("error", (err) => {
					reject(new Error(`Archive error: ${err.message}`))
				})

				archive.on("progress", (progress: archiver.ProgressData) => {
					const percent = progress.entries.processed === progress.entries.total
						? 100
						: Math.floor((progress.entries.processed / progress.entries.total) * 100)
					onProgress?.(`Compressing: ${percent}%`)
				})

				archive.pipe(output)

				// Add database dump
				onProgress?.("Adding database dump...")
				archive.file(dumpPath, { name: "database/dump.sql" })

				// Add uploads directory (if it exists)
				fs.access(uploadsDir)
					.then(() => {
						onProgress?.("Adding uploads folder...")
						archive.directory(uploadsDir, "uploads")
						archive.finalize()
					})
					.catch(() => {
						// Uploads directory doesn't exist, skip it
						onProgress?.("No uploads folder found, skipping...")
						archive.finalize()
					})
			})
			.catch(reject)
	})
}

/**
 * Clean up old backup files based on retention policy.
 *
 * Deletes backup files older than the specified retention period.
 *
 * @param backupDir - Directory containing backup files
 * @param retentionDays - Number of days to retain backups
 */
export async function cleanupOldBackups(
	backupDir: string,
	retentionDays: number,
	onProgress?: (message: string) => void
): Promise<{ deleted: number; freedSpace: number }> {
	try {
		const files = await fs.readdir(backupDir)
		const now = Date.now()
		const retentionMs = retentionDays * 24 * 60 * 60 * 1000

		let deleted = 0
		let freedSpace = 0

		for (const file of files) {
			const filePath = path.join(backupDir, file)

			// Skip non-files and .gitkeep
			try {
				const stats = await fs.stat(filePath)
				if (!stats.isFile()) continue

				if (file === ".gitkeep") continue

				// Check if file is older than retention period
				if (now - stats.mtimeMs > retentionMs) {
					const size = stats.size
					await fs.unlink(filePath)
					deleted++
					freedSpace += size
					onProgress?.(`Deleted old backup: ${file}`)
				}
			} catch (error) {
				// File might have been deleted by another process
				console.warn(`Could not process file ${file}:`, error)
			}
		}

		return { deleted, freedSpace }
	} catch (error) {
		// Backup directory might not exist yet
		if ((error as NodeJS.ErrnoException).code === "ENOENT") {
			return { deleted: 0, freedSpace: 0 }
		}
		throw error
	}
}

/**
 * Generate backup filename with timestamp.
 *
 * Format: backup-YYYY-MM-DD-HHMMSS.zip
 */
export function generateBackupFilename(date: Date = new Date()): string {
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, "0")
	const day = String(date.getDate()).padStart(2, "0")
	const hours = String(date.getHours()).padStart(2, "0")
	const minutes = String(date.getMinutes()).padStart(2, "0")
	const seconds = String(date.getSeconds()).padStart(2, "0")

	return `backup-${year}-${month}-${day}-${hours}${minutes}${seconds}.zip`
}

/**
 * Perform a complete backup operation.
 *
 * This is the main orchestration function that:
 * 1. Parses DATABASE_URL
 * 2. Creates a database dump
 * 3. Compresses dump + uploads into a ZIP
 * 4. Cleans up old backups
 * 5. Returns the result
 *
 * @param options - Backup configuration options
 */
export async function performBackup(options: BackupOptions = {}): Promise<BackupResult> {
	const startTime = Date.now()
	const {
		retentionDays = parseInt(process.env.BACKUP_RETENTION_DAYS || String(DEFAULT_RETENTION_DAYS), 10),
		backupDir = process.env.BACKUP_DIR || DEFAULT_BACKUP_DIR,
		onProgress,
	} = options

	// Check if backup is enabled
	if (process.env.BACKUP_ENABLED === "false") {
		return {
			success: false,
			error: "Backup is disabled (BACKUP_ENABLED=false)",
		}
	}

	const tempDir = path.join(process.cwd(), ".temp-backup")
	const dumpPath = path.join(tempDir, "dump.sql")
	const backupFilename = generateBackupFilename()
	const backupPath = path.join(backupDir, backupFilename)

	let cleanupNeeded = false

	try {
		onProgress?.("Starting backup process...")

		// Ensure temp directory exists
		await fs.mkdir(tempDir, { recursive: true })
		cleanupNeeded = true

		// Parse DATABASE_URL
		const dbUrl = process.env.DATABASE_URL
		if (!dbUrl) {
			throw new Error("DATABASE_URL environment variable is not set")
		}

		onProgress?.("Parsing database connection...")
		const dbConfig = parseDatabaseUrl(dbUrl)

		// Create database dump
		onProgress?.(`Creating database dump of ${dbConfig.database}...`)
		await createDatabaseDump(dbConfig, dumpPath)

		// Create ZIP archive
		onProgress?.("Creating backup archive...")
		const size = await createBackupZip(dumpPath, UPLOADS_DIR, backupPath, onProgress)

		const duration = Date.now() - startTime
		onProgress?.(`Backup completed: ${backupPath} (${formatBytes(size)} in ${duration}ms)`)

		return {
			success: true,
			backupPath,
			size,
			duration,
		}
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error)
		onProgress?.(`Backup failed: ${message}`)
		return {
			success: false,
			error: message,
			duration: Date.now() - startTime,
		}
	} finally {
		// Clean up temp files
		if (cleanupNeeded) {
			try {
				await fs.rm(tempDir, { recursive: true, force: true })
			} catch (e) {
				console.warn("Failed to clean up temp directory:", e)
			}
		}

		// Clean up old backups (do this even if backup failed, to manage disk space)
		try {
			onProgress?.("Cleaning up old backups...")
			const cleanupResult = await cleanupOldBackups(backupDir, retentionDays, onProgress)
			if (cleanupResult.deleted > 0) {
				onProgress?.(`Deleted ${cleanupResult.deleted} old backup(s), freed ${formatBytes(cleanupResult.freedSpace)}`)
			}
		} catch (error) {
			console.warn("Failed to cleanup old backups:", error)
		}
	}
}

/**
 * Format bytes to human-readable string.
 */
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

/**
 * List all backups in the backup directory.
 */
export async function listBackups(
	backupDir: string = process.env.BACKUP_DIR || DEFAULT_BACKUP_DIR
): Promise<Array<{ name: string; path: string; size: number; createdAt: Date }>> {
	try {
		const files = await fs.readdir(backupDir)
		const backups: Array<{ name: string; path: string; size: number; createdAt: Date }> = []

		for (const file of files) {
			if (file === ".gitkeep") continue

			const filePath = path.join(backupDir, file)
			try {
				const stats = await fs.stat(filePath)
				if (stats.isFile() && file.endsWith(".zip")) {
					backups.push({
						name: file,
						path: filePath,
						size: stats.size,
						createdAt: stats.mtime,
					})
				}
			} catch {
				// Skip files we can't read
			}
		}

		// Sort by creation date (newest first)
		return backups.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === "ENOENT") {
			return []
		}
		throw error
	}
}
