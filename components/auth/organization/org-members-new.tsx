"use client";

import { useState, useEffect, useCallback } from "react";
import { authClient } from "@/lib/auth/client";
import { orpcClient } from "@/lib/orpc/client";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, UserPlus, Shield, UserX, Settings2 } from "lucide-react";
import { toast } from "sonner";
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
import { Checkbox } from "@/components/ui/checkbox";

interface OrgMember {
	id: string;
	role: string | null;
	globalRole: string | null;
	user?: {
		name?: string | null;
		email?: string | null;
	};
	organizationRoles: {
		id: string;
		roleId: string;
		roleType: "system" | "custom";
		roleName?: string;
	}[];
}

type OrgRole = "member" | "admin" | "owner";

const SYSTEM_ROLES = [
	{ id: "owner", name: "Owner" },
	{ id: "admin", name: "Admin" },
	{ id: "member", name: "Member" },
];

export function OrgMembers({ organizationId }: { organizationId: string }) {
	const [members, setMembers] = useState<OrgMember[]>([]);
	const [loading, setLoading] = useState(true);
	
	const [inviteOpen, setInviteOpen] = useState(false);
	const [inviteEmail, setInviteEmail] = useState("");
	const [inviteRole, setInviteRole] = useState<OrgRole>("member");
	const [inviting, setInviting] = useState(false);

	const [manageOpen, setManageOpen] = useState(false);
	const [selectedMember, setSelectedMember] = useState<OrgMember | null>(null);
	const [availableCustomRoles, setAvailableCustomRoles] = useState<{id: string, name: string}[]>([]);
	const [stagedRoles, setStagedRoles] = useState<{roleId: string, roleType: "system" | "custom"}[]>([]);
	const [savingRoles, setSavingRoles] = useState(false);

	const fetchMembers = useCallback(async () => {
		try {
			setLoading(true);
			const res = await (orpcClient as any).organizations.listMembers({ organizationId });
			if (res) {
				setMembers(res);
			}
		} catch (error) {
			console.error("Failed to fetch members:", error);
		}
		setLoading(false);
	}, [organizationId]);

	const fetchRoles = useCallback(async () => {
		try {
			const roles = await (orpcClient as any).organizations.listAvailableRoles({ organizationId });
			setAvailableCustomRoles(roles || []);
		} catch (error) {
			console.error("Failed to fetch roles:", error);
		}
	}, [organizationId]);

	useEffect(() => {
		fetchMembers();
		fetchRoles();
	}, [fetchMembers, fetchRoles]);

	const inviteMember = async () => {
		toast.info("To add members, use the database seed or contact an admin");
		setInviteOpen(false);
	};

	const removeMember = async (memberId: string) => {
		try {
			await (orpcClient as any).organizations.removeMember({
				organizationId,
				memberId,
			});
			toast.success("Member removed");
			fetchMembers();
		} catch (error: any) {
			toast.error(error.message || "Failed to remove member");
		}
	};

	const openManageRoles = (member: OrgMember) => {
		setSelectedMember(member);
		setStagedRoles(member.organizationRoles.map(r => ({ roleId: r.roleId, roleType: r.roleType })));
		setManageOpen(true);
	};

	const toggleRole = (roleId: string, roleType: "system" | "custom", checked: boolean) => {
		setStagedRoles(current => {
			if (checked) {
				return [...current.filter(r => !(r.roleId === roleId && r.roleType === roleType)), { roleId, roleType }];
			} else {
				return current.filter(r => !(r.roleId === roleId && r.roleType === roleType));
			}
		});
	};

	const saveManageRoles = async () => {
		if (!selectedMember) return;
		try {
			setSavingRoles(true);
			await (orpcClient as any).organizations.manageMemberRoles({
				organizationId,
				memberId: selectedMember.id,
				roles: stagedRoles,
			});
			toast.success("Roles updated successfully");
			setManageOpen(false);
			fetchMembers();
		} catch (error: any) {
			toast.error(error.message || "Failed to update roles");
		} finally {
			setSavingRoles(false);
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

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>Members</CardTitle>
						<CardDescription>Manage organization members and their roles</CardDescription>
					</div>
					<Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
						<DialogTrigger asChild>
							<Button size="sm">
								<UserPlus className="mr-2 h-4 w-4" />
								Invite
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Invite Member</DialogTitle>
								<DialogDescription>
									Add a member to this organization
								</DialogDescription>
							</DialogHeader>
							<FieldGroup>
								<Field>
									<FieldLabel>Email</FieldLabel>
									<Input
										type="email"
										placeholder="colleague@example.com"
										value={inviteEmail}
										onChange={(e) => setInviteEmail(e.target.value)}
									/>
								</Field>
								<Field>
									<FieldLabel>Role</FieldLabel>
									<Select value={inviteRole} onValueChange={(v) => setInviteRole(v as OrgRole)}>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="member">Member</SelectItem>
											<SelectItem value="admin">Admin</SelectItem>
										</SelectContent>
									</Select>
								</Field>
								<Button onClick={inviteMember} disabled={inviting || !inviteEmail}>
									{inviting ? "Adding..." : "Add Member"}
								</Button>
							</FieldGroup>
						</DialogContent>
					</Dialog>
				</div>
			</CardHeader>
			<CardContent>
				{loading ? (
					<p>Loading members...</p>
				) : members.length === 0 ? (
					<p className="text-muted-foreground text-sm">No members yet</p>
				) : (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Member</TableHead>
								<TableHead>Global Role</TableHead>
								<TableHead>Roles</TableHead>
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
									<TableCell>
										<Badge variant="outline" className="capitalize">
											{member.globalRole || "User"}
										</Badge>
									</TableCell>
									<TableCell>
										<div className="flex flex-wrap gap-1">
											{member.organizationRoles.length > 0 ? (
												member.organizationRoles.map((r, i) => (
													<Badge key={i} variant={r.roleType === "system" ? "default" : "secondary"}>
														{r.roleName || r.roleId}
													</Badge>
												))
											) : (
												<span className="text-muted-foreground text-xs">None</span>
											)}
										</div>
									</TableCell>
									<TableCell className="text-right">
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="ghost" size="sm">
													<MoreHorizontal className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuItem onClick={() => openManageRoles(member)}>
													<Settings2 className="mr-2 h-4 w-4" />
													Manage Roles
												</DropdownMenuItem>
												<DropdownMenuItem
													className="text-destructive"
													onClick={() => removeMember(member.id)}
												>
													<UserX className="mr-2 h-4 w-4" />
													Remove
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				)}
			</CardContent>

			{/* Manage Roles Dialog */}
			<Dialog open={manageOpen} onOpenChange={setManageOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Manage Roles</DialogTitle>
						<DialogDescription>
							Assign or remove roles for {selectedMember?.user?.name}
						</DialogDescription>
					</DialogHeader>
					
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<h4 className="font-medium text-sm text-muted-foreground">Base Roles</h4>
							<div className="space-y-2">
								{SYSTEM_ROLES.map((role) => {
									const isChecked = stagedRoles.some(r => r.roleId === role.id && r.roleType === "system");
									return (
										<div key={role.id} className="flex flex-row items-center space-x-3">
											<Checkbox
												id={`system-${role.id}`}
												checked={isChecked}
												onCheckedChange={(checked) => toggleRole(role.id, "system", checked === true)}
											/>
											<label htmlFor={`system-${role.id}`} className="text-sm font-medium leading-none">
												{role.name}
											</label>
										</div>
									);
								})}
							</div>
						</div>

						{availableCustomRoles.length > 0 && (
							<div className="space-y-2 pt-4 border-t">
								<h4 className="font-medium text-sm text-muted-foreground">Granular Roles</h4>
								<div className="space-y-2">
									{availableCustomRoles.map((role) => {
										const isChecked = stagedRoles.some(r => r.roleId === role.id && r.roleType === "custom");
										return (
											<div key={role.id} className="flex flex-row items-center space-x-3">
												<Checkbox
													id={`custom-${role.id}`}
													checked={isChecked}
													onCheckedChange={(checked) => toggleRole(role.id, "custom", checked === true)}
												/>
												<label htmlFor={`custom-${role.id}`} className="text-sm font-medium leading-none">
													{role.name}
												</label>
											</div>
										);
									})}
								</div>
							</div>
						)}
					</div>
					
					<div className="flex justify-end gap-2">
						<Button variant="outline" onClick={() => setManageOpen(false)}>Cancel</Button>
						<Button onClick={saveManageRoles} disabled={savingRoles}>
							{savingRoles ? "Saving..." : "Save Roles"}
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</Card>
	);
}
