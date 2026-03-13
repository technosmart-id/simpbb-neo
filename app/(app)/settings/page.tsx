"use client";

import { SetupTwoFactor, BackupCodes, SessionManager } from "@/components/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2Icon, UserIcon, Key, Shield, Smartphone, Lock, CheckCircle2, Sun, Moon, Palette } from "lucide-react";
import { authClient } from "@/lib/auth/client";
import { toast } from "sonner";
import { useState, useEffect, useCallback } from "react";
import { useTheme } from "next-themes";

interface User {
	name: string;
	email: string;
	image?: string;
	username?: string;
	phoneNumber?: string;
	twoFactorEnabled?: boolean;
}

export default function AccountSettingsPage() {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);
	const [loadingProfile, setLoadingProfile] = useState(false);
	const [loadingPassword, setLoadingPassword] = useState(false);
	const [user, setUser] = useState<User | null>(null);
	const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

	// Avoid hydration mismatch
	useEffect(() => {
		setMounted(true);
	}, []);

	const fetchUser = useCallback(async () => {
		const res = await authClient.getSession();
		const userData = res.data?.user as User | null;
		setUser(userData);
		setTwoFactorEnabled(userData?.twoFactorEnabled ?? false);
	}, []);

	useEffect(() => {
		fetchUser();
	}, [fetchUser]);

	// Refresh 2FA status
	const refresh2FAStatus = async () => {
		const res = await authClient.getSession();
		setTwoFactorEnabled(res.data?.user?.twoFactorEnabled ?? false);
	};

	const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoadingProfile(true);

		const formData = new FormData(e.currentTarget);
		const name = formData.get("name") as string;
		const username = formData.get("username") as string;
		const phoneNumber = formData.get("phoneNumber") as string;

		const res = await authClient.updateUser({
			name,
			username: username || undefined,
			phoneNumber: phoneNumber || undefined,
		});

		if (res.error) {
			toast.error(res.error.message || "Failed to update profile");
		} else {
			toast.success("Profile updated!");
			fetchUser();
		}
		setLoadingProfile(false);
	};

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
			<div className="space-y-1">
				<h1 className="text-2xl font-bold tracking-tight">Account Settings</h1>
				<p className="text-muted-foreground">
					Manage your profile and appearance preferences
				</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Left Column - Profile, Password, Sessions */}
				<div className="lg:col-span-2 space-y-6">
					{/* Profile Section */}
					<Card>
						<CardHeader>
							<div className="flex items-center gap-3">
								<div className="rounded-lg bg-primary/10 p-2">
									<UserIcon className="h-5 w-5 text-primary" />
								</div>
								<div>
									<CardTitle className="text-lg">Profile</CardTitle>
									<CardDescription className="text-sm">
										Update your personal information
									</CardDescription>
								</div>
							</div>
						</CardHeader>
						<CardContent>
							<div className="flex items-center gap-4 mb-6">
								<Avatar className="h-16 w-16">
									<AvatarImage src={user?.image} alt={user?.name} />
									<AvatarFallback className="text-lg">
										{user?.name?.charAt(0).toUpperCase() || <UserIcon className="h-6 w-6" />}
									</AvatarFallback>
								</Avatar>
								<div>
									<div className="font-medium">{user?.name || "User"}</div>
									<div className="text-sm text-muted-foreground">{user?.email}</div>
								</div>
							</div>
							<form onSubmit={handleUpdateProfile}>
								<FieldGroup className="gap-4">
									<Field>
										<FieldLabel htmlFor="name">Full Name</FieldLabel>
										<Input
											id="name"
											name="name"
											defaultValue={user?.name || ""}
											placeholder="John Doe"
											required
										/>
									</Field>
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
										<Field>
											<FieldLabel htmlFor="username">Username</FieldLabel>
											<div className="relative">
												<span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
													@
												</span>
												<Input
													id="username"
													name="username"
													className="pl-7"
													defaultValue={user?.username || ""}
													placeholder="johndoe"
													minLength={3}
													maxLength={20}
												/>
											</div>
										</Field>
										<Field>
											<FieldLabel htmlFor="phoneNumber">Phone</FieldLabel>
											<Input
												id="phoneNumber"
												name="phoneNumber"
												type="tel"
												defaultValue={user?.phoneNumber || ""}
												placeholder="+1234567890"
											/>
										</Field>
									</div>
									<div className="flex justify-end pt-2">
										<Button type="submit" disabled={loadingProfile}>
											{loadingProfile && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
											Save Changes
										</Button>
									</div>
								</FieldGroup>
							</form>
						</CardContent>
					</Card>

					{/* Password */}
					<Card>
						<CardHeader>
							<div className="flex items-center gap-3">
								<div className="rounded-lg bg-primary/10 p-2">
									<Key className="h-5 w-5 text-primary" />
								</div>
								<div>
									<CardTitle className="text-lg">Password</CardTitle>
									<CardDescription className="text-sm">
										Change your password
									</CardDescription>
								</div>
							</div>
						</CardHeader>
						<CardContent>
							<form onSubmit={handlePasswordChange}>
								<FieldGroup className="gap-4">
									<Field>
										<FieldLabel htmlFor="currentPassword">Current Password</FieldLabel>
										<PasswordInput
											id="currentPassword"
											name="currentPassword"
											placeholder="••••••••"
											required
										/>
									</Field>
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
										<Field>
											<FieldLabel htmlFor="newPassword">New Password</FieldLabel>
											<PasswordInput
												id="newPassword"
												name="newPassword"
												placeholder="New password"
												required
												minLength={8}
												showStrength
											/>
										</Field>
										<Field>
											<FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
											<PasswordInput
												id="confirmPassword"
												name="confirmPassword"
												placeholder="••••••••"
												required
												minLength={8}
											/>
										</Field>
									</div>
									<div className="flex justify-end pt-2">
										<Button type="submit" disabled={loadingPassword}>
											{loadingPassword && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
											Update Password
										</Button>
									</div>
								</FieldGroup>
							</form>
						</CardContent>
					</Card>

					{/* Active Sessions */}
					<Card>
						<CardHeader>
							<div className="flex items-center gap-3">
								<div className="rounded-lg bg-primary/10 p-2">
									<Smartphone className="h-5 w-5 text-primary" />
								</div>
								<div>
									<CardTitle className="text-lg">Active Sessions</CardTitle>
									<CardDescription className="text-sm">
										Devices logged into your account
									</CardDescription>
								</div>
							</div>
						</CardHeader>
						<CardContent>
							<SessionManager />
						</CardContent>
					</Card>
				</div>

				{/* Right Column - Appearance & 2FA */}
				<div className="space-y-6">
					{/* Appearance */}
					<Card>
						<CardHeader>
							<div className="flex items-center gap-3">
								<div className="rounded-lg bg-primary/10 p-2">
									<Palette className="h-5 w-5 text-primary" />
								</div>
								<div>
									<CardTitle className="text-base">Appearance</CardTitle>
									<CardDescription className="text-xs">
										Customize your experience
									</CardDescription>
								</div>
							</div>
						</CardHeader>
						<CardContent>
							<FieldGroup>
								<Field>
									<FieldLabel>Theme</FieldLabel>
									<FieldDescription className="mb-3">
										Select your preferred theme
									</FieldDescription>
									{mounted ? (
										<div className="grid grid-cols-3 gap-2">
											{["light", "dark", "system"].map((t) => (
												<button
													key={t}
													type="button"
													onClick={() => setTheme(t)}
													className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-colors ${theme === t
															? "border-primary bg-primary/10"
															: "border-border hover:bg-muted"
														}`}
												>
													{t === "light" && <Sun className="h-4 w-4" />}
													{t === "dark" && <Moon className="h-4 w-4" />}
													{t === "system" && (
														<div className="relative">
															<Sun className="h-4 w-4" />
															<Moon className="h-4 w-4 absolute -bottom-1 -right-1" />
														</div>
													)}
													<span className="text-xs capitalize">{t}</span>
												</button>
											))}
										</div>
									) : (
										<div className="grid grid-cols-3 gap-2">
											{["light", "dark", "system"].map((t) => (
												<div
													key={t}
													className="flex flex-col items-center gap-2 p-3 rounded-lg border border-border"
												>
													{t === "light" && <Sun className="h-4 w-4" />}
													{t === "dark" && <Moon className="h-4 w-4" />}
													{t === "system" && (
														<div className="relative">
															<Sun className="h-4 w-4" />
															<Moon className="h-4 w-4 absolute -bottom-1 -right-1" />
														</div>
													)}
													<span className="text-xs capitalize">{t}</span>
												</div>
											))}
										</div>
									)}
								</Field>
							</FieldGroup>
						</CardContent>
					</Card>

					{/* Two-Factor Authentication */}
					<Card className={twoFactorEnabled ? "border-green-500/20" : "border-primary/20"}>
						<CardHeader>
							<div className="flex items-center gap-3">
								<div className={`rounded-lg p-2 ${twoFactorEnabled ? "bg-green-500/10" : "bg-amber-500/10"}`}>
									<Shield className={`h-5 w-5 ${twoFactorEnabled ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"}`} />
								</div>
								<div className="flex-1">
									<CardTitle className="text-base">Two-Factor Auth</CardTitle>
									<CardDescription className="text-xs">
										{twoFactorEnabled ? "Enabled" : "Not enabled"}
									</CardDescription>
								</div>
								{twoFactorEnabled && (
									<CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
								)}
							</div>
						</CardHeader>
						<CardContent className="space-y-4">
							<FieldDescription className="text-sm">
								{twoFactorEnabled
									? "Your account is protected with two-factor authentication."
									: "Add an extra layer of security to your account."}
							</FieldDescription>
							<SetupTwoFactor onEnabledChange={refresh2FAStatus} />
						</CardContent>
					</Card>

					{/* Backup Codes */}
					{twoFactorEnabled && (
						<Card>
							<CardHeader>
								<div className="flex items-center gap-3">
									<div className="rounded-lg bg-muted p-2">
										<Lock className="h-4 w-4 text-muted-foreground" />
									</div>
									<div>
										<CardTitle className="text-base">Backup Codes</CardTitle>
										<CardDescription className="text-xs">
											Recovery codes
										</CardDescription>
									</div>
								</div>
							</CardHeader>
							<CardContent>
								<BackupCodes />
							</CardContent>
						</Card>
					)}
				</div>
			</div>
		</div>
	);
}
