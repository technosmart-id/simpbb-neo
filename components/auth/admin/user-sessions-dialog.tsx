"use client"

import { useState, useEffect, useCallback } from "react"
import { authClient } from "@/lib/auth/client"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, Monitor, X } from "lucide-react"
import { toast } from "sonner"

interface User {
	id: string
	name: string
	email: string
}

interface UserSession {
	token: string
	userId: string
	expiresAt: Date
	createdAt: Date
	ipAddress?: string
	userAgent?: string
}

interface UserSessionsDialogProps {
	user: User
	open: boolean
	onOpenChange: (open: boolean) => void
	onRefresh: () => void
}

export function UserSessionsDialog({
	user,
	open,
	onOpenChange,
	onRefresh,
}: UserSessionsDialogProps) {
	const [sessions, setSessions] = useState<UserSession[]>([])
	const [loading, setLoading] = useState(false)
	const [revoking, setRevoking] = useState<string | null>(null)

	const fetchSessions = useCallback(async () => {
		setLoading(true)
		try {
			const res = await (authClient.admin as unknown as {
				listUserSessions: (opts: { query: { userId: string } }) => Promise<{ data?: UserSession[] }>;
			}).listUserSessions({
				query: { userId: user.id },
			})
			if (res.data) {
				setSessions(res.data as UserSession[])
			}
		} catch {
			toast.error("Failed to fetch sessions")
		} finally {
			setLoading(false)
		}
	}, [user.id])

	useEffect(() => {
		if (open) {
			fetchSessions()
		}
	}, [open, fetchSessions])

	const handleRevokeSession = async (token: string) => {
		setRevoking(token)
		try {
			const res = await (authClient.admin as unknown as {
				revokeUserSession: (opts: { body: { userId: string; token: string } }) => Promise<{ error?: { message?: string } }>;
			}).revokeUserSession({
				body: { userId: user.id, token },
			})

			if (res.error) {
				toast.error(res.error.message || "Failed to revoke session")
			} else {
				toast.success("Session revoked")
				fetchSessions()
				onRefresh()
			}
		} catch {
			toast.error("Failed to revoke session")
		} finally {
			setRevoking(null)
		}
	}

	const handleRevokeAllSessions = async () => {
		setRevoking("all")
		try {
			const res = await (authClient.admin as unknown as {
				revokeUserSessions: (opts: { body: { userId: string } }) => Promise<{ error?: { message?: string } }>;
			}).revokeUserSessions({
				body: { userId: user.id },
			})

			if (res.error) {
				toast.error(res.error.message || "Failed to revoke sessions")
			} else {
				toast.success("All sessions revoked")
				setSessions([])
				onRefresh()
			}
		} finally {
			setRevoking(null)
		}
	}

	const formatDate = (date: Date | string) => {
		return new Date(date).toLocaleString()
	}

	const isExpired = (expiresAt: Date | string) => {
		return new Date(expiresAt) < new Date()
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Monitor className="h-5 w-5" />
						Active Sessions for {user.name}
					</DialogTitle>
					<DialogDescription>
						Manage all active sessions for {user.email}
					</DialogDescription>
				</DialogHeader>

				<div className="py-4">
					{loading ? (
						<div className="flex items-center justify-center py-8">
							<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
						</div>
					) : sessions.length === 0 ? (
						<div className="text-center py-8 text-muted-foreground">
							No active sessions found for this user.
						</div>
					) : (
						<>
							<div className="rounded-md border">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Created</TableHead>
											<TableHead>Expires</TableHead>
											<TableHead>Status</TableHead>
											<TableHead className="text-right">Actions</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{sessions.map((session) => (
											<TableRow key={session.token}>
												<TableCell className="text-sm">
													{formatDate(session.createdAt)}
												</TableCell>
												<TableCell className="text-sm">
													{formatDate(session.expiresAt)}
												</TableCell>
												<TableCell>
													{isExpired(session.expiresAt) ? (
														<Badge variant="secondary">Expired</Badge>
													) : (
														<Badge variant="default">Active</Badge>
													)}
												</TableCell>
												<TableCell className="text-right">
													<Button
														variant="ghost"
														size="sm"
														onClick={() => handleRevokeSession(session.token)}
														disabled={revoking === session.token || isExpired(session.expiresAt)}
													>
														{revoking === session.token ? (
															<Loader2 className="h-4 w-4 animate-spin" />
														) : (
															<X className="h-4 w-4" />
														)}
													</Button>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>

							<div className="flex justify-between items-center mt-4 pt-4 border-t">
								<span className="text-sm text-muted-foreground">
									{sessions.length} session{sessions.length !== 1 ? "s" : ""} total
								</span>
								<Button
									variant="destructive"
									size="sm"
									onClick={handleRevokeAllSessions}
									disabled={revoking === "all"}
								>
									{revoking === "all" ? (
										<>
											<Loader2 className="h-4 w-4 animate-spin mr-2" />
											Revoking...
										</>
									) : (
										<>
											<X className="h-4 w-4 mr-2" />
											Revoke All Sessions
										</>
									)}
								</Button>
							</div>
						</>
					)}
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Close
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
