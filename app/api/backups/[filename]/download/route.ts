import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import * as fs from "fs/promises"
import * as path from "path"

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ filename: string }> }
) {
	const session = await auth.api.getSession({ headers: req.headers })
	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
	}

	try {
		const { filename } = await params

		const backupDir = path.resolve(process.env.BACKUP_DIR || path.join(process.cwd(), "backups"))
		const safeFilename = path.basename(filename)
		const filePath = path.join(backupDir, safeFilename)

		// Security check: prevent path traversal attacks
		if (safeFilename !== filename || !filePath.startsWith(backupDir)) {
			return NextResponse.json({ error: "Invalid filename" }, { status: 400 })
		}

		// Additional check: only allow .zip files with expected naming pattern
		if (!safeFilename.startsWith("backup-") || !safeFilename.endsWith(".zip")) {
			return NextResponse.json({ error: "Invalid backup file" }, { status: 400 })
		}

		try {
			const fileBuffer = await fs.readFile(filePath)
			const stats = await fs.stat(filePath)

			return new NextResponse(fileBuffer, {
				headers: {
					"Content-Type": "application/zip",
					"Content-Length": stats.size.toString(),
					"Content-Disposition": `attachment; filename="${filename}"`,
					"Cache-Control": "private, max-age=0",
				},
			})
		} catch (e) {
			return NextResponse.json({ error: "Backup file not found" }, { status: 404 })
		}
	} catch (error) {
		return NextResponse.json({ error: "Internal error" }, { status: 500 })
	}
}
