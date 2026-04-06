import { NextRequest, NextResponse } from "next/server"
import { StorageService } from "@/lib/services/storage"
import { auth } from "@/lib/auth"
import fs from "fs/promises"

// Next.js Response can take a ReadableStream, a Buffer, or a string.
// But simplest for local files is to read the buffer if they aren't huge, 
// or use a stream.

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ path: string[] }> }
) {
	const session = await auth.api.getSession({ headers: req.headers })
	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
	}

	try {
		const { path: pathParts } = await params
		const relativePath = pathParts.join("/")
		
		let diskPath: string
		try {
			diskPath = StorageService.getDiskPath(relativePath)
		} catch (e) {
			return NextResponse.json({ error: "Invalid path" }, { status: 400 })
		}
		
		try {
			const fileBuffer = await fs.readFile(diskPath)
			const stats = await fs.stat(diskPath)
			
			// Detect content type based on extension
			const ext = relativePath.split(".").pop()?.toLowerCase()
			const contentType = getContentType(ext)

			return new NextResponse(fileBuffer, {
				headers: {
					"Content-Type": contentType,
					"Content-Length": stats.size.toString(),
					"Cache-Control": "private, max-age=3600",
				},
			})
		} catch (e) {
			return NextResponse.json({ error: "File not found" }, { status: 404 })
		}
	} catch (error) {
		return NextResponse.json({ error: "Internal error" }, { status: 500 })
	}
}

function getContentType(ext?: string): string {
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
}
