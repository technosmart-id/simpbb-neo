"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth/client"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "sonner"

interface SessionData {
	session: {
		impersonatedBy?: string
	}
	user: {
		name: string
		email: string
	}
}

export function ImpersonationBanner() {
	const router = useRouter()
	const [isImpersonating, setIsImpersonating] = useState(false)
	const [impersonatedBy, setImpersonatedBy] = useState<string | null>(null)
	const [isLoading, setIsLoading] = useState(false)

	useEffect(() => {
		const checkImpersonation = async () => {
			await authClient.getSession({
				fetchOptions: {
					onSuccess: (ctx) => {
						const sessionData = ctx.data as SessionData | null
						if (sessionData?.session?.impersonatedBy) {
							setIsImpersonating(true)
							setImpersonatedBy(sessionData.session.impersonatedBy)
						} else {
							setIsImpersonating(false)
							setImpersonatedBy(null)
						}
					},
				},
			})
		}

		checkImpersonation()
	}, [])

	const handleStopImpersonating = async () => {
		setIsLoading(true)
		try {
			const result = await authClient.admin.stopImpersonating()
			if (result.error) {
				toast.error(result.error.message || "Failed to stop impersonating")
			} else {
				toast.success("Stopped impersonating")
				setIsImpersonating(false)
				router.push("/settings/organizations")
				router.refresh()
			}
		} catch {
			toast.error("Failed to stop impersonating")
		} finally {
			setIsLoading(false)
		}
	}

	if (!isImpersonating) {
		return null
	}

	return (
		<Alert className="rounded-none border-x-0 border-t-0 border-b-4 border-b-amber-500 bg-amber-50 dark:bg-amber-950/50">
			<AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
			<AlertTitle className="text-amber-800 dark:text-amber-400">
				Admin Impersonation Mode
			</AlertTitle>
			<AlertDescription className="flex items-center justify-between gap-4 text-amber-700 dark:text-amber-300">
				<span>
					You are currently viewing the application as another user.
					{impersonatedBy && ` Impersonated by: ${impersonatedBy}`}
				</span>
				<Button
					variant="outline"
					size="sm"
					onClick={handleStopImpersonating}
					disabled={isLoading}
					className="border-amber-600 text-amber-800 hover:bg-amber-100 dark:border-amber-400 dark:text-amber-200 dark:hover:bg-amber-900"
				>
					{isLoading ? "Stopping..." : "Stop Impersonating"}
				</Button>
			</AlertDescription>
		</Alert>
	)
}
