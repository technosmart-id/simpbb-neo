"use client";

import { useState } from "react";
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
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Loader2Icon, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { GalleryVerticalEndIcon } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const [sent, setSent] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			const response = await fetch("/api/auth/forget-password", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					email,
					redirectTo: "/reset-password",
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				toast.error(data.message || "Failed to send reset email");
			} else {
				toast.success("Password reset email sent!");
				setSent(true);
			}
		} catch {
			toast.error("Failed to send reset email");
		}

		setLoading(false);
	};

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
							Reset Password
						</CardTitle>
						<CardDescription>
							{!sent
								? "Enter your email to receive a password reset link"
								: "Check your email for the reset link"}
						</CardDescription>
					</CardHeader>
					<CardContent>
						{!sent ? (
							<form onSubmit={handleSubmit}>
								<FieldGroup>
									<Field>
										<FieldLabel htmlFor="email">Email</FieldLabel>
										<Input
											id="email"
											type="email"
											placeholder="m@example.com"
											value={email}
											onChange={(e) => setEmail(e.target.value)}
											required
										/>
									</Field>
									<Field>
										<Button type="submit" disabled={loading} className="w-full">
											{loading && (
												<Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
											)}
											Send Reset Link
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
						) : (
							<FieldGroup>
								<p className="text-center text-sm text-muted-foreground">
									We sent a password reset link to{" "}
									<strong>{email}</strong>
								</p>
								<Field>
									<Button
										type="button"
										variant="outline"
										className="w-full"
										onClick={() => setSent(false)}
									>
										Send again
									</Button>
								</Field>
							</FieldGroup>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
