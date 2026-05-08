"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Field,
	FieldGroup,
	FieldLabel,
	FieldDescription,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { cn } from "@/lib/utils";
import { Loader2Icon, KeyRound, Check, X } from "lucide-react";
import { toast } from "sonner";
import { GalleryVerticalEndIcon } from "lucide-react";
import Link from "next/link";

function ResetPasswordPageContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const token = searchParams.get("token");

	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [loading, setLoading] = useState(false);

	// Check if passwords match and password is valid
	const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
	const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword;
	const isPasswordValid = password.length >= 8;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (password !== confirmPassword) {
			toast.error("Passwords do not match");
			return;
		}

		if (password.length < 8) {
			toast.error("Password must be at least 8 characters");
			return;
		}

		setLoading(true);

		try {
			const response = await fetch("/api/auth/reset-password", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					newPassword: password,
					token: token || "",
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				toast.error(data.message || "Failed to reset password");
			} else {
				toast.success("Password reset successfully!");
				router.push("/sign-in");
			}
		} catch {
			toast.error("Failed to reset password");
		}

		setLoading(false);
	};

	if (!token) {
		return (
			<div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
				<div className="flex w-full max-w-sm flex-col gap-6">
					<Card>
						<CardHeader>
							<CardTitle>Invalid Reset Link</CardTitle>
							<CardDescription>
								This password reset link is invalid or has expired.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Button asChild className="w-full">
								<Link href="/forgot-password">Request New Link</Link>
							</Button>
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	return (
		<div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
			<div className="flex w-full max-w-sm flex-col gap-6">
				<Link href="/" className="flex items-center gap-2 self-center font-medium">
					<div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
						<GalleryVerticalEndIcon className="size-4" />
					</div>
					Acme Inc.
				</Link>

				<Card>
					<CardHeader className="text-center">
						<CardTitle className="flex items-center justify-center gap-2">
							<KeyRound className="h-5 w-5" />
							Set New Password
						</CardTitle>
						<CardDescription>Enter your new password below</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit}>
							<FieldGroup>
								<Field>
									<FieldLabel htmlFor="password">New Password</FieldLabel>
									<PasswordInput
										id="password"
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										required
										minLength={8}
										showStrength
									/>
								</Field>
								<Field>
									<FieldLabel htmlFor="confirmPassword" className="flex items-center gap-2">
										Confirm Password
										{passwordsMatch && (
											<Check className="h-4 w-4 text-green-600" />
										)}
										{passwordMismatch && (
											<X className="h-4 w-4 text-destructive" />
										)}
									</FieldLabel>
									<Input
										id="confirmPassword"
										type="password"
										value={confirmPassword}
										onChange={(e) => setConfirmPassword(e.target.value)}
										required
										minLength={8}
										className={cn(
											passwordMismatch && "border-destructive focus-visible:ring-destructive",
											passwordsMatch && "border-green-600 focus-visible:ring-green-600"
										)}
										autoComplete="new-password"
									/>
									{passwordMismatch && (
										<FieldDescription className="text-destructive">
											Passwords do not match
										</FieldDescription>
									)}
								</Field>
								<Field>
									<Button
										type="submit"
										disabled={loading || !isPasswordValid || !passwordsMatch}
										className="w-full"
									>
										{loading && (
											<Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
										)}
										Reset Password
									</Button>
								</Field>
								<Field>
									<Link
										href="/sign-in"
										className="text-sm text-muted-foreground hover:underline"
									>
										Back to login
									</Link>
								</Field>
							</FieldGroup>
						</form>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

export default function ResetPasswordPage() {
	return (
		<Suspense fallback={<div className="flex min-h-svh items-center justify-center">Loading...</div>}>
			<ResetPasswordPageContent />
		</Suspense>
	);
}
