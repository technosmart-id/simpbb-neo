"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2Icon, UserIcon } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth/client";
import { useCallback, useEffect, useState } from "react";

interface User {
	name: string;
	email: string;
	image?: string;
	username?: string;
	phoneNumber?: string;
}

export default function AccountSettingsPage() {
	const [loading, setLoading] = useState(false);
	const [user, setUser] = useState<User | null>(null);

	const fetchUser = useCallback(async () => {
		const res = await authClient.getSession();
		setUser(res.data?.user as User | null);
	}, []);

	useEffect(() => {
		fetchUser();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoading(true);

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
		setLoading(false);
	};

	return (
		<div className="space-y-6">
			{/* Page Header */}
			<div>
				<h1 className="text-2xl font-bold">Account</h1>
				<p className="text-muted-foreground">Manage your profile and personal information</p>
			</div>

			{/* Profile Section */}
			<Card>
				<CardHeader>
					<CardTitle>Profile Information</CardTitle>
					<CardDescription>Update your personal details and public profile</CardDescription>
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
						<FieldGroup>
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
								<FieldDescription>Your unique username for @mentions and profile URL</FieldDescription>
							</Field>

							<Field>
								<FieldLabel htmlFor="phoneNumber">Phone Number</FieldLabel>
								<Input
									id="phoneNumber"
									name="phoneNumber"
									type="tel"
									defaultValue={user?.phoneNumber || ""}
									placeholder="+1234567890"
								/>
								<FieldDescription>Optional - Used for account recovery and notifications</FieldDescription>
							</Field>

							<Field>
								<Button type="submit" disabled={loading}>
									{loading && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
									Save Changes
								</Button>
							</Field>
						</FieldGroup>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
