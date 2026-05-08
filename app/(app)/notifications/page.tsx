"use client"

import { useORPC } from "@/lib/orpc/react"
import { formatDistanceToNow } from "date-fns"
import { useQuery } from "@tanstack/react-query"
import { Loader2, Bell, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

type Notification = {
	id: string
	title: string
	message: string
	isRead: boolean
	createdAt: string | Date
	link?: string | null
}

type NotificationsListResult = { rows: Notification[]; total: number }

export default function NotificationsPage() {
	const orpc = useORPC()

	// Notifications List Query
	const { data: listData, isLoading, refetch } = useQuery(
		orpc.notifications.list.queryOptions({
			input: { limit: 100 },
		})
	)

	const notifications = (listData as NotificationsListResult | undefined)?.rows || []
	const unreadCount = notifications.filter((n: Notification) => !n.isRead).length

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
					<p className="text-muted-foreground">
						{unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
					</p>
				</div>
				<Button variant="outline" size="sm" onClick={() => refetch()}>
					<RefreshCw className="h-4 w-4 mr-2" />
					Refresh
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>All Notifications</CardTitle>
					<CardDescription>
						{notifications.length} total notification{notifications.length !== 1 ? "s" : ""}
					</CardDescription>
				</CardHeader>
				<CardContent className="p-0">
					{isLoading ? (
						<div className="flex items-center justify-center h-64">
							<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
						</div>
					) : notifications.length === 0 ? (
						<div className="flex flex-col items-center justify-center h-64 text-center">
							<Bell className="h-12 w-12 text-muted-foreground/20 mb-4" />
							<p className="text-muted-foreground">No notifications yet</p>
						</div>
					) : (
						<ScrollArea className="h-[600px]">
							<div className="divide-y">
								{notifications.map((n: Notification) => (
									<div
										key={n.id}
										className={`p-4 hover:bg-muted/50 transition-colors ${!n.isRead ? "bg-muted/30" : ""}`}
									>
										<div className="flex gap-4">
											<div className="flex-1 space-y-2">
												<div className="flex items-center gap-2">
													{!n.isRead && (
														<Badge variant="default" className="text-xs">New</Badge>
													)}
													<h4 className={`text-sm ${!n.isRead ? "font-semibold" : ""}`}>
														{n.title}
													</h4>
												</div>
												<p className="text-sm text-muted-foreground">
													{n.message}
												</p>
												<p className="text-xs text-muted-foreground">
													{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
												</p>
												{n.link && (
													<Link
														href={n.link}
														className="text-xs text-primary hover:underline inline-block mt-1"
													>
														View →
													</Link>
												)}
											</div>
										</div>
									</div>
								))}
							</div>
						</ScrollArea>
					)}
				</CardContent>
			</Card>
		</div>
	)
}
