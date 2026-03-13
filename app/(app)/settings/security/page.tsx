"use client";

import { SetupTwoFactor, BackupCodes, SessionManager } from "@/components/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Shield, Key, Smartphone, Loader2Icon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/lib/auth/client";
import { toast } from "sonner";
import { useState } from "react";

export default function SecuritySettingsPage() {
	const [loadingPassword, setLoadingPassword] = useState(false);

	const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoadingPassword(true);

		const formData = new FormData(e.currentTarget);
		const currentPassword = formData.get("currentPassword") as string;
		const newPassword = formData.get("newPassword") as string;
		const confirmPassword = formData.get("confirmPassword") as string;

		if (newPassword !== confirmPassword) {
			toast.error("Passwords do not match");
			setLoadingPassword(false);
			return;
		}

		if (newPassword.length < 8) {
			toast.error("Password must be at least 8 characters");
			setLoadingPassword(false);
			return;
		}

		const res = await authClient.changePassword({
			currentPassword,
			newPassword,
			revokeOtherSessions: true,
		});

		if (res.error) {
			toast.error(res.error.message || "Failed to update password");
		} else {
			toast.success("Password updated successfully!");
			(e.target as HTMLFormElement).reset();
		}
		setLoadingPassword(false);
	};

	return (
		<div className="space-y-6">
			{/* Page Header */}
			<div>
				<h1 className="text-2xl font-bold">Security</h1>
				<p className="text-muted-foreground">Manage your account security and authentication</p>
			</div>

			<Tabs defaultValue="2fa">
				<TabsList className="grid w-full grid-cols-3">
					<TabsTrigger value="2fa">
						<Key className="mr-2 h-4 w-4" />
						Two-Factor Auth
					</TabsTrigger>
					<TabsTrigger value="sessions">
						<Smartphone className="mr-2 h-4 w-4" />
						Sessions
					</TabsTrigger>
					<TabsTrigger value="password">
						<Shield className="mr-2 h-4 w-4" />
						Password
					</TabsTrigger>
				</TabsList>

				<TabsContent value="2fa" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Two-Factor Authentication</CardTitle>
							<CardDescription>
								Add an extra layer of security to your account
							</CardDescription>
						</CardHeader>
						<CardContent>
							<SetupTwoFactor />
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Backup Codes</CardTitle>
							<CardDescription>
								Generate backup codes to access your account if you lose your
								authenticator device
							</CardDescription>
						</CardHeader>
						<CardContent>
							<BackupCodes />
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="sessions" className="space-y-6">
					<SessionManager />
				</TabsContent>

				<TabsContent value="password" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Change Password</CardTitle>
							<CardDescription>
								Update your password to keep your account secure
							</CardDescription>
						</CardHeader>
						<CardContent>
							<form onSubmit={handlePasswordChange}>
								<FieldGroup>
									<Field>
										<FieldLabel htmlFor="currentPassword">Current Password</FieldLabel>
										<PasswordInput
											id="currentPassword"
											name="currentPassword"
											placeholder="Enter your current password"
											required
										/>
									</Field>
									<Field>
										<FieldLabel htmlFor="newPassword">New Password</FieldLabel>
										<PasswordInput
											id="newPassword"
											name="newPassword"
											placeholder="Enter new password"
											required
											minLength={8}
											showStrength
										/>
									</Field>
									<Field>
										<FieldLabel htmlFor="confirmPassword">Confirm New Password</FieldLabel>
										<PasswordInput
											id="confirmPassword"
											name="confirmPassword"
											placeholder="Confirm new password"
											required
											minLength={8}
										/>
									</Field>
									<Field>
										<Button type="submit" disabled={loadingPassword}>
											{loadingPassword && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
											Update Password
										</Button>
									</Field>
								</FieldGroup>
							</form>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
