"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
	Laptop,
	Monitor,
	Smartphone,
	Globe,
	Trash2,
	Shield,
	Clock,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface SessionInfo {
	id: string;
	createdAt: string;
	expiresAt: string;
	ipAddress?: string;
	userAgent?: string;
	token: string;
	isCurrent: boolean;
}

interface DeviceInfo {
	type: "desktop" | "mobile" | "tablet";
	os: string;
	browser: string;
	icon: React.ReactNode;
}

function parseUserAgent(userAgent?: string): DeviceInfo {
	const ua = userAgent?.toLowerCase() || "";

	if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua)) {
		return {
			type: "mobile",
			os: ua.includes("android") ? "Android" : ua.includes("iphone") ? "iOS" : "Mobile",
			browser: ua.includes("chrome") ? "Chrome" : ua.includes("safari") ? "Safari" : "Mobile",
			icon: <Smartphone className="h-4 w-4" />,
		};
	}

	if (/tablet|ipad|kindle|silk/i.test(ua)) {
		return {
			type: "tablet",
			os: ua.includes("ipad") ? "iPadOS" : "Tablet",
			browser: "Tablet",
			icon: <Laptop className="h-4 w-4" />,
		};
	}

	let os = "Unknown";
	if (ua.includes("windows")) os = "Windows";
	else if (ua.includes("mac")) os = "macOS";
	else if (ua.includes("linux")) os = "Linux";

	let browser = "Unknown";
	if (ua.includes("chrome") && !ua.includes("edg")) browser = "Chrome";
	else if (ua.includes("safari") && !ua.includes("chrome")) browser = "Safari";
	else if (ua.includes("firefox")) browser = "Firefox";
	else if (ua.includes("edg")) browser = "Edge";

	return {
		type: "desktop",
		os,
		browser,
		icon: <Monitor className="h-4 w-4" />,
	};
}

function formatIP(ip?: string): string {
	if (!ip) return "Unknown";
	const parts = ip.split(".");
	if (parts.length !== 4) return ip;
	return `${parts[0]}.${parts[1]}.${parts[2]}.***`;
}

export function SessionManager() {
	const [sessions, setSessions] = useState<SessionInfo[]>([]);
	const [loading, setLoading] = useState(true);
	const [revokeDialog, setRevokeDialog] = useState<{
		open: boolean;
		sessionId: string;
	}>({ open: false, sessionId: "" });

	const fetchSessions = async () => {
		setLoading(true);
		try {
			const response = await fetch("/api/user/sessions");
			if (!response.ok) {
				throw new Error("Failed to fetch sessions");
			}
			const data = await response.json();
			setSessions(data);
		} catch (error) {
			console.error("Failed to fetch sessions:", error);
			toast.error("Failed to load sessions");
		} finally {
			setLoading(false);
		}
	};

	const handleRevokeSession = async (sessionId: string) => {
		try {
			const response = await fetch(`/api/user/sessions?id=${sessionId}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to revoke session");
			}

			toast.success("Session revoked successfully");
			setRevokeDialog({ open: false, sessionId: "" });
			fetchSessions();
		} catch (error) {
			console.error("Failed to revoke session:", error);
			toast.error(error instanceof Error ? error.message : "Failed to revoke session");
		}
	};

	const handleRevokeAll = async () => {
		try {
			const response = await fetch("/api/user/sessions", {
				method: "PATCH",
			});

			if (!response.ok) {
				throw new Error("Failed to revoke sessions");
			}

			toast.success("All other sessions revoked");
			fetchSessions();
		} catch (error) {
			console.error("Failed to revoke sessions:", error);
			toast.error("Failed to revoke sessions");
		}
	};

	useEffect(() => {
		fetchSessions();
	}, []);

	if (loading) {
		return (
			<div className="flex items-center justify-center py-8">
				<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
			</div>
		);
	}

	return (
		<>
			{sessions.length > 1 && (
				<div className="flex justify-end mb-4">
					<Button
						variant="outline"
						size="sm"
						onClick={handleRevokeAll}
						className="gap-2"
					>
						<Shield className="h-4 w-4" />
						Sign out all other sessions
					</Button>
				</div>
			)}
			{sessions.length === 0 ? (
				<div className="flex flex-col items-center justify-center py-8 text-center">
					<div className="rounded-full bg-muted p-4">
						<Globe className="h-8 w-8 text-muted-foreground" />
					</div>
					<p className="mt-4 text-sm text-muted-foreground">
						No active sessions found
					</p>
				</div>
			) : (
				<div className="space-y-3">
					{sessions.map((session) => {
						const device = parseUserAgent(session.userAgent);
						const isExpired = new Date(session.expiresAt) < new Date();

						return (
							<div
								key={session.id}
								className={`flex items-center gap-4 p-3 rounded-lg border transition-colors hover:bg-muted/50 ${isExpired ? "opacity-50" : ""}`}
							>
								<div className="rounded-full bg-muted p-2.5 shrink-0">
									{device.icon}
								</div>
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-2 flex-wrap">
										<span className="font-medium text-sm truncate">
											{device.browser} on {device.os}
										</span>
										{session.isCurrent && (
											<Badge variant="secondary" className="text-xs shrink-0">
												Current
											</Badge>
										)}
										{isExpired && (
											<Badge variant="destructive" className="text-xs shrink-0">
												Expired
											</Badge>
										)}
									</div>
									<div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
										<span className="flex items-center gap-1">
											<Globe className="h-3 w-3" />
											{formatIP(session.ipAddress)}
										</span>
										<span className="flex items-center gap-1">
											<Clock className="h-3 w-3" />
											{formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}
										</span>
									</div>
								</div>
								{!session.isCurrent && (
									<Button
										variant="ghost"
										size="icon"
										onClick={() =>
											setRevokeDialog({
												open: true,
												sessionId: session.id,
											})
										}
										className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								)}
							</div>
						);
					})}
				</div>
			)}

			<AlertDialog
				open={revokeDialog.open}
				onOpenChange={(open) =>
					setRevokeDialog({ open, sessionId: revokeDialog.sessionId })
				}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Revoke Session?</AlertDialogTitle>
						<AlertDialogDescription>
							This will sign out the device immediately. The user will need to sign
							in again to access their account.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => handleRevokeSession(revokeDialog.sessionId)}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							Revoke Session
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
