"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Field,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	UserPlus,
	MoreHorizontal,
	Mail,
	RefreshCw,
	X,
	Check,
	Clock,
	Users,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

type Invitation = {
	id: string;
	organizationId: string;
	email: string;
	role: string;
	status: string;
	createdAt: Date;
	expiresAt: Date;
	inviterId: string;
};

interface PendingInvite {
	id: string;
	email: string;
	role: string;
	status: string;
	expiresAt: string | Date;
	createdAt: string | Date;
	inviter?: {
		name: string;
		email: string;
	};
}

interface Member {
	id: string;
	role: string;
	user: {
		id: string;
		name: string;
		email: string;
	};
}

interface OrganizationInvitesProps {
	organizationId: string;
}

/**
 * Organization Invites Component
 *
 * Manages team member invitations with:
 * - Send new invitations
 * - View pending invitations
 * - Resend expired/pending invitations
 * - Cancel pending invitations
 * - View current members
 */
export function OrganizationInvites({
	organizationId,
}: OrganizationInvitesProps) {
	const [members, setMembers] = useState<Member[]>([]);
	const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
	const [loading, setLoading] = useState(true);
	const [inviteOpen, setInviteOpen] = useState(false);
	const [inviteEmail, setInviteEmail] = useState("");
	const [inviteRole, setInviteRole] = useState("member");
	const [inviting, setInviting] = useState(false);
	const [activeTab, setActiveTab] = useState<"members" | "invites">("members");

	useEffect(() => {
		fetchData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [organizationId]);

	const fetchData = async () => {
		setLoading(true);
		await Promise.all([fetchMembers(), fetchInvites()]);
		setLoading(false);
	};

	const fetchMembers = async () => {
		try {
			// Workaround for better-auth organization client missing types in version 1.5.5
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			if (typeof authClient.organization.listMembers === 'function') {
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				const res = await authClient.organization.listMembers({ organizationId });
				if (res.data && res.data.members) {
					setMembers(res.data.members as unknown as Member[]);
				} else if (Array.isArray(res.data)) {
					setMembers(res.data as unknown as Member[]);
				}
			}
		} catch (error) {
			console.error("Failed to fetch members:", error);
		}
	};

	const fetchInvites = async () => {
		try {
			// Workaround for better-auth organization client missing types in version 1.5.5
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			if (typeof authClient.organization.listInvites === 'function') {
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				const res = await authClient.organization.listInvites({ organizationId });
				if (res.data && res.data.invites) {
					setPendingInvites(res.data.invites as unknown as Invitation[]);
				} else if (Array.isArray(res.data)) {
					setPendingInvites(res.data as unknown as Invitation[]);
				}
			}
		} catch (error) {
			console.error("Failed to fetch invites:", error);
		}
	};

	const inviteMember = async () => {
		if (!inviteEmail) {
			toast.error("Please enter an email address");
			return;
		}

		setInviting(true);
		try {
			// Workaround for better-auth organization client missing types in version 1.5.5
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			const res = await authClient.organization.inviteMember({
				organizationId,
				email: inviteEmail,
				role: inviteRole as "member" | "admin" | "owner",
			});

			if (res.error) {
				toast.error(res.error.message || "Failed to invite member");
			} else {
				toast.success("Invitation sent successfully!");
				setInviteOpen(false);
				setInviteEmail("");
				setInviteRole("member");
				fetchData();
			}
		} catch (error) {
			console.error("Failed to invite member:", error);
			toast.error("Failed to send invitation");
		} finally {
			setInviting(false);
		}
	};

	const resendInvite = async (inviteId: string, email: string) => {
		try {
			// Re-sending is essentially creating a new invite with the same email
			// First cancel the old one
			await cancelInvite(inviteId, false);

			// Then send a new one
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			const res = await authClient.organization.inviteMember({
				organizationId,
				email,
				role: "member", // Default role, could be stored from original invite
			});

			if (res.error) {
				toast.error(res.error.message || "Failed to resend invitation");
			} else {
				toast.success("Invitation resent successfully!");
				fetchData();
			}
		} catch (error) {
			console.error("Failed to resend invite:", error);
			toast.error("Failed to resend invitation");
		}
	};

	const cancelInvite = async (inviteId: string, showToast = true) => {
		try {
			// Better Auth organization plugin provides cancelInvite
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			const res = await authClient.organization.cancelInvite({
				organizationId,
				invitationId: inviteId,
			});

			if (res.error) {
				throw new Error(res.error.message || "Failed to cancel invitation");
			}

			if (showToast) {
				toast.success("Invitation cancelled");
			}
			fetchData();
		} catch (error) {
			console.error("Failed to cancel invite:", error);
			if (showToast) {
				toast.error(error instanceof Error ? error.message : "Failed to cancel invitation");
			}
		}
	};

	const updateMemberRole = async (memberId: string, role: string) => {
		try {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			const res = await authClient.organization.updateMemberRole({
				organizationId,
				memberId,
				role: role,
			});

			if (res.error) {
				toast.error(res.error.message || "Failed to update role");
			} else {
				toast.success("Role updated successfully");
				fetchMembers();
			}
		} catch (error) {
			console.error("Failed to update role:", error);
			toast.error("Failed to update role");
		}
	};

	const removeMember = async (memberId: string) => {
		try {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			const res = await authClient.organization.removeMember({
				organizationId,
				memberIdOrEmail: memberId,
			});

			if (res.error) {
				toast.error(res.error.message || "Failed to remove member");
			} else {
				toast.success("Member removed successfully");
				fetchMembers();
			}
		} catch (error) {
			console.error("Failed to remove member:", error);
			toast.error("Failed to remove member");
		}
	};

	const getInitials = (name: string) => {
		return name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase()
			.slice(0, 2);
	};

	const getRoleBadge = (role: string) => {
		const variants: Record<string, "default" | "secondary" | "outline"> = {
			owner: "default",
			admin: "default",
			member: "secondary",
			viewer: "outline",
			guest: "outline",
		};
		const labels: Record<string, string> = {
			owner: "Owner",
			admin: "Admin",
			member: "Member",
			viewer: "Viewer",
			guest: "Guest",
		};
		return (
			<Badge variant={variants[role] || "secondary"}>{labels[role] || role}</Badge>
		);
	};

	const getInviteStatusBadge = (status: string, expiresAt: string) => {
		const isExpired = new Date(expiresAt) < new Date();

		if (isExpired) {
			return (
				<Badge variant="outline" className="gap-1">
					<Clock className="h-3 w-3" />
					Expired
				</Badge>
			);
		}

		if (status === "accepted") {
			return (
				<Badge variant="default" className="gap-1">
					<Check className="h-3 w-3" />
					Accepted
				</Badge>
			);
		}

		if (status === "rejected") {
			return (
				<Badge variant="secondary" className="gap-1">
					<X className="h-3 w-3" />
					Declined
				</Badge>
			);
		}

		return (
			<Badge variant="outline" className="gap-1">
				<Mail className="h-3 w-3" />
				Pending
			</Badge>
		);
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>Team Management</CardTitle>
						<CardDescription>
							Manage members and invitations for your organization
						</CardDescription>
					</div>
					<Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
						<DialogTrigger asChild>
							<Button size="sm">
								<UserPlus className="mr-2 h-4 w-4" />
								Invite Member
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Invite to Organization</DialogTitle>
								<DialogDescription>
									Send an invitation to join this organization
								</DialogDescription>
							</DialogHeader>
							<FieldGroup>
								<Field>
									<FieldLabel>Email Address</FieldLabel>
									<Input
										type="email"
										placeholder="colleague@example.com"
										value={inviteEmail}
										onChange={(e) => setInviteEmail(e.target.value)}
										autoFocus
									/>
								</Field>
								<Field>
									<FieldLabel>Role</FieldLabel>
									<Select
										value={inviteRole}
										onValueChange={setInviteRole}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="member">Member</SelectItem>
											<SelectItem value="admin">Admin</SelectItem>
											<SelectItem value="viewer">Viewer</SelectItem>
											<SelectItem value="guest">Guest</SelectItem>
										</SelectContent>
									</Select>
								</Field>
								<Button
									onClick={inviteMember}
									disabled={inviting || !inviteEmail}
									className="w-full"
								>
									{inviting ? (
										<>
											<RefreshCw className="mr-2 h-4 w-4 animate-spin" />
											Sending...
										</>
									) : (
										<>
											<Mail className="mr-2 h-4 w-4" />
											Send Invitation
										</>
									)}
								</Button>
							</FieldGroup>
						</DialogContent>
					</Dialog>
				</div>
			</CardHeader>
			<CardContent>
				<Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "members" | "invites")}>
					<TabsList className="grid w-full grid-cols-2">
						<TabsTrigger value="members" className="gap-2">
							<Users className="h-4 w-4" />
							Members
							<Badge variant="secondary" className="ml-1">
								{members.length}
							</Badge>
						</TabsTrigger>
						<TabsTrigger value="invites" className="gap-2">
							<Mail className="h-4 w-4" />
							Pending Invites
							<Badge
								variant="secondary"
								className="ml-1"
							>
								{pendingInvites.length}
							</Badge>
						</TabsTrigger>
					</TabsList>

					{/* Members Tab */}
					<TabsContent value="members" className="mt-4">
						{loading ? (
							<div className="flex items-center justify-center py-8">
								<div className="h-6 w-6 animate-spin rounded-full border-3 border-primary border-t-transparent" />
							</div>
						) : members.length === 0 ? (
							<div className="flex flex-col items-center justify-center py-8 text-center">
								<div className="rounded-full bg-muted p-4">
									<Users className="h-8 w-8 text-muted-foreground" />
								</div>
								<p className="mt-4 text-sm text-muted-foreground">
									No members yet. Invite someone to get started!
								</p>
							</div>
						) : (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Member</TableHead>
										<TableHead>Role</TableHead>
										<TableHead className="text-right">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{members.map((member) => (
										<TableRow key={member.id}>
											<TableCell>
												<div className="flex items-center gap-3">
													<Avatar>
														<AvatarFallback>
															{getInitials(member.user?.name || "U")}
														</AvatarFallback>
													</Avatar>
													<div>
														<div className="font-medium">{member.user?.name}</div>
														<div className="text-sm text-muted-foreground">
															{member.user?.email}
														</div>
													</div>
												</div>
											</TableCell>
											<TableCell>{getRoleBadge(member.role)}</TableCell>
											<TableCell className="text-right">
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button variant="ghost" size="icon">
															<MoreHorizontal className="h-4 w-4" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<DropdownMenuItem
															onClick={() => updateMemberRole(member.id, "admin")}
														>
															Make Admin
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={() => updateMemberRole(member.id, "member")}
														>
															Make Member
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={() => updateMemberRole(member.id, "viewer")}
														>
															Make Viewer
														</DropdownMenuItem>
														<DropdownMenuItem
															className="text-destructive"
															onClick={() => removeMember(member.id)}
														>
															Remove from Organization
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						)}
					</TabsContent>

					{/* Pending Invites Tab */}
					<TabsContent value="invites" className="mt-4">
						{loading ? (
							<div className="flex items-center justify-center py-8">
								<div className="h-6 w-6 animate-spin rounded-full border-3 border-primary border-t-transparent" />
							</div>
						) : pendingInvites.length === 0 ? (
							<div className="flex flex-col items-center justify-center py-8 text-center">
								<div className="rounded-full bg-muted p-4">
									<Mail className="h-8 w-8 text-muted-foreground" />
								</div>
								<p className="mt-4 text-sm text-muted-foreground">
									No pending invitations
								</p>
							</div>
						) : (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Email</TableHead>
										<TableHead>Role</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Sent</TableHead>
										<TableHead className="text-right">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{pendingInvites.map((invite) => {
										const isExpired = new Date(invite.expiresAt) < new Date();

										return (
											<TableRow
												key={invite.id}
												className={isExpired ? "opacity-60" : undefined}
											>
												<TableCell>
													<div className="flex items-center gap-3">
														<Avatar>
															<AvatarFallback className="bg-muted">
																{invite.email[0].toUpperCase()}
															</AvatarFallback>
														</Avatar>
														<div>
															<div className="font-medium">{invite.email}</div>
															{invite.inviter && (
																<div className="text-xs text-muted-foreground">
																	Invited by {invite.inviter.name}
																</div>
															)}
														</div>
													</div>
												</TableCell>
												<TableCell>{getRoleBadge(invite.role)}</TableCell>
												<TableCell>
													{getInviteStatusBadge(invite.status, invite.expiresAt as string)}
												</TableCell>
												<TableCell>
													<div className="text-sm text-muted-foreground">
														{formatDistanceToNow(new Date(invite.createdAt as string | Date), {
															addSuffix: true,
														})}
													</div>
												</TableCell>
												<TableCell className="text-right">
													<DropdownMenu>
														<DropdownMenuTrigger asChild>
															<Button variant="ghost" size="icon">
																<MoreHorizontal className="h-4 w-4" />
															</Button>
														</DropdownMenuTrigger>
														<DropdownMenuContent align="end">
															{isExpired || invite.status === "rejected" ? (
																<DropdownMenuItem
																	onClick={() =>
																		resendInvite(invite.id, invite.email)
																	}
																>
																	<RefreshCw className="mr-2 h-4 w-4" />
																	Resend Invitation
																</DropdownMenuItem>
															) : (
																<DropdownMenuItem
																	onClick={() =>
																		resendInvite(invite.id, invite.email)
																	}
																>
																	<Mail className="mr-2 h-4 w-4" />
																	Send Reminder
																</DropdownMenuItem>
															)}
															<DropdownMenuItem
																className="text-destructive"
																onClick={() => cancelInvite(invite.id)}
															>
																<X className="mr-2 h-4 w-4" />
																Cancel Invitation
															</DropdownMenuItem>
														</DropdownMenuContent>
													</DropdownMenu>
												</TableCell>
											</TableRow>
										);
									})}
								</TableBody>
							</Table>
						)}
					</TabsContent>
				</Tabs>
			</CardContent>
		</Card>
	);
}
