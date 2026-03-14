import { NextRequest, NextResponse } from "next/server"
import { StorageService } from "@/lib/services/storage"
import { auth } from "@/lib/auth"

export async function POST(req: NextRequest) {
	const session = await auth.api.getSession({ headers: req.headers })
	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
	}

	try {
		const formData = await req.formData()
		const files = formData.getAll("files") as File[]

		if (!files || files.length === 0) {
			return NextResponse.json({ error: "No files uploaded" }, { status: 400 })
		}

		const results = []
		for (const file of files) {
			const result = await StorageService.saveTemp(file)
			results.push(result)
		}

		return NextResponse.json(results)
	} catch (error) {
		console.error("Upload error:", error)
		return NextResponse.json({ error: "Upload failed" }, { status: 500 })
	}
}
